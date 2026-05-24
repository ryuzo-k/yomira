import { appendSimulationCalibration, getSimulationForUser, getUserByApiKey } from "../../src/billing/ledger.mjs";
import { handleOptions, setCors } from "../../src/http/cors.mjs";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  setCors(response);

  if (request.method !== "GET" && request.method !== "POST" && request.method !== "PATCH") {
    response.status(405).json({ error: "Method not allowed. Use GET, POST, or PATCH." });
    return;
  }

  try {
    const apiKey = readApiKey(request);
    if (!apiKey) throw new Error("Missing x-api-key.");
    const user = await getUserByApiKey(apiKey);
    if (!user) throw new Error("Invalid API key.");

    const id = request.query?.id || extractIdFromUrl(request.url);
    if (!id) throw new Error("Simulation id is required.");

    if (request.method === "POST" || request.method === "PATCH") {
      const updated = await appendSimulationCalibration({
        simulationId: id,
        userId: user.id,
        calibration: request.body || {}
      });
      if (!updated) {
        response.status(404).json({ error: "Simulation not found." });
        return;
      }
      response.status(200).json({
        id: updated.id,
        status: updated.status,
        result: updated.result,
        calibration_log: updated.result?.calibration_log || []
      });
      return;
    }

    const row = await getSimulationForUser(id, user.id);
    if (!row) {
      response.status(404).json({ error: "Simulation not found." });
      return;
    }

    const format = String(request.query?.format || "").toLowerCase();
    if ((format === "markdown" || format === "md") && row.status !== "completed") {
      response.status(202).json({
        id: row.id,
        status: row.status,
        error: row.error,
        message: "Simulation is not completed yet."
      });
      return;
    }

    if (format === "markdown" || format === "md") {
      const markdown = toMarkdown(row);
      response.setHeader("content-type", "text/markdown; charset=utf-8");
      response.setHeader("content-disposition", `attachment; filename=\"simulation-${row.id}.md\"`);
      response.status(200).send(markdown);
      return;
    }

    if (format === "json") {
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.setHeader("content-disposition", `attachment; filename=\"simulation-${row.id}.json\"`);
      response.status(200).json(row);
      return;
    }

    response.setHeader("content-type", "application/json; charset=utf-8");
    response.status(200).json({
      id: row.id,
      status: row.status,
      artifact_type: row.artifact_type,
      objective: row.objective,
      requested_n: row.requested_n,
      credits_charged: row.credits_charged,
      error: row.error,
      created_at: row.created_at,
      completed_at: row.completed_at,
      result: row.result,
      downloads: row.status === "completed" ? {
        json: `/api/simulations/${row.id}?format=json`,
        markdown: `/api/simulations/${row.id}?format=markdown`
      } : null
    });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}

function readApiKey(request) {
  const header = request.headers["x-api-key"] || request.headers.authorization;
  return String(header || request.query?.api_key || "").replace(/^Bearer\s+/i, "");
}

function extractIdFromUrl(url) {
  return String(url || "").split("?")[0].split("/").filter(Boolean).pop();
}

function toMarkdown(row) {
  const result = row.result || {};
  const lines = [
    `# Simulation ${row.id}`,
    "",
    `Objective: ${result.object?.objective || row.objective || ""}`,
    "",
    `Audience: ${result.object?.audience || ""}`,
    "",
    `Simulated people: ${result.simulation_design?.simulated_n || row.requested_n || ""}`,
    "",
    "## Distribution",
    ""
  ];

  for (const item of result.reaction_distribution || []) {
    lines.push(`- ${Math.round(Number(item.share || 0) * 100)}% (${item.count}) ${item.reaction}`);
  }

  if (result.trust_layer) {
    lines.push("", "## Trust Layer", "");
    lines.push(`Grounding level: ${result.trust_layer.grounding_level || ""}`);
    if (result.trust_layer.data_basis) lines.push("", `Data basis: ${result.trust_layer.data_basis}`);
    if (result.trust_layer.prediction_scope) lines.push("", `Prediction scope: ${result.trust_layer.prediction_scope}`);
    if (result.trust_layer.missing_context?.length) {
      lines.push("", "Missing context:");
      for (const item of result.trust_layer.missing_context) lines.push(`- ${item}`);
    }
    if (result.trust_layer.recommended_validation?.length) {
      lines.push("", "Recommended validation:");
      for (const item of result.trust_layer.recommended_validation) lines.push(`- ${item}`);
    }
  }

  if (result.audience_construction_report?.segments?.length) {
    lines.push("", "## Audience Construction", "");
    for (const segment of result.audience_construction_report.segments) {
      lines.push(`- ${Math.round(Number(segment.share || 0) * 100)}% ${segment.name}: ${segment.why_included || ""}`);
    }
  }

  if (result.comparison?.matrix?.length) {
    lines.push("", "## Option Comparison", "");
    for (const option of result.comparison.matrix) {
      lines.push(`- ${option.label}: positive ${Math.round(Number(option.positive_share || 0) * 100)}%, skeptical ${Math.round(Number(option.skepticism_share || 0) * 100)}%, leading reaction: ${option.leading_reaction}`);
    }
  }

  lines.push("", "## Voice Clusters", "");
  for (const cluster of result.voice_clusters || []) {
    lines.push(`### ${Math.round(Number(cluster.share || 0) * 100)}% - ${cluster.people}`);
    if (cluster.deeper_pattern) lines.push("", cluster.deeper_pattern);
    if (cluster.likely_action) lines.push("", `Likely action: ${cluster.likely_action}`);
    lines.push("");
    for (const voice of cluster.raw_voices || []) {
      lines.push(`> ${voice}`, "");
    }
  }

  if (result.calibration_log?.length) {
    lines.push("", "## Calibration Log", "");
    for (const entry of result.calibration_log) {
      lines.push(`- ${entry.created_at || ""}: ${entry.actual_outcome || ""}`);
      if (entry.notes) lines.push(`  - Notes: ${entry.notes}`);
    }
  }

  lines.push("## Full JSON", "", "```json", JSON.stringify(result, null, 2), "```", "");
  return lines.join("\n");
}
