import { createSupabaseUser } from "../../src/billing/auth.mjs";
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
    validateAuthInput(email, password);
    const authUser = await createSupabaseUser({ email, password });
    const account = await createAccountForAuthUser({
      authUserId: authUser.id,
      email: authUser.email || email,
      trialCredits: Number(process.env.TRIAL_CREDITS || 20)
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

function validateAuthInput(email, password) {
  if (!email || !String(email).includes("@")) throw new Error("A valid email is required.");
  if (!password || String(password).length < 8) throw new Error("Password must be at least 8 characters.");
}
