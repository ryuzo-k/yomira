import crypto from "node:crypto";
import { supabaseRequest, supabaseRpc } from "./supabase.mjs";

export function createApiKey() {
  return `sim_${crypto.randomBytes(24).toString("base64url")}`;
}

export function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export async function createCustomerAccess({ email, stripeCustomerId, credits = 0, planId = "starter" }) {
  const now = new Date().toISOString();
  let user = null;

  if (email) {
    const existing = await supabaseRequest(`/profiles?email=eq.${encodeURIComponent(email)}&limit=1`);
    if (existing[0]) {
      const [updated] = await supabaseRequest(`/profiles?id=eq.${encodeURIComponent(existing[0].id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          email,
          stripe_customer_id: stripeCustomerId || existing[0].stripe_customer_id,
          plan_id: planId,
          updated_at: now
        })
      });
      user = updated;
    }
  }

  if (!user) {
    [user] = await supabaseRequest("/profiles", {
      method: "POST",
      body: JSON.stringify({
        email,
        stripe_customer_id: stripeCustomerId,
        plan_id: planId,
        created_at: now,
        updated_at: now
      })
    });
  }

  const apiKey = await createApiKeyForUser(user.id);

  await ensureCreditAccount(user.id);

  if (credits) {
    await addCredits(user.id, credits, "initial_purchase");
  }

  return { user: normalizeUser(user), apiKey };
}

export async function createAccountForAuthUser({ authUserId, email, profile = {}, trialCredits = 0 }) {
  let user = await getUserByAuthUserId(authUserId);
  const now = new Date().toISOString();
  const profilePatch = normalizeProfilePatch(profile);

  if (!user && email) {
    const existing = await supabaseRequest(`/profiles?email=eq.${encodeURIComponent(email)}&limit=1`);
    if (existing[0]) {
      const [updated] = await supabaseRequest(`/profiles?id=eq.${encodeURIComponent(existing[0].id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          auth_user_id: authUserId,
          email,
          ...profilePatch,
          updated_at: now
        })
      });
      user = normalizeUser(updated);
    }
  }

  if (!user) {
    const [created] = await supabaseRequest("/profiles", {
      method: "POST",
      body: JSON.stringify({
        auth_user_id: authUserId,
        email,
        plan_id: "free",
        ...profilePatch,
        created_at: now,
        updated_at: now
      })
    });
    user = normalizeUser(created);
  }

  await ensureCreditAccount(user.id);
  const balance = await getCredits(user.id);
  if (balance === 0 && trialCredits > 0) {
    await addCredits(user.id, trialCredits, "trial_grant");
  }

  const apiKey = await createApiKeyForUser(user.id, "Login session");
  return { user, apiKey, credits: await getCredits(user.id) };
}

export async function createApiKeyForUser(userId, label = "Default") {
  const apiKey = createApiKey();
  const apiKeyHash = hashApiKey(apiKey);
  await supabaseRequest("/api_keys", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      key_hash: apiKeyHash,
      label
    })
  });
  return apiKey;
}

export async function getUserByApiKey(apiKey) {
  const apiKeyHash = hashApiKey(apiKey);
  const keys = await supabaseRequest(`/api_keys?key_hash=eq.${encodeURIComponent(apiKeyHash)}&revoked_at=is.null&select=user_id`);
  const userId = keys[0]?.user_id;
  if (!userId) return null;

  await supabaseRequest(`/api_keys?key_hash=eq.${encodeURIComponent(apiKeyHash)}`, {
    method: "PATCH",
    body: JSON.stringify({ last_used_at: new Date().toISOString() })
  });

  const users = await supabaseRequest(`/profiles?id=eq.${encodeURIComponent(userId)}&limit=1`);
  return users[0] ? normalizeUser(users[0]) : null;
}

export async function getUserByStripeCustomer(stripeCustomerId) {
  const users = await supabaseRequest(`/profiles?stripe_customer_id=eq.${encodeURIComponent(stripeCustomerId)}&limit=1`);
  return users[0] ? normalizeUser(users[0]) : null;
}

export async function getUserByAuthUserId(authUserId) {
  const users = await supabaseRequest(`/profiles?auth_user_id=eq.${encodeURIComponent(authUserId)}&limit=1`);
  return users[0] ? normalizeUser(users[0]) : null;
}

export async function addCredits(userId, credits, reason = "credit_grant", metadata = {}) {
  return Number(await supabaseRpc("add_credits", {
    target_user_id: userId,
    credit_delta: credits,
    credit_reason: reason,
    credit_metadata: metadata
  }));
}

export async function getCredits(userId) {
  const rows = await supabaseRequest(`/credit_accounts?user_id=eq.${encodeURIComponent(userId)}&select=balance&limit=1`);
  return Number(rows[0]?.balance || 0);
}

export async function getCreditAccount(userId) {
  const rows = await supabaseRequest(`/credit_accounts?user_id=eq.${encodeURIComponent(userId)}&limit=1`);
  return rows[0] || null;
}

export async function ensureCreditAccount(userId) {
  const existing = await getCreditAccount(userId);
  if (existing) return existing;

  const [row] = await supabaseRequest("/credit_accounts", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      balance: 0
    })
  });
  return row;
}

