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
4. show the trust layer, audience construction, distribution, and raw voices,
5. explain what the user should do next,
6. save the real-world outcome later as calibration when the user has one.

## Requirements

The user needs an API key from:

```text
https://tryyomira.com/admin.html
```

If this environment supports MCP, the agent may connect to the Yomira documentation MCP server:

```text
https://docs.tryyomira.com/mcp
```

Use the MCP server for documentation lookup: setup instructions, API parameters, examples, and best practices. Do not confuse it with the Yomira simulation API itself.

Use an existing key from the environment when present:

```bash
export YOMIRA_API_KEY="sim_..."
export YOMIRA_BASE_URL="https://tryyomira.com"
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
8. After the user sends, publishes, launches, or sells the artifact, ask for the actual result and save it as calibration.

## Context-First Rule

Yomira is not a prompt wrapper. The agent's first responsibility is to reconstruct the decision context before calling the API.

Use the user's current agent environment as the context source:

- current conversation
- repo files and docs
- pasted drafts
- previous decisions in the thread
- company/product descriptions
- launch notes, customer notes, or user-provided source URLs
- Mora candidate paths when present

Do not ask the user to repeat context that is already visible. Extract it yourself.

If the context is too thin for a useful simulation, ask only the missing questions needed to improve the run. Prefer 1-3 direct questions:

```text
Before I run Yomira, I need three things to avoid a generic simulation:
1. Who exactly will see this?
2. Where will they see it?
3. What action do you want from them?
```

If the user is impatient, make labeled assumptions and run a small fast simulation first.

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
- **data mode:** whether this is described, context-enriched, grounded, or calibrated.
- **missing data:** what would make the simulation more reliable.

If one of artifact, audience, or decision is missing, ask one concise question. If the user is in a hurry, make a labeled assumption and run a small simulation first.

When used after Mora, convert each candidate path into a concrete artifact or stimulus before simulating. Do not simulate vague path names alone.

## Data Modes

Use these labels in your report:

- **described:** the audience is described by the user or inferred from the conversation.
- **context-enriched:** the agent used company context, product context, channel context, files, or docs.
- **grounded:** the simulation used real source material such as CRM rows, customer notes, interviews, reviews, social posts, or supplied audience examples.
- **calibrated:** Yomira predictions are being compared with real outcomes for this use case over time.

Self-serve runs are usually described or context-enriched.

Enterprise runs can be grounded or calibrated. For enterprise work, Yobou/Yomira helps construct the necessary audience dataset from real customer, market, or social data.

## Multi-Option Rule

When there are multiple options, do not pick based on taste. Simulate each concrete option.

Prefer one compare-mode API call with an `options` array when the options share the same objective and audience.

For each option, report:

- option name
- comparison matrix row
- reaction distribution
- raw voices that reveal the important objection or desire
- likely action
- decision implication

If simulating all options would be too expensive or too slow, ask the user whether to run all options or start with a smaller `target_n`.

## Compare API Call

```bash
curl -s -X POST "${YOMIRA_BASE_URL:-https://tryyomira.com}/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
  -d '{
    "objective": "Choose which message to send.",
    "audience": {
      "description": "Potential early users who liked a public post."
    },
    "options": [
      {
        "label": "Short ask",
        "artifact": {
          "type": "message",
          "content": "Want me to run one Yomira simulation for something you are working on?"
        }
      },
      {
        "label": "Long context",
        "artifact": {
          "type": "message",
          "content": "I am building Yomira, an agent-native reaction simulation API. Want to try it and give blunt feedback?"
        }
      }
    ],
    "simulation": {
      "mode": "fast",
      "target_n": 40,
      "max_agent_voices": 8
    }
  }'
```

## API Call

```bash
curl -s -X POST "${YOMIRA_BASE_URL:-https://tryyomira.com}/api/simulate" \
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

1. `trust_layer`: grounding level, missing context, assumptions, limits, and validation next steps.
2. `audience_construction_report`: who was simulated and why those segments were included.
3. `comparison`: if present, read the option matrix before recommending a path.
4. `reaction_distribution`: what share felt each way.
5. `voice_clusters`: the main business signal.
6. raw voices inside clusters and agent voices: quote voices that reveal hidden objection/desire.
7. `likely_action`: what they may do next.
8. `downloads.markdown` or `downloads.json`: preserve the result for future agent work.

## Calibration

After the user uses an artifact in the real world, save what actually happened:

```bash
curl -s -X POST "${YOMIRA_BASE_URL:-https://tryyomira.com}/api/simulations/SIMULATION_ID" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
  -d '{
    "actualOutcome": "Sent to 12 people. 4 replied. 1 asked for the link.",
    "notes": "The simulation matched curiosity, but underestimated validation questions."
  }'
```

## Report Format

Return:

```text
## Simulation Summary
- Simulated people:
- Credits charged:
- Grounding level:
- Main distribution:

## What This Means
- Data mode:
- Missing context:
- Assumptions / limits:
- Audience construction:
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
