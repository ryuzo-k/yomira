# Product 2 API: Reaction Simulation

This is the first local API contract for Product 2.

The product is not a scoring API. It is a synthetic human voice API:

- Build the audience that would realistically encounter an artifact.
- Generate detailed human dossiers for that scene.
- Return many inner voices, likely actions, and clustered patterns.
- Let the user make the decision from the voices and the distribution.

## Local Server

Set the LLM key locally. Do not commit `.env`.

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

Or create a local `.env`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

```bash
npm run serve:api
```

Health check:

```bash
curl http://127.0.0.1:8787/health
```

Simulation:

```bash
curl -X POST http://127.0.0.1:8787/simulate \
  -H 'content-type: application/json' \
  -d @request.json
```

## Request

```json
{
  "artifact": {
    "type": "x_profile",
    "content": "AI-native agency founder. Building Mora and synthetic human voice simulation for better decisions."
  },
  "objective": "Understand how people would interpret this X profile and what actions they might take.",
  "audience": {
    "source": "described",
    "description": "AI-native founders, small business owners, consultants, curious peers, and potential buyers who may encounter this profile on X."
  },
  "simulation": {
    "target_n": 120,
    "detail": "voices",
    "max_agent_voices": 12,
    "provider": "llm"
  }
}
```

## Response Shape

```json
{
  "id": "sim_xxxxxxxx",
  "object": {
    "type": "x_profile",
    "objective": "...",
    "audience": "..."
  },
  "simulation_design": {
    "requested_n": 120,
    "simulated_n": 120,
    "n_reason": "...",
    "audience_construction": "...",
    "note": "These are synthetic human voices for decision support..."
  },
  "reaction_distribution": [
    {
      "reaction": "specific confusion",
      "count": 24,
      "share": 0.2
    }
  ],
  "voice_clusters": [
    {
      "share": 0.075,
      "count": 9,
      "people": "35-year-old small business owner",
      "deeper_pattern": "...",
      "core_private_motive": "...",
      "common_friction": "...",
      "likely_action": "...",
      "core_voice": "...",
      "raw_voices": ["..."]
    }
  ],
  "agent_voices": [
    {
      "id": "agent_0001",
      "human_dossier": {
        "surface_identity": "...",
        "deeper_context": "...",
        "private_motive": "...",
        "social_mask": "...",
        "money_reality": "...",
        "status_pressure": "...",
        "past_experience": "...",
        "friction": "..."
      },
      "reaction": {
        "first_impression": "...",
        "inner_voice": "...",
        "felt_but_may_not_say": "...",
        "likely_action": "...",
        "action_probability": 0.42,
        "emotional_intensity": 0.73,
        "reaction_angle": "desire with reservation"
      }
    }
  ],
  "omitted_agent_voices": 96,
  "next_simulation_inputs": ["..."]
}
```

## Current Engine

The default engine is LLM-backed when `OPENAI_API_KEY` is present.

Use the local deterministic fallback for cheap shape tests:

```json
{
  "simulation": {
    "provider": "deterministic"
  }
}
```

The LLM-backed flow is:

1. Audience Builder prompt
2. Agent Dossier prompt
3. Reaction Runner prompt
4. Cluster/Summary prompt

The public product should stay honest: these are synthetic voices, not real human survey responses.
