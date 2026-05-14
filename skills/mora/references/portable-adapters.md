# Portable Adapters

Mora should be maintained as a core protocol, then adapted to each AI environment.

## Mental Model

Most AI products do not share one universal "skill" format. The portable part is the protocol: the instructions, workflow, and output contract. Each product has its own way to inject those instructions into model context.

## Claude Code

Claude Code supports Agent Skills as folders containing `SKILL.md` plus optional resources. Personal skills live in `~/.claude/skills/`; project skills live in `.claude/skills/`. Skills are model-invoked from their description, unlike slash commands which are explicitly invoked.

Recommended adapter:

```text
.claude/skills/mora/
  SKILL.md
  references/
```

Also consider a slash command for explicit usage:

```text
.claude/commands/decision-space.md
```

Use a slash command when the user wants to run it deliberately; use a skill when the agent should discover it automatically.

## Codex

Codex uses skill folders with `SKILL.md` and optional resources. In the Codex desktop environment, user skills are discovered from configured skill directories such as `$CODEX_HOME/skills` or `~/.codex/skills`.

Recommended adapter:

```text
~/.codex/skills/mora/
  SKILL.md
  agents/openai.yaml
  references/
```

For repo sharing, keep a copy in the repository and install/symlink it into the user's Codex skills directory when desired.

For public distribution through the open `skills` CLI, keep the canonical copy at:

```text
skills/mora/
  SKILL.md
  references/
```

## Cursor

Cursor uses Rules rather than Agent Skills. Project rules live in `.cursor/rules` and are included as persistent instructions when applied. Use a `.mdc` rule that points to the protocol or embeds a compact version of the workflow.

Recommended adapter:

```text
.cursor/rules/mora.mdc
```

Make the rule explicit enough that a user can say "use the decision-space mapper" and Cursor has the workflow available.

## Hermes Agent

Hermes Agent uses `SKILL.md` files and follows the agentskills.io-style progressive disclosure model. Local skills live under `~/.hermes/skills/`, and installed skills are also invocable as slash commands.

Recommended adapter:

```text
~/.hermes/skills/mora/
  SKILL.md
  references/
```

## Generic Agents

For agents without a native skill system, package the protocol as a prompt file:

```text
prompts/mora.md
```

The user can paste it into system/developer instructions, a project memory file, an agent profile, or a custom command.

## Stable Output Contract

Keep the interface stable:

- `decision_frame`
- `source_inventory`
- `possible_decision_targets`
- `candidate_paths`
- `supporting_option_families`
- `simulation_bridge`
- `comparison_dimensions`
- `next_evidence`

This allows the same skill output to feed a Web UI, CLI, or another agent workflow later.
