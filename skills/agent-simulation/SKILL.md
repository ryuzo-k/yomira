---
name: agent-simulation
description: Run synthetic human-reaction simulations through the Agent Simulation API. Use when the user wants to test how people may privately react to a product idea, offer, landing page, X profile, post, DM, sales message, GEO/content draft, launch plan, pricing page, or one or more candidate paths produced by Decision Foundation.
---

# Agent Simulation

## Purpose

Use this skill when the user wants to hear plausible private human reactions before publishing, selling, messaging, or choosing.

This skill is different from Decision Foundation:

- Decision Foundation maps the possible paths.
- Agent Simulation tests one artifact or a set of paths against likely human reactions.

The output should center raw human voices, then summarize the clusters and percentages.

## Requirements

The user needs an API key from:

```text
https://agent-simulation-api.vercel.app/admin.html
```

For terminal-capable agents, ask the user to set:

```bash
export AGENT_SIMULATION_API_KEY="sim_..."
export AGENT_SIMULATION_BASE_URL="https://agent-simulation-api.vercel.app"
```

If the key is not available, prepare the request payload and tell the user exactly where to paste it.

## When To Use

Use this for:

- checking a GEO/content draft before publishing
- testing an X profile, bio, thread, or post
- testing a landing page, offer, pricing page, or DM
- comparing candidate paths from Decision Foundation
- seeing objections before a sales call or launch
- preparing a Markdown/JSON export for later conversation

Do not use this as proof of reality. It is synthetic decision support.

## Workflow

1. Clarify the decision being tested.
2. Extract the artifact people will actually see.
3. Define the audience likely to encounter it.
4. Start with `target_n: 40` for speed.
5. If the result is useful, run a larger simulation such as `target_n: 120` or `180`.
6. Download or preserve the JSON/Markdown result so the user can continue discussing it with another agent.

## API Call

```bash
curl -s -X POST "${AGENT_SIMULATION_BASE_URL:-https://agent-simulation-api.vercel.app}/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $AGENT_SIMULATION_API_KEY" \
  -d '{
    "objective": "Decide whether to publish this GEO content draft.",
    "artifact": {
      "type": "content_draft",
      "content": "PASTE THE ACTUAL TEXT PEOPLE WILL SEE"
    },
    "audience": {
      "description": "Describe who will see this and why they care."
    },
    "simulation": {
      "target_n": 40,
      "max_agent_voices": 8
    }
  }'
```

## Response Reading

Read the result in this order:

1. `reaction_distribution`: what share felt each way.
2. `voice_clusters`: the main business signal.
3. `raw_voices`: the most important part; quote the voices that reveal the hidden objection/desire.
4. `likely_action`: what they may do next.
5. `downloads.markdown` or `downloads.json`: preserve the result for future agent work.

## Report Format

Return:

```text
## Simulation Summary
- Simulated people:
- Credits charged:
- Main distribution:

## What This Means
- Buyer desire:
- Suspicion:
- Confusion:
- Likely conversion path:

## Raw Voices That Matter
> ...
> ...

## Decision
- Ship as-is:
- Revise:
- Run a larger simulation:

## Export
- Markdown:
- JSON:
```

## Important Judgment

If the output sounds too generic, say so. The product only matters when the voices feel specific enough to change the user's decision.
