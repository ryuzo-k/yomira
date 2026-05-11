import { simulateReaction } from "../src/simulation/engine.mjs";
import { consumeCredits, getCreditAccount, getUserByApiKey, storeSimulation } from "../src/billing/ledger.mjs";
import { estimateCredits } from "../src/billing/plans.mjs";
import { maybeAutoTopup } from "../src/billing/auto-topup.mjs";
import { handleOptions, setCors } from "../src/http/cors.mjs";

export const config = {
  maxDuration: 300
};

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const input = request.body || {};
    const usage = await authorizeUsage(request, input);
    if (usage && usage.creditAccount?.balance < usage.credits) {
      const topup = await maybeAutoTopup({
        user: usage.user,
        creditAccount: usage.creditAccount,
        creditsNeeded: usage.credits,
        reason: "insufficient_balance"
      });
      usage.creditAccount = await getCreditAccount(usage.user.id);
      usage.autoTopup = topup;
    }

    if (usage && usage.creditAccount?.balance < usage.credits) {
      response.status(402).json({
        error: "Insufficient credits.",
        credits_required: usage.credits,
        credits_available: usage.creditAccount.balance,
        auto_topup_enabled: usage.creditAccount.auto_topup_enabled,
        auto_topup: usage.autoTopup
      });
      return;
    }
    const result = await simulateReaction(input);
    if (usage) {
      await storeSimulation({
        userId: usage.user.id,
        input,
        result,
        creditsCharged: usage.credits
      });
      result.billing = {
        credits_charged: usage.credits,
        credits_remaining: await consumeCredits(usage.user.id, usage.credits),
        auto_topup: usage.autoTopup
      };
      const latestAccount = await getCreditAccount(usage.user.id);
      if (latestAccount?.balance <= latestAccount?.auto_topup_threshold) {
        result.billing.auto_topup = await maybeAutoTopup({
          user: usage.user,
          creditAccount: latestAccount,
          reason: "low_balance"
        });
        if (result.billing.auto_topup?.charged) {
          result.billing.credits_remaining = result.billing.auto_topup.balance_after;
        }
      }
    }
    response.status(200).json(result);
  } catch (error) {
    response.status(400).json({
      error: error.message
    });
  }
}

async function authorizeUsage(request, input) {
  if (process.env.REQUIRE_API_KEY !== "true") return null;

  const apiKey = readApiKey(request);
  if (!apiKey) throw new Error("Missing x-api-key.");

  const user = await getUserByApiKey(apiKey);
  if (!user) throw new Error("Invalid API key.");

  return {
    user,
    credits: estimateCredits(input),
    creditAccount: await getCreditAccount(user.id)
  };
}

function readApiKey(request) {
  const header = request.headers["x-api-key"] || request.headers.authorization;
  return String(header || "").replace(/^Bearer\s+/i, "");
}
