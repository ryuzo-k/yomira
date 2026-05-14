# Yomira

Yomira simulates likely private human reactions to a real artifact:

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
https://yomira-api.vercel.app/admin.html
```

2. Open the dashboard:

```text
https://yomira-api.vercel.app/dashboard.html
```

3. Paste the artifact, audience, and decision objective.
4. Start with 40 simulated people.
5. Download Markdown or JSON and continue the conversation in Claude Code, Codex, Cursor, or with a team.

## API

Set:

```bash
export YOMIRA_API_KEY="sim_..."
```

Create a simulation job:

```bash
curl -s -X POST "https://yomira-api.vercel.app/api/simulate" \
  -H "content-type: application/json" \
  -H "x-api-key: $YOMIRA_API_KEY" \
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
      "mode": "fast",
      "target_n": 40,
      "max_agent_voices": 8,
      "max_output_tokens": 30000
    }
  }'
```

The endpoint returns immediately:

```json
{
  "simulation_id": "SIMULATION_ID",
  "status": "queued",
  "polling": {
    "url": "/api/simulations/SIMULATION_ID",
    "recommended_interval_ms": 3000
  }
}
```

Poll until `status` is `completed`:

```bash
curl -s "https://yomira-api.vercel.app/api/simulations/SIMULATION_ID" \
  -H "x-api-key: $YOMIRA_API_KEY"
```

## Response

Important fields:

- `status`: `queued`, `running`, `completed`, or `failed`.
- `result.reaction_distribution`: percentage and count for each reaction type.
- `result.voice_clusters`: the core output; similar private voices grouped together.
- `result.agent_voices`: representative individual dossiers and reactions.
- `id`: saved simulation id.
- `downloads.markdown`: URL path to export Markdown once completed.
- `downloads.json`: URL path to export JSON once completed.
- `credits_charged`: credits used.

## Download A Saved Result

```bash
curl -s "https://yomira-api.vercel.app/api/simulations/SIMULATION_ID?format=markdown" \
  -H "x-api-key: $YOMIRA_API_KEY"
```

```bash
curl -s "https://yomira-api.vercel.app/api/simulations/SIMULATION_ID?format=json" \
  -H "x-api-key: $YOMIRA_API_KEY"
```

## Suggested Defaults

Use:

- `mode: "fast", target_n: 40` for first-pass checks.
- `mode: "standard", target_n: 120` for serious launch/content decisions.
- `mode: "deep", target_n: 300` for deeper comparison.
- `mode: "report", target_n: 1000` for report-grade synthetic coverage.

The default engine uses parallel voice batches and then reduces the batches into a distribution and voice clusters. Use `simulation.strategy: "single"` only for debugging the old one-shot engine.

Credit use:

- 40 people = 5 credits
- 120 people = 20 credits
- 300 people = 60 credits
- 1000 people = 250 credits
- external data / grounded simulations = enterprise contract

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

### Candidate Paths From Mora

Use Mora first to produce coherent paths. Then simulate each path, or simulate the top few actual artifacts derived from those paths.

## Context Quality

The API works best when the request includes the exact artifact and enough business context.

Good context includes:

- exact thing people will see
- who sees it
- where they see it
- what they already believe
- what the sender/company sells
- desired action
- known worries
- alternatives being compared

Thin context produces generic voices. Agent skills should build a context packet from the current conversation before calling the API.
