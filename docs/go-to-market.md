# Yomira Go-To-Market

## Short Version

Do not initially sell this as a generic "AI simulation API".

Sell it as:

> See how likely buyers privately react before you publish, pitch, price, or launch.

The first users should be people who already feel pain from publishing or selling without knowing how humans will react.

## Best Initial Users

### 1. Ryuzo / GEO Content Operator

This is the best first user because the use case is real and recurring.

Use cases:

- check GEO articles before publishing
- test how enterprise buyers interpret claims
- test whether content feels credible or AI-generated
- test how founders react to "AI search" language
- test outreach messages to companies

Why this matters:

- recurring use
- direct link to revenue
- easy to create examples
- high willingness to pay if it improves conversion

### 2. Agency Owners / Growth Consultants

They can turn one good simulation into client-facing value.

Use cases:

- landing page reaction checks
- offer checks
- client pitch validation
- ad/message pretesting
- objection mining

Likely pricing:

- $20 starter is fine
- $99/mo can work
- $299/mo works if it helps them sell or retain clients
- high-ticket done-for-you report can be $500-$2,000

### 3. Indie Hackers / AI Founders

Good for distribution, weaker for revenue.

Use cases:

- product idea reaction
- launch post reaction
- pricing page reaction
- profile reaction
- DM reaction

Risk:

- many will use free credits and not pay
- high skepticism about prompt wrappers
- low budget

Use them for feedback and public examples, not as the only revenue base.

### 4. Enterprise Communications / PR / New Business

Potentially large but slow.

Use cases:

- press release pretest
- executive message reaction
- new business concept reaction
- internal proposal reaction
- stakeholder objection simulation

Risk:

- procurement
- security review
- they may require private deployment, SOC2, contracts, and no data retention

Do not start here unless there is a warm buyer.

### 5. Existing Simulation / Research Businesses

These people may be buyers or competitors.

Use cases:

- use API as backend capacity
- add synthetic voices to reports
- speed up qualitative analysis

Risk:

- they know the category
- they demand quality and methodology
- they may compare against established research tools

Good later as API customers.

## Pricing

Goal: high margin, fast cash, low support.

### Credit Pricing

- Free trial: 20 credits
- $20 for 100 credits
- $99 for 700 credits
- $299 for 2,500 credits
- Enterprise / external data: custom contract

Keep self-serve as credit packs. Do not force weird SaaS plans before usage patterns are clear.

### Credit Use

- Quick: 40 people = 5 credits
- Standard: 120 people = 20 credits
- Deep: 300 people = 60 credits
- Report: 1,000 people = 250 credits
- Grounded / external data = custom contract

### Cash-Now Offers

To make money quickly, add a service wrapper:

- $300: one artifact, 120-person simulation, Markdown report
- $1,000: 5 artifacts or paths, comparison report
- $3,000: launch package for offer/LP/pricing/DM

This is more likely to make money in week one than pure self-serve SaaS.

### One-Week $1M Reality

One week to $1M is unlikely with self-serve credits.

Paths that could theoretically get close:

- 100 customers paying $10,000 for an enterprise/research package
- 20 customers paying $50,000 for strategic simulation projects
- a pre-existing audience plus a very viral launch plus high-ticket service sales

The more realistic aggressive target:

- 10 customers × $1,000 = $10k
- 10 customers × $3,000 = $30k
- 3 enterprise pilots × $10,000 = $30k

That can become meaningful while the product improves.

## Marketing Assets To Build

### Free Skills

Keep Mora as the top-of-funnel skill:

- it maps options
- it naturally creates simulation candidates
- it is useful even without the paid API

Add Yomira as the paid bridge skill:

- it calls the API
- it exports Markdown/JSON
- it lets Claude Code, Codex, Cursor, and other agents use the product

Use-case skills:

- GEO Content Reaction Check
- Content Reaction Check
- Message Reaction Flow
- Venture Idea Simulation

These should be wrappers around the same API. The value is not new technology; it is better context collection for each scene.

## Why People Pay

People pay when the simulation is tied to a money-adjacent decision:

- publish this content or not
- send this sales message or not
- launch this offer or not
- choose this pricing or not
- show this enterprise narrative or not

They do not pay for abstract "AI personas". They pay to avoid embarrassment, wasted ad spend, weak positioning, ignored messages, bad content, or wrong product direction.

The product becomes valuable when it saves one bad launch, one bad client deliverable, one ignored sales sequence, or one week of building the wrong thing.

## Technical Evolution

The next real technical step is async jobs:

1. `/api/simulate` creates a job and returns `job_id` immediately.
2. A background worker runs the simulation.
3. Dashboard polls `/api/jobs/:id`.
4. Large N simulations become reliable.

After that:

- multi-pass simulation: generate audience first, then reactions, then clusters
- artifact variants: simulate A/B/C versions in one run
- context packs: save reusable company/audience context
- calibration: compare synthetic predictions to real outcomes
- private enterprise mode: no retention, workspace-specific context, export audit logs

## First Launch Motion

1. Publish the free Mora skill.
2. Show a real example: "I simulated this product's launch."
3. Show the distribution and raw voices.
4. Offer to run simulations for people's landing pages, offers, posts, or profiles.
5. Charge manually for high-touch reports while self-serve credits exist in parallel.
6. Turn repeated use cases into dedicated pages and skills.

## Positioning

Avoid:

> AI simulates your customers.

Use:

> Hear plausible private reactions before you publish or sell.

Avoid:

> Market research replacement.

Use:

> A fast pre-check before interviews, ads, sales calls, or launch.
