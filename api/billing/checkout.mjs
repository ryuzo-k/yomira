import { getPlan } from "../../src/billing/plans.mjs";
import { stripeRequest } from "../../src/billing/stripe.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const { planId = "starter", email } = request.body || {};
    const plan = getPlan(planId);
    const priceId = getPriceId(plan.id);
    const origin = process.env.PUBLIC_BASE_URL || request.headers.origin || "http://localhost:4173";
    const mode = plan.mode;

    const session = await stripeRequest("/checkout/sessions", {
      mode,
      customer_email: email,
      customer_creation: mode === "payment" ? "always" : undefined,
      success_url: `${origin}/admin.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/admin.html?checkout=cancelled`,
      "metadata[plan_id]": plan.id,
      "metadata[credits]": plan.credits || plan.monthlyCredits,
      "line_items[0][quantity]": 1,
      "line_items[0][price]": priceId,
      "payment_intent_data[setup_future_usage]": mode === "payment" ? "off_session" : undefined
    });

    response.status(200).json({ url: session.url, id: session.id });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

function getPriceId(planId) {
  const envKey = `STRIPE_PRICE_${planId.toUpperCase()}`;
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`${envKey} is required.`);
  }
  return priceId;
}
