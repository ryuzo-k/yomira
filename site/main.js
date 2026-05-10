const repo = "ryuzo-k/decision-space-mapper";
const repoUrl = `https://github.com/${repo}`;
const skillsCommand = `npx skills add ${repo}`;

const agents = {
  auto: {
    kind: "skills.sh auto-detect",
    title: "Install for the current agent",
    command: skillsCommand,
    prompt: `Install Decision Space Mapper from the open skills ecosystem.

Run this command:

${skillsCommand}

If the command asks which agent to install for, choose the current environment. After installing, verify the skill exists and tell me the exact installed path.

Then test it by mapping the full option space for a real decision before asking for a recommendation.`
  },
  "claude-code": {
    kind: "Claude Code",
    title: "Install for Claude Code",
    command: `${skillsCommand} -a claude-code -g -y`,
    prompt: `Install Decision Space Mapper for Claude Code.

Run:

${skillsCommand} -a claude-code -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  codex: {
    kind: "Codex",
    title: "Install for Codex",
    command: `${skillsCommand} -a codex -g -y`,
    prompt: `Install Decision Space Mapper for Codex.

Run:

${skillsCommand} -a codex -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  cursor: {
    kind: "Cursor",
    title: "Install for Cursor",
    command: `${skillsCommand} -a cursor -g -y`,
    prompt: `Install Decision Space Mapper for Cursor.

Run:

${skillsCommand} -a cursor -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  "github-copilot": {
    kind: "GitHub Copilot",
    title: "Install for GitHub Copilot",
    command: `${skillsCommand} -a github-copilot -g -y`,
    prompt: `Install Decision Space Mapper for GitHub Copilot.

Run:

${skillsCommand} -a github-copilot -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  windsurf: {
    kind: "Windsurf",
    title: "Install for Windsurf",
    command: `${skillsCommand} -a windsurf -g -y`,
    prompt: `Install Decision Space Mapper for Windsurf.

Run:

${skillsCommand} -a windsurf -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  gemini: {
    kind: "Gemini CLI",
    title: "Install for Gemini CLI",
    command: `${skillsCommand} -a gemini -g -y`,
    prompt: `Install Decision Space Mapper for Gemini CLI.

Run:

${skillsCommand} -a gemini -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  cline: {
    kind: "Cline",
    title: "Install for Cline",
    command: `${skillsCommand} -a cline -g -y`,
    prompt: `Install Decision Space Mapper for Cline.

Run:

${skillsCommand} -a cline -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  amp: {
    kind: "Amp",
    title: "Install for Amp",
    command: `${skillsCommand} -a amp -g -y`,
    prompt: `Install Decision Space Mapper for Amp.

Run:

${skillsCommand} -a amp -g -y

Then verify the skill installed and tell me the exact installed path.`
  },
  generic: {
    kind: "Generic agent",
    title: "Install from GitHub manually",
    command: repoUrl,
    prompt: `Install Decision Space Mapper from this GitHub repo:
${repoUrl}

If the open skills CLI is available, run:

${skillsCommand}

If not, fetch the repo and load skills/decision-space-mapper/SKILL.md as a reusable skill/instruction for this agent. After installing, verify the files exist and tell me the exact installed path.`
  }
};

function copyText(text, button) {
  navigator.clipboard.writeText(text.trim()).then(() => {
    const previous = button.textContent;
    button.textContent = "Copied";
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1200);
  });
}

function setAgent(agent) {
  const data = agents[agent] || agents.auto;
  document.querySelector("#agent-kind").textContent = data.kind;
  document.querySelector("#agent-title").textContent = data.title;
  document.querySelector("#agent-prompt").textContent = data.prompt;

  document.querySelectorAll(".agent-tab").forEach((tab) => {
    const active = tab.dataset.agent === agent;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

document.querySelectorAll(".agent-tab").forEach((tab) => {
  tab.addEventListener("click", () => setAgent(tab.dataset.agent));
});

document.querySelector("#copy-agent-prompt")?.addEventListener("click", (event) => {
  copyText(document.querySelector("#agent-prompt").textContent, event.currentTarget);
});

document.querySelector("#copy-hero-prompt")?.addEventListener("click", (event) => {
  copyText(document.querySelector("#agent-prompt").textContent, event.currentTarget);
});

document.querySelector("#copy-skills-command")?.addEventListener("click", (event) => {
  const active = document.querySelector(".agent-tab.is-active")?.dataset.agent || "auto";
  copyText((agents[active] || agents.auto).command, event.currentTarget);
});

setAgent("auto");
