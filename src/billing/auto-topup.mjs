import { addCredits } from "./ledger.mjs";
import { stripeGet, stripeRequest } from "./stripe.mjs";

const DEFAULT_TOPUP_AMOUNT_CENTS = 2000;

export async function maybeAutoTopup({ user, creditAccount, creditsNeeded = 0, reason = "low_balance" }) {
  if (!user?.stripeCustomerId || !creditAccount?.auto_topup_enabled) {
    return { attempted: false };
  }

  const balance = Number(creditAccount.balance || 0);
  const threshold = Number(creditAccount.auto_topup_threshold || 0);
  if (reason === "low_balance" && balance > threshold) {
    return { attempted: false };
  }

  const topupCredits = Math.max(Number(creditAccount.auto_topup_credits || 200), creditsNeeded);
  const paymentMethod = await getReusablePaymentMethod(user.stripeCustomerId);
  if (!paymentMethod) {
    return {
      attempted: true,
      charged: false,
      error: "No saved Stripe payment method is available for auto top-up."
    };
  }

  const paymentIntent = await stripeRequest("/payment_intents", {
    amount: DEFAULT_TOPUP_AMOUNT_CENTS,
    currency: "usd",
    customer: user.stripeCustomerId,
    payment_method: paymentMethod,
    off_session: true,
    confirm: true,
    description: "Yomira auto top-up",
    "metadata[user_id]": user.id,
    "metadata[credits]": topupCredits,
    "metadata[reason]": reason
  });

  if (paymentIntent.status !== "succeeded") {
    return {
      attempted: true,
      charged: false,
      payment_intent: paymentIntent.id,
      status: paymentIntent.status
    };
  }

  const balanceAfter = await addCredits(user.id, topupCredits, "auto_topup", {
    stripe_payment_intent_id: paymentIntent.id,
    reason
  });

  return {
    attempted: true,
    charged: true,
    payment_intent: paymentIntent.id,
    credits_added: topupCredits,
    balance_after: balanceAfter
  };
}

async function getReusablePaymentMethod(stripeCustomerId) {
  const customer = await stripeGet(`/customers/${encodeURIComponent(stripeCustomerId)}`);
  if (customer.invoice_settings?.default_payment_method) {
    return customer.invoice_settings.default_payment_method;
  }

  const methods = await stripeGet("/payment_methods", {
    customer: stripeCustomerId,
    type: "card",
    limit: 1
  });
  return methods.data?.[0]?.id || null;
}
