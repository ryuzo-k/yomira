# Decision Space Mapper

[![skills.sh](https://skills.sh/b/ryuzo-k/decision-space-mapper)](https://skills.sh/ryuzo-k/decision-space-mapper)

For people who do not want to use an AI agent's first answer as-is.

Decision Space Mapper is an agent-native skill/protocol for Claude Code, Codex, Hermes Agent, Cursor, and generic AI agents. It makes an AI expand the option space before it recommends a path, especially for intangible decisions like product direction, positioning, pricing, launch plans, content strategy, offers, and career moves.

## Install

The primary install path is the open `skills` CLI:

```bash
npx skills add ryuzo-k/decision-space-mapper
```

This is also the path that should make the skill show up on skills.sh once the GitHub repo is public and people install it.

This should make it available to supported agents such as Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, Gemini CLI, Cline, Amp, Antigravity, Goose, OpenCode, Roo, Trae, VS Code, and more.

You can also paste this into the AI agent you already use:

```text
Install Decision Space Mapper from this GitHub repo:
https://github.com/ryuzo-k/decision-space-mapper

Detect whether this environment is Claude Code, Codex, Hermes Agent, Cursor, or another agent.
Install the right adapter for the current environment, then tell me what changed.
```

For terminal-capable agents, the agent should copy the right files:

- Claude Code: copy `skills/decision-space-mapper/` to `~/.claude/skills/decision-space-mapper`
- Codex: copy `skills/decision-space-mapper/` to `${CODEX_HOME:-~/.codex}/skills/decision-space-mapper`
- Hermes Agent: copy `skills/decision-space-mapper/` to `~/.hermes/skills/decision-space-mapper`
- Cursor: copy `adapters/cursor/decision-space-mapper.mdc` to `.cursor/rules/decision-space-mapper.mdc`

Optional repo-local installer:

```bash
node bin/decision-space-mapper.mjs install --target all
```

## Paste Into An AI Agent

Paste this into Claude Code, Codex, Cursor, Hermes, or another terminal-capable agent:

```text
Install Decision Space Mapper from this GitHub repo:
https://github.com/ryuzo-k/decision-space-mapper

Detect the current AI environment. If this is Claude Code, Codex, or Hermes, install the SKILL.md-based skill into the right user skill directory. If this is Cursor, install the Cursor rule.

After installing, verify the files exist and show me the exact path.
```

## Use

Ask your agent:

```text
Use decision-space-mapper for this decision:
I am deciding what product to build next...
```

The skill returns:

- Decision frame
- Decision lenses/categories
- Exhaustive option map grouped by lens
- Blind spots
- Comparison without premature narrowing
- Next evidence to collect before committing

Use it when the default AI answer feels too narrow, too confident, or too optimized for sounding helpful instead of mapping what is actually possible.

## Distribution Model

This repository intentionally separates:

- **Core protocol:** `skills/decision-space-mapper/SKILL.md`
- **Cursor adapter:** `adapters/cursor/decision-space-mapper.mdc`
- **Generic prompt:** `prompts/ai-install.md`
- **Website:** `site/`
- **Optional CLI:** `bin/decision-space-mapper.mjs`

The skill is the distribution layer for the option-mapping product.
