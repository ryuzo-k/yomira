const API_BASE = location.protocol === "file:" ? "https://tryyomira.com" : "";
const state = {
  apiKey: localStorage.getItem("yomira_api_key") || localStorage.getItem("agent_sim_api_key") || "",
  user: JSON.parse(localStorage.getItem("yomira_user") || localStorage.getItem("agent_sim_user") || "null"),
  latest: null,
  template: "message"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const templates = {
  message: {
    artifactType: "message",
    objective: "Decide whether to send this message, revise it, or choose a different approach.",
    artifact: "Hi - I saw you liked my post about agent-based reaction simulation. I am building Yomira, an API that lets AI agents simulate how real people might react to messages, content, landing pages, offers, and product ideas. It is only a day old, but I am using it on my own decisions already. Would you be open to trying it and giving honest feedback?",
    audience: "A potential early user who liked a public post about agent-native decision making, probably interested in AI tools, founder tools, or simulation workflows.",
    channel: "X DM after a lightweight public signal.",
    desiredAction: "Reply with curiosity, ask for access, or give honest feedback instead of ignoring the message.",
    senderContext: "The sender is the founder. The product is early, self-serve, API-first, and still being shaped with early users.",
    concerns: "The recipient may feel sold to, may not understand what the API does, may think it is too early, or may not want a long founder DM.",
    alternatives: "Short direct DM; longer context-heavy DM; ask one question first; send link immediately; offer to run one simulation for them.",
    availableData: "Use the recipient's public signal and the message context only. No private data."
  },
  content: {
    artifactType: "content",
    objective: "Decide whether to publish this content and what reaction patterns it may create.",
    artifact: "if you're making decisions inside Claude Code, Codex, Cursor, or Hermes Agent and want simulation-based feedback before you ship, send, publish, or price something, reach out. I am building Yomira.",
    audience: "AI-native founders, indie hackers, marketers, agency owners, and operators who use AI agents in daily work.",
    channel: "Public X / LinkedIn launch post.",
    desiredAction: "Understand the product quickly, feel that the use case is real, and click through or DM.",
    senderContext: "Yomira is early. The founder wants to find people who already make decisions inside AI tools and feel the pain of one-shot AI answers.",
    concerns: "The phrase simulation-based feedback may sound vague. Some readers may assume it is another wrapper. Others may need a concrete example before caring.",
    alternatives: "API-first post; founder story post; concrete example post; enterprise grounded-simulation post; free skill channel post.",
    availableData: "Use public AI-builder audience assumptions only. No external audience data in this run."
  },
  landing: {
    artifactType: "landing_page",
    objective: "Decide whether this landing page makes people understand and trust Yomira enough to sign up or contact the founder.",
    artifact: "Yomira lets your AI agent gather context, build the right audience, and run reaction simulations with raw voices, percentages, and exports. Use it before sending messages, publishing content, launching offers, testing pricing, or choosing product direction.",
    audience: "Founders, marketers, agencies, product teams, and AI-agent users evaluating whether to try a new simulation API.",
    channel: "Landing page viewed from X, docs, founder DM, or search.",
    desiredAction: "Sign up, copy the agent setup prompt, buy credits, or book an enterprise pilot.",
    senderContext: "The product sells self-serve credits and custom enterprise grounded simulations. It needs to look serious, useful, and not like a toy.",
    concerns: "Visitors may doubt simulation accuracy, may not know what to paste, may worry the output is generic, or may not understand self-serve versus enterprise.",
    alternatives: "Minimal essay LP; visual SaaS LP; API docs-first page; enterprise-first page; use-case-first page.",
    availableData: "Use the landing-page copy and product positioning. No live analytics included."
  },
  product: {
    artifactType: "product_direction",
    objective: "Decide which Yomira product direction is most worth pursuing first.",
    artifact: "Yomira could be sold as a self-serve API for AI agents, an enterprise grounded simulation product, a content preflight tool, a message preflight tool, or embedded infrastructure for other research/simulation products.",
    audience: "Potential buyers including AI-native founders, agencies, marketers, enterprise innovation teams, product teams, and developers building agent-native products.",
    channel: "Product strategy decision before launch and outreach.",
    desiredAction: "Identify which direction creates real willingness to pay fastest without weakening the long-term research vision.",
    senderContext: "The founder wants to earn revenue quickly but also build toward serious human-reaction simulation and decision support.",
    concerns: "A generic API may be too abstract. Enterprise sales may be slow. Consumer self-serve may not pay enough. The strongest use case may require better data grounding.",
    alternatives: "Self-serve API; enterprise pilots; content preflight; message preflight; product/venture validation; embedded API for other tools.",
    availableData: "Use current product context, pricing, and launch intent. No customer interview dataset yet."
  },
  pricing: {
    artifactType: "pricing",
    objective: "Decide whether the current credit packs and enterprise line make sense.",
    artifact: "Self-serve Yomira credits: $20 for 100 credits, $99 for 700 credits, $299 for 2,500 credits. Quick simulation uses 5 credits, standard uses 20, deep uses 60, and 1000-person report uses 250. Enterprise grounded simulations are custom.",
    audience: "Individual founders, AI-agent users, agencies, marketers, developers, and enterprise buyers who may pay for reaction simulation.",
    channel: "Pricing page and dashboard checkout.",
    desiredAction: "Buy credits without overthinking, or understand when to contact for enterprise.",
    senderContext: "The product needs high gross margin, quick self-serve revenue, and a clear path to higher-ticket grounded simulation work.",
    concerns: "Users may not know what a credit means, may distrust output quality before paying, may want a free sample, or may be confused by enterprise versus self-serve.",
    alternatives: "Credit packs only; monthly subscription; free trial; paid first simulation; enterprise-only; service-led pilots.",
    availableData: "Use current credit costs and product assumptions. No full cost curve yet."
  },
  enterprise: {
    artifactType: "enterprise_pilot",
    objective: "Decide how to frame a grounded enterprise pilot for high-stakes decisions.",
    artifact: "Yomira can build a grounded audience dataset from customer notes, CRM rows, reviews, interviews, X/social data, community posts, and market source material, then simulate reactions to concrete options before a company launches, publishes, prices, or changes positioning.",
    audience: "Enterprise innovation teams, product marketing, communications, new business teams, agencies, and founders with high-stakes public or commercial decisions.",
    channel: "Founder outreach, enterprise landing page, sales deck, or pilot proposal.",
    desiredAction: "Book a call, share data sources, and agree to a paid pilot.",
    senderContext: "Enterprise value comes from grounding the audience in real source data instead of only described synthetic context.",
    concerns: "Buyers may ask about validity, confidentiality, methodology, procurement, and whether this is meaningfully better than research or surveys.",
    alternatives: "$3k fast pilot; $10k grounded report; $30k+ enterprise pilot; agency-delivered simulation report; API-only integration.",
    availableData: "This run is self-serve synthetic. Enterprise version would use supplied customer/market/social datasets."
  }
};

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
$("#compare-enabled").addEventListener("change", () => {
  $("#compare-options-wrap").classList.toggle("hidden", !$("#compare-enabled").checked);
  updateContextPreview();
});
$("#compare-options").addEventListener("input", updateContextPreview);
$("#save-calibration").addEventListener("click", saveCalibration);
for (const button of $$("[data-template]")) {
  button.addEventListener("click", () => applyTemplate(button.dataset.template));
}
for (const field of ["#objective", "#artifact", "#audience", "#channel", "#desired-action", "#sender-context", "#known-concerns", "#alternatives", "#available-data"]) {
  $(field)?.addEventListener("input", updateContextPreview);
}
for (const button of document.querySelectorAll("[data-plan]")) {
  button.addEventListener("click", () => checkout(button.dataset.plan));
}

hydrate();
claimCheckoutIfNeeded();
applyTemplate("message");

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
        threshold: Number($("#auto-threshold").value)
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
    const context = buildContextPacket();
    const options = $("#compare-enabled").checked ? parseComparisonOptions() : [];
    if ($("#compare-enabled").checked && options.length < 2) {
      throw new Error("Add at least two concrete options to compare.");
    }
    const job = await api("/api/simulate", {
      method: "POST",
      headers: { "x-api-key": state.apiKey },
      body: {
        objective: $("#objective").value,
        artifact: { type: $("#artifact-type").value || state.template || "artifact", content: buildArtifactContent(context) },
        options: options.length ? options : undefined,
        audience: {
          description: buildAudienceDescription(context),
          source: "dashboard_context_packet"
        },
        context,
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
    state.latest.simulation_id = completed.id || job.simulation_id;
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
  renderTrustLayer(data.trust_layer);
  renderAudienceReport(data.audience_construction_report);
  renderComparison(data.comparison);
  const distribution = $("#distribution");
  const clusters = $("#clusters");
  const next = $("#result-next");
  distribution.innerHTML = "";
  clusters.innerHTML = "";
  next.innerHTML = "";

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

  const suggestions = data.next_simulation_inputs || data.suggested_next_tests || [];
  if (suggestions.length) {
    next.innerHTML = `
      <h3>What to simulate next</h3>
      <ul class="small">
        ${suggestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }
}

function renderTrustLayer(trust = {}) {
  const missing = trust.missing_context || [];
  const validation = trust.recommended_validation || [];
  $("#trust-layer").innerHTML = `
    <h3>Trust layer <span class="pill">${escapeHtml(trust.grounding_level || "unknown")}</span></h3>
    <div class="small">${escapeHtml(trust.data_basis || "")}</div>
    <div class="small"><strong>Scope:</strong> ${escapeHtml(trust.prediction_scope || "")}</div>
    ${missing.length ? `<div class="small"><strong>Missing:</strong><ul>${missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
    ${validation.length ? `<div class="small"><strong>Validation:</strong><ul>${validation.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
  `;
}

function renderAudienceReport(report = {}) {
  const segments = report.segments || [];
  $("#audience-report").innerHTML = `
    <h3>Audience construction</h3>
    <div class="small">${escapeHtml(report.construction_method || "")}</div>
    ${segments.slice(0, 6).map((segment) => `
      <div class="small" style="margin-top:8px">
        <strong>${Math.round(Number(segment.share || 0) * 100)}% ${escapeHtml(segment.name || "")}</strong><br />
        ${escapeHtml(segment.why_included || "")}
      </div>
    `).join("")}
  `;
}

function renderComparison(comparison) {
  const el = $("#comparison-result");
  if (!comparison?.matrix?.length) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  el.classList.remove("hidden");
  el.innerHTML = `
    <h3>Option comparison</h3>
    <div class="small"><strong>Suggested path:</strong> ${escapeHtml(comparison.suggested_path?.label || "")}</div>
    ${comparison.matrix.map((option) => `
      <div class="small" style="margin-top:10px">
        <strong>${escapeHtml(option.label)}</strong><br />
        Positive ${Math.round(Number(option.positive_share || 0) * 100)}% / Skeptical ${Math.round(Number(option.skepticism_share || 0) * 100)}%<br />
        ${escapeHtml(option.likely_action || option.core_friction || "")}
      </div>
    `).join("")}
  `;
}

async function saveCalibration() {
  if (!state.latest?.simulation_id) {
    $("#calibration-status").textContent = "Run or load a completed simulation first.";
    return;
  }
  try {
    $("#save-calibration").disabled = true;
    const data = await api(`/api/simulations/${encodeURIComponent(state.latest.simulation_id)}`, {
      method: "POST",
      headers: { "x-api-key": state.apiKey },
      body: {
        actualOutcome: $("#actual-outcome").value,
        notes: $("#calibration-notes").value
      }
    });
    state.latest = data.result;
    state.latest.simulation_id = data.id;
    $("#calibration-status").textContent = "Calibration saved.";
  } catch (error) {
    $("#calibration-status").textContent = error.message;
  } finally {
    $("#save-calibration").disabled = false;
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
  $("#auto-credits").value = "$20 / 100 credits";
}

function loadSample() {
  applyTemplate("product");
  $("#target-n").value = 40;
  $("#voice-limit").value = 8;
  $("#mode").value = "fast";
  updateContextPreview();
}

function applyTemplate(templateId, options = {}) {
  const template = templates[templateId] || templates.message;
  state.template = templateId;
  for (const button of $$("[data-template]")) {
    button.setAttribute("aria-pressed", String(button.dataset.template === templateId));
  }
  $("#artifact-type").value = template.artifactType;
  const shouldFill = !options.preserveIfFilled || !$("#artifact").value.trim();
  if (shouldFill) {
    $("#objective").value = template.objective;
    $("#artifact").value = template.artifact;
    $("#audience").value = template.audience;
    $("#channel").value = template.channel;
    $("#desired-action").value = template.desiredAction;
    $("#sender-context").value = template.senderContext;
    $("#known-concerns").value = template.concerns;
    $("#alternatives").value = template.alternatives;
    $("#available-data").value = template.availableData;
  }
  updateContextPreview();
}

function buildContextPacket() {
  return {
    use_case: state.template,
    channel: $("#channel").value.trim(),
    desired_action: $("#desired-action").value.trim(),
    sender_context: $("#sender-context").value.trim(),
    known_concerns: $("#known-concerns").value.trim(),
    alternatives: $("#alternatives").value.trim(),
    comparison_options: $("#compare-enabled").checked ? $("#compare-options").value.trim() : "",
    available_data: $("#available-data").value.trim()
  };
}

function buildArtifactContent(context) {
  return `${$("#artifact").value.trim()}

---
Yomira context packet
Use case: ${context.use_case}
Channel / situation: ${context.channel}
Sender / company context: ${context.sender_context}
Desired action: ${context.desired_action}
Known concerns / objections: ${context.known_concerns}
Alternatives or variants being considered: ${context.alternatives}
Concrete options being compared: ${context.comparison_options}
Available data or grounding material: ${context.available_data}`;
}

function buildAudienceDescription(context) {
  return `${$("#audience").value.trim()}

Scene context:
- Channel / situation: ${context.channel}
- Desired action: ${context.desired_action}
- Sender / company context: ${context.sender_context}
- Known concerns: ${context.known_concerns}
- Available data: ${context.available_data}`;
}

function updateContextPreview() {
  const checks = {
    artifact: $("#artifact").value.trim().length >= 80,
    audience: $("#audience").value.trim().length >= 50,
    channel: $("#channel").value.trim().length >= 12,
    sender: $("#sender-context").value.trim().length >= 40,
    action: $("#desired-action").value.trim().length >= 15,
    concerns: $("#known-concerns").value.trim().length >= 30
  };
  for (const [key, value] of Object.entries(checks)) {
    document.querySelector(`[data-check="${key}"]`)?.classList.toggle("done", value);
  }
  const context = buildContextPacket();
  $("#context-preview").textContent = [
    `Use case: ${context.use_case}`,
    `Channel: ${context.channel || "(missing)"}`,
    `Desired action: ${context.desired_action || "(missing)"}`,
    `Sender context: ${context.sender_context || "(missing)"}`,
    `Known concerns: ${context.known_concerns || "(missing)"}`,
    `Alternatives: ${context.alternatives || "(optional)"}`,
    `Compare options: ${context.comparison_options ? "yes" : "no"}`,
    `Available data: ${context.available_data || "(optional)"}`
  ].join("\n");
}

function parseComparisonOptions() {
  return $("#compare-options").value
    .split(/\n\s*\n+/)
    .map((block, index) => {
      const [firstLine, ...rest] = block.trim().split("\n");
      if (!firstLine) return null;
      const colonIndex = firstLine.indexOf(":");
      const label = colonIndex > -1 ? firstLine.slice(0, colonIndex).trim() : `Option ${index + 1}`;
      const content = colonIndex > -1
        ? [firstLine.slice(colonIndex + 1).trim(), ...rest].join("\n").trim()
        : block.trim();
      return {
        id: `option_${index + 1}`,
        label,
        artifact: {
          type: $("#artifact-type").value || state.template || "option",
          content: `${content}\n\nShared context:\n${buildArtifactContent(buildContextPacket())}`
        }
      };
    })
    .filter((option) => option?.artifact?.content);
}

function agentSetupPrompt() {
  return `You can use Yomira for reaction simulation.

API base URL:
https://tryyomira.com

API key:
${state.apiKey}

When I ask you to simulate reactions, do this:

1. Identify the exact artifact people will see. If the artifact is missing, ask me for it.
2. Build a context packet from the current conversation, files, docs, and company context: objective, audience, channel, sender/company context, desired action, known concerns, alternatives, and available data.
3. Call POST /api/simulate with:
   - objective
   - artifact.type
   - artifact.content, including the exact artifact plus the context packet
   - audience.description, including who sees it and the scene they see it in
   - context, if your client can send extra JSON fields
   - simulation.mode: "fast" for first pass, "standard" for serious decisions
   - simulation.target_n: 40 for first pass, 120 for serious decisions
4. Poll GET /api/simulations/{simulation_id} until completed.
5. Show me:
   - simulation_id
   - grounding level, missing context, and assumptions
   - audience construction report
   - reaction distribution
   - representative raw voices
   - the concrete decision implications
   - what should be tested or changed next
6. If there are multiple candidate options, simulate each option instead of guessing.
7. After I use a recommendation in the real world, ask me for the actual outcome and save it as calibration with POST /api/simulations/{simulation_id}.
8. Never replace the API with your own casual reaction prediction unless I explicitly ask you not to use the API.`;
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
