#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const defaultBaseUrl = "https://tryyomira.com";
const protocolVersion = "2025-03-26";

const tools = [
  {
    name: "yomira_simulate_reactions",
    description: "Run a real Yomira API-backed human-reaction simulation. Use this instead of guessing when the user wants reactions to a message, post, landing page, offer, pricing page, product idea, or concrete decision option.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        objective: {
          type: "string",
          description: "The decision the user is trying to make."
        },
        artifact: {
          anyOf: [
            { type: "string" },
            { type: "object", additionalProperties: true }
          ],
          description: "The exact artifact people will see. Can be a string or an object such as { type, content }."
        },
        options: {
          type: "array",
          description: "Concrete options to compare. Each item should include a label and artifact.",
          items: {
            type: "object",
            additionalProperties: true
          }
        },
        audience: {
          anyOf: [
            { type: "string" },
            { type: "object", additionalProperties: true }
          ],
          description: "Who will see it, where they see it, and what they already believe. Can be a string or object."
        },
        context: {
          anyOf: [
            { type: "string" },
            { type: "object", additionalProperties: true }
          ],
          description: "Company, sender, channel, stakes, known worries, source notes, or other context."
        },
        simulation: {
          type: "object",
          description: "Yomira simulation settings such as { mode, target_n, max_agent_voices, max_output_tokens }."
        },
        mode: {
          type: "string",
          enum: ["fast", "standard", "deep"],
          description: "Convenience setting merged into simulation.mode."
        },
        target_n: {
          type: "number",
          description: "Convenience setting merged into simulation.target_n."
        },
        wait: {
          type: "boolean",
          description: "Poll until the simulation completes. Defaults to true."
        },
        max_wait_ms: {
          type: "number",
          description: "Maximum time to poll when wait is true. Defaults to 180000."
        },
        apiKey: {
          type: "string",
          description: "Optional API key override. Prefer YOMIRA_API_KEY or ~/.yomira/config.json."
        },
        baseUrl: {
          type: "string",
          description: "Optional API base URL override. Defaults to https://tryyomira.com."
        }
      },
      required: ["objective", "audience"]
    }
  },
  {
    name: "yomira_get_simulation",
    description: "Fetch a saved Yomira simulation by id as JSON.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        simulation_id: {
          type: "string"
        },
        apiKey: {
          type: "string"
        },
        baseUrl: {
          type: "string"
        }
      },
      required: ["simulation_id"]
    }
  },
  {
    name: "yomira_export_simulation_markdown",
    description: "Download a completed Yomira simulation as Markdown for sharing with another AI agent or saving in a repo.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        simulation_id: {
          type: "string"
        },
        apiKey: {
          type: "string"
        },
        baseUrl: {
          type: "string"
        }
      },
      required: ["simulation_id"]
    }
  },
  {
    name: "yomira_setup_help",
    description: "Return the canonical Yomira setup prompt, MCP command, and API-key storage guidance.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {}
    }
  }
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function textContent(text) {
  return {
    content: [
      {
        type: "text",
        text
      }
    ]
  };
}

function jsonContent(value) {
  return textContent(JSON.stringify(value, null, 2));
}

function toolError(message, details = null) {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: details ? `${message}\n\n${JSON.stringify(details, null, 2)}` : message
      }
    ]
  };
}

async function loadConfig() {
  const configPath = path.join(os.homedir(), ".yomira", "config.json");
  try {
    return JSON.parse(await fs.readFile(configPath, "utf8"));
  } catch {
    return {};
  }
}

async function resolveSettings(args = {}) {
  const config = await loadConfig();
  const apiKey = args.apiKey || process.env.YOMIRA_API_KEY || config.apiKey;
  const baseUrl = normalizeBaseUrl(args.baseUrl || process.env.YOMIRA_BASE_URL || config.baseUrl || defaultBaseUrl);
  return {
    apiKey,
    baseUrl
  };
}

function normalizeBaseUrl(value) {
  return String(value || defaultBaseUrl).replace(/\/+$/, "");
}

function asArtifact(value) {
  if (value == null) return value;
  if (typeof value === "string") return { type: "artifact", content: value };
  return value;
}

function asAudience(value) {
  if (value == null) return value;
  if (typeof value === "string") return { description: value };
  return value;
}

function buildSimulationPayload(args) {
  const simulation = {
    ...(args.simulation && typeof args.simulation === "object" ? args.simulation : {})
  };
  if (args.mode) simulation.mode = args.mode;
  if (args.target_n) simulation.target_n = args.target_n;
  if (!simulation.mode) simulation.mode = "fast";
  if (!simulation.target_n) simulation.target_n = 40;

  const payload = {
    objective: args.objective,
    audience: asAudience(args.audience),
    simulation
  };

  if (args.artifact != null) payload.artifact = asArtifact(args.artifact);
  if (Array.isArray(args.options)) payload.options = args.options;
  if (args.context != null) payload.context = args.context;

  return payload;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    text
  };
}

function authHeaders(apiKey, extra = {}) {
  return {
    ...extra,
    "x-api-key": apiKey
  };
}

function requireApiKey(apiKey) {
  if (apiKey) return null;
  return toolError(`Missing Yomira API key.

Ask the user for their key or have them sign up at:
https://tryyomira.com/admin.html

Then store it with:
npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora --hooks

For MCP clients, set:
YOMIRA_API_KEY=sim_YOUR_KEY`);
}

