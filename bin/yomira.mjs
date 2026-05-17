#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const yomiraSkillSource = path.join(packageRoot, "skills", "yomira");
const moraSkillSource = path.join(packageRoot, "skills", "mora");
const cursorYomiraRuleSource = path.join(packageRoot, "adapters", "cursor", "yomira.mdc");
const cursorMoraRuleSource = path.join(packageRoot, "adapters", "cursor", "mora.mdc");
const home = os.homedir();
const defaultBaseUrl = "https://tryyomira.com";

function usage() {
  return `Yomira agent-native onboarding

Usage:
  yomira init --api-key sim_... --target codex
  yomira signup --email you@example.com --password ... --name ... --company-name ... --company-url ... --role ... --intended-use ... --target codex
  yomira install --target all
  yomira doctor
  yomira prompt

Commands:
  init      Save an API key, install the Yomira skill, and verify setup.
  signup    Create an account through the API, save the returned key, install the skill, and verify setup.
  install   Install the Yomira skill without creating an account.
  doctor    Check local config and skill install locations.
  prompt    Print a copy-paste prompt for AI agents.

Options:
  --api-key <key>              Existing Yomira API key.
  --base-url <url>             Default: ${defaultBaseUrl}
  --target <all|claude|codex|hermes|cursor>
  --cwd <path>                 Project directory for Cursor installs.
  --with-mora                  Also install Mora.
  --email <email>
  --password <password>
  --name <name>
  --company-name <name>
  --company-url <url>
  --role <role>
  --intended-use <text>
`;
}

