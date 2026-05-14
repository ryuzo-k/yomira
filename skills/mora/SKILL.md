---
name: mora
description: Map coherent candidate paths from a user's messy decision context before recommending a path. Use when a user is deciding what to build, sell, write, publish, position, price, prioritize, launch, include, exclude, test, or choose; when they ask for exhaustive options, alternatives, overlooked paths, "what else is possible?", product/business/career strategy, positioning, pricing, messaging, profile/self-presentation, or a structured set of action patterns to prepare for later human or agent simulation.
---

# Mora

## Purpose

Use this skill to turn messy user context into a source-grounded map of coherent candidate paths. The goal is not to invent polished artifacts, write clever copy, or produce one confident recommendation. The goal is to recover the choices latent in the user's words, expand the missing alternatives, and package them as realistic paths the user could actually choose.

This is especially useful for intangible, profit-relevant decisions where the user is choosing among product direction, positioning, pricing, launch plans, content strategy, offers, profiles, career moves, or business models.

Treat the output as a path map:

1. Extract the user's existing options, ingredients, constraints, and tensions.
2. Identify the actual decision target.
3. If the target is ambiguous, show possible decision targets and ask the user which map they want.
4. Convert raw option fragments into coherent candidate paths or action patterns.
5. Keep taste-dependent artifacts as skeletons, ingredients, and decision rules unless the user explicitly asks for final copy.
6. Prepare the path map so it can later feed human interviews, market tests, or a simulation API.

## Connected Simulation Workflow

Mora is the first move. Human Reaction Simulation is the second move.

After mapping candidate paths, identify which paths depend on human reaction: selling, publishing, pitching, pricing, messaging, profile positioning, launch strategy, or enterprise communication.

For those paths, prepare a simulation handoff:

- exact artifact or stimulus needed
- audience to simulate
- decision the user is trying to make
- risks or reactions to test
- variants worth comparing

If the `yomira` skill or Yomira is available, suggest using it after the path map. Do not simulate vague path labels; convert paths into concrete artifacts first.

## Non-Negotiable Rule

Do not replace the user's thinking with the agent's taste.

The main deliverable is not a list of atomic categories. The main deliverable is a set of coherent candidate paths.

For taste-sensitive surfaces such as profiles, launch posts, landing-page copy, personal narratives, founder positioning, or brand voice, do **not** default to polished prose. Instead, map the viable paths:

- The purpose of the path.
- Who the path is for.
- What to foreground.
- What to hide or de-emphasize.
- What actions this path implies.
- Which proof points to include.
- Which risks or reactions this path may create.
- What should be tested before choosing it.

Only write final copy when the user explicitly asks for copywriting, drafts, examples, or text they can paste. Even then, keep it clearly labeled as a draft derived from the path map.

Example:

```text
Weak:
### Family: Profile foreground
- Buyer clarity
- AI-native agency
- Weird founder

Strong:
## Candidate Paths

### Path A: Business acquisition profile
- Purpose: make the account convert skeptical business buyers.
- For: operators, founders, SMB owners, overseas companies entering Japan.
- Foreground: AI search/GEO, concrete business outcome, contact path.
- De-emphasize: age, too many side projects, abstract personal philosophy.
- Action norm: post proof, customer problems, teardown threads, clear offers.
- Risk to test: does it feel trustworthy or too narrow?

### Path B: Full self / artist-founder profile
- Purpose: attract people who resonate with the person, not only the service.
- For: peers, founders with taste, creative technologists, people interested in mind/AI.
- Foreground: TryMind, human mind/blog work, unusual taste, age if it is part of the story.
- De-emphasize: corporate service clarity.
- Action norm: post essays, weird observations, prototypes, personal theses.
- Risk to test: does it attract high-fit people or confuse buyers?

### Path C: Single-purpose business account
- Purpose: make the account serve one offer only.
- For: a narrow buyer segment.
- Foreground: one service, proof, process, outcomes.
- De-emphasize: personal identity and unrelated projects.
- Action norm: publish only buyer-facing content and case material.
- Risk to test: does it create trust or feel generic?
```

