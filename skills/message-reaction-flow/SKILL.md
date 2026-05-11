---
name: message-reaction-flow
description: Simulate how a recipient may interpret a sales DM, email, follow-up, ask, apology, partnership message, or request. Focuses on the recipient's structural decision flow and private reaction.
---

# Message Reaction Flow

## Purpose

Use this skill before sending a message where the recipient's interpretation matters.

The goal is not to write a prettier message. The goal is to simulate the recipient's decision flow:

1. Do they understand what this is?
2. Do they feel respected or interrupted?
3. Do they believe the sender?
4. Do they see a reason to reply now?
5. What private suspicion or desire appears?
6. What action do they take?

## Context Collection

Extract:

- exact message
- sender identity and relationship to recipient
- recipient type
- prior context
- desired reply/action
- what the sender is worried about
- constraints such as politeness, urgency, status, or money

If the exact message is missing, ask for it or create clearly labeled variants only if requested.

## API Use

Use Agent Simulation API with:

```json
{
  "artifact": {
    "type": "message",
    "content": "EXACT MESSAGE"
  },
  "objective": "Decide whether this message should be sent as-is, revised, or replaced.",
  "audience": {
    "description": "Recipient type, relationship, context, and likely state of mind."
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

- reply likelihood
- ghost/ignore likelihood
- suspicion triggers
- status or emotional triggers
- raw recipient voices
- structural revision targets
- whether to send, revise, or choose a different ask
