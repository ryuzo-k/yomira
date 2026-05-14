---
name: content-reaction-check
description: Check how likely readers may privately react before publishing content, especially GEO/SEO articles, thought-leadership posts, launch posts, X/LinkedIn posts, essays, or company content. Uses Yomira when available.
---

# Content Reaction Check

## Purpose

Use this skill before publishing content. The goal is to catch how real readers may privately interpret the draft:

- credible or AI-generated
- useful or obvious
- impressive or try-hard
- trustworthy or suspicious
- worth sharing, replying, contacting, or ignoring

## Context Collection

Extract from the conversation:

- exact draft or post text
- where it will be published
- target readers
- desired action after reading
- business context and offer
- user's worries about tone, credibility, boredom, or confusion

If the exact draft is missing, ask for it. Do not simulate a vague description unless the user explicitly wants a pre-draft check.

## API Use

Use Yomira with:

```json
{
  "artifact": {
    "type": "content_draft",
    "content": "EXACT CONTENT"
  },
  "objective": "Decide whether to publish, revise, or reposition this content.",
  "audience": {
    "description": "Likely readers and why they see it."
  },
  "simulation": {
    "target_n": 40,
    "max_agent_voices": 8,
    "max_output_tokens": 16000
  }
}
```

## Output

Return:

- publish / revise / do not publish
- reaction distribution
- reader clusters
- raw private voices that reveal the problem
- exact revision targets, not rewritten copy unless requested
- Markdown/JSON export link if available
