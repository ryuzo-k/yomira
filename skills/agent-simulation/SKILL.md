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

1. Build the context packet from the current conversation.
2. Clarify the decision being tested.
3. Extract the artifact people will actually see.
4. Define the audience likely to encounter it.
5. Start with `target_n: 40` for speed.
6. If the result is useful, run a larger simulation such as `target_n: 120` or `180`.
7. Download or preserve the JSON/Markdown result so the user can continue discussing it with another agent.

## Context Packet

The simulation will be weak if the input is thin. Before calling the API, gather context from the current conversation, files, docs, or repo. Do not ask the user to re-explain what is already visible.

Prepare:

- **artifact:** the exact thing people will see, not a description of the thing.
- **decision:** what choice the user is trying to make.
- **audience:** who will see it, how they encounter it, and what they care about.
- **stakes:** what happens if the reaction is bad.
- **business context:** what the user sells, to whom, price range, trust problem, proof, constraints.
- **distribution context:** X, Reddit, LinkedIn, email, sales DM, SEO/GEO, enterprise deck, app UI, etc.
- **known worries:** the user's explicit fears, dislikes, or hypotheses.
- **alternatives:** any candidate paths or variants being compared.

If one of artifact, audience, or decision is missing, ask one concise question. If the user is in a hurry, make a labeled assumption and run a small simulation first.

When used after Decision Foundation, convert each candidate path into a concrete artifact or stimulus before simulating. Do not simulate vague path names alone.

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
      "max_agent_voices": 8,
      "max_output_tokens": 16000
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
