---
name: decision-space-mapper
description: Generate a structured map of concrete candidate outputs for ambiguous or high-stakes choices before recommending a path. Use when a user is deciding what to publish, build, sell, write, launch, price, position, prioritize, present, or choose; when they ask for exhaustive options, alternatives, tradeoffs, overlooked paths, "what else is possible?", product/business/career strategy, positioning, pricing, messaging, profile/self-presentation, or a set of world-facing candidate results.
---

# Decision Space Mapper

## Purpose

Use this skill to turn a vague decision into a structured map of concrete candidate results. The goal is not to brainstorm abstract directions or produce one confident recommendation; it is to stop the agent from collapsing too early and produce multiple things the user could actually publish, ship, sell, send, test, or show to the world.

This is especially useful for intangible, profit-relevant decisions where the user is choosing among product direction, positioning, pricing, launch plans, content strategy, offers, career moves, or business models.

Treat the output as a result map:

1. Identify what kind of output/result the user is choosing.
2. Generate concrete candidate outputs grouped by result family.
3. Add only enough explanation for the user to understand what each result is optimizing for.
4. Identify which candidates should be tested or compared before the user commits.

## Workflow

### 1. Clarify the Decision Frame

Infer the frame from the user's context. Ask at most one concise question only when the missing information would radically change the option set.

Capture:

- **Decision:** what must be chosen.
- **Output surface:** the thing that will exist in the world: profile, landing page, offer, product concept, post, email, pricing page, pitch, roadmap, service package, career narrative, etc.
- **Desired outcome:** what "good" means.
- **Constraints:** money, time, reputation, energy, skill, team, market, ethics, distribution, geography.
- **Current options:** what the user is already considering.
- **Hidden audience:** whose reaction matters, if any.
- **Irreversibility:** what becomes hard to undo.

If the user provides messy or emotional context, preserve the nuance. Do not sanitize away motivations like boredom, desire for status, urgency, fear, or taste; those often determine which options are real.

### 2. Define Result Families

Before listing candidates, create 3-7 result families. A result family is a cluster of concrete outputs that would look different in the world. It can be based on audience, surface, narrative, offer shape, credibility strategy, tone, business model, or constraint.

Do not return abstract headings like "Trust and credibility" unless each heading immediately contains concrete candidates. The heading is scaffolding; the candidates are the product.

Useful result families include:

- **World-facing artifact:** profile draft, landing page section, post, pitch, offer, pricing package, product concept.
- **Audience-specific version:** for buyers, peers, employers, investors, overseas customers, operators, skeptics.
- **Narrative version:** practical, visionary, credibility-heavy, weird/interesting, minimal, premium, honest, provocative.
- **Business version:** service, productized service, SaaS, API, media, community, agency, consulting, marketplace.
- **Proof version:** credential-led, product-led, case-study-led, numbers-led, founder-story-led, no-hype.
- **Tone version:** safe, sharp, warm, technical, executive, indie, corporate, academic, contrarian.
- **Constraint version:** fast to ship, trust-preserving, high-status, low-maintenance, cash-near, long-term asset.

### 3. Generate the Result Map by Family

Generate concrete candidates under each result family instead of dumping one flat list. Prefer 4-8 families, each with 2-6 candidates. The user should be able to copy, edit, publish, show, or test a candidate.

Default format:

```text
## Result Map

### Family: Practical buyer-facing profile
- Candidate A: "..."
- Candidate B: "..."
- Candidate C: "..."

### Family: Visionary AI-native agency profile
- Candidate A: "..."
- Candidate B: "..."
- Candidate C: "..."

### Family: Minimal anti-suspicion profile
- Candidate A: "..."
- Candidate B: "..."
- Candidate C: "..."
```

For non-writing decisions, the candidates should still be concrete:

```text
### Family: Productized service
- Candidate A: "AI search audit + implementation sprint for Japanese SMBs"
- Candidate B: "Japan GTM landing-page localization and search-intent API"

### Family: Content-led wedge
- Candidate A: "Weekly teardown of AI-search winners in Japan"
- Candidate B: "Public database of GEO/AIO patterns for Japanese companies"
```

Include these candidate families when relevant:

