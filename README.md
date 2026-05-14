# Yomira / Mora

[![skills.sh](https://skills.sh/b/ryuzo-k/yomira)](https://skills.sh/ryuzo-k/yomira)

Yomira is the reaction simulation API. Mora is the free option-mapping skill that prepares better decisions before simulation.

Mora is an agent-native skill/protocol for Claude Code, Codex, Hermes Agent, Cursor, and generic AI agents. It makes an AI extract the options already latent in your context, expand the missing alternatives, and package them as coherent candidate paths before it recommends one.

The installable skill id remains `mora`.

It is intentionally not a taste engine. For surfaces like profiles, launch posts, landing pages, and personal positioning, the skill maps viable paths, ingredients, action norms, inclusion/exclusion choices, and reactions to test instead of writing polished copy by default.

## Install

The primary install path is the open `skills` CLI:

```bash
npx skills add ryuzo-k/yomira
```

This is also the path that should make the skill show up on skills.sh once the GitHub repo is public and people install it.

This should make it available to supported agents such as Claude Code, Codex, Cursor, GitHub Copilot, Windsurf, Gemini CLI, Cline, Amp, Antigravity, Goose, OpenCode, Roo, Trae, VS Code, and more.

You can also paste this into the AI agent you already use:

```text
Install Mora from this GitHub repo:
https://github.com/ryuzo-k/yomira

Detect whether this environment is Claude Code, Codex, Hermes Agent, Cursor, or another agent.
Install the right adapter for the current environment, then tell me what changed.
```

For terminal-capable agents, the agent should copy the right files:

- Claude Code: copy `skills/mora/` to `~/.claude/skills/mora`
- Codex: copy `skills/mora/` to `${CODEX_HOME:-~/.codex}/skills/mora`
- Hermes Agent: copy `skills/mora/` to `~/.hermes/skills/mora`
- Cursor: copy `adapters/cursor/mora.mdc` to `.cursor/rules/mora.mdc`

Optional repo-local installer:

```bash
node bin/mora.mjs install --target all
```

## Paste Into An AI Agent

Paste this into Claude Code, Codex, Cursor, Hermes, or another terminal-capable agent:

```text
Install Mora from this GitHub repo:
https://github.com/ryuzo-k/yomira

Detect the current AI environment. If this is Claude Code, Codex, or Hermes, install the SKILL.md-based skill into the right user skill directory. If this is Cursor, install the Cursor rule.

After installing, verify the files exist and show me the exact path.
```

## Use

Ask your agent:

```text
Use mora for this decision:
I am deciding what product to build next...
```

The skill returns:

- Decision frame
- Source inventory from your own context
- Candidate paths / action patterns
- Supporting option families when useful
- Comparison without premature narrowing
- Simulation bridge for later human or agent testing

Use it when the default AI answer feels too narrow, too confident, or too optimized for sounding helpful instead of showing the real paths you could choose.

## What It Produces

The skill should produce source-grounded candidate paths, not loose categories or polished copy.

```text
## Source Inventory
- Existing options mentioned: AI search, AI-native agency, TryMind, Japan GTM, credentials, age.
- Tensions: business clarity vs personal taste, trust vs suspicion, boring service vs interesting founder.

## Candidate Paths
### Path A: Business acquisition profile
- Purpose: convert skeptical business buyers.
- For: operators, founders, overseas companies entering Japan.
- Foreground: AI search/GEO, business outcome, contact path.
- De-emphasize: age, too many side projects, abstract personal philosophy.
- Action norm: post proof, customer problems, teardown threads, clear offers.
- Reaction to test: trustworthy or too narrow?

### Path B: Full self / artist-founder profile
- Purpose: attract people who resonate with the person, not only the service.
- For: peers, founders with taste, creative technologists.
- Foreground: TryMind, human mind/blog work, unusual taste.
- De-emphasize: corporate service clarity.
- Action norm: post essays, observations, prototypes, personal theses.
- Reaction to test: attracts right people or confuses buyers?

## Simulation Bridge
- Stimulus required: 2-3 actual profile drafts written in the user's voice.
- Audience to test: buyers, peers, skeptical operators.
- Signals: trust, suspicion, willingness to contact, memorability.
```

## Distribution Model

This repository intentionally separates:

- **Core protocol:** `skills/mora/SKILL.md`
- **Reaction simulation API prototype:** `src/simulation/`
- **Cursor adapter:** `adapters/cursor/mora.mdc`
- **Generic prompt:** `prompts/ai-install.md`
- **Website:** `site/`
- **Optional CLI:** `bin/mora.mjs`

The skill is the free distribution layer for the path-mapping product and a preparation layer for future simulation workflows.

## Product 2 Prototype: Reaction Simulation API

The first local API prototype is included so we can test the output shape before building the full backend.

```bash
npm run serve:api
```

Then call:

```bash
curl -X POST http://127.0.0.1:8787/simulate \
  -H 'content-type: application/json' \
  -d @request.json
```

Or print a sample request:

```bash
npm run sim:sample
```

See `docs/product-2-api.md` for the current contract.

## Yomira

The paid simulation product now has:

- Web onboarding: `https://yomira-api.vercel.app/admin.html`
- Dashboard: `https://yomira-api.vercel.app/dashboard.html`
- API docs: `docs/yomira-api.md`
- Go-to-market notes: `docs/go-to-market.md`
- Agent skill: `skills/yomira/SKILL.md`
- Use-case skills:
  - `skills/content-reaction-check/SKILL.md`
  - `skills/message-reaction-flow/SKILL.md`
  - `skills/venture-idea-simulation/SKILL.md`

Mora is the free option-mapping layer. Yomira is the paid reaction-testing layer.
