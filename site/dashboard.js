const API_BASE = location.protocol === "file:" ? "https://tryyomira.com" : "";
const state = {
  apiKey: localStorage.getItem("yomira_api_key") || localStorage.getItem("agent_sim_api_key") || "",
  user: JSON.parse(localStorage.getItem("yomira_user") || localStorage.getItem("agent_sim_user") || "null"),
  latest: null
};

const $ = (selector) => document.querySelector(selector);

if (!state.apiKey) location.href = "./admin.html";
if (state.apiKey) localStorage.setItem("yomira_api_key", state.apiKey);
if (state.user) localStorage.setItem("yomira_user", JSON.stringify(state.user));

$("#logout").addEventListener("click", () => {
  localStorage.removeItem("yomira_api_key");
  localStorage.removeItem("yomira_user");
  location.href = "./admin.html";
});
$("#copy-key").addEventListener("click", () => copyText(state.apiKey, $("#copy-key"), "Copy API key"));
$("#copy-agent-prompt").addEventListener("click", () => copyText(agentSetupPrompt(), $("#copy-agent-prompt"), "Copy agent setup prompt"));
$("#save-auto").addEventListener("click", saveAutoTopup);
$("#run").addEventListener("click", runSimulation);
$("#sample").addEventListener("click", loadSample);
$("#download-json").addEventListener("click", () => downloadLatest("json"));
$("#download-md").addEventListener("click", () => downloadLatest("markdown"));
for (const button of document.querySelectorAll("[data-plan]")) {
  button.addEventListener("click", () => checkout(button.dataset.plan));
}

hydrate();
claimCheckoutIfNeeded();

async function hydrate() {
  $("#account").textContent = state.user?.email || "";
  $("#api-key").textContent = state.apiKey;
  await refreshAccount().catch((error) => $("#billing-status").textContent = error.message);
  await refreshHistory().catch(() => {});
}

async function checkout(planId) {
  try {
    const data = await api("/api/billing/checkout", {
      method: "POST",
      body: { planId, email: state.user?.email }
    });
    location.href = data.url;
  } catch (error) {
    $("#billing-status").textContent = error.message;
  }
}

async function claimCheckoutIfNeeded() {
  const sessionId = new URLSearchParams(location.search).get("session_id");
  if (!sessionId) return;
  $("#billing-status").textContent = "Claiming payment...";
  try {
    const data = await api("/api/billing/claim", { method: "POST", body: { sessionId } });
    if (data.apiKey) {
      state.apiKey = data.apiKey;
      localStorage.setItem("yomira_api_key", data.apiKey);
    }
    if (data.user) {
      state.user = data.user;
      localStorage.setItem("yomira_user", JSON.stringify(data.user));
    }
    $("#billing-status").textContent = "Payment claimed.";
    await hydrate();
  } catch (error) {
    $("#billing-status").textContent = error.message;
  }
}

async function refreshAccount() {
  const data = await api("/api/billing/me", { headers: { "x-api-key": state.apiKey } });
  $("#balance").textContent = `Credits: ${data.credits}`;
  if (data.credit_account) syncAutoTopup(data.credit_account);
}

async function refreshHistory() {
  const data = await api("/api/simulations", { headers: { "x-api-key": state.apiKey } });
  const history = $("#history");
  history.innerHTML = "";
  for (const item of data.simulations || []) {
    const el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `
      <div><strong>${escapeHtml(item.objective || "Untitled simulation")}</strong></div>
      <div class="small">${escapeHtml(item.status || "")} / ${escapeHtml(item.created_at || "")} / ${item.credits_charged} credits</div>
      <div class="row">
        <button class="secondary" data-download-json="${item.id}">JSON</button>
        <button class="secondary" data-download-md="${item.id}">Markdown</button>
      </div>
    `;
    history.append(el);
  }
  for (const button of document.querySelectorAll("[data-download-json]")) {
    button.addEventListener("click", () => downloadSimulation(button.dataset.downloadJson, "json"));
  }
  for (const button of document.querySelectorAll("[data-download-md]")) {
    button.addEventListener("click", () => downloadSimulation(button.dataset.downloadMd, "markdown"));
  }
}

async function saveAutoTopup() {
  try {
    const data = await api("/api/billing/auto-topup", {
      method: "POST",
      headers: { "x-api-key": state.apiKey },
      body: {
        enabled: $("#auto-enabled").checked,
        threshold: Number($("#auto-threshold").value),
        credits: Number($("#auto-credits").value)
      }
    });
    syncAutoTopup(data.credit_account);
    $("#billing-status").textContent = "Billing settings saved.";
  } catch (error) {
    $("#billing-status").textContent = error.message;
  }
}

