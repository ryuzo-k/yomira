import { getUserByApiKey, listSimulationsForUser } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed. Use GET." });
    return;
  }

  try {
    const apiKey = readApiKey(request);
    if (!apiKey) throw new Error("Missing x-api-key.");
    const user = await getUserByApiKey(apiKey);
    if (!user) throw new Error("Invalid API key.");
    const rows = await listSimulationsForUser(user.id, request.query?.limit || 20);
    response.status(200).json({ simulations: rows });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

function readApiKey(request) {
  const header = request.headers["x-api-key"] || request.headers.authorization;
  return String(header || "").replace(/^Bearer\s+/i, "");
}
