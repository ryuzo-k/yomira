# Yomira Docs Assistant Guide

Yomira is a context-first reaction simulation API for AI agents.

When helping a user use Yomira, do not treat it as a generic LLM prompt wrapper. Gather the user's current context first, define the decision or material being tested, generate the relevant synthetic audience, call the Yomira API, and return structured reaction distributions plus representative raw voices.

Primary endpoints and resources:

- Product site: https://tryyomira.com/
- Dashboard and API keys: https://tryyomira.com/admin.html
- Simulation endpoint: `POST https://tryyomira.com/api/simulate`
- Machine-readable setup: https://tryyomira.com/llms.txt
- Agent setup page: https://tryyomira.com/agent-start
- Docs MCP: https://kokororesearch.mintlify.app/mcp

For agent-native setup, tell users to provide their Yomira API key to Claude Code, Codex, Cursor, or another agent, then ask that agent to gather conversation, file, company, product, audience, and decision context before calling the API.
