# Product 2: Reaction Simulation

## Product Thesis

Mora creates the decision substrate: a comprehensive set of viable paths.

Product 2 tests those paths against simulated or real human reactions so the user can decide with more confidence.

The product is not "predict the future." It is:

- take multiple candidate paths
- expose them to modeled audiences
- return reaction distributions and representative reasons
- help the user decide what to test, ship, sell, write, or avoid

## Source Inventory

From the current context:

- Product 1 is a free skill/channel.
- Product 2 is the paid or monetizable simulation layer.
- The user wants real-feeling reactions, not abstract strategy text.
- The strongest use cases involve humans interpreting something: buying, trusting, clicking, replying, contacting, sharing, blocking, ignoring, suspecting.
- The user prefers cash-near validation and wants motivation from paying customers.
- The product may be API-first, agent-native, or web UI.
- X/Twitter audiences may be useful data sources later, but should not be required for the first version.

## Decision Target

What should Product 2 be first?

Not the final company. The first product path should answer:

- who pays first
- what artifact they submit
- what simulation result they receive
- how it connects to Mora
- how to deliver it this week

## Candidate Paths

### Path A: Agent-Native Simulation API

- Purpose: become the paid backend that Claude Code, Codex, Cursor, and other agents can call after generating candidate paths.
- For: AI-native builders, founders, consultants, agencies, and power users already using coding/agent tools.
- Core choice: API-first. The user or agent sends candidate paths and target audience; the API returns simulated reactions.
- Foreground: developer workflow, JSON output, credits, easy integration.
- De-emphasize: polished dashboard, consumer onboarding, broad market research branding.
- Action norm: publish API docs, examples, MCP/CLI wrapper, Stripe credit checkout.
- First artifact:
  - `POST /simulate`
  - input: paths, audience brief, decision question, reaction dimensions
  - output: aggregate percentages, segment summaries, representative reactions, uncertainty notes
- Revenue shape: prepaid credits.
- Main risk: users may not trust simulation quality without seeing examples.
- Test: can 5-10 AI-agent-heavy users pay for credits or ask for access after seeing sample output?

### Path B: Manual Concierge Simulation

- Purpose: sell the outcome before building the backend.
- For: founders, marketers, agencies, creators, people deciding positioning/offers/profiles/launches.
- Core choice: user sends options; you manually run simulation workflow and return a report.
- Foreground: "I will test these paths against simulated audiences and tell you where reactions split."
- De-emphasize: automation, API, self-serve UI.
- Action norm: DM people, take Stripe payment, deliver Notion/PDF/report within 24 hours.
- First artifact:
  - landing/checkout: "$49 / $99 path reaction report"
  - input form: candidate paths, audience, decision question
  - output report: distribution, segments, representative reactions, recommendation caveats
- Revenue shape: fixed-price report.
- Main risk: operationally annoying, but best for learning what people actually pay for.
- Test: can friends or X followers pay for one report?

### Path C: Web App for Founders

- Purpose: make a visible product people can understand without agents.
- For: founders and solo builders deciding product, offer, pricing, positioning, or launch paths.
- Core choice: self-serve UI. Paste paths, choose audience, run simulation, get dashboard.
- Foreground: simple workflow and visual results.
- De-emphasize: developer API, deep custom audiences, complex integrations.
- Action norm: build input screen, result screen, Stripe credits, examples.
- First artifact:
  - "Paste your candidate paths"
  - "Choose audience"
  - "Run 100 simulated reactions"
  - "See distribution and representative objections"
- Revenue shape: $10-30 per simulation pack, or subscription.
- Main risk: more UI work before knowing demand.
- Test: can the LP/video produce waitlist or paid preorders?

### Path D: X-Audience Simulation

- Purpose: use real social graph/context to make reactions feel more specific and valuable.
- For: creators, founders, X-native operators, personal brands, indie hackers.
- Core choice: simulate reactions from a specific X audience or adjacent people.
- Foreground: "how your actual audience might react."
- De-emphasize: generic customer research.
- Action norm: collect target accounts, infer segments, simulate reactions per segment.
- First artifact:
  - input: X handle, candidate profile/post/offer paths
  - output: likely reaction clusters from audience types
