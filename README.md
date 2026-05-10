# Decision Space Mapper

[![skills.sh](https://skills.sh/b/ryuzo-k/decision-space-mapper)](https://skills.sh/ryuzo-k/decision-space-mapper)

For people who do not want to use an AI agent's first answer as-is.

Decision Space Mapper is an agent-native skill/protocol for Claude Code, Codex, Hermes Agent, Cursor, and generic AI agents. It makes an AI extract the options already latent in your context, expand the missing alternatives, and map the full decision space before it recommends a path.

It is intentionally not a taste engine. For surfaces like profiles, launch posts, landing pages, and personal positioning, the skill maps ingredients, bundles, inclusion/exclusion choices, and reactions to test instead of writing polished copy by default.

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
- Source inventory from your own context
- Option families
- Exhaustive option map by family
- Combination options
- Blind spots
- Comparison without premature narrowing
- Simulation bridge for later human or agent testing

Use it when the default AI answer feels too narrow, too confident, or too optimized for sounding helpful instead of showing the real option space.

## What It Produces

The skill should produce a source-grounded option map, not polished copy.

```text
## Source Inventory
- Existing options mentioned: AI search, AI-native agency, TryMind, Japan GTM, credentials, age.
- Tensions: business clarity vs personal taste, trust vs suspicion, boring service vs interesting founder.

## Option Map
### Family: Profile foreground
- Option A: Buyer clarity
  - Include: AI search/GEO, business outcome, contact path.
  - De-emphasize: age, too many side projects.
  - Reaction to test: trustworthy or too narrow?
- Option B: Weird founder / mind angle
  - Include: TryMind, human mind/blog work, unusual taste.
  - De-emphasize: corporate service clarity.
  - Reaction to test: attracts right people or confuses buyers?

## Simulation Bridge
- Stimulus required: 2-3 actual profile drafts written in the user's voice.
- Audience to test: buyers, peers, skeptical operators.
- Signals: trust, suspicion, willingness to contact, memorability.
```

## Distribution Model

This repository intentionally separates:

- **Core protocol:** `skills/decision-space-mapper/SKILL.md`
- **Cursor adapter:** `adapters/cursor/decision-space-mapper.mdc`
- **Generic prompt:** `prompts/ai-install.md`
- **Website:** `site/`
- **Optional CLI:** `bin/decision-space-mapper.mjs`

The skill is the free distribution layer for the option-mapping product and a preparation layer for future simulation workflows.
