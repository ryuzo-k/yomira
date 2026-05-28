import { getCreditAccount, getUserByApiKey, updateAutoTopup } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (!["GET", "POST"].includes(request.method)) {
    response.status(405).json({ error: "Method not allowed. Use GET or POST." });
    return;
  }

  try {
    const user = await authorize(request);
    if (request.method === "GET") {
      response.status(200).json({ user, credit_account: await getCreditAccount(user.id) });
      return;
    }

    const { enabled, threshold, credits } = request.body || {};
    const allowedCredits = new Set([100, 700, 2500]);
    const topupCredits = allowedCredits.has(Number(credits)) ? Number(credits) : 100;
    const updated = await updateAutoTopup(user.id, { enabled, threshold, credits: topupCredits });
    response.status(200).json({ user, credit_account: updated });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

async function authorize(request) {
  const header = request.headers["x-api-key"] || request.headers.authorization;
  const apiKey = String(header || "").replace(/^Bearer\s+/i, "");
  if (!apiKey) throw new Error("Missing x-api-key.");
  const user = await getUserByApiKey(apiKey);
  if (!user) throw new Error("Invalid API key.");
  return user;
}