async function simulateReactions(args = {}) {
  const { apiKey, baseUrl } = await resolveSettings(args);
  const keyError = requireApiKey(apiKey);
  if (keyError) return keyError;

  const payload = buildSimulationPayload(args);
  const created = await fetchJson(`${baseUrl}/api/simulate`, {
    method: "POST",
    headers: authHeaders(apiKey, { "content-type": "application/json" }),
    body: JSON.stringify(payload)
  });

  if (!created.ok) {
    return toolError(`Yomira simulation request failed with HTTP ${created.status}.`, created.data);
  }

  const wait = args.wait !== false;
  const simulationId = created.data.simulation_id || created.data.id;
  if (!wait || !simulationId || created.data.status === "completed") {
    return jsonContent(created.data);
  }

  const final = await pollSimulation({
    simulationId,
    baseUrl,
    apiKey,
    maxWaitMs: Number(args.max_wait_ms || 180000),
    intervalMs: Number(created.data.polling?.recommended_interval_ms || 3000)
  });

  return jsonContent({
    created: created.data,
    result: final
  });
}

async function pollSimulation({ simulationId, baseUrl, apiKey, maxWaitMs, intervalMs }) {
  const startedAt = Date.now();
  let last = null;
  while (Date.now() - startedAt <= maxWaitMs) {
    await delay(intervalMs);
    const response = await fetchJson(`${baseUrl}/api/simulations/${encodeURIComponent(simulationId)}`, {
      headers: authHeaders(apiKey)
    });
    last = response.data;
    if (!response.ok) return { status: "error", http_status: response.status, ...response.data };
    if (response.data.status === "completed" || response.data.status === "failed") return response.data;
  }
  return {
    status: "timeout",
    simulation_id: simulationId,
    message: "Polling timed out. Fetch it later with yomira_get_simulation.",
    last
  };
}

async function getSimulation(args = {}) {
  const { apiKey, baseUrl } = await resolveSettings(args);
  const keyError = requireApiKey(apiKey);
  if (keyError) return keyError;
  if (!args.simulation_id) return toolError("Missing simulation_id.");

  const response = await fetchJson(`${baseUrl}/api/simulations/${encodeURIComponent(args.simulation_id)}?format=json`, {
    headers: authHeaders(apiKey)
  });
  if (!response.ok) return toolError(`Yomira fetch failed with HTTP ${response.status}.`, response.data);
  return jsonContent(response.data);
}

async function exportMarkdown(args = {}) {
  const { apiKey, baseUrl } = await resolveSettings(args);
  const keyError = requireApiKey(apiKey);
  if (keyError) return keyError;
  if (!args.simulation_id) return toolError("Missing simulation_id.");

  const response = await fetchText(`${baseUrl}/api/simulations/${encodeURIComponent(args.simulation_id)}?format=markdown`, {
    headers: authHeaders(apiKey)
  });
  if (!response.ok) return toolError(`Yomira Markdown export failed with HTTP ${response.status}.`, response.text);
  return textContent(response.text);
}

async function setupHelp() {
  return textContent(`Yomira setup for AI agents:

1. Ask the user for their Yomira API key, unless YOMIRA_API_KEY or ~/.yomira/config.json already exists.
2. Install the agent-native setup:

npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora --hooks
npx -y github:ryuzo-k/yomira doctor

3. Optional MCP server command for clients that support MCP:

npx -y --package github:ryuzo-k/yomira yomira-mcp

Environment for MCP:
YOMIRA_API_KEY=sim_YOUR_KEY
YOMIRA_BASE_URL=https://tryyomira.com

MCP is optional. The canonical product API is still HTTPS:
POST https://tryyomira.com/api/simulate
GET  https://tryyomira.com/api/simulations/{simulation_id}

Do not replace Yomira with casual reaction guessing when an API key is available.`);
}

async function callTool(name, args) {
  if (name === "yomira_simulate_reactions") return simulateReactions(args);
  if (name === "yomira_get_simulation") return getSimulation(args);
  if (name === "yomira_export_simulation_markdown") return exportMarkdown(args);
  if (name === "yomira_setup_help") return setupHelp(args);
  return toolError(`Unknown Yomira tool: ${name}`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleRequest(message) {
  if (!message || typeof message !== "object") return null;
  if (!("id" in message)) return null;

  if (message.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        protocolVersion: message.params?.protocolVersion || protocolVersion,
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: "yomira",
          title: "Yomira",
          version: "0.1.0"
        }
      }
    };
  }

  if (message.method === "ping") {
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {}
    };
  }

  if (message.method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id: message.id,
      result: {
        tools
      }
    };
  }

  if (message.method === "tools/call") {
    const result = await callTool(message.params?.name, message.params?.arguments || {});
    return {
      jsonrpc: "2.0",
      id: message.id,
      result
    };
  }

  return {
    jsonrpc: "2.0",
    id: message.id,
    error: {
      code: -32601,
      message: `Method not found: ${message.method}`
    }
  };
}

export async function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const text = line.trim();
    if (!text) continue;

    let message;
    try {
      message = JSON.parse(text);
    } catch (error) {
      send({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`
        }
      });
      continue;
    }

    try {
      const response = await handleRequest(message);
      if (response) send(response);
    } catch (error) {
      send({
        jsonrpc: "2.0",
        id: message.id ?? null,
        error: {
          code: -32603,
          message: error.message
        }
      });
    }
  }
}

async function isDirectRun() {
  if (!process.argv[1]) return false;
  const invokedPath = await fs.realpath(process.argv[1]).catch(() => process.argv[1]);
  const modulePath = await fs.realpath(__filename).catch(() => __filename);
  return pathToFileURL(invokedPath).href === pathToFileURL(modulePath).href;
}

if (await isDirectRun()) {
  startMcpServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
