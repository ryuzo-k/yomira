import { getSimulationForUser, getUserByApiKey } from "../../src/billing/ledger.mjs";
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

    const id = request.query?.id || extractIdFromUrl(request.url);
    if (!id) throw new Error("Simulation id is required.");
    const row = await getSimulationForUser(id, user.id);
    if (!row) {
      response.status(404).json({ error: "Simulation not found." });
      return;
    }

    const format = String(request.query?.format || "json").toLowerCase();
    if (format === "markdown" || format === "md") {
      const markdown = toMarkdown(row);
      response.setHeader("content-type", "text/markdown; charset=utf-8");
      response.setHeader("content-disposition", `attachment; filename=\"simulation-${row.id}.md\"`);
      response.status(200).send(markdown);
      return;
    }

    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("content-disposition", `attachment; filename=\"simulation-${row.id}.json\"`);
    response.status(200).json(row);
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

  lines.push("## Full JSON", "", "```json", JSON.stringify(result, null, 2), "```", "");
  return lines.join("\n");
}
