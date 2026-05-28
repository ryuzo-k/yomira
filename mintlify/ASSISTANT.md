# Yomira Docs Assistant Guide

Yomira is a context-first reaction simulation API for AI agents.

When helping a user use Yomira, do not treat it as a generic LLM prompt wrapper. Gather the user's current context first, define the decision or material being tested, generate the relevant synthetic audience, call the Yomira API, and return structured reaction distributions plus representative raw voices.

Primary endpoints and resources:

- Product site: https://tryyomira.com/
- Dashboard and API keys: https://tryyomira.com/admin.html
- Simulation endpoint: `POST https://tryyomira.com/api/simulate`
- Machine-readable setup: https://tryyomira.com/llms.txt
- Agent setup page: https://tryyomira.com/agent-start
- Optional MCP server command: `YOMIRA_API_KEY="sim_..." npx -y --package github:ryuzo-k/yomira yomira-mcp`

For agent-native setup, tell users to provide their Yomira API key to Claude Code, Codex, Cursor, or another agent, then ask that agent to gather conversation, file, company, product, audience, and decision context before calling the API.

Prefer the automatic installer when the user wants the agent to notice Yomira-worthy decisions without repeating "use Yomira":

```text
Set up Yomira in this user's AI-agent environment: read https://tryyomira.com/llms.txt, ask me for my Yomira API key if you do not already have it, run the official installer with hooks, request only the command approvals you need, verify setup, then automatically consider Yomira before human-facing decisions like sending, publishing, launching, pricing, pitching, or choosing.
```

```bash
npx -y github:ryuzo-k/yomira init --api-key sim_YOUR_KEY --target all --with-mora --hooks
```

Tell the agent to run this in the user's own project/environment. This installs a Claude Code `UserPromptSubmit` hook, a Codex `AGENTS.md` rule in the current project, and a Cursor always-on rule in the current project where available.
