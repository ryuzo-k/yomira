import { getCreditAccount, getCredits, getUserByApiKey } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  const apiKey = readApiKey(request);
  if (!apiKey) {
    response.status(401).json({ error: "Missing x-api-key." });
    return;
  }

  try {
    const user = await getUserByApiKey(apiKey);
    if (!user) {
      response.status(401).json({ error: "Invalid API key." });
      return;
    }

    response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        planId: user.planId
      },
      credits: await getCredits(user.id),
      credit_account: await getCreditAccount(user.id)
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

function readApiKey(request) {
  const header = request.headers["x-api-key"] || request.headers.authorization;
  if (!header) return "";
  return String(header).replace(/^Bearer\s+/i, "");
}
