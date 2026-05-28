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
const codexRuleStart = "<!-- yomira-auto-hook:start -->";
const codexRuleEnd = "<!-- yomira-auto-hook:end -->";

function usage() {
  return `Yomira agent-native onboarding

Installs into the current user's AI-agent environment:
- ~/.yomira/config.json and ~/.yomira/bin/yomira.mjs
- ~/.claude/settings.json and ~/.claude/skills/yomira for Claude Code
- ~/.codex/skills/yomira plus AGENTS.md in --cwd for Codex
- .cursor/rules/yomira.mdc in --cwd for Cursor
- ~/.hermes/skills/yomira for Hermes Agent

Usage:
  yomira init --api-key sim_... --target codex
  yomira init --api-key sim_... --target claude --with-mora --hooks
  yomira signup --email you@example.com --password ... --name ... --company-name ... --company-url ... --role ... --intended-use ... --target codex
  yomira install --target all
  yomira hook install --target claude
  yomira hook doctor
  yomira doctor
  yomira prompt

Commands:
  init      Save an API key, install the Yomira skill, and verify setup.
  signup    Create an account through the API, save the returned key, install the skill, and verify setup.
  install   Install the Yomira skill without creating an account.
  hook      Install or run automatic agent hooks.
  doctor    Check local config and skill install locations.
  prompt    Print a copy-paste prompt for AI agents.

Options:
  --api-key <key>              Existing Yomira API key.
  --base-url <url>             Default: ${defaultBaseUrl}
  --target <all|claude|codex|hermes|cursor>
  --cwd <path>                 User project directory for Codex/Cursor rules.
  --with-mora                  Also install Mora.
  --hooks                      Also install automatic hooks/rules during init or signup.
  --hook-scope <user|project|local>
                              Claude hook scope. Default: user.
  --format <claude|text|json>  Output format for "yomira hook run". Default: claude.
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
    withMora: false,
    hooks: false,
    hookScope: "user",
    hookCommand: "help",
    format: "claude"
  };

  if (argv[0] && !argv[0].startsWith("-")) args.command = argv.shift();
  if (args.command === "hook" && argv[0] && !argv[0].startsWith("-")) args.hookCommand = argv.shift();

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--api-key") args.apiKey = argv[++i];
    else if (arg === "--base-url") args.baseUrl = argv[++i] || defaultBaseUrl;
    else if (arg === "--target") args.target = argv[++i] || "all";
    else if (arg === "--cwd") args.cwd = path.resolve(argv[++i] || process.cwd());
    else if (arg === "--with-mora") args.withMora = true;
    else if (arg === "--hooks") args.hooks = true;
    else if (arg === "--hook-scope") args.hookScope = argv[++i] || "user";
    else if (arg === "--format") args.format = argv[++i] || "claude";
    else if (arg === "--prompt") args.prompt = argv[++i] || "";
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

function claudeSettingsPath(scope, cwd) {
  if (scope === "user") return path.join(home, ".claude", "settings.json");
  if (scope === "project") return path.join(cwd, ".claude", "settings.json");
  if (scope === "local") return path.join(cwd, ".claude", "settings.local.json");
  throw new Error(`Invalid --hook-scope: ${scope}`);
}

function hookRuntimePath() {
  return path.join(home, ".yomira", "bin", "yomira.mjs");
}

async function installHookRuntime() {
  const runtimePath = hookRuntimePath();
  await fs.mkdir(path.dirname(runtimePath), { recursive: true, mode: 0o700 });
  await fs.copyFile(path.join(packageRoot, "bin", "yomira.mjs"), runtimePath);
  await fs.chmod(runtimePath, 0o755).catch(() => {});
  return runtimePath;
}

function createClaudeHookHandler(scriptPath) {
  return {
    type: "command",
    command: process.execPath,
    args: [scriptPath, "hook", "run", "--format", "claude"],
    timeout: 5,
    statusMessage: "Checking whether Yomira should run"
  };
}

function isYomiraClaudeHook(handler) {
  return handler?.type === "command"
    && Array.isArray(handler.args)
    && handler.args.includes("hook")
    && handler.args.includes("run")
    && String(handler.args[0] || "").endsWith(path.join("bin", "yomira.mjs"));
}

async function readJsonFileIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw new Error(`Could not read JSON at ${filePath}: ${error.message}`);
  }
}

async function installClaudeHook({ cwd, hookScope }) {
  const settingsPath = claudeSettingsPath(hookScope, cwd);
  const settings = await readJsonFileIfExists(settingsPath);
  const runtimePath = await installHookRuntime();
  const handler = createClaudeHookHandler(runtimePath);

  settings.hooks = settings.hooks && typeof settings.hooks === "object" ? settings.hooks : {};
  const groups = Array.isArray(settings.hooks.UserPromptSubmit)
    ? settings.hooks.UserPromptSubmit
    : [];

  for (const entry of groups) {
    if (Array.isArray(entry.hooks)) entry.hooks = entry.hooks.filter((candidate) => !isYomiraClaudeHook(candidate));
  }

  let group = groups.find((entry) => !entry.matcher && Array.isArray(entry.hooks));
  if (!group) {
    group = { hooks: [] };
    groups.push(group);
  }

  group.hooks.push(handler);

  settings.hooks.UserPromptSubmit = groups;
  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n");

  return {
    target: "claude",
    kind: "UserPromptSubmit hook",
    path: settingsPath,
    installed: true
  };
}

function codexAutoRuleBlock() {
  return `${codexRuleStart}
## Yomira Auto Preflight

When the user is preparing a decision, message, post, landing page, offer, pricing page, profile, pitch, product idea, venture direction, or other artifact where real people may react, automatically consider Yomira before giving a final recommendation.

Do not casually guess human reactions if a Yomira API key is available. First gather the exact artifact or concrete options, audience, channel, objective, desired action, sender/company context, and known concerns from the conversation and files. If key context is missing, ask the smallest number of questions. Then call the real Yomira API and report reaction clusters, percentages, raw voices, missing-context warnings, and decision implications.

If the user asks for comprehensive options first, use Mora or decision-space mapping before simulating each concrete option with Yomira.
${codexRuleEnd}`;
}

async function upsertMarkedBlock(filePath, startMarker, endMarker, block) {
  let existing = "";
  try {
    existing = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const start = existing.indexOf(startMarker);
  const end = existing.indexOf(endMarker);
  let next;
  if (start !== -1 && end !== -1 && end > start) {
    next = existing.slice(0, start).trimEnd() + "\n\n" + block + "\n" + existing.slice(end + endMarker.length).trimStart();
  } else if (existing.trim()) {
    next = existing.trimEnd() + "\n\n" + block + "\n";
  } else {
    next = block + "\n";
  }

  await fs.writeFile(filePath, next);
}

async function installCodexAutoRule({ cwd }) {
  const rulePath = path.join(cwd, "AGENTS.md");
  await upsertMarkedBlock(rulePath, codexRuleStart, codexRuleEnd, codexAutoRuleBlock());
  return {
    target: "codex",
    kind: "AGENTS.md auto preflight rule",
    path: rulePath,
    installed: true
  };
}

async function installCursorAutoRule({ cwd }) {
  const rulePath = skillTarget("cursor", "yomira", cwd);
  await copyFile(cursorYomiraRuleSource, rulePath);
  return {
    target: "cursor",
    kind: "always-on Cursor rule",
    path: rulePath,
    installed: true
  };
}

async function installHookSet({ target, cwd, hookScope }) {
  const results = [];
  for (const agent of expandTargets(target)) {
    if (agent === "claude") results.push(await installClaudeHook({ cwd, hookScope }));
    else if (agent === "codex") results.push(await installCodexAutoRule({ cwd }));
    else if (agent === "cursor") results.push(await installCursorAutoRule({ cwd }));
    else if (agent === "hermes") {
      results.push({
        target: "hermes",
        kind: "skill fallback",
        path: skillTarget("hermes", "yomira", cwd),
        installed: false,
        note: "No generic Hermes hook file is installed; the Yomira skill remains the supported path."
      });
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
  console.log(`Credits: ${data.credits}`);
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
  const hookInstalls = args.hooks ? await installHookSet(args) : [];

  console.log("Yomira is installed.");
  console.log(`- config: ${configPath}`);
  for (const result of installs) {
    console.log(`- ${result.target}/${result.skill}: ${result.path}`);
  }
  for (const result of hookInstalls) {
    console.log(`- ${result.target}/${result.kind}: ${result.path}${result.note ? ` (${result.note})` : ""}`);
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
  await hookDoctor({ cwd: process.cwd(), hookScope: "user" });
}

function prompt() {
  console.log(`Install Yomira for this environment.

Read:
https://tryyomira.com/llms.txt

If I provide signup details, create my account with POST /api/auth/register.
If I provide an API key, run:

npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora --hooks

Then verify with:

npx -y github:ryuzo-k/yomira doctor

After setup, use Yomira whenever I ask you to simulate reactions to a message, post, landing page, offer, pricing page, product idea, or decision option.`);
}

function patternCount(text, patterns) {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function classifyPromptForYomira(prompt) {
  const text = String(prompt || "").trim();
  const haystack = text.toLowerCase();
  const disabled = /do not use yomira|don't use yomira|without yomira|no yomira|apiを使わない|yomiraを使わない|yomira使わない|シミュレーションしない/i.test(text);
  if (!text || disabled) {
    return { shouldUseYomira: false, reason: disabled ? "disabled by prompt" : "empty prompt", score: 0 };
  }

  const explicit = /\byomira\b|\bmora\b|reaction simulation|simulate reactions?|human reactions?|raw voices?|本音|反応シミュレーション|シミュレーション|人間の声/i.test(text);
  const artifact = patternCount(haystack, [
    /\bdm\b/, /\bemail\b/, /\bmessage\b/, /\bpost\b/, /\bcontent\b/, /\blanding page\b/, /\blp\b/,
    /\boffer\b/, /\bpricing\b/, /\bprice\b/, /\bprofile\b/, /\bdeck\b/, /\bpitch\b/,
    /\bcopy\b/, /\bad\b/, /\blaunch\b/, /\bsend\b/, /\bpublish\b/, /\bproduct idea\b/,
    /メッセージ/, /メール/, /投稿/, /コンテンツ/, /記事/, /ランディングページ/, /プロフィール/,
    /オファー/, /価格/, /値段/, /営業/, /提案/, /資料/, /事業案/, /プロダクト/, /ローンチ/, /公開/, /送る/
  ]);
  const decision = patternCount(haystack, [
    /\bdecide\b/, /\bdecision\b/, /\bchoose\b/, /\bcompare\b/, /\boption/, /\bwhich\b/, /\bshould\b/,
    /\bdirection\b/, /\bvalidate\b/, /\btest\b/, /\bpreflight\b/,
    /意思決定/, /判断/, /べき/, /決め/, /選択肢/, /比較/, /どれ/, /方向性/, /検証/, /公開前/, /送信前/, /チェック/
  ]);
  const audience = patternCount(haystack, [
    /\baudience\b/, /\bcustomer\b/, /\bbuyer\b/, /\buser\b/, /\bmarket\b/, /\bpeople\b/, /\bpublic\b/,
    /\bfounder\b/, /\bagenc/, /\bmarketer\b/, /\bfollower\b/, /\bclient\b/, /\breaction\b/, /\bfeedback\b/,
    /ユーザー/, /顧客/, /客/, /買う/, /相手/, /読者/, /人が/, /人は/, /市場/, /フォロワー/, /反応/, /意見/
  ]);

  const score = (explicit ? 3 : 0) + Math.min(artifact, 2) + Math.min(decision, 2) + Math.min(audience, 2);
  const shouldUseYomira = explicit
    || (score >= 4 && artifact > 0 && (decision > 0 || audience > 0))
    || (artifact >= 2 && (decision > 0 || audience > 0));

  return {
    shouldUseYomira,
    reason: explicit ? "explicit Yomira/simulation intent" : "decision artifact with likely human reaction",
    score,
    signals: {
      artifact,
      decision,
      audience,
      explicit
    }
  };
}

function buildHookAdditionalContext(classification) {
  return `Yomira auto-hook detected a likely human-reaction decision (${classification.reason}).

Before giving a final recommendation from taste, consider using Yomira.

Required context before calling the API:
- exact artifact people will see, or every concrete option if this is a comparison
- audience and channel
- objective and desired action
- sender/company/product context
- known worries, constraints, or hypotheses

If YOMIRA_API_KEY or ~/.yomira/config.json is available, call the real Yomira API after the context is sufficient. If context is missing, ask the smallest number of questions first. Do not present casual AI guessing as a Yomira simulation. If there are multiple concrete options, simulate every option rather than picking only the top few.`;
}

async function readStdinText() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk));
  return chunks.join("");
}

async function runHook(args) {
  const stdin = await readStdinText();
  let input = null;
  try {
    input = stdin.trim() ? JSON.parse(stdin) : null;
  } catch {
    input = null;
  }

  const promptText = args.prompt || input?.prompt || stdin;
  const classification = classifyPromptForYomira(promptText);
  const eventName = input?.hook_event_name || "UserPromptSubmit";
  const additionalContext = classification.shouldUseYomira ? buildHookAdditionalContext(classification) : "";

  if (args.format === "json") {
    console.log(JSON.stringify({ ...classification, additionalContext }, null, 2));
    return;
  }

  if (!classification.shouldUseYomira) return;

  if (args.format === "text") {
    console.log(additionalContext);
    return;
  }

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext
    }
  }));
}

async function hookDoctor({ cwd, hookScope }) {
  const settingsPath = claudeSettingsPath(hookScope, cwd);
  const settings = await readJsonFileIfExists(settingsPath).catch(() => ({}));
  const claudeGroups = Array.isArray(settings?.hooks?.UserPromptSubmit) ? settings.hooks.UserPromptSubmit : [];
  const hasClaudeHook = claudeGroups.some((entry) => Array.isArray(entry.hooks) && entry.hooks.some(isYomiraClaudeHook));
  const codexPath = path.join(cwd, "AGENTS.md");
  const codexText = await fs.readFile(codexPath, "utf8").catch(() => "");
  const cursorPath = skillTarget("cursor", "yomira", cwd);

  console.log("Yomira hook doctor:");
  console.log(`- claude UserPromptSubmit: ${hasClaudeHook ? "found" : "missing"} (${settingsPath})`);
  console.log(`- codex AGENTS.md rule: ${codexText.includes(codexRuleStart) ? "found" : "missing"} (${codexPath})`);
  console.log(`- cursor rule: ${await exists(cursorPath) ? "found" : "missing"} (${cursorPath})`);
}

async function hook(args) {
  if (args.hookCommand === "install") {
    const installs = await installHookSet(args);
    for (const result of installs) {
      console.log(`${result.target}/${result.kind}: ${result.path}${result.note ? ` (${result.note})` : ""}`);
    }
  } else if (args.hookCommand === "run") {
    await runHook(args);
  } else if (args.hookCommand === "doctor") {
    await hookDoctor(args);
  } else {
    console.log(`Yomira hook commands:
  yomira hook install --target claude
  yomira hook install --target all --hook-scope user
  yomira hook run --format claude
  yomira hook doctor`);
  }
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
    } else if (args.command === "hook") await hook(args);
    else if (args.command === "doctor") await doctor();
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
