import { loginSupabaseUser } from "../../src/billing/auth.mjs";
import { createAccountForAuthUser } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const { email, password } = request.body || {};
    if (!email || !password) throw new Error("Email and password are required.");
    const session = await loginSupabaseUser({ email, password });
    const account = await createAccountForAuthUser({
      authUserId: session.user.id,
      email: session.user.email || email,
      trialCredits: 0
    });
    response.status(200).json({
      user: {
        id: account.user.id,
        email: account.user.email,
        planId: account.user.planId
      },
      apiKey: account.apiKey,
      credits: account.credits
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
