const API_BASE = location.protocol === "file:" ? "https://agent-simulation-api.vercel.app" : "";
const state = {
  apiKey: localStorage.getItem("agent_sim_api_key") || "",
  user: JSON.parse(localStorage.getItem("agent_sim_user") || "null")
};

const $ = (selector) => document.querySelector(selector);

const emailInput = $("#email");
const passwordInput = $("#password");
const accountStatus = $("#account-status");
const apiKeyWrap = $("#api-key-wrap");
const apiKeyBox = $("#api-key");
const balanceBox = $("#balance");
const billingStatus = $("#billing-status");
const runStatus = $("#run-status");
const results = $("#results");
const distributionEl = $("#distribution");
const clustersEl = $("#clusters");
const resultNote = $("#result-note");

$("#register").addEventListener("click", () => auth("register"));
$("#login").addEventListener("click", () => auth("login"));
$("#copy-key").addEventListener("click", () => navigator.clipboard.writeText(state.apiKey));
$("#save-auto").addEventListener("click", saveAutoTopup);
$("#run").addEventListener("click", runSimulation);
$("#sample").addEventListener("click", loadSample);

for (const button of document.querySelectorAll("[data-plan]")) {
  button.addEventListener("click", () => checkout(button.dataset.plan));
}

hydrate();
claimCheckoutIfNeeded();

async function auth(mode) {
  setBusy(mode === "register" ? $("#register") : $("#login"), true);
  try {
    const data = await api(`/api/auth/${mode}`, {
      method: "POST",
      body: {
        email: emailInput.value,
        password: passwordInput.value
      }
    });
    saveSession(data);
    accountStatus.textContent = `${mode === "register" ? "Account created" : "Logged in"}: ${data.user.email}`;
    await refreshAccount();
  } catch (error) {
    accountStatus.textContent = error.message;
  } finally {
    setBusy(mode === "register" ? $("#register") : $("#login"), false);
  }
}

async function checkout(planId) {
  try {
    const email = state.user?.email || emailInput.value;
    if (!email) throw new Error("Enter your email or create an account first.");
    const data = await api("/api/billing/checkout", {
      method: "POST",
      body: { planId, email }
    });
    location.href = data.url;
  } catch (error) {
    billingStatus.textContent = error.message;
  }
}

async function claimCheckoutIfNeeded() {
  const sessionId = new URLSearchParams(location.search).get("session_id");
  if (!sessionId) return;

  billingStatus.textContent = "Claiming your paid API key...";
  try {
    const data = await api("/api/billing/claim", {
      method: "POST",
      body: { sessionId }
    });
    saveSession(data);
    billingStatus.textContent = "Payment claimed. Your API key is ready.";
    await refreshAccount();
  } catch (error) {
    billingStatus.textContent = error.message;
  }
}

async function refreshAccount() {
  if (!state.apiKey) return;
  const data = await api("/api/billing/me", {
    headers: { "x-api-key": state.apiKey }
  });
  balanceBox.textContent = `Credits: ${data.credits}`;
  if (data.credit_account) syncAutoTopup(data.credit_account);
}

async function saveAutoTopup() {
  if (!state.apiKey) {
    billingStatus.textContent = "Create an account or log in first.";
    return;
  }
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
    billingStatus.textContent = "Billing settings saved.";
  } catch (error) {
    billingStatus.textContent = error.message;
  }
}

async function runSimulation() {
  if (!state.apiKey) {
    runStatus.textContent = "Create an account or log in first.";
    return;
  }

  setBusy($("#run"), true);
  runStatus.textContent = "Simulating private human voices...";
  try {
    const data = await api("/api/simulate", {
      method: "POST",
      headers: { "x-api-key": state.apiKey },
      body: {
        objective: $("#objective").value,
        artifact: {
          type: "product_or_content",
          content: $("#artifact").value
        },
        audience: {
          description: $("#audience").value
        },
        simulation: {
          target_n: Number($("#target-n").value),
          max_agent_voices: Number($("#voice-limit").value)
        }
      }
    });
    renderResult(data);
    runStatus.textContent = `Done. Charged ${data.billing?.credits_charged ?? "-"} credits.`;
    if (data.billing?.credits_remaining !== undefined) {
      balanceBox.textContent = `Credits: ${data.billing.credits_remaining}`;
    }
  } catch (error) {
    runStatus.textContent = error.message;
  } finally {
    setBusy($("#run"), false);
  }
}

function renderResult(data) {
  results.classList.remove("hidden");
  resultNote.textContent = `${data.simulation_design?.simulated_n || 0} simulated people. Representative voices below.`;
  distributionEl.innerHTML = "";
  clustersEl.innerHTML = "";

  for (const item of data.reaction_distribution || []) {
    const pct = Math.round(Number(item.share || 0) * 100);
    const row = document.createElement("div");
    row.className = "dist-row";
    row.innerHTML = `
      <div class="dist-meta"><strong>${escapeHtml(item.reaction)}</strong><span>${pct}% / ${item.count}</span></div>
      <div class="bar"><span style="width:${Math.max(2, pct)}%"></span></div>
    `;
    distributionEl.append(row);
  }

  for (const cluster of data.voice_clusters || []) {
    const pct = Math.round(Number(cluster.share || 0) * 100);
    const voices = (cluster.raw_voices || []).map((voice) => `<div class="voice">${escapeHtml(voice)}</div>`).join("");
    const el = document.createElement("article");
    el.className = "cluster";
    el.innerHTML = `
      <div class="cluster-top">
        <div>
          <h3>${escapeHtml(cluster.people)}</h3>
          <div class="small">${escapeHtml(cluster.deeper_pattern || "")}</div>
        </div>
        <div class="share">${pct}%</div>
      </div>
      ${voices}
      <div class="small"><strong>Likely action:</strong> ${escapeHtml(cluster.likely_action || "")}</div>
    `;
    clustersEl.append(el);
  }
}

function saveSession(data) {
  if (data.apiKey) {
    state.apiKey = data.apiKey;
    localStorage.setItem("agent_sim_api_key", data.apiKey);
  }
  if (data.user) {
    state.user = data.user;
    localStorage.setItem("agent_sim_user", JSON.stringify(data.user));
  }
  hydrate();
}

function hydrate() {
  if (state.user?.email) {
    emailInput.value = state.user.email;
    accountStatus.textContent = `Signed in: ${state.user.email}`;
  }
  apiKeyWrap.classList.toggle("hidden", !state.apiKey);
  apiKeyBox.textContent = state.apiKey || "";
  if (state.apiKey) refreshAccount().catch(() => {});
}

function syncAutoTopup(account) {
  $("#auto-enabled").checked = Boolean(account.auto_topup_enabled);
  $("#auto-threshold").value = account.auto_topup_threshold ?? 10;
  $("#auto-credits").value = account.auto_topup_credits ?? 200;
}

function loadSample() {
  $("#objective").value = "Decide whether Agent Simulation API is worth launching as a paid developer API.";
  $("#audience").value = "Indie hackers, AI tool builders, agency owners, startup founders, and operators who already use Claude Code, Codex, Cursor, or other agentic coding tools.";
  $("#artifact").value = "An API that simulates how likely human audiences would react to a product, profile, offer, or content artifact. It returns many realistic private voices and aggregate patterns for better decisions.";
  $("#target-n").value = 120;
  $("#voice-limit").value = 12;
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

function setBusy(button, busy) {
  button.disabled = busy;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
