---
name: decision-space-mapper
description: Map the full decision space from a user's messy context before recommending a path. Use when a user is deciding what to build, sell, write, publish, position, price, prioritize, launch, include, exclude, test, or choose; when they ask for exhaustive options, alternatives, overlooked paths, "what else is possible?", product/business/career strategy, positioning, pricing, messaging, profile/self-presentation, or a structured set of choices to prepare for later human or agent simulation.
---

# Decision Space Mapper

## Purpose

Use this skill to turn messy user context into a comprehensive, source-grounded option map. The goal is not to invent polished artifacts, write clever copy, or produce one confident recommendation. The goal is to prevent the agent from collapsing too early, recover the choices already latent in the user's words, and expand them into a clear set of possible paths.

This is especially useful for intangible, profit-relevant decisions where the user is choosing among product direction, positioning, pricing, launch plans, content strategy, offers, profiles, career moves, or business models.

Treat the output as a decision-space map:

1. Extract the user's existing options, ingredients, constraints, and tensions.
2. Normalize them into clear option units.
3. Expand the map with plausible missing options and meaningful combinations.
4. Keep taste-dependent artifacts as skeletons, ingredients, or bundles unless the user explicitly asks for final copy.
5. Prepare the option map so it can later feed human interviews, market tests, or a simulation API.

## Non-Negotiable Rule

Do not replace the user's thinking with the agent's taste.

For taste-sensitive surfaces such as profiles, launch posts, landing-page copy, personal narratives, founder positioning, or brand voice, do **not** default to polished prose. Instead, map the candidate choices:

- What to foreground.
- What to hide or de-emphasize.
- Which audience each choice is for.
- Which proof points to include.
- Which risks or reactions each choice may create.
- Which combinations deserve testing.

Only write final copy when the user explicitly asks for copywriting, drafts, examples, or text they can paste. Even then, keep it clearly labeled as a draft derived from the option map.

Example:

```text
Weak:
- Candidate A: "I help Japanese companies turn AI search into qualified pipeline..."

Strong:
### Family: Profile foreground
- Option A: Buyer clarity
  - Include: AI search/GEO work, concrete business outcome, contact path.
  - De-emphasize: age, TryMind, too many credentials.
  - Likely reaction to test: does this feel trustworthy or too narrow?
- Option B: AI-native agency
  - Include: AI-native implementation, agency capability, frontier feel.
  - De-emphasize: SEO-like phrasing.
  - Likely reaction to test: does this feel advanced or vague?
- Option C: Weird founder / mind angle
  - Include: TryMind, human mind/blog work, unusual taste.
  - De-emphasize: corporate service clarity.
  - Likely reaction to test: does this attract the right people or confuse buyers?
```

## Workflow

### 1. Recover the Decision Frame

Infer the frame from the user's context. Ask at most one concise question only when the missing information would radically change the option set.

Capture:

- **Decision:** what must be chosen.
- **Decision surface:** where the choice appears: profile, product, offer, price, launch, website, post, roadmap, career narrative, market, audience, etc.
- **User-provided options:** choices, fragments, examples, and instincts already mentioned by the user.
- **Ingredients:** facts, assets, proof points, constraints, tastes, fears, ambitions, audience assumptions, and distribution channels.
- **Desired outcome:** what "good" means.
- **Hidden audience:** whose reaction matters, if any.
- **Irreversibility:** what becomes hard to undo.

If the user provides messy or emotional context, preserve the nuance. Do not sanitize away motivations like boredom, desire for status, urgency, fear, or taste; those often determine which options are real.

### 2. Extract Source Material First

Before adding new options, show the material you extracted from the user.

Use a compact source inventory:

```text
## Source Inventory
- Existing options mentioned:
- Important ingredients:
- Constraints:
- Audience/reaction assumptions:
- Tensions:
- Things the user seems to dislike:
```

This keeps the skill grounded. If an option is invented by the agent, label it as an expansion rather than pretending the user said it.

### 3. Define Option Families

Create 3-7 option families. A family is a group of choices that are meaningfully different in how they would be perceived, executed, or tested.

Families can be based on:

- **Foreground:** what gets emphasized or hidden.
- **Audience:** buyer, peer, investor, operator, friend, overseas customer, skeptic, employee, community.
- **Outcome:** cash, trust, status, learning, distribution, talent, optionality.
- **Surface:** profile, offer, product, post, landing page, DM, pricing, roadmap, content series.
- **Business model:** service, productized service, SaaS, API, media, community, agency, consulting, marketplace.
- **Proof strategy:** credential-led, product-led, case-study-led, numbers-led, founder-story-led, no-hype.
- **Constraint:** fast to ship, low-maintenance, reputation-safe, cash-near, high-upside, reversible.