## Workflow

### 1. Recover the Decision Target

Infer the target from the user's context. Ask at most one concise question only when the missing information would radically change the path map.

Capture:

- **Decision:** what must be chosen.
- **Decision surface:** where the choice appears: profile, product, offer, price, launch, website, post, roadmap, career narrative, market, audience, etc.
- **User-provided options:** choices, fragments, examples, and instincts already mentioned by the user.
- **Ingredients:** facts, assets, proof points, constraints, tastes, fears, ambitions, audience assumptions, and distribution channels.
- **Desired outcome:** what "good" means.
- **Hidden audience:** whose reaction matters, if any.
- **Irreversibility:** what becomes hard to undo.

If the user provides messy or emotional context, preserve the nuance. Do not sanitize away motivations like boredom, desire for status, urgency, fear, or taste; those often determine which paths are real.

### 2. Handle Ambiguous Targets

If the user's context contains several possible decisions and choosing the wrong target would produce the wrong options, do not force a full map.

Instead, output:

```text
## Possible Decision Targets
- Target A:
  - What this would decide:
  - Why it may be the real question:
- Target B:
  - What this would decide:
  - Why it may be the real question:
- Target C:
  - What this would decide:
  - Why it may be the real question:

Question: Which target should I map first?
```

If one target is clearly dominant, proceed and name the assumption.

### 3. Extract Source Material First

Before adding new paths, show the material extracted from the user.

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

This keeps the skill grounded. If a path is invented by the agent, label it as an expansion rather than pretending the user said it.

### 4. Build Candidate Paths

Build 3-9 coherent candidate paths. A path is a bundled choice that could realistically guide behavior. It is not just one axis, family, or ingredient.

Each path should answer:

- **Purpose:** what this path is trying to accomplish.
- **For:** who it is optimized for.
- **Core choice:** what makes it meaningfully different.
- **Foreground:** what becomes visible.
- **De-emphasize:** what becomes quiet, hidden, or excluded.
- **Action norm:** what the user would repeatedly do if they chose this path.
- **Proof/assets:** what evidence or assets this path uses.
- **Risk/reaction to test:** what could go wrong or must be validated.

Useful path shapes include:

- **Audience path:** one path for buyers, one for peers, one for investors, one for a community.
- **Identity path:** full self, professional operator, artist/founder, anonymous brand, single-purpose business.
- **Business path:** service, productized service, SaaS, API, media, community, agency, consulting, marketplace.
- **Distribution path:** X-first, Reddit-first, SEO/content-first, DM-first, partnership-first, community-first.
- **Revenue path:** cash-near service, freemium skill, paid credits, high-ticket consulting, subscription, usage-based API.
- **Trust path:** credential-led, product-led, case-study-led, numbers-led, founder-story-led, no-hype.
- **Constraint path:** fast to ship, low-maintenance, reputation-safe, high-upside, reversible, deep-work-heavy.

Include these path types when relevant:

- **Obvious paths:** what a reasonable person would already consider.
- **User-mentioned paths:** preserve the user's own candidates.
- **Adjacent paths:** one step sideways from the current thinking.
- **Inversion paths:** remove the premise, change the target, or do the opposite.
- **Extreme paths:** overcommit, undercommit, go premium, go tiny, go public, go private.
- **Lazy paths:** the simplest acceptable path.
- **Asset paths:** choices that compound into data, audience, code, reputation, or distribution.
- **Cash paths:** choices closest to revenue.
- **Learning paths:** choices that maximize information gained per unit of effort.
- **No-action/defer paths:** sometimes the real path is to wait, preserve optionality, or avoid publishing.

Do not collapse distinct paths too early. If two paths would create different behavior, attract different people, or teach different things, keep both.

