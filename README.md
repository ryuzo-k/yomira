# Yomira

[![skills.sh](https://skills.sh/b/ryuzo-k/yomira)](https://skills.sh/ryuzo-k/yomira)

Yomira is a context-first reaction simulation API for AI agents.

Use it before you send, publish, price, launch, or choose. Your AI agent gathers the working context, calls the API, and brings back reaction distributions, raw private voices, missing-context warnings, and exports.

Mora is separate: it is the free option-mapping skill that helps you decide what concrete options should be simulated. Mora maps the paths. Yomira tests the concrete artifacts.

## Public Links

- Product: https://tryyomira.com/
- Japanese product page: https://tryyomira.com/ja
- Docs: https://docs.tryyomira.com/
- Agent setup: https://docs.tryyomira.com/agent/setup
- Dashboard: https://tryyomira.com/admin.html
- Machine-readable guide: https://tryyomira.com/llms.txt

## What Yomira Does

- Simulates likely reactions to messages, content, landing pages, offers, pricing pages, product ideas, and decision options.
- Compares multiple concrete options instead of letting one LLM choose from taste.
- Returns raw voices, reaction clusters, audience-construction notes, trust/missing-context warnings, and JSON/Markdown exports.
- Lets users attach actual outcomes to saved simulations for later comparison.

Self-serve outcome logs do not automatically retrain the model today. Enterprise work can use grounded or calibrated datasets built from customer notes, interviews, CRM context, reviews, social data, or other source material.

## Agent-First Setup

Most users should not start with curl. Paste this into Claude Code, Codex, Cursor, Hermes Agent, or another terminal-capable AI agent:

```text
Set up Yomira in this user's AI-agent environment: read https://tryyomira.com/llms.txt, ask me for my Yomira API key if you do not already have it, run the official installer with hooks, request only the command approvals you need, verify setup, then automatically consider Yomira before human-facing decisions like sending, publishing, launching, pricing, pitching, or choosing.
```

Long-form version:

```text
Use Yomira for reaction simulation.

API base URL: https://tryyomira.com
API key: sim_YOUR_KEY

When I ask you to check a message, content draft, landing page, offer, product idea, or decision option:
1. Gather the exact artifact, audience, channel, objective, desired action, and known concerns from the conversation/files.
2. If any of those are missing, ask me the smallest number of questions before calling the API.
3. Call POST /api/simulate.
4. Poll the result.
5. Show reaction distribution, raw voices, missing-context warnings, and what decision this supports.
6. Do not replace Yomira with your own guess unless I explicitly ask you not to use the API.
```

The official Yomira skill lives at:

```text
skills/yomira/SKILL.md
```

The Mora option-mapping skill lives at:

```text
skills/mora/SKILL.md
```

## Optional CLI

Run this inside the user's own project/environment, not inside the Yomira repository. The installer writes to that user's home directory and current project:

- `~/.yomira/config.json`
- `~/.yomira/bin/yomira.mjs`
- `~/.claude/settings.json` for Claude Code hooks
- `${CODEX_HOME:-~/.codex}/skills/yomira`
- `AGENTS.md` in the current project for Codex
- `.cursor/rules/yomira.mdc` in the current project for Cursor

If the package can be installed from GitHub, a terminal-capable agent can run:

```bash
npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora --hooks
npx -y github:ryuzo-k/yomira doctor
```

`--hooks` installs the automatic path where the agent platform supports it:

- Claude Code: a `UserPromptSubmit` hook that injects Yomira context when a prompt looks like a human-reaction decision.
- Codex: an `AGENTS.md` preflight rule in the current project.
- Cursor: an always-on project rule.
- Hermes Agent: the Yomira skill fallback, because there is no generic hook file assumed here.

You can install only the hook layer with:

```bash
npx -y github:ryuzo-k/yomira hook install --target all
npx -y github:ryuzo-k/yomira hook doctor
```

## Advanced: MCP

The user-facing setup should stay one prompt. Do not ask users to choose an "MCP version" of Yomira.

MCP is an optional execution layer inside the same flow. The canonical Yomira API is still HTTPS, and the installer/hooks above remain the default path. The MCP server is useful when an AI client can register local MCP tools and you want the agent to call Yomira as a first-class tool instead of hand-writing curl.

```bash
YOMIRA_API_KEY="sim_..." npx -y --package github:ryuzo-k/yomira yomira-mcp
```

Tools:

- `yomira_simulate_reactions`
- `yomira_get_simulation`
- `yomira_export_simulation_markdown`
- `yomira_setup_help`

This is a simulation API adapter, not a docs/search MCP.

## API Quickstart

```bash
export YOMIRA_API_KEY="sim_..."

curl -s -X POST "https://tryyomira.com/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
  -d '{
    "objective": "Decide whether to publish this landing page.",
    "artifact": {
      "type": "landing_page",
      "content": "Paste the exact artifact people will see."
    },
    "audience": {
      "description": "Describe who will see it, where they see it, what they already believe, and what action matters."
    },
    "simulation": {
      "mode": "fast",
      "target_n": 40,
      "max_agent_voices": 8
    }
  }'
```

The API returns `202 Accepted` with a `simulation_id`. Poll it:

```bash
curl -s "https://tryyomira.com/api/simulations/SIMULATION_ID" \
  -H "x-api-key: $YOMIRA_API_KEY"
```

If the request is missing the artifact, audience/channel, or objective, the API returns `422` with `missing_context` and `agent_next_step`.

## Compare Options

```bash
curl -s -X POST "https://tryyomira.com/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
  -d '{
    "objective": "Choose which message to send.",
    "audience": {
      "description": "Potential early users who liked a post about agent-native reaction simulation."
    },
    "options": [
      {
        "label": "Short ask",
        "artifact": { "type": "message", "content": "Want me to run one Yomira simulation for something you are working on?" }
      },
      {
        "label": "Long context",
        "artifact": { "type": "message", "content": "I am building Yomira, an API for agent-native reaction simulation. Want to try it and give blunt feedback?" }
      }
    ],
    "simulation": { "mode": "fast", "target_n": 40, "max_agent_voices": 8 }
  }'
```

## Repository Shape

- `api/`: Vercel API routes.
- `src/simulation/`: simulation engine.
- `src/billing/`: accounts, credits, API keys, and saved simulations.
- `site/`: product pages, dashboard, docs mirror, and machine-readable files.
- `mintlify/`: Mintlify docs source.
- `skills/yomira/`: official Yomira agent skill.
- `skills/mora/`: Mora option-mapping skill.
- `docs/`: internal product and launch notes.

## Product Boundary

Yomira is synthetic decision support, not proof of reality. It becomes more useful when the input includes the exact artifact, audience, channel, sender/company context, desired action, known concerns, and real source material. For high-stakes decisions, use grounded enterprise work with real customer, market, or social data.
