const API_BASE = location.protocol === "file:" ? "https://tryyomira.com" : "";
const state = {
  apiKey: localStorage.getItem("yomira_api_key") || localStorage.getItem("agent_sim_api_key") || "",
  user: JSON.parse(localStorage.getItem("yomira_user") || localStorage.getItem("agent_sim_user") || "null"),
  account: null,
  simulations: [],
  selectedPlan: "pack_100"
};

const plans = {
  pack_100: { label: "$20", credits: 100, note: "100 credits for quick checks and early experiments." },
  pack_700: { label: "$99", credits: 700, note: "700 credits for regular content, offer, and message checks." },
  pack_2500: { label: "$299", credits: 2500, note: "2,500 credits for teams, agencies, and large comparison runs." }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const checkoutSessionId = new URLSearchParams(location.search).get("session_id");
if (!state.apiKey && !checkoutSessionId) location.href = "./admin.html";
if (state.apiKey) localStorage.setItem("yomira_api_key", state.apiKey);
if (state.user) localStorage.setItem("yomira_user", JSON.stringify(state.user));

$("#logout").addEventListener("click", () => {
  localStorage.removeItem("yomira_api_key");
  localStorage.removeItem("yomira_user");
  location.href = "./admin.html";
});

$("#copy-key").addEventListener("click", () => copyText(state.apiKey, $("#copy-key"), "Copy API key"));
$("#copy-agent-prompt").addEventListener("click", () => copyText(agentSetupPrompt(), $("#copy-agent-prompt"), "Copy one-line agent setup"));
$("#refresh-history").addEventListener("click", hydrate);
$("#continue-checkout").addEventListener("click", () => checkout(state.selectedPlan));
$("#save-auto").addEventListener("click", saveAutoTopup);

for (const id of ["open-buy-credits", "open-buy-credits-2"]) {
  $(`#${id}`).addEventListener("click", () => openModal("purchase-modal"));
}
for (const id of ["open-auto-topup", "open-auto-topup-2"]) {
  $(`#${id}`).addEventListener("click", () => openModal("auto-modal"));
}
for (const closeButton of $$("[data-close-modal]")) {
  closeButton.addEventListener("click", () => closeModal(closeButton.dataset.closeModal));
}
for (const backdrop of $$(".modal-backdrop")) {
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
}
for (const button of $$("[data-plan]")) {
  button.addEventListener("click", () => selectPlan(button.dataset.plan));
}

claimCheckoutIfNeeded().then(hydrate).catch((error) => {
  $("#billing-status").textContent = error.message;
  hydrate();
});

async function hydrate() {
  $("#account").textContent = state.user?.email || "";
  $("#api-key").textContent = state.apiKey;
  await refreshAccount().catch((error) => showAccountError(error));
  await refreshHistory().catch((error) => showHistoryError(error));
  renderDashboard();
}

async function refreshAccount() {
  const data = await api("/api/billing/me", { headers: { "x-api-key": state.apiKey } });
  state.account = data;
  if (data.user) {
    state.user = data.user;
    localStorage.setItem("yomira_user", JSON.stringify(data.user));
    $("#account").textContent = data.user.email || "";
  }
}

async function refreshHistory() {
  const data = await api("/api/simulations?limit=100", { headers: { "x-api-key": state.apiKey } });
  state.simulations = data.simulations || [];
}

function renderDashboard() {
  const stats = calculateStats(state.simulations);
  const creditAccount = state.account?.credit_account || {};
  const credits = Number(state.account?.credits ?? creditAccount.balance ?? 0);

  $("#metric-credits").textContent = formatNumber(credits);
  $("#billing-balance").textContent = formatNumber(credits);
  $("#metric-autotopup").textContent = creditAccount.auto_topup_enabled ? "Auto top-up enabled" : "Auto top-up off";
  $("#metric-runs").textContent = formatNumber(stats.total);
  $("#metric-last-run").textContent = stats.lastRun ? `Last run ${formatDate(stats.lastRun)}` : "Last run -";
  $("#metric-used").textContent = formatNumber(stats.creditsUsed);
  $("#metric-avg").textContent = stats.total ? `Average ${Math.round(stats.creditsUsed / stats.total)} credits / run` : "Average -";
  $("#metric-success").textContent = stats.total ? `${Math.round(stats.completed / stats.total * 100)}%` : "-";
  $("#metric-active").textContent = `${stats.active} queued / running`;

  $("#billing-threshold").textContent = formatNumber(creditAccount.auto_topup_threshold ?? 10);
  $("#billing-pack").textContent = `${formatNumber(creditAccount.auto_topup_credits || 100)} credits`;
  $("#auto-enabled").checked = Boolean(creditAccount.auto_topup_enabled);
  $("#auto-threshold").value = creditAccount.auto_topup_threshold ?? 10;
  $("#auto-credits").value = String(creditAccount.auto_topup_credits || 100);

  renderUsageAnalysis(stats);
  renderSimulationAnalysis(stats);
  renderHistory();
}

function renderUsageAnalysis(stats) {
  const rows = [
    ["Completed", stats.completed],
    ["Queued / running", stats.active],
    ["Failed", stats.failed],
    ["Last 7 days", stats.last7Days]
  ];
  $("#usage-analysis").innerHTML = rows.map(([label, value]) => usageRow(label, value, Math.max(stats.total, stats.last7Days, 1))).join("")
    + `<p class="small" style="margin:14px 0 0">This is dashboard-side analysis from saved API jobs. It does not include raw HTTP request logs yet.</p>`;
}

function renderSimulationAnalysis(stats) {
  const rows = Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (!rows.length) {
    $("#simulation-analysis").innerHTML = `<p class="small">No simulations yet. Use the one-line agent setup prompt, then ask your AI agent to run Yomira before a human-facing decision.</p>`;
    return;
  }
  $("#simulation-analysis").innerHTML = rows.map(([label, value]) => usageRow(label || "unknown", value, stats.total)).join("")
    + `<p class="small" style="margin:14px 0 0">Average requested audience size: ${formatNumber(stats.avgRequestedN)} people.</p>`;
}

function usageRow(label, value, max) {
  const pct = max ? Math.round(value / max * 100) : 0;
  return `
    <div class="usage-row">
      <div>${escapeHtml(label)}</div>
      <div class="bar"><span style="width:${Math.max(2, pct)}%"></span></div>
      <strong>${formatNumber(value)}</strong>
    </div>
  `;
}

function renderHistory() {
  const body = $("#history-body");
  if (!state.simulations.length) {
    body.innerHTML = `<tr><td colspan="7" class="small">No simulation history yet.</td></tr>`;
    return;
  }
  body.innerHTML = state.simulations.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.objective || "Untitled simulation")}</strong><div class="small">${escapeHtml(item.id)}</div></td>
      <td><span class="pill">${escapeHtml(item.status || "")}</span>${item.error ? `<div class="small">${escapeHtml(item.error)}</div>` : ""}</td>
      <td>${escapeHtml(item.artifact_type || "-")}</td>
      <td>${formatNumber(item.requested_n || "-")}</td>
      <td>${formatNumber(item.credits_charged || 0)}</td>
      <td>${formatDate(item.created_at)}</td>
      <td class="row">
        <button class="secondary" data-download-json="${item.id}">JSON</button>
        <button class="secondary" data-download-md="${item.id}">MD</button>
      </td>
    </tr>
  `).join("");
  for (const button of $$("[data-download-json]")) {
    button.addEventListener("click", () => downloadSimulation(button.dataset.downloadJson, "json"));
  }
  for (const button of $$("[data-download-md]")) {
    button.addEventListener("click", () => downloadSimulation(button.dataset.downloadMd, "markdown"));
  }
}

function calculateStats(rows) {
  const now = Date.now();
  const byType = {};
  let creditsUsed = 0;
  let requestedTotal = 0;
  let requestedCount = 0;
  let completed = 0;
  let active = 0;
  let failed = 0;
  let last7Days = 0;
  let lastRun = null;

  for (const row of rows) {
    const created = row.created_at ? new Date(row.created_at).getTime() : 0;
    if (!lastRun || created > new Date(lastRun).getTime()) lastRun = row.created_at;
    if (created && now - created <= 7 * 24 * 60 * 60 * 1000) last7Days += 1;
    if (row.status === "completed") completed += 1;
    else if (row.status === "failed") failed += 1;
    else active += 1;
    creditsUsed += Number(row.credits_charged || 0);
    byType[row.artifact_type || "unknown"] = (byType[row.artifact_type || "unknown"] || 0) + 1;
    if (Number(row.requested_n)) {
      requestedTotal += Number(row.requested_n);
      requestedCount += 1;
    }
  }

  return {
    total: rows.length,
    completed,
    active,
    failed,
    last7Days,
    lastRun,
    creditsUsed,
    byType,
    avgRequestedN: requestedCount ? Math.round(requestedTotal / requestedCount) : 0
  };
}

function selectPlan(planId) {
  state.selectedPlan = plans[planId] ? planId : "pack_100";
  for (const button of $$("[data-plan]")) {
    button.setAttribute("aria-pressed", String(button.dataset.plan === state.selectedPlan));
  }
  const plan = plans[state.selectedPlan];
  $("#selected-plan-label").textContent = plan.label;
  $("#selected-plan-note").textContent = plan.note;
}

async function checkout(planId) {
  $("#continue-checkout").disabled = true;
  $("#billing-status").textContent = "Opening Stripe Checkout...";
  try {
    const data = await api("/api/billing/checkout", {
      method: "POST",
      body: { planId, email: state.user?.email }
    });
    location.href = data.url;
  } catch (error) {
    $("#billing-status").textContent = error.message;
    $("#continue-checkout").disabled = false;
  }
}

async function claimCheckoutIfNeeded() {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  if (!sessionId) return;
  $("#billing-status").textContent = "Claiming payment...";
  const data = await api("/api/billing/claim", { method: "POST", body: { sessionId } });
  if (data.apiKey) {
    state.apiKey = data.apiKey;
    localStorage.setItem("yomira_api_key", data.apiKey);
  }
  if (data.user) {
    state.user = data.user;
    localStorage.setItem("yomira_user", JSON.stringify(data.user));
  }
  history.replaceState({}, "", "./dashboard.html");
  $("#billing-status").textContent = "Payment claimed.";
}

async function saveAutoTopup() {
  $("#save-auto").disabled = true;
  $("#auto-status").textContent = "Saving...";
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
    state.account = { ...(state.account || {}), credit_account: data.credit_account };
    renderDashboard();
    $("#auto-status").textContent = "Saved.";
  } catch (error) {
    $("#auto-status").textContent = error.message;
  } finally {
    $("#save-auto").disabled = false;
  }
}

function openModal(id) {
  $(`#${id}`).classList.remove("hidden");
}

function closeModal(id) {
  $(`#${id}`).classList.add("hidden");
}

function downloadSimulation(id, format) {
  const url = `${API_BASE}/api/simulations/${encodeURIComponent(id)}?format=${format}&api_key=${encodeURIComponent(state.apiKey)}`;
  window.open(url, "_blank", "noopener");
}

function agentSetupPrompt() {
  return `Set up Yomira in this user's AI-agent environment: read https://tryyomira.com/llms.txt, use this API key ${state.apiKey}, run the official installer with hooks, request only the command approvals you need, verify setup, then automatically consider Yomira before human-facing decisions like sending, publishing, launching, pricing, pitching, or choosing.`;
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

function showAccountError(error) {
  $("#metric-credits").textContent = "-";
  $("#billing-status").textContent = error.message;
}

function showHistoryError(error) {
  $("#history-body").innerHTML = `<tr><td colspan="7" class="small">${escapeHtml(error.message)}</td></tr>`;
}

function formatNumber(value) {
  if (value === "-" || value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