### 5. Use Option Families as Supporting Material

Option families are supporting material, not the main deliverable.

Use them only when they help the user see the ingredients behind the paths:

- **Foreground choices:** what gets emphasized or hidden.
- **Audience choices:** buyer, peer, investor, operator, friend, overseas customer, skeptic, employee, community.
- **Outcome choices:** cash, trust, status, learning, distribution, talent, optionality.
- **Surface choices:** profile, offer, product, post, landing page, DM, pricing, roadmap, content series.
- **Proof choices:** credential-led, product-led, case-study-led, numbers-led, founder-story-led, no-hype.

If including option families would make the answer more confusing, skip them and focus on candidate paths.

### 6. Use Skeletons for Taste-Sensitive Outputs

When the decision surface is a taste-sensitive artifact, provide skeletons rather than polished output unless asked.

Use:

- **Ingredients:** what elements go in.
- **Order:** what appears first, second, last.
- **Emphasis:** what is loud, quiet, omitted, or implied.
- **Claim shape:** practical claim, weird claim, premium claim, proof-led claim, minimalist claim.
- **Simulation stimulus needed:** what exact artifact would need to be created later for human or agent testing.

Example skeleton:

```text
### Path: Business acquisition profile
- Ingredient order: business outcome -> AI search/GEO capability -> proof -> contact path.
- Include: AI search work, Japan market, concrete service outcome.
- De-emphasize: age, personal blog, too many credentials.
- Claim shape: "I help [buyer] achieve [business result] through [method]."
- Simulation stimulus needed: 2-3 actual profile drafts written in the user's voice.
```

### 7. Compare Without Prematurely Deciding

Only compare after the path map exists. Use comparison language that helps the user think, not false precision.

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

Never substitute a tiny "top 3" for the full map unless the user explicitly asks for ranking. If you highlight paths, explain what class of decision each highlighted path represents and what could make a lower-ranked path win.

### 8. Prepare the Simulation Bridge

When human interpretation matters, end with a simulation-ready brief, but do not invent simulation results.

Include:

- **Paths to simulate:** the paths or bundles that need external reaction.
- **Stimulus required:** what artifact, scenario, or behavior sample must be created or shown.
- **Audience to test:** whose interpretation matters.
- **Signals to observe:** trust, desire, confusion, suspicion, willingness to pay, status response, shareability, avoidance, anger, etc.
- **Decision rule:** what result would make a path stronger or weaker.

This skill is the free preparation layer. A later simulation API can consume the path map and run deeper reaction testing.

## Output Shape

Use this default structure:

1. **Decision Target**
2. **Source Inventory**
3. **Candidate Paths**
4. **Supporting Option Families** (optional)
5. **Comparison**
6. **Simulation Bridge**
7. **Next Move**

If the target is ambiguous, use:

1. **Source Inventory**
2. **Possible Decision Targets**
3. **Question**

Keep the answer readable. Do not produce a single flat list unless the decision is genuinely tiny. If the user asks for exhaustive depth, expand each path rather than adding one long undifferentiated list.

## Quality Bar

A good result should make the user say:

- "This captured what I was already circling around."
- "These are real paths I could choose between."
- "I understand how each path would change my behavior."
- "I can choose what to write, test, simulate, or ignore next."
- "The AI did not hijack my taste."

A bad result:

- Gives categories when the user needed coherent paths.
- Writes polished copy when the user needed options.
- Replaces the user's context with generic strategy.
- Gives five generic options.
- Dumps 20 options in one flat list with no path logic.
- Forces every path into an artificial "A vs B" axis.
- Recommends too early.
- Uses fake scores, fake market data, or fake user reactions.
- Treats every problem as startup strategy.
- Ignores the user's personality, constraints, and taste.
- Produces paths that cannot be connected back to the user's source material.

## References

Read `references/portable-adapters.md` when asked how to package this for Claude Code, Codex, Cursor, generic agents, MCP, or API use.
