import { CREDIT_PLANS, getPlan } from "../../src/billing/plans.mjs";
import { createApiKeyForUser, createCustomerAccess, getUserByStripeCustomer } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const { sessionId } = request.body || {};
    if (!sessionId) throw new Error("sessionId is required.");

    const session = await stripeGet(`/checkout/sessions/${encodeURIComponent(sessionId)}`);
    if (session.payment_status !== "paid" && session.status !== "complete") {
      throw new Error("Checkout session is not paid/complete yet.");
    }

    const plan = getPlan(session.metadata?.plan_id || "starter");
    const existing = await getUserByStripeCustomer(session.customer);
    if (existing) {
      const apiKey = await createApiKeyForUser(existing.id, "Checkout claim");
      response.status(200).json({
        user: { id: existing.id, email: existing.email, planId: existing.planId },
        apiKey,
        message: "Created a fresh API key for this paid Stripe customer."
      });
      return;
    }

    const credits = plan.credits || plan.monthlyCredits || CREDIT_PLANS.starter.credits;
    const { user, apiKey } = await createCustomerAccess({
      email: session.customer_details?.email || session.customer_email,
      stripeCustomerId: session.customer,
      credits,
      planId: plan.id
    });

    response.status(200).json({
      user: { id: user.id, email: user.email, planId: user.planId },
      apiKey,
      credits
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

async function stripeGet(path) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is required.");
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { "authorization": `Bearer ${secret}` }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || `Stripe GET failed: ${path}`);
  return data;
}
