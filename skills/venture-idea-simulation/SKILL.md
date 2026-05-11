---
name: venture-idea-simulation
description: Simulate likely reactions to a new business idea, product concept, API, SaaS, service, or launch plan. Use when validating whether a venture direction may attract buyers, users, agencies, enterprises, or technical communities.
---

# Venture Idea Simulation

## Purpose

Use this skill to test a business idea before overbuilding or overlaunching.

This is not a market-size calculation. It is a reaction simulation:

- who gets it immediately
- who thinks it is fake, obvious, or a prompt wrapper
- who would pay and why
- what proof they need
- what pricing feels plausible
- which first segment is closest to money

## Context Collection

Extract:

- product/service/API idea
- buyer/user candidates
- pricing hypothesis
- distribution channels
- existing assets
- founder credibility
- alternatives being considered
- what "success" means
- time/cash goal

If the idea is vague, first ask for the artifact the market will see: landing page, offer, demo, X post, DM, or one-paragraph product description.

## API Use

Use Agent Simulation API with:

```json
{
  "artifact": {
    "type": "venture_concept",
    "content": "CONCRETE PRODUCT/OFFER DESCRIPTION"
  },
  "objective": "Decide which launch segment, pricing, and positioning to test first.",
  "audience": {
    "description": "Likely buyer/user segments and where they encounter the idea."
  },
  "simulation": {
    "target_n": 80,
    "max_agent_voices": 10,
    "max_output_tokens": 18000
  }
}
```

## Output

Return:

- first segment to sell to
- segments that are curious but unlikely to pay
- high-ticket angles
- self-serve angles
- proof needed before payment
- likely pricing resistance
- raw voices that reveal actual buying motives
- next experiment to run
