# Agent Simulation API

Agent Simulation API simulates likely private human reactions to a real artifact:

- product idea
- landing page
- offer
- pricing page
- X profile or post
- DM or sales message
- GEO/content draft
- launch plan

The product is not a truth machine and not a replacement for real customers. It is a fast decision-support layer before interviews, sales calls, ads, or publishing.

## Fastest Use

1. Create an account:

```text
https://agent-simulation-api.vercel.app/admin.html
```

2. Open the dashboard:

```text
https://agent-simulation-api.vercel.app/dashboard.html
```

3. Paste the artifact, audience, and decision objective.
4. Start with 40 simulated people.
5. Download Markdown or JSON and continue the conversation in Claude Code, Codex, Cursor, or with a team.

## API

Set:

```bash
export AGENT_SIMULATION_API_KEY="sim_..."
```

Call:

```bash
curl -s -X POST "https://agent-simulation-api.vercel.app/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $AGENT_SIMULATION_API_KEY" \
  -d '{
    "objective": "Decide whether to publish this content.",
    "artifact": {
      "type": "content_draft",
      "content": "Paste the actual text people will see."
    },
    "audience": {
      "description": "Describe the people likely to see it."
    },
    "simulation": {
      "target_n": 40,
      "max_agent_voices": 8
    }
  }'
```

## Response

Important fields:

- `reaction_distribution`: percentage and count for each reaction type.
- `voice_clusters`: the core output; similar private voices grouped together.
- `agent_voices`: representative individual dossiers and reactions.
- `simulation_id`: saved result id.
- `downloads.markdown`: URL path to export Markdown.
- `downloads.json`: URL path to export JSON.
- `billing.credits_charged`: credits used.

## Download A Saved Result

```bash
curl -s "https://agent-simulation-api.vercel.app/api/simulations/SIMULATION_ID?format=markdown" \
  -H "x-api-key: $AGENT_SIMULATION_API_KEY"
```

```bash
curl -s "https://agent-simulation-api.vercel.app/api/simulations/SIMULATION_ID?format=json" \
  -H "x-api-key: $AGENT_SIMULATION_API_KEY"
```

## Suggested Defaults

Use:

- `target_n: 40` for fast first-pass checks.
- `target_n: 120` for serious launch/content decisions.
- `target_n: 180+` for paid reports or high-stakes decisions.

Large simulations can take longer. Run a small pass first to make sure the artifact and audience are framed correctly.

## Common Use Cases

### GEO / Content Before Publishing

Use this when you want to know how founders, marketers, enterprise buyers, or search-aware operators may privately react to a draft before publishing.

### Offer / Landing Page

Use this to catch confusion, suspicion, pricing resistance, and hidden conversion motives before sending traffic.

### X Profile / Post

Use this to test whether a profile or post attracts buyers, peers, skeptics, or low-fit curiosity.

### Sales DM / Follow-up

Use this to test whether a message feels useful, desperate, impressive, suspicious, or worth replying to.

### Candidate Paths From Decision Foundation

Use Decision Foundation first to produce coherent paths. Then simulate each path, or simulate the top few actual artifacts derived from those paths.
