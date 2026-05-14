#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const skillSource = path.join(packageRoot, "skills", "mora");
const cursorRuleSource = path.join(packageRoot, "adapters", "cursor", "mora.mdc");

const home = process.env.HOME || process.env.USERPROFILE || "";

function usage() {
  return `Mora

Usage:
  node bin/mora.mjs install --target all
  node bin/mora.mjs install --target claude
  node bin/mora.mjs install --target codex
  node bin/mora.mjs install --target hermes
  node bin/mora.mjs install --target cursor --cwd /path/to/project
  node bin/mora.mjs prompt
  node bin/mora.mjs doctor

Options:
  --target <all|claude|codex|hermes|cursor>
  --user        Install into the user's global agent directory where supported
  --project     Install into the current project's agent directory where supported
  --cwd <path>  Project directory for Cursor/project installs
`;
}

function parseArgs(argv) {
  const args = { command: "install", target: "all", scope: "user", cwd: process.cwd() };

  if (argv[0] && !argv[0].startsWith("-")) {
    args.command = argv.shift();
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--target") {
      args.target = argv[++i] || "all";
    } else if (arg === "--user") {
      args.scope = "user";
    } else if (arg === "--project") {
      args.scope = "project";
    } else if (arg === "--cwd") {
      args.cwd = path.resolve(argv[++i] || process.cwd());
    } else if (arg === "--help" || arg === "-h") {
      args.command = "help";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
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

function userTarget(agent) {
  if (!home) {
    throw new Error("Could not determine HOME directory for user install.");
  }

  if (agent === "claude") {
    return path.join(home, ".claude", "skills", "mora");
  }

  if (agent === "codex") {
    const codexHome = process.env.CODEX_HOME || path.join(home, ".codex");
    return path.join(codexHome, "skills", "mora");
  }

  if (agent === "hermes") {
    return path.join(home, ".hermes", "skills", "mora");
  }

  throw new Error(`No user skill target for ${agent}.`);
}

function projectTarget(agent, cwd) {
  if (agent === "claude") {
    return path.join(cwd, ".claude", "skills", "mora");
  }

  if (agent === "codex") {
    return path.join(cwd, ".codex", "skills", "mora");
  }

  throw new Error(`Project install is not defined for ${agent}.`);
}

async function installSkill(agent, scope, cwd) {
  const destination = scope === "project" ? projectTarget(agent, cwd) : userTarget(agent);
  await copyDirectory(skillSource, destination);
  return destination;
}

async function installCursor(cwd) {
  const destination = path.join(cwd, ".cursor", "rules", "mora.mdc");
  await copyFile(cursorRuleSource, destination);
  return destination;
}

function expandTargets(target) {
  if (target === "all") {
    return ["claude", "codex", "hermes", "cursor"];
  }

  const valid = new Set(["claude", "codex", "hermes", "cursor"]);
  if (!valid.has(target)) {
    throw new Error(`Invalid target: ${target}`);
  }

  return [target];
}

async function install(args) {
  const targets = expandTargets(args.target);
  const results = [];

  for (const target of targets) {
    if (target === "cursor") {
      const destination = await installCursor(args.cwd);
      results.push({ target, destination });
      continue;
    }

    const destination = await installSkill(target, args.scope, args.cwd);
    results.push({ target, destination });
  }

  console.log("Installed Mora:");
  for (const result of results) {
    console.log(`- ${result.target}: ${result.destination}`);
  }
  console.log("");
  console.log("Try: Use mora to map coherent candidate paths for this decision: ...");
}

async function doctor() {
  const checks = [
    ["claude", userTarget("claude")],
    ["codex", userTarget("codex")],
    ["hermes", userTarget("hermes")],
    ["cursor", path.join(process.cwd(), ".cursor", "rules", "mora.mdc")]
  ];

  console.log("Mora install check:");
  for (const [name, targetPath] of checks) {
    const ok = await exists(targetPath);
    console.log(`- ${name}: ${ok ? "found" : "missing"} (${targetPath})`);
  }
}

function prompt() {
  console.log(`Install Mora for this environment.

If you can run shell commands, run:

npx skills add ryuzo-k/yomira

Then verify the install and tell me which adapters were installed.

After installing, use it to map coherent candidate paths for a real decision before asking for a recommendation.

If npx is not available, fetch the GitHub repository and copy the mora skill folder into the current agent's skill directory. For Cursor, install the Cursor adapter as .cursor/rules/mora.mdc.`);
}

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.command === "help") {
      console.log(usage());
    } else if (args.command === "install") {
      await install(args);
    } else if (args.command === "doctor") {
      await doctor();
    } else if (args.command === "prompt") {
      prompt();
    } else {
      throw new Error(`Unknown command: ${args.command}`);
    }
  } catch (error) {
    console.error(error.message);
    console.error("");
    console.error(usage());
    process.exit(1);
  }
}

await main();