export async function updateAutoTopup(userId, settings) {
  const patch = {};
  if (typeof settings.enabled === "boolean") patch.auto_topup_enabled = settings.enabled;
  if (settings.threshold !== undefined) patch.auto_topup_threshold = Number(settings.threshold);
  if (settings.credits !== undefined) patch.auto_topup_credits = Number(settings.credits);
  patch.updated_at = new Date().toISOString();

  const [row] = await supabaseRequest(`/credit_accounts?user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
  return row;
}

export async function consumeCredits(userId, credits) {
  return addCredits(userId, -credits, "simulation_usage");
}

export async function refundSimulationCredits(userId, credits, simulationId, reason = "simulation_failed_refund") {
  if (!credits) return getCredits(userId);
  return addCredits(userId, credits, reason, { simulation_id: simulationId });
}

export async function upsertPlan(user, planId) {
  const [updated] = await supabaseRequest(`/profiles?id=eq.${encodeURIComponent(user.id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      plan_id: planId,
      updated_at: new Date().toISOString()
    })
  });
  return normalizeUser(updated || { ...user, planId });
}

export async function storeSimulation({ userId, input, result, creditsCharged = 0 }) {
  const [row] = await supabaseRequest("/simulations", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId || null,
      status: "completed",
      artifact_type: input?.artifact?.type || null,
      objective: input?.objective || input?.decision_question || null,
      requested_n: input?.simulation?.target_n || input?.target_n || null,
      credits_charged: creditsCharged,
      request: input || {},
      result,
      completed_at: new Date().toISOString()
    })
  });
  return row;
}

export async function createSimulationJob({ userId, input, creditsCharged = 0 }) {
  const [row] = await supabaseRequest("/simulations", {
    method: "POST",
    body: JSON.stringify({
      user_id: userId || null,
      status: "queued",
      artifact_type: input?.artifact?.type || null,
      objective: input?.objective || input?.decision_question || null,
      requested_n: input?.simulation?.target_n || input?.target_n || null,
      credits_charged: creditsCharged,
      request: input || {},
      result: null,
      error: null
    })
  });
  return row;
}

export async function markSimulationRunning(simulationId, userId) {
  const [row] = await supabaseRequest(`/simulations?id=eq.${encodeURIComponent(simulationId)}&user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "running",
      error: null
    })
  });
  return row;
}

export async function completeSimulationJob({ simulationId, userId, result }) {
  const [row] = await supabaseRequest(`/simulations?id=eq.${encodeURIComponent(simulationId)}&user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "completed",
      result,
      error: null,
      completed_at: new Date().toISOString()
    })
  });
  return row;
}

export async function failSimulationJob({ simulationId, userId, error }) {
  const [row] = await supabaseRequest(`/simulations?id=eq.${encodeURIComponent(simulationId)}&user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "failed",
      error: String(error?.message || error || "Simulation failed."),
      completed_at: new Date().toISOString()
    })
  });
  return row;
}

export async function appendSimulationCalibration({ simulationId, userId, calibration }) {
  const row = await getSimulationForUser(simulationId, userId);
  if (!row) return null;
  const result = row.result || {};
  const log = Array.isArray(result.calibration_log) ? result.calibration_log : [];
  const entry = {
    id: `cal_${Date.now()}`,
    actual_outcome: cleanText(calibration.actualOutcome || calibration.actual_outcome),
    outcome_metric: cleanText(calibration.outcomeMetric || calibration.outcome_metric),
    matched_prediction: cleanText(calibration.matchedPrediction || calibration.matched_prediction),
    surprise: cleanText(calibration.surprise),
    notes: cleanText(calibration.notes),
    created_at: new Date().toISOString()
  };
  const updatedResult = {
    ...result,
    calibration_log: [...log, entry],
    calibration_summary: summarizeCalibration([...log, entry])
  };
  const [updated] = await supabaseRequest(`/simulations?id=eq.${encodeURIComponent(simulationId)}&user_id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify({
      result: updatedResult
    })
  });
  return updated;
}

export async function getSimulationForUser(simulationId, userId) {
  const rows = await supabaseRequest(`/simulations?id=eq.${encodeURIComponent(simulationId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`);
  return rows[0] || null;
}

export async function listSimulationsForUser(userId, limit = 20) {
  return supabaseRequest(`/simulations?user_id=eq.${encodeURIComponent(userId)}&select=id,status,artifact_type,objective,requested_n,credits_charged,error,created_at,completed_at&order=created_at.desc&limit=${Number(limit) || 20}`);
}

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    companyName: user.company_name,
    companyUrl: user.company_url,
    role: user.role,
    intendedUse: user.intended_use,
    stripeCustomerId: user.stripe_customer_id,
    planId: user.plan_id,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

function normalizeProfilePatch(profile = {}) {
  const patch = {};
  if (profile.name !== undefined) patch.name = cleanText(profile.name);
  if (profile.companyName !== undefined) patch.company_name = cleanText(profile.companyName);
  if (profile.companyUrl !== undefined) patch.company_url = cleanUrl(profile.companyUrl);
  if (profile.role !== undefined) patch.role = cleanText(profile.role);
  if (profile.intendedUse !== undefined) patch.intended_use = cleanText(profile.intendedUse);
  return patch;
}

function cleanText(value) {
  const text = String(value || "").trim();
  return text || null;
}

function cleanUrl(value) {
  const text = cleanText(value);
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function summarizeCalibration(log = []) {
  return {
    entries: log.length,
    last_outcome: log[log.length - 1]?.actual_outcome || null,
    note: "Calibration entries are user-provided actual outcomes. Use them to compare synthetic predictions against real exposure over time."
  };
}