- Revenue shape: paid report or credits.
- Main risk: data collection/compliance/scraping complexity; too narrow if started first.
- Test: manually run for a few public profiles before automating.

### Path E: Agency/Consultant Tool

- Purpose: sell to people who repeatedly need to evaluate messaging/options for clients.
- For: marketing agencies, positioning consultants, AI agencies, GTM consultants.
- Core choice: B2B workflow for repeated client decisions.
- Foreground: client-ready reports, team seats, repeat usage.
- De-emphasize: individual consumer use.
- Action norm: design reports, export, white-label, client folders.
- Revenue shape: monthly subscription or bulk credits.
- Main risk: longer sales cycle; product must feel credible.
- Test: DM 20 agencies/consultants with a sample client report.

## Comparison

| Path | Speed to cash | Learning value | Build effort | Trust burden | Best first move |
| --- | --- | --- | --- | --- | --- |
| Agent-Native API | Medium | High | Medium | High | API mock + examples |
| Manual Concierge | High | Very high | Low | Medium | Sell 5 reports |
| Web App | Medium | Medium | High | Medium | Prototype UI |
| X-Audience Simulation | Medium | High | High | High | Manual public demos |
| Agency Tool | Medium | High | Medium-high | High | Sample client report |

## Recommended First Path

Start with Path B plus Path A.

The first sellable product should be:

> Send me your candidate paths. I will run a reaction simulation and return a distribution of likely reactions, segment-level reasons, and what to test next.

Under the hood, build the API-shaped workflow from day one, but deliver manually or semi-manually at first.

This gives:

- immediate cash possibility
- real examples for marketing
- data for API schema
- proof of what users actually want
- a clean bridge from Mora

## MVP Contract

### Input

```json
{
  "decision_question": "Which product path should I launch first?",
  "candidate_paths": [
    {
      "name": "Agent-native API",
      "purpose": "Let agents run simulations after option mapping",
      "audience": "AI-native builders"
    }
  ],
  "audience_brief": "Founders and AI-native builders who use Claude Code, Codex, Cursor, or similar tools.",
  "reaction_dimensions": [
    "trust",
    "desire",
    "confusion",
    "willingness_to_pay",
    "skepticism",
    "shareability"
  ]
}
```

### Output

```json
{
  "summary": "Path B is most cash-near; Path A is the strongest long-term product spine.",
  "aggregate_reactions": [
    {
      "path": "Manual Concierge Simulation",
      "positive": 0.42,
      "neutral": 0.31,
      "negative": 0.27,
      "top_positive_reason": "Clear outcome and low commitment.",
      "top_negative_reason": "Trust in simulated reactions is uncertain."
    }
  ],
  "segments": [
    {
      "segment": "AI-native solo founders",
      "likely_reaction": "Interested if the report shows concrete objections and next actions.",
      "risk": "May prefer to run it themselves via API."
    }
  ],
  "representative_reactions": [
    {
      "persona": "Skeptical founder",
      "reaction": "Interesting, but I need to see a sample before paying."
    }
  ],
  "next_tests": [
    "Publish one sample report.",
    "DM 20 AI-native builders with a $49 concierge offer.",
    "Track replies, payment intent, and trust objections."
  ]
}
```

## First Build Scope

Do not build the full platform yet.

Build these first:

1. A sample report format.
2. A simple intake form or Stripe payment link.
3. A script/API-shaped function that takes paths + audience + dimensions and returns a report.
4. A public example connecting Mora output to simulation output.
5. A waitlist or "request simulation" CTA on the LP.

## Product Naming Options

- Reaction Simulator
- Path Simulator
- Audience Simulator
- Decision Simulation API
- Signal Room
- Crowd Mirror
- Market Mirror

Working name: **Path Simulator**.

## Next Move

Create one public example:

1. Use Mora to generate candidate paths for Product 2.
2. Run a mock/semi-manual simulation report on those paths.
3. Publish the pair:
   - "First, map the paths."
   - "Then, simulate how people react."

This becomes the launch asset for both products.