function parseArgs(argv) {
  const args = {
    command: "help",
    target: "all",
    cwd: process.cwd(),
    baseUrl: process.env.YOMIRA_BASE_URL || defaultBaseUrl,
    withMora: false
  };

  if (argv[0] && !argv[0].startsWith("-")) args.command = argv.shift();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--api-key") args.apiKey = argv[++i];
    else if (arg === "--base-url") args.baseUrl = argv[++i] || defaultBaseUrl;
    else if (arg === "--target") args.target = argv[++i] || "all";
    else if (arg === "--cwd") args.cwd = path.resolve(argv[++i] || process.cwd());
    else if (arg === "--with-mora") args.withMora = true;
    else if (arg === "--email") args.email = argv[++i];
    else if (arg === "--password") args.password = argv[++i];
    else if (arg === "--name") args.name = argv[++i];
    else if (arg === "--company-name") args.companyName = argv[++i];
    else if (arg === "--company-url") args.companyUrl = argv[++i];
    else if (arg === "--role") args.role = argv[++i];
    else if (arg === "--intended-use") args.intendedUse = argv[++i];
    else if (arg === "--help" || arg === "-h") args.command = "help";
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyDirectory(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.rm(destination, { recursive: true, force: true });
  await fs.cp(source, destination, { recursive: true });
}

async function copyFile(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
}

function expandTargets(target) {
  if (target === "all") return ["claude", "codex", "hermes", "cursor"];
  const valid = new Set(["claude", "codex", "hermes", "cursor"]);
  if (!valid.has(target)) throw new Error(`Invalid target: ${target}`);
  return [target];
}

function skillTarget(agent, skillName, cwd) {
  if (agent === "claude") return path.join(home, ".claude", "skills", skillName);
  if (agent === "codex") return path.join(process.env.CODEX_HOME || path.join(home, ".codex"), "skills", skillName);
  if (agent === "hermes") return path.join(home, ".hermes", "skills", skillName);
  if (agent === "cursor") return path.join(cwd, ".cursor", "rules", `${skillName}.mdc`);
  throw new Error(`Unknown target: ${agent}`);
}

async function installSkillSet({ target, cwd, withMora }) {
  const results = [];
  for (const agent of expandTargets(target)) {
    if (agent === "cursor") {
      const yomiraDestination = skillTarget(agent, "yomira", cwd);
      await copyFile(cursorYomiraRuleSource, yomiraDestination);
      results.push({ target: agent, skill: "yomira", path: yomiraDestination });
      if (withMora) {
        const moraDestination = skillTarget(agent, "mora", cwd);
        await copyFile(cursorMoraRuleSource, moraDestination);
        results.push({ target: agent, skill: "mora", path: moraDestination });
      }
      continue;
    }

    const yomiraDestination = skillTarget(agent, "yomira", cwd);
    await copyDirectory(yomiraSkillSource, yomiraDestination);
    results.push({ target: agent, skill: "yomira", path: yomiraDestination });
    if (withMora) {
      const moraDestination = skillTarget(agent, "mora", cwd);
      await copyDirectory(moraSkillSource, moraDestination);
      results.push({ target: agent, skill: "mora", path: moraDestination });
    }
  }
  return results;
}

async function saveConfig({ apiKey, baseUrl }) {
  if (!apiKey) throw new Error("Missing --api-key.");
  const configDir = path.join(home, ".yomira");
  const configPath = path.join(configDir, "config.json");
  await fs.mkdir(configDir, { recursive: true, mode: 0o700 });
  await fs.writeFile(configPath, JSON.stringify({
    apiKey,
    baseUrl: baseUrl || defaultBaseUrl,
    createdAt: new Date().toISOString()
  }, null, 2), { mode: 0o600 });
  await fs.chmod(configPath, 0o600).catch(() => {});
  return configPath;
}

async function loadConfig() {
  const configPath = path.join(home, ".yomira", "config.json");
  try {
    return {
      path: configPath,
      data: JSON.parse(await fs.readFile(configPath, "utf8"))
    };
  } catch {
    return { path: configPath, data: null };
  }
}

async function signup(args) {
  const body = {
    name: required(args.name, "--name"),
    email: required(args.email, "--email"),
    password: required(args.password, "--password"),
    companyName: required(args.companyName, "--company-name"),
    companyUrl: required(args.companyUrl, "--company-url"),
    role: required(args.role, "--role"),
    intendedUse: required(args.intendedUse, "--intended-use")
  };

  const response = await fetch(`${args.baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Signup failed: HTTP ${response.status}`);

  await finishSetup({ ...args, apiKey: data.apiKey });
  console.log(`Created Yomira account for ${data.user.email}.`);
  console.log(`Trial credits: ${data.credits}`);
}

function required(value, label) {
  const text = String(value || "").trim();
  if (!text) throw new Error(`Missing ${label}.`);
  return text;
}

async function init(args) {
  await finishSetup(args);
}

async function finishSetup(args) {
  const configPath = await saveConfig({ apiKey: args.apiKey, baseUrl: args.baseUrl });
  const installs = await installSkillSet(args);

  console.log("Yomira is installed.");
  console.log(`- config: ${configPath}`);
  for (const result of installs) {
    console.log(`- ${result.target}/${result.skill}: ${result.path}`);
  }
  console.log("");
  console.log("Use this in your agent:");
  console.log("Use Yomira to simulate reactions to this artifact: ...");
}

async function doctor() {
  const config = await loadConfig();
  console.log("Yomira doctor:");
  console.log(`- config: ${config.data?.apiKey ? "found" : "missing"} (${config.path})`);
  for (const target of expandTargets("all")) {
    const targetPath = skillTarget(target, "yomira", process.cwd());
    console.log(`- ${target}: ${await exists(targetPath) ? "found" : "missing"} (${targetPath})`);
  }
}

function prompt() {
  console.log(`Install Yomira for this environment.

Read:
https://tryyomira.com/llms.txt

If I provide signup details, create my account with POST /api/auth/register.
If I provide an API key, run:

npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora

Then verify with:

npx -y github:ryuzo-k/yomira doctor

After setup, use Yomira whenever I ask you to simulate reactions to a message, post, landing page, offer, pricing page, product idea, or decision option.`);
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.command === "help") console.log(usage());
    else if (args.command === "init") await init(args);
    else if (args.command === "signup") await signup(args);
    else if (args.command === "install") {
      const installs = await installSkillSet(args);
      for (const result of installs) console.log(`${result.target}/${result.skill}: ${result.path}`);
    } else if (args.command === "doctor") await doctor();
    else if (args.command === "prompt") prompt();
    else throw new Error(`Unknown command: ${args.command}`);
  } catch (error) {
    console.error(error.message);
    console.error("");
    console.error(usage());
    process.exit(1);
  }
}

await main();
