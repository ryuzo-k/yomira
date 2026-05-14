---
name: yomira
description: Use Yomira to run real API-backed human-reaction simulations before publishing, sending, selling, launching, pricing, or choosing. Use when the user asks how people may react to a message, DM, email, content draft, landing page, offer, pricing page, X profile/post, product idea, venture concept, or candidate options from Mora. Always prefer calling the API over casual guessing when an API key is available.
---

# Yomira

## Purpose

Use this skill when the user wants to hear likely private human reactions before publishing, sending, selling, launching, pricing, or choosing.

This skill is different from Mora:

- Mora maps the possible paths.
- Yomira tests concrete artifacts or options against likely human reactions.

The output should center raw human voices, then summarize clusters, percentages, and decision implications.

## What Users Do With This Skill

After installing this skill into Claude Code, Codex, Cursor, Hermes Agent, or another AI agent, the user can ask things like:

```text
Use Yomira to check this DM before I send it.
```

```text
Simulate how potential buyers will react to this landing page.
```

```text
Use Mora to map my options, then simulate every concrete option with Yomira.
```

```text
Before I publish this post, run a fast simulation and show me the raw voices that matter.
```

The agent should then:

1. collect the artifact and context from the conversation,
2. call Yomira,
3. poll until the result is complete,
4. show the distribution and raw voices,
5. explain what the user should do next.

## Requirements

The user needs an API key from:

```text
https://yomira-api.vercel.app/admin.html
```

Use an existing key from the environment when present:

```bash
export YOMIRA_API_KEY="sim_..."
export YOMIRA_BASE_URL="https://yomira-api.vercel.app"
```

If the key is not available, do not pretend to simulate. Prepare the request payload and tell the user exactly where to get a key and where to paste it.

If the user pasted an API key into the conversation, use it for the current task but remind them to rotate it later if it was exposed publicly or shared broadly.

## When To Use

Use this for:

- checking a GEO/content draft before publishing
- testing an X profile, bio, thread, or post
- testing a landing page, offer, pricing page, or DM
- comparing candidate paths from Mora
- seeing objections before a sales call or launch
- preparing a Markdown/JSON export for later conversation

Do not use this as proof of reality. It is synthetic decision support.

## Workflow

1. Build the context packet from the current conversation.
2. Clarify the decision being tested.
3. Extract the exact artifact people will actually see.
4. Define the audience likely to encounter it.
5. Start with `mode: "fast"` and `target_n: 40` for speed.
6. If the result is useful, suggest `mode: "standard"` and `target_n: 120`.
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

When used after Mora, convert each candidate path into a concrete artifact or stimulus before simulating. Do not simulate vague path names alone.

## Multi-Option Rule

When there are multiple options, do not pick based on taste. Simulate each concrete option.

For each option, report:

- option name
- simulation id
- reaction distribution
- raw voices that reveal the important objection or desire
- likely action
- decision implication

If simulating all options would be too expensive or too slow, ask the user whether to run all options or start with a smaller `target_n`.

## API Call

```bash
curl -s -X POST "${YOMIRA_BASE_URL:-https://yomira-api.vercel.app}/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
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
      "mode": "fast",
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
3. raw voices inside clusters and agent voices: quote voices that reveal hidden objection/desire.
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

Do not summarize away the human voice. The user's value comes from seeing what different people actually seemed to think, not from a generic recommendation.