async function runSimulation() {
  $("#run").disabled = true;
  $("#run-status").textContent = "Creating simulation job...";
  try {
    const job = await api("/api/simulate", {
      method: "POST",
      headers: { "x-api-key": state.apiKey },
      body: {
        objective: $("#objective").value,
        artifact: { type: "product_or_content", content: $("#artifact").value },
        audience: { description: $("#audience").value },
        simulation: {
          mode: $("#mode").value,
          target_n: Number($("#target-n").value),
          max_agent_voices: Number($("#voice-limit").value),
          max_output_tokens: 30000
        }
      }
    });
    $("#run-status").textContent = `Queued. Simulation id: ${job.simulation_id}. Waiting for results...`;
    if (job.billing?.credits_remaining !== undefined) $("#balance").textContent = `Credits: ${job.billing.credits_remaining}`;
    await refreshHistory();
    const completed = await pollSimulation(job.simulation_id);
    state.latest = completed.result;
    renderResult(completed.result);
    $("#run-status").textContent = `Done. Charged ${completed.credits_charged ?? job.billing?.credits_charged ?? "-"} credits.`;
    await refreshHistory();
  } catch (error) {
    $("#run-status").textContent = error.message;
  } finally {
    $("#run").disabled = false;
  }
}

async function pollSimulation(id) {
  const started = Date.now();
  while (Date.now() - started < 10 * 60 * 1000) {
    await delay(3000);
    const data = await api(`/api/simulations/${encodeURIComponent(id)}`, {
      headers: { "x-api-key": state.apiKey }
    });
    if (data.status === "completed" && data.result) return data;
    if (data.status === "failed") throw new Error(data.error || "Simulation failed.");
    $("#run-status").textContent = `${data.status || "running"}... ${Math.round((Date.now() - started) / 1000)}s`;
  }
  throw new Error("Simulation is still running. Check history again in a moment.");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderResult(data) {
  $("#results").classList.remove("hidden");
  $("#result-note").textContent = `${data.simulation_design?.simulated_n || 0} simulated people. Export this result into your next agent conversation.`;
  const distribution = $("#distribution");
  const clusters = $("#clusters");
  distribution.innerHTML = "";
  clusters.innerHTML = "";

  for (const item of data.reaction_distribution || []) {
    const pct = Math.round(Number(item.share || 0) * 100);
    const row = document.createElement("div");
    row.innerHTML = `
      <div class="dist-meta"><strong>${escapeHtml(item.reaction)}</strong><span>${pct}% / ${item.count}</span></div>
      <div class="bar"><span style="width:${Math.max(2, pct)}%"></span></div>
    `;
    distribution.append(row);
  }

  for (const cluster of data.voice_clusters || []) {
    const pct = Math.round(Number(cluster.share || 0) * 100);
    const voices = (cluster.raw_voices || []).map((voice) => `<div class="voice">${escapeHtml(voice)}</div>`).join("");
    const el = document.createElement("article");
    el.className = "cluster";
    el.innerHTML = `
      <div class="cluster-top">
        <div><h3>${escapeHtml(cluster.people)}</h3><div class="small">${escapeHtml(cluster.deeper_pattern || "")}</div></div>
        <div class="share">${pct}%</div>
      </div>
      ${voices}
      <div class="small"><strong>Likely action:</strong> ${escapeHtml(cluster.likely_action || "")}</div>
    `;
    clusters.append(el);
  }
}

function downloadLatest(format) {
  if (!state.latest?.simulation_id) return;
  downloadSimulation(state.latest.simulation_id, format);
}

function downloadSimulation(id, format) {
  const url = `${API_BASE}/api/simulations/${encodeURIComponent(id)}?format=${format}&api_key=${encodeURIComponent(state.apiKey)}`;
  window.open(url, "_blank", "noopener");
}

function syncAutoTopup(account) {
  $("#auto-enabled").checked = Boolean(account.auto_topup_enabled);
  $("#auto-threshold").value = account.auto_topup_threshold ?? 10;
  $("#auto-credits").value = account.auto_topup_credits ?? 200;
}

function loadSample() {
  $("#objective").value = "Decide whether Yomira is worth launching as a paid developer API.";
  $("#audience").value = "Indie hackers, AI tool builders, agency owners, startup founders, and operators who already use Claude Code, Codex, Cursor, or other agentic coding tools.";
  $("#artifact").value = "An API that simulates how likely human audiences would react to a product, profile, offer, or content artifact. It returns many realistic private voices and aggregate patterns for better decisions.";
  $("#target-n").value = 40;
  $("#voice-limit").value = 8;
  $("#mode").value = "fast";
}

function agentSetupPrompt() {
  return `You can use Yomira for reaction simulation.

API base URL:
https://tryyomira.com

API key:
${state.apiKey}

When I ask you to simulate reactions, do this:

1. Identify the exact artifact people will see. If the artifact is missing, ask me for it.
2. Build a context packet from the current conversation: objective, audience, channel, sender/company context, desired action, known concerns, and alternatives.
3. Call POST /api/simulate with:
   - objective
   - artifact.type
   - artifact.content
   - audience.description
   - simulation.mode: "fast" for first pass, "standard" for serious decisions
   - simulation.target_n: 40 for first pass, 120 for serious decisions
4. Poll GET /api/simulations/{simulation_id} until completed.
5. Show me:
   - simulation_id
   - reaction distribution
   - representative raw voices
   - the concrete decision implications
   - what should be tested or changed next
6. If there are multiple candidate options, simulate each option instead of guessing.
7. Never replace the API with your own casual reaction prediction unless I explicitly ask you not to use the API.`;
}

function copyText(text, button, fallbackLabel) {
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = fallbackLabel;
    }, 1200);
  }).catch(() => {
    button.textContent = "Copy failed";
  });
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