Do not force every family into an artificial "A vs B" axis. Some families are menus, bundles, inclusion/exclusion choices, sequences, or combinations.

### 4. Build the Option Map

Generate options under each family instead of dumping one flat list. Prefer 4-8 families, each with 2-8 options. The user should be able to see the whole space and choose what deserves deeper work.

Default format:

```text
## Option Map

### Family: Profile foreground
- Option A: Buyer clarity
  - Include:
  - Exclude/de-emphasize:
  - What changes:
  - Reaction to test:
- Option B: AI-native agency
  - Include:
  - Exclude/de-emphasize:
  - What changes:
  - Reaction to test:

### Family: Business wedge
- Option A: Free skill as distribution
- Option B: Paid simulation credits
- Option C: Agency/service wedge
```

Include these option types when relevant:

- **Obvious options:** what a reasonable person would already consider.
- **User-mentioned options:** preserve the user's own candidates.
- **Adjacent options:** one step sideways from the current thinking.
- **Inversion options:** remove the premise, change the target, or do the opposite.
- **Extreme options:** overcommit, undercommit, go premium, go tiny, go public, go private.
- **Lazy options:** the simplest acceptable thing to do.
- **Asset options:** choices that compound into data, audience, code, reputation, or distribution.
- **Cash options:** choices closest to revenue.
- **Learning options:** choices that maximize information gained per unit of effort.
- **No-action/defer options:** sometimes the correct option is to wait, preserve optionality, or avoid publishing.

Do not collapse distinct options too early. If two options would create different reactions, require different execution, or teach different things, keep both.

After the grouped map, optionally add a short **Combination Options** section for bundles that combine multiple families.

### 5. Use Skeletons for Taste-Sensitive Outputs

When the decision surface is a taste-sensitive artifact, provide skeletons rather than polished output unless asked.

Use:

- **Ingredients:** what elements go in.
- **Order:** what appears first, second, last.
- **Emphasis:** what is loud, quiet, omitted, or implied.
- **Claim shape:** practical claim, weird claim, premium claim, proof-led claim, minimalist claim.
- **Simulation stimulus needed:** what exact artifact would need to be created later for human or agent testing.

Example skeleton:

```text
### Option: Buyer clarity profile
- Ingredient order: business outcome -> AI search/GEO capability -> proof -> contact path.
- Include: AI search work, Japan market, concrete service outcome.
- De-emphasize: age, personal blog, too many credentials.
- Claim shape: "I help [buyer] achieve [business result] through [method]."
- Simulation stimulus needed: 2-3 actual profile drafts written in the user's voice.
```

### 6. Compare Without Prematurely Deciding

Only compare after the option map exists. Use comparison language that helps the user think, not false precision.

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
- Need for taste/copywriting judgment
- Need for human or agent simulation

Never substitute a tiny "top 3" for the full map. If you highlight options, explain what class of decision each highlighted option represents and what could make a lower-ranked option win.

### 7. Prepare the Simulation Bridge

When human interpretation matters, end with a simulation-ready brief, but do not invent simulation results.

Include:

- **Options to simulate:** the options or bundles that need external reaction.
- **Stimulus required:** what artifact must be created or shown.
- **Audience to test:** whose interpretation matters.
- **Signals to observe:** trust, desire, confusion, suspicion, willingness to pay, status response, shareability, avoidance, anger, etc.
- **Decision rule:** what result would make an option stronger or weaker.

This skill is the free preparation layer. A later simulation API can consume the option map and run deeper reaction testing.

## Output Shape

Use this default structure:

1. **Decision Frame**
2. **Source Inventory**
3. **Option Families**
4. **Option Map by Family**
5. **Combination Options**
6. **Comparison**
7. **Simulation Bridge**
8. **Next Move**

Keep the answer readable. Do not produce a single flat list unless the decision is genuinely tiny. If the user asks for exhaustive depth, expand each family rather than adding one long undifferentiated list.

## Quality Bar

A good result should make the user say:

- "This captured what I was already circling around."
- "I can see the whole option space now."
- "I can choose what to write, test, simulate, or ignore next."
- "The AI did not hijack my taste."

A bad result:

- Writes polished copy when the user needed options.
- Replaces the user's context with generic strategy.
- Gives five generic options.
- Dumps 20 options in one flat list with no organizing families.
- Forces every family into an artificial "A vs B" axis.
- Recommends too early.
- Uses fake scores, fake market data, or fake user reactions.
- Treats every problem as startup strategy.
- Ignores the user's personality, constraints, and taste.
- Produces options that cannot be connected back to the user's source material.

## References

Read `references/portable-adapters.md` when asked how to package this for Claude Code, Codex, Cursor, generic agents, MCP, or API use.