- **Obvious candidates:** what a reasonable person would already make.
- **Adjacent candidates:** one step sideways from the user's current thinking.
- **Inversion candidates:** remove the premise, change the target, or do the opposite.
- **Extreme candidates:** overcommit, undercommit, go premium, go tiny, go public, go private.
- **Lazy candidates:** the simplest acceptable thing to publish or do.
- **Asset candidates:** candidates that compound into data, audience, code, reputation, or distribution.
- **Cash candidates:** candidates closest to revenue.
- **Learning candidates:** candidates that maximize information gained per unit of effort.
- **No-action or defer candidates:** sometimes the concrete result is to wait, preserve optionality, or not publish.

Do not collapse distinct candidates too early. If two outputs would be perceived differently by users or require different execution, keep both.

After the grouped map, optionally add a short **Hybrid Candidates** section for outputs that combine multiple families.

### 4. Calibrate Depth

Do not over-structure too early. Match the depth to the user's need:

- **Rough map:** result-family headings plus one-line candidate outputs.
- **Decision-ready map:** result families, concrete candidates, and short notes on what each candidate changes.
- **Deep map:** compact option cards for the most important or confusing options.
- **Exhaustive map:** every result family, every meaningful candidate, hybrids, and what evidence would change the choice.

Use compact option cards only when useful. The default should be grouped concrete candidates, not a wall of abstract analysis.

When expanding a candidate into a card, use:

- **Name:** short and concrete.
- **Candidate output:** the actual thing to publish, ship, send, or show.
- **Why it exists:** the logic behind it.
- **What it foregrounds:** what this choice makes visible or important.
- **Who it attracts/repels:** likely audience fit.
- **What changes if chosen:** the real-world action or commitment.
- **Main risk:** the failure mode that matters.

When an option depends on other people, markets, or stakeholders, also include:

- **Stimulus:** the exact text, offer, profile, product concept, or scenario that can be shown to a person or agent.
- **Who needs to react:** the people whose interpretation matters.
- **What to learn:** trust, desire, confusion, suspicion, willingness to pay, status response, shareability, avoidance, anger, etc.

### 5. Surface Missing Options

After the first pass, explicitly check for blind spots:

- What option is being avoided because it feels socially awkward?
- What option is being avoided because it is too simple?
- What option is obvious to a buyer but not to the builder?
- What option creates distribution before product?
- What option creates cash before software?
- What option gives the user a proprietary dataset or repeated workflow?
- What option uses the user's existing unfair advantage?
- What option should be rejected because it attracts the wrong people?

Add any newly discovered options to the map.

### 6. Compare Without Prematurely Deciding

Only after mapping all options, compare them. Use comparison language that helps the user think, not false precision.

Good comparison dimensions:

- Speed to first evidence
- Revenue proximity
- Distribution advantage
- Trust burden
- Differentiation
- Execution difficulty
- Personal fit
- Downside/reversibility
- Learning value
- Need for external evidence

Avoid presenting a tiny "top 3" as if the rest can be ignored. If you highlight candidates, explain what class of decision each candidate represents and what could make a lower-ranked option win.

### 7. Define the Next Evidence

End by showing what evidence would make the decision clearer. Keep this practical and specific.

Include:

- **Unknowns:** what must be learned before choosing.
- **Evidence source:** user interview, sales call, landing page, public post, prototype, manual service, internal review, market research, or personal experiment.
- **Question to ask:** the exact question or artifact to put in front of people.
- **Signal to watch:** what response, behavior, or constraint would change the decision.
- **Decision rule:** what result would make an option stronger or weaker.

## Output Shape

Use this default structure:

1. **Decision Frame**
2. **Result Families**
3. **Result Map by Family**
4. **Blind Spots Added**
5. **Comparison**
6. **Next Evidence**
7. **Next Move**

Keep the answer readable. Do not produce a single flat list unless the decision is genuinely tiny. If the user asks for exhaustive depth, expand each result family rather than adding one long undifferentiated list.

## Quality Bar

A good result should make the user say:

- "I had not realized these were all different decisions."
- "I now have actual candidates I could publish, ship, send, or test."
- "I can see what evidence would actually change the decision."
- "I know what to try next."

A bad result:

- Gives five generic options.
- Gives only abstract lenses, categories, or strategy words without concrete candidate outputs.
- Dumps 20 options in one flat list with no organizing result families.
- Forces every family into an artificial "A vs B" axis.
- Recommends too early.
- Uses fake scores or fake market data.
- Treats every problem as startup strategy.
- Ignores the user's personality, constraints, and taste.
- Produces options that cannot be acted on or shown to others.

## References

Read `references/portable-adapters.md` when asked how to package this for Claude Code, Codex, Cursor, generic agents, MCP, or API use.
