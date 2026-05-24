const DEFAULT_MAX_N = 1000;
const DEFAULT_RETURN_LIMIT = 80;
const DEFAULT_LLM_RETURN_LIMIT = 24;
const DEFAULT_BATCH_CONCURRENCY = 4;
const canonicalReactionAngles = [
  "quiet_conversion",
  "desire_with_reservation",
  "specific_confusion",
  "private_suspicion",
  "intellectual_interest",
  "status_reaction",
  "dismissal"
];

const archetypes = [
  {
    id: "cash_near_operator",
    label: "Cash-near operator with practical pressure",
    baseShare: 0.18,
    contexts: [
      "runs a small but real business and has no patience for vague capability claims",
      "owns revenue responsibility and judges ideas by whether they reduce a current bottleneck",
      "has paid consultants before and remembers both the useful ones and the disappointing ones"
    ],
    motives: [
      "wants a concrete next step without feeling sold to",
      "needs proof that the thing works for a business like theirs",
      "is quietly afraid of falling behind newer AI-native operators"
    ],
    frictions: [
      "another abstract AI pitch feels like work, not help",
      "unclear scope makes them assume hidden labor",
      "they will not move unless the offer connects to a current problem"
    ]
  },
  {
    id: "taste_sensitive_builder",
    label: "Taste-sensitive builder",
    baseShare: 0.14,
    contexts: [
      "builds products or content and cares whether something feels sharp or generic",
      "uses AI heavily but is allergic to outputs that sound like AI",
      "is more open to weirdness than the average buyer, but still wants coherence"
    ],
    motives: [
      "wants to see possibilities they would not have named themselves",
      "likes tools that preserve their own taste",
      "cares about whether the artifact changes how smart people perceive them"
    ],
    frictions: [
      "anything that feels like a marketing template breaks the spell",
      "over-explaining obvious things makes the product feel lower taste",
      "flat voices would make them churn quickly"
    ]
  },
  {
    id: "skeptical_peer",
    label: "Skeptical peer in the same scene",
    baseShare: 0.13,
    contexts: [
      "knows enough about the category to notice exaggeration",
      "has seen many AI demos and privately discounts most of them",
      "may admire the ambition but judges execution harshly"
    ],
    motives: [
      "wants to know whether there is real substance behind the framing",
      "enjoys sharp new tools when they reveal something non-obvious",
      "cares about status and originality more than they admit"
    ],
    frictions: [
      "fake precision is immediately visible to them",
      "they do not believe synthetic voices unless the texture feels specific",
      "they may share the product only if it makes them look early"
    ]
  },
  {
    id: "quiet_high_intent_buyer",
    label: "Quiet high-intent buyer",
    baseShare: 0.12,
    contexts: [
      "has an active problem but rarely comments publicly",
      "reads more than they react and bookmarks things before reaching out",
      "often buys after a private comparison period"
    ],
    motives: [
      "wants help making a decision without looking uncertain",
      "needs language for a choice they already feel but cannot articulate",
      "responds to clear examples and low-friction contact paths"
    ],
    frictions: [
      "they will disappear if the offer asks them to do too much interpretation",
      "they do not want to be educated from zero",
      "they need a reason to act now"
    ]
  },
  {
    id: "curious_nonbuyer",
    label: "Curious non-buyer",
    baseShare: 0.16,
    contexts: [
      "likes the idea intellectually but has no urgent use case",
      "collects interesting tools and rarely pays for them",
      "may amplify the concept while never becoming revenue"
    ],
    motives: [
      "wants to understand the idea and talk about it",
      "enjoys examples that reveal social or psychological nuance",
      "likes being near new categories"
    ],
    frictions: [
      "their interest is easy to mistake for purchase intent",
      "they will ask for more demos instead of buying",
      "they may flatten the product into a novelty"
    ]
  },
  {
    id: "risk_averse_decider",
    label: "Risk-averse decider",
    baseShare: 0.11,
    contexts: [
      "has budget or authority but is careful about reputation risk",
      "needs to explain purchases to other people",
      "prefers established vendors unless the upside is obvious"
    ],
    motives: [
      "wants fewer embarrassing decisions",
      "cares about defensibility",
      "looks for signs that the creator understands real-world constraints"
    ],
    frictions: [
      "unverifiable claims make them defensive",
      "synthetic simulation can sound unserious to them",
      "the output needs to look usable in a decision process"
    ]
  },
  {
    id: "identity_resonant_follower",
    label: "Identity-resonant follower",
    baseShare: 0.09,
    contexts: [
      "follows people because of worldview, taste, and personal intensity",
      "is drawn to unusual founder energy before understanding the business",
      "may become a loyal audience member before becoming a buyer"
    ],
    motives: [
      "wants to feel the creator is seeing something others miss",
      "likes personal stakes and original language",
      "cares about belonging to an early circle"
    ],
    frictions: [
      "they can be inspired without taking action",
      "overly commercial positioning may reduce the emotional pull",
      "the artifact needs enough specificity to avoid pure vibe"
    ]
  },
  {
    id: "overloaded_scanner",
    label: "Overloaded scanner",
    baseShare: 0.07,
    contexts: [
      "is busy, distracted, and gives the artifact only a few seconds",
      "judges from the first visible claim",
      "does not reconstruct missing context"
    ],
    motives: [
      "wants immediate relevance",
      "responds to plain outcomes and recognizable pain",
      "saves mental effort whenever possible"
    ],
    frictions: [
      "they bounce when the point is not instantly clear",
      "they do not read subtle nuance",
      "they mistake complexity for lack of focus"
    ]
  }
];

const reactionAngles = [
  {
    id: "desire_with_reservation",
    label: "desire with reservation",
    action: "keeps reading, saves it, or considers reaching out later",
    voice: [
      "I can feel the usefulness, but I need one concrete example before I would act.",
      "This is close to a problem I actually have. I am not ready to buy from this alone, but I would keep watching.",
      "The idea lands, but I need to see the result on a real case like mine."
    ]
  },
  {
    id: "specific_confusion",
    label: "specific confusion",
    action: "slows down, rereads, then often leaves",
    voice: [
      "I understand the ambition, but I do not know what I am supposed to do next.",
      "There are several interesting pieces here, and that is exactly why I am not sure what this is for.",
      "I am not confused because it is hard. I am confused because the promise is not anchored enough."
    ]
  },
  {
    id: "private_suspicion",
    label: "private suspicion",
    action: "does not engage, but remembers the claim skeptically",
    voice: [
      "This sounds powerful, but I am checking whether the confidence is earned.",
      "I want to believe it, but part of me thinks this could be a dressed-up prompt.",
      "The framing is strong enough that I immediately look for the proof."
    ]
  },
  {
    id: "quiet_conversion",
    label: "quiet conversion",
    action: "opens the contact path, asks a private question, or starts a trial",
    voice: [
      "This is exactly the kind of thing I would rather test privately than debate publicly.",
      "If the example is real, I would pay for one run just to see what comes back.",
      "I have a decision like this right now, so the timing makes it feel more valuable than abstract."
    ]
  },
  {
    id: "intellectual_interest",
    label: "intellectual interest",
    action: "shares, discusses, or follows without buying",
    voice: [
      "The concept is fascinating. I would talk about it before I would pay for it.",
      "I like the category being created here, even if I do not have a use case today.",
      "This makes me think, which is rare. But it is still not a purchase decision for me."
    ]
  },
  {
    id: "status_reaction",
    label: "status reaction",
    action: "evaluates what using or sharing it says about them",
    voice: [
      "Part of the appeal is that using this would make me feel early.",
      "I would share this if the example made me look smart, not if it looked like generic AI research.",
      "I am reacting as much to the taste of the person behind it as to the product."
    ]
  },
  {
    id: "dismissal",
    label: "dismissal",
    action: "leaves quickly or ignores it",
    voice: [
      "This might be useful for someone, but I do not see my problem in it.",
      "I have seen too many AI tools promise decision support. I need a sharper reason to care.",
      "The idea is not wrong. It just does not create urgency for me."
    ]
  }
];

export async function simulateReaction(input = {}) {
  if (hasComparisonOptions(input)) {
    return simulateComparison(input);
  }

  if (shouldUseLlm(input)) {
    return simulateReactionWithLlm(input);
  }

  return simulateReactionDeterministic(input);
}

export async function simulateComparison(input = {}) {
  const options = normalizeComparisonOptions(input);
  if (options.length < 2) {
    throw new Error("Compare mode requires at least two options.");
  }

  const optionResults = [];
  for (const option of options) {
    const result = await simulateReaction({
      ...input,
      options: undefined,
      compare: undefined,
      artifact: option.artifact,
      objective: `${input.objective || input.decision_question || "Compare options."}\n\nOption being simulated: ${option.label}`,
      simulation: {
        ...(input.simulation || {}),
        target_n: option.targetN || input.simulation?.target_n || input.target_n || 40
      }
    });
    optionResults.push({
      id: option.id,
      label: option.label,
      artifact: option.artifact,
      result,
      summary: summarizeOptionResult(result)
    });
  }

  return buildComparisonResult(input, optionResults);
}

export function simulateReactionDeterministic(input = {}) {
  const normalized = normalizeInput(input);
  const seed = hashText(JSON.stringify(normalized));
  const random = mulberry32(seed);
  const population = buildPopulation(normalized, random);
  const agents = population.map((agent, index) => reactAsAgent(agent, normalized, index, random));
  const voiceClusters = clusterVoices(agents, normalized);

  return withDecisionSupportLayers({
    id: `sim_${seed.toString(16).padStart(8, "0")}`,
    object: {
      type: normalized.artifact.type,
      objective: normalized.objective,
      audience: normalized.audience.description
    },
    simulation_design: {
      requested_n: input.simulation?.target_n ?? null,
      simulated_n: agents.length,
      n_reason: explainN(normalized, agents.length),
      audience_construction: describeAudienceConstruction(normalized),
      note: "These are synthetic human voices for decision support. They are not a substitute for real interviews, sales calls, or live market data."
    },
    reaction_distribution: summarizeDistribution(agents),
    voice_clusters: voiceClusters,
    agent_voices: agents.slice(0, normalized.returnLimit),
    omitted_agent_voices: Math.max(0, agents.length - normalized.returnLimit),
    next_simulation_inputs: suggestNextInputs(normalized, voiceClusters)
  }, normalized);
}

export async function simulateReactionWithLlm(input = {}) {
  const normalized = normalizeInput(input);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Add it to your shell or .env, then retry.");
  }

  const requestedN = normalized.n;
  const returnedVoices = Math.min(normalized.returnLimit || DEFAULT_LLM_RETURN_LIMIT, DEFAULT_LLM_RETURN_LIMIT);
  const model = input.simulation?.model || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const requestedOutputTokens = Number(input.simulation?.max_output_tokens || process.env.OPENAI_MAX_OUTPUT_TOKENS || 30000);
  const maxOutputTokens = Math.max(requestedOutputTokens, 16000);
  const strategy = input.simulation?.strategy || input.simulation?.engine || process.env.SIMULATION_ENGINE || "batch";

  if (strategy !== "single") {
    return simulateReactionBatched({
      apiKey,
      model,
      normalized,
      input,
      requestedN,
      returnedVoices,
      maxOutputTokens
    });
  }

  const body = await callOpenAiReactionSimulation({
    apiKey,
    model,
    normalized,
    requestedN,
    returnedVoices,
    maxOutputTokens
  });

  const outputText = extractOutputText(body);
  if (!outputText) {
    throw new Error("OpenAI API returned no output_text.");
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch (error) {
    if (body.status === "incomplete") {
      throw new Error(`OpenAI API returned incomplete JSON (${body.incomplete_details?.reason || "unknown reason"}). Retry with a smaller target_n or larger max_output_tokens.`);
    }
    throw new Error(`OpenAI API returned non-JSON output: ${error.message}`);
  }

  return withDecisionSupportLayers({
    ...parsed,
    id: parsed.id || `sim_llm_${Date.now()}`,
    object: {
      type: normalized.artifact.type,
      objective: normalized.objective,
      audience: normalized.audience.description,
      ...(parsed.object || {})
    },
    simulation_design: {
      requested_n: requestedN,
      simulated_n: parsed.simulation_design?.simulated_n || requestedN,
      backend: "openai_responses",
      model,
      ...(parsed.simulation_design || {}),
      note: parsed.simulation_design?.note || "These are synthetic human voices for decision support. They are not a substitute for real interviews, sales calls, or live market data."
    }
  }, normalized);
}

async function simulateReactionBatched({ apiKey, model, normalized, input, requestedN, returnedVoices, maxOutputTokens }) {
  const mode = resolveSimulationMode(input, requestedN);
  const plan = buildAudiencePlan(normalized, requestedN, mode);
  const batches = buildVoiceBatches(plan, mode);
  const concurrency = clamp(Number(input.simulation?.concurrency || process.env.SIMULATION_BATCH_CONCURRENCY || DEFAULT_BATCH_CONCURRENCY), 1, 8);
  const batchResults = await runWithConcurrency(batches, concurrency, (batch) => callOpenAiVoiceBatch({
    apiKey,
    model,
    normalized,
    batch,
    mode,
    maxOutputTokens: outputTokensForBatch(input, maxOutputTokens, batch.count)
  }));
  const agents = batchResults.flatMap((result) => result.agent_voices || []).slice(0, requestedN);
  const voiceClusters = clusterVoices(agents).slice(0, 12);

  return withDecisionSupportLayers({
    id: `sim_batch_${Date.now()}`,
    object: {
      type: normalized.artifact.type,
      objective: normalized.objective,
      audience: normalized.audience.description
    },
    simulation_design: {
      requested_n: requestedN,
      simulated_n: agents.length,
      backend: "openai_responses_batched",
      model,
      mode,
      batches: batches.length,
      batch_concurrency: concurrency,
      n_reason: explainN(normalized, requestedN),
      audience_construction: describeBatchedAudienceConstruction(plan),
      note: "These are synthetic human voices for decision support. They are not a substitute for real interviews, sales calls, or live market data."
    },
    reaction_distribution: summarizeDistribution(agents),
    voice_clusters: voiceClusters,
    agent_voices: agents.slice(0, returnedVoices),
    omitted_agent_voices: Math.max(0, agents.length - returnedVoices),
    next_simulation_inputs: suggestNextInputs(normalized, voiceClusters)
  }, normalized, { plan });
}

function resolveSimulationMode(input, requestedN) {
  const explicit = String(input.simulation?.mode || input.mode || "").toLowerCase();
  if (["fast", "standard", "deep", "report"].includes(explicit)) return explicit;
  if (requestedN <= 40) return "fast";
  if (requestedN <= 160) return "standard";
  if (requestedN <= 400) return "deep";
  return "report";
}

function buildAudiencePlan(input, requestedN, mode) {
  const weighted = archetypes
    .map((archetype) => ({
      id: archetype.id,
      label: archetype.label,
      weight: tuneShare(archetype, input),
      context: archetype.contexts[0],
      motive: archetype.motives[0],
      friction: archetype.frictions[0]
    }))
    .sort((a, b) => b.weight - a.weight);
  const segmentCount = mode === "fast" ? 4 : mode === "standard" ? 6 : 8;
  const selected = weighted.slice(0, segmentCount);
  const total = selected.reduce((sum, segment) => sum + segment.weight, 0);
  let assigned = 0;
  const segments = selected.map((segment, index) => {
    const isLast = index === selected.length - 1;
    const count = isLast ? requestedN - assigned : Math.max(1, Math.round((segment.weight / total) * requestedN));
    assigned += count;
    return {
      ...segment,
      share: Number((count / requestedN).toFixed(3)),
      count
    };
  });

  return { mode, requestedN, segments };
}

function buildVoiceBatches(plan, mode) {
  const maxBatchSize = mode === "fast" ? 12 : mode === "standard" ? 20 : 30;
  const batches = [];
  let batchIndex = 0;
  for (const segment of plan.segments) {
    let remaining = segment.count;
    while (remaining > 0) {
      const count = Math.min(maxBatchSize, remaining);
      batches.push({
        id: `batch_${String(batchIndex + 1).padStart(3, "0")}`,
        count,
        segment
      });
      batchIndex += 1;
      remaining -= count;
    }
  }
  return batches;
}

async function callOpenAiVoiceBatch({ apiKey, model, normalized, batch, mode, maxOutputTokens }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: voiceBatchInstructions(),
      input: JSON.stringify({
        artifact: normalized.artifact,
        objective: normalized.objective,
        audience: normalized.audience,
        reaction_dimensions: normalized.dimensions,
        mode,
        batch: {
          id: batch.id,
          count: batch.count,
          segment: batch.segment
        }
      }, null, 2),
      text: {
        format: {
          type: "json_schema",
          name: "reaction_voice_batch",
          strict: false,
          schema: voiceBatchSchema()
        },
        verbosity: "medium"
      },
      max_output_tokens: maxOutputTokens
    })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message || `OpenAI API request failed with HTTP ${response.status}.`;
    throw new Error(message);
  }
  if (body?.status === "incomplete") {
    throw new Error(`OpenAI voice batch returned incomplete JSON (${body.incomplete_details?.reason || "unknown reason"}).`);
  }
  const outputText = extractOutputText(body);
  if (!outputText) throw new Error("OpenAI voice batch returned no output_text.");
  try {
    const parsed = JSON.parse(outputText);
    return {
      ...parsed,
      agent_voices: normalizeBatchVoices(parsed.agent_voices || [], batch)
    };
  } catch (error) {
    throw new Error(`OpenAI voice batch returned non-JSON output: ${error.message}`);
  }
}

function normalizeBatchVoices(voices, batch) {
  return Array.from({ length: batch.count }, (_, index) => {
    const voice = voices[index] || {};
    const fallback = fallbackBatchVoice(batch, index);
    return {
    id: voice.id || `${batch.id}_agent_${String(index + 1).padStart(3, "0")}`,
    archetype_id: batch.segment.id,
    human_dossier: {
      surface_identity: voice.human_dossier?.surface_identity || fallback.human_dossier.surface_identity,
      deeper_context: voice.human_dossier?.deeper_context || fallback.human_dossier.deeper_context,
      private_motive: voice.human_dossier?.private_motive || fallback.human_dossier.private_motive,
      social_mask: voice.human_dossier?.social_mask || "publicly polite, privately selective",
      money_reality: voice.human_dossier?.money_reality || "will only pay if the artifact connects to a live problem",
      status_pressure: voice.human_dossier?.status_pressure || "does not want to look naive for trying another AI tool",
      past_experience: voice.human_dossier?.past_experience || "has seen several AI tools overpromise",
      friction: voice.human_dossier?.friction || fallback.human_dossier.friction
    },
    reaction: {
      first_impression: voice.reaction?.first_impression || fallback.reaction.first_impression,
      inner_voice: voice.reaction?.inner_voice || fallback.reaction.inner_voice,
      felt_but_may_not_say: voice.reaction?.felt_but_may_not_say || fallback.reaction.felt_but_may_not_say,
      likely_action: voice.reaction?.likely_action || fallback.reaction.likely_action,
      action_probability: Number(voice.reaction?.action_probability ?? 0.4),
      emotional_intensity: Number(voice.reaction?.emotional_intensity ?? 0.5),
      reaction_angle: normalizeReactionAngle(voice.reaction?.reaction_angle || fallback.reaction.reaction_angle)
    }
  };
  });
}

function fallbackBatchVoice(batch, index) {
  return {
    human_dossier: {
      surface_identity: `${batch.segment.label} respondent ${index + 1}`,
      deeper_context: batch.segment.context,
      private_motive: batch.segment.motive,
      friction: batch.segment.friction
    },
    reaction: {
      first_impression: "The artifact is interesting, but they need one concrete example before trusting it.",
      inner_voice: "I can see the use, but I am checking whether this is real or just another polished AI claim. Show me one result on something messy and I would know quickly.",
      felt_but_may_not_say: "I do not want to look naive for trying another AI tool that only sounds impressive.",
      likely_action: "waits for a concrete example or sends a low-risk sample",
      reaction_angle: "desire_with_reservation"
    }
  };
}

function normalizeReactionAngle(value) {
  const raw = String(value || "").toLowerCase().trim();
  if (canonicalReactionAngles.includes(raw)) return raw;
  if (/convert|buy|reply|send|trial|try|contact/.test(raw)) return "quiet_conversion";
  if (/desire|interested|curious|reservation|cautious|optimistic/.test(raw)) return "desire_with_reservation";
  if (/confus|unclear|understand|vague/.test(raw)) return "specific_confusion";
  if (/suspicion|skeptic|doubt|trust|proof/.test(raw)) return "private_suspicion";
  if (/intellectual|fascinat|concept|think/.test(raw)) return "intellectual_interest";
  if (/status|early|smart|taste|share/.test(raw)) return "status_reaction";
  return "dismissal";
}

function voiceBatchInstructions() {
  return `You generate one small batch of synthetic human reactions for a reaction simulation API.

Output JSON only.
Return exactly the requested number of agent_voices.
Do not summarize clusters. Do not write a report.
Each voice must feel like one plausible person's private reaction after seeing the artifact.
Avoid consultant language, generic personas, fake precision, and marketing copy.
Make the voices specific, human, internally coherent, and varied inside the given segment.
Use natural private thought: uncertainty, annoyance, money pressure, status anxiety, curiosity, fatigue, and concrete next action.
reaction.reaction_angle must be exactly one of:
- quiet_conversion
- desire_with_reservation
- specific_confusion
- private_suspicion
- intellectual_interest
- status_reaction
- dismissal
The output will be merged with other batches and reduced locally.`;
}

function voiceBatchSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["batch_id", "agent_voices"],
    properties: {
      batch_id: { type: "string" },
      agent_voices: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "human_dossier", "reaction"],
          properties: {
            id: { type: "string" },
            human_dossier: {
              type: "object",
              additionalProperties: false,
              required: ["surface_identity", "deeper_context", "private_motive", "friction"],
              properties: {
                surface_identity: { type: "string" },
                deeper_context: { type: "string" },
                private_motive: { type: "string" },
                friction: { type: "string" }
              }
            },
            reaction: {
              type: "object",
              additionalProperties: false,
              required: ["first_impression", "inner_voice", "felt_but_may_not_say", "likely_action", "action_probability", "emotional_intensity", "reaction_angle"],
              properties: {
                first_impression: { type: "string" },
                inner_voice: { type: "string" },
                felt_but_may_not_say: { type: "string" },
                likely_action: { type: "string" },
                action_probability: { type: "number" },
                emotional_intensity: { type: "number" },
                reaction_angle: {
                  type: "string",
                  enum: canonicalReactionAngles
                }
              }
            }
          }
        }
      }
    }
  };
}

async function runWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function outputTokensForBatch(input, maxOutputTokens, count) {
  const explicit = Number(input.simulation?.batch_max_output_tokens || 0);
  if (explicit > 0) return explicit;
  return clamp(Math.min(maxOutputTokens, 7000 + count * 800), 9000, 26000);
}

function describeBatchedAudienceConstruction(plan) {
  const segments = plan.segments.map((segment) => `${segment.count} ${segment.label}`).join("; ");
  return `Audience was split into ${plan.segments.length} synthetic segments before parallel voice generation: ${segments}.`;
}

function hasComparisonOptions(input = {}) {
  return normalizeComparisonOptions(input).length >= 2;
}

function normalizeComparisonOptions(input = {}) {
  const raw = Array.isArray(input.options)
    ? input.options
    : Array.isArray(input.compare?.options)
      ? input.compare.options
      : [];

  return raw
    .map((option, index) => {
      const artifact = typeof option === "string"
        ? { type: input.artifact?.type || "option", content: option }
        : typeof option?.artifact === "string"
          ? { type: option.type || input.artifact?.type || "option", content: option.artifact }
          : option?.artifact || {
            type: option?.type || input.artifact?.type || "option",
            content: option?.content || option?.text || ""
          };
      return {
        id: String(option?.id || `option_${index + 1}`),
        label: String(option?.label || option?.name || `Option ${index + 1}`),
        artifact: {
          type: String(artifact.type || input.artifact?.type || "option"),
          content: String(artifact.content || artifact.text || "").trim()
        },
        targetN: Number(option?.target_n || option?.targetN || 0)
      };
    })
    .filter((option) => option.artifact.content);
}

function summarizeOptionResult(result) {
  const distribution = result.reaction_distribution || [];
  const clusters = result.voice_clusters || [];
  const positive = distribution
    .filter((item) => /conversion|desire|interest|status|curious/i.test(item.reaction))
    .reduce((sum, item) => sum + Number(item.share || 0), 0);
  const skepticism = distribution
    .filter((item) => /suspicion|confusion|dismissal|skeptic|unclear/i.test(item.reaction))
    .reduce((sum, item) => sum + Number(item.share || 0), 0);
  return {
    positive_share: Number(positive.toFixed(3)),
    skepticism_share: Number(skepticism.toFixed(3)),
    leading_reaction: distribution[0]?.reaction || "",
    strongest_cluster: clusters[0]?.people || "",
    likely_action: clusters[0]?.likely_action || "",
    core_friction: clusters[0]?.common_friction || clusters[0]?.deeper_pattern || ""
  };
}

function buildComparisonResult(input, optionResults) {
  const normalized = normalizeInput({
    ...input,
    artifact: {
      type: "comparison",
      content: optionResults.map((option) => `${option.label}: ${option.artifact.content}`).join("\n\n")
    }
  });
  const ranked = [...optionResults].sort((a, b) => {
    const aScore = a.summary.positive_share - a.summary.skepticism_share;
    const bScore = b.summary.positive_share - b.summary.skepticism_share;
    return bScore - aScore;
  });
  const matrix = optionResults.map((option) => ({
    id: option.id,
    label: option.label,
    positive_share: option.summary.positive_share,
    skepticism_share: option.summary.skepticism_share,
    leading_reaction: option.summary.leading_reaction,
    strongest_cluster: option.summary.strongest_cluster,
    likely_action: option.summary.likely_action,
    core_friction: option.summary.core_friction
  }));

  return withDecisionSupportLayers({
    id: `compare_${Date.now()}`,
    object: {
      type: "comparison",
      objective: normalized.objective,
      audience: normalized.audience.description
    },
    simulation_design: {
      requested_n: Number(input.simulation?.target_n || input.target_n || 40) * optionResults.length,
      simulated_n: optionResults.reduce((sum, option) => sum + Number(option.result.simulation_design?.simulated_n || 0), 0),
      backend: "comparison_wrapper",
      option_count: optionResults.length,
      n_reason: "Each option is simulated separately so the decision is based on option-specific reaction distributions, not one blended reaction.",
      audience_construction: "The same described audience and context are reused across all options so differences come from the option artifact itself.",
      note: "Comparison mode supports decision preflight. It ranks reaction patterns, not guaranteed market outcomes."
    },
    comparison: {
      options: optionResults,
      matrix,
      suggested_path: {
        id: ranked[0]?.id || null,
        label: ranked[0]?.label || "",
        reason: ranked[0]
          ? `Highest positive-minus-skeptical reaction balance in this synthetic run. Still validate with real exposure before treating it as final.`
          : ""
      }
    },
    reaction_distribution: matrix.map((item) => ({
      reaction: item.label,
      count: Math.round(item.positive_share * 1000),
      share: item.positive_share
    })),
    voice_clusters: optionResults.flatMap((option) => (option.result.voice_clusters || []).slice(0, 2).map((cluster) => ({
      ...cluster,
      people: `${option.label}: ${cluster.people}`
    }))).slice(0, 12),
    agent_voices: optionResults.flatMap((option) => (option.result.agent_voices || []).slice(0, 4).map((voice) => ({
      ...voice,
      option_id: option.id,
      option_label: option.label
    }))),
    omitted_agent_voices: optionResults.reduce((sum, option) => sum + Number(option.result.omitted_agent_voices || 0), 0),
    next_simulation_inputs: [
      "Run the strongest option against a larger audience after tightening the exact artifact.",
      "Run the most skeptical option again after adding the missing proof or context.",
      "After using the chosen option in the real world, log the actual outcome for calibration."
    ]
  }, normalized);
}

function withDecisionSupportLayers(result, normalized, options = {}) {
  return {
    ...result,
    trust_layer: result.trust_layer || buildTrustLayer(normalized, result),
    audience_construction_report: result.audience_construction_report || buildAudienceConstructionReport(normalized, options.plan),
    decision_support: result.decision_support || buildDecisionSupport(normalized, result)
  };
}

function buildTrustLayer(input, result = {}) {
  const content = input.artifact.content || "";
  const audience = input.audience.description || "";
  const source = input.audience.source || "described_or_inferred";
  const hasContextPacket = /Yomira context packet|Context packet|Channel \/ situation|Known concerns/i.test(content);
  const hasSuppliedData = /crm|interview|review|customer note|sales call|x\/social|dataset|supplied data|grounding material/i.test(content + " " + audience);
  const missing = [];
  if (content.length < 200) missing.push("exact artifact text or full artifact screenshot/source");
  if (audience.length < 120) missing.push("specific audience description and who realistically sees this");
  if (!/channel|situation|where|x dm|landing|email|sales|publish|公開|送信/i.test(content + " " + audience)) missing.push("channel and scene where the audience encounters the artifact");
  if (!/desired action|buy|reply|contact|sign up|purchase|問い合わせ|返信|購入/i.test(content + " " + audience)) missing.push("desired action or conversion target");
  if (!/concern|objection|risk|worry|doubt|skeptic|懸念|不安|反論/i.test(content + " " + audience)) missing.push("known concerns, objections, or trust risks");
  if (!hasSuppliedData) missing.push("real outcome data, customer examples, or supplied audience source material");

  const groundingLevel = hasSuppliedData
    ? "supplied_data"
    : hasContextPacket || source === "dashboard_context_packet"
      ? "agent_context"
      : "thin_context";

  return {
    grounding_level: groundingLevel,
    data_basis: hasSuppliedData
      ? "User supplied or described external source material in addition to the artifact."
      : groundingLevel === "agent_context"
        ? "Exact artifact plus structured context packet supplied by the user or agent."
        : "Described artifact and audience only.",
    prediction_scope: "Useful for reaction preflight, option comparison, missing-context discovery, and next validation planning. Not a guaranteed market forecast.",
    missing_context: missing,
    assumptions: [
      "Synthetic agents are constructed from the provided artifact, audience, and context.",
      "Percentages summarize this synthetic run; they are not survey statistics unless calibrated against real outcomes.",
      "Real behavior can shift with timing, distribution, relationship, brand trust, and competing alternatives."
    ],
    cannot_predict: [
      "Exact conversion rate or revenue without real traffic/outcome data.",
      "Viral spread, platform algorithm behavior, or one specific person's final decision.",
      "Effects of facts that were not included in the context packet."
    ],
    recommended_validation: missing.length
      ? [
        "Add the missing context before treating this as a serious decision input.",
        "Expose the chosen artifact to a small real audience and log the actual result.",
        "Re-run with supplied customer/interview/social data for a grounded version."
      ]
      : [
        "Use this as a preflight result, then log real outcomes for calibration.",
        "For high-stakes decisions, run a grounded audience pack with real source data."
      ]
  };
}

function buildAudienceConstructionReport(input, plan) {
  const segments = plan?.segments?.length
    ? plan.segments
    : buildAudiencePlan(input, input.n || 120, "standard").segments;

  return {
    audience_source: input.audience.source || "described_or_inferred",
    audience_brief: input.audience.description,
    construction_method: plan
      ? "weighted_segments_from_artifact_and_context"
      : "inferred_segments_from_artifact_and_context",
    segments: segments.map((segment) => ({
      id: segment.id,
      name: segment.label,
      count: segment.count,
      share: segment.share,
      why_included: segment.context,
      likely_pressure: segment.motive,
      main_friction: segment.friction,
      data_basis: input.audience.source || "inferred from prompt/context"
    })),
    thin_spots: buildTrustLayer(input).missing_context,
    enterprise_upgrade_note: "For grounded simulations, replace inferred segments with supplied customer notes, interviews, CRM rows, reviews, social data, or panel data."
  };
}

function buildDecisionSupport(input, result = {}) {
  const distribution = result.reaction_distribution || [];
  const topRisk = distribution.find((item) => /suspicion|confusion|dismissal/i.test(item.reaction));
  const topPositive = distribution.find((item) => /conversion|desire|interest|status|curious/i.test(item.reaction));
  return {
    use_as: "preflight_decision_support",
    strongest_positive_signal: topPositive?.reaction || "",
    strongest_risk_signal: topRisk?.reaction || "",
    decision_rule: "Choose or revise based on the reaction pattern you can actually validate next, not on a synthetic winner alone.",
    next_step: "Run a real-world exposure or log the actual outcome after using the selected artifact."
  };
}

async function callOpenAiReactionSimulation({ apiKey, model, normalized, requestedN, returnedVoices, maxOutputTokens }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      instructions: llmInstructions(),
      input: JSON.stringify({
        artifact: normalized.artifact,
        objective: normalized.objective,
        audience: normalized.audience,
        reaction_dimensions: normalized.dimensions,
        requested_n: requestedN,
        returned_agent_voices: returnedVoices
      }, null, 2),
      text: {
        format: {
          type: "json_schema",
          name: "reaction_simulation",
          strict: false,
          schema: reactionSimulationSchema()
        },
        verbosity: "medium"
      },
      max_output_tokens: maxOutputTokens
    })
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message || `OpenAI API request failed with HTTP ${response.status}.`;
    throw new Error(message);
  }
  return body;
}

function normalizeInput(input) {
  const artifact = typeof input.artifact === "string"
    ? { type: "unknown", content: input.artifact }
    : input.artifact || {};

  const content = String(artifact.content || artifact.text || input.content || "").trim();
  const objective = String(input.objective || input.decision_question || "Understand how people would interpret and react to this.").trim();
  const audience = typeof input.audience === "string"
    ? { description: input.audience }
    : input.audience || {};

  const audienceDescription = String(audience.description || input.audience_brief || "People who may encounter this artifact.").trim();
  const requestedN = Number(input.simulation?.target_n || input.target_n || 0);
  const inferredN = inferN({ content, objective, audienceDescription, artifactType: artifact.type });
  const n = clamp(Number.isFinite(requestedN) && requestedN > 0 ? requestedN : inferredN, 12, DEFAULT_MAX_N);
  const detail = input.simulation?.detail || input.detail || "voices";
  const returnLimit = detail === "full"
    ? n
    : clamp(Number(input.simulation?.max_agent_voices || input.max_agent_voices || DEFAULT_RETURN_LIMIT), 8, n);

  return {
    artifact: {
      type: String(artifact.type || input.decision_surface || "artifact"),
      content
    },
    objective,
    audience: {
      description: audienceDescription,
      source: audience.source || input.audience_source || "described_or_inferred",
      knownPeople: Array.isArray(audience.known_people) ? audience.known_people : []
    },
    dimensions: Array.isArray(input.reaction_dimensions) ? input.reaction_dimensions : [],
    n,
    returnLimit
  };
}

function shouldUseLlm(input) {
  const provider = input.simulation?.provider || input.provider || process.env.SIMULATION_PROVIDER || "llm";
  return provider !== "deterministic" && provider !== "local";
}

function llmInstructions() {
  return `You are the engine behind a synthetic human voice simulation product.

Your job is not to score the artifact, write strategy advice, or sound like a market research report.
Your job is to generate dense, believable, varied human reactions to the user's artifact.

Core rules:
- Output JSON only.
- Treat the result as synthetic voices for decision support, not real survey data.
- The main value is the raw human texture: inner voice, private motive, social mask, money reality, status pressure, likely action.
- Avoid generic personas like "AI-interested founder". Make people feel specific without pretending they are real named individuals.
- Do not write consultant language such as "growth mindset", "balancing efficiency", "actionable insights", "diverse stakeholders", or "market proof" unless a person would actually think those words.
- Do not produce gibberish, pseudo-language, corrupted text, joke text, or surreal filler. Every raw voice must sound like a plausible private thought from one coherent person.
- Do not summarize what a user segment "would value". Write what that person would actually mutter internally after seeing the artifact.
- Each cluster must be built from individual raw voices first, then summarized into percentages. The percentage is a count of similar private reactions, not an abstract score.
- Do not over-focus on trust/confidence as a meta field. If suspicion, desire, confusion, or trust appears, express it as human voice.
- Build the audience from the given audience brief and artifact context. If the audience is broad, create several plausible clusters.
- Simulate all relevant reaction types: desire, confusion, suspicion, curiosity, dismissal, status reaction, quiet conversion.
- Use percentages and counts as a summary of the synthetic run, but make the voices the center.
- When requested_n is large, do not return every individual. Return representative voices and clusters while preserving the simulated_n.
- In raw_voices and inner_voice, write like private thought, not a survey answer. Include hesitation, vanity, money anxiety, embarrassment, status, fatigue, curiosity, and concrete context.
- Good cluster labels are like "bootstrapped founders who want a fake-customer-call before paying for user research" or "agency owners who like the demo but fear clients will call it AI guessing".
- Bad cluster labels are like "innovation-oriented users" or "stakeholders seeking trust".
- A good voice sounds like: "I would probably try this once if it used my actual landing page. But if it comes back with polished marketing-speak, I will immediately think it is just another prompt wrapper."
- A bad voice sounds like: "This tool provides actionable insights for founders seeking validation."

The user wants output that feels like hearing many humans think privately.`;
}

function reactionSimulationSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "id",
      "object",
      "simulation_design",
      "reaction_distribution",
      "voice_clusters",
      "agent_voices",
      "omitted_agent_voices",
      "next_simulation_inputs"
    ],
    properties: {
      id: { type: "string" },
      object: {
        type: "object",
        additionalProperties: false,
        required: ["type", "objective", "audience"],
        properties: {
          type: { type: "string" },
          objective: { type: "string" },
          audience: { type: "string" }
        }
      },
      simulation_design: {
        type: "object",
        additionalProperties: false,
        required: ["requested_n", "simulated_n", "n_reason", "audience_construction", "note"],
        properties: {
          requested_n: { type: "integer" },
          simulated_n: { type: "integer" },
          n_reason: { type: "string" },
          audience_construction: { type: "string" },
          note: { type: "string" }
        }
      },
      reaction_distribution: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["reaction", "count", "share"],
          properties: {
            reaction: { type: "string" },
            count: { type: "integer" },
            share: { type: "number" }
          }
        }
      },
      voice_clusters: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["share", "count", "people", "deeper_pattern", "core_private_motive", "common_friction", "likely_action", "core_voice", "raw_voices"],
          properties: {
            share: { type: "number" },
            count: { type: "integer" },
            people: { type: "string" },
            deeper_pattern: { type: "string" },
            core_private_motive: { type: "string" },
            common_friction: { type: "string" },
            likely_action: { type: "string" },
            core_voice: { type: "string" },
            raw_voices: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      },
      agent_voices: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "human_dossier", "reaction"],
          properties: {
            id: { type: "string" },
            human_dossier: {
              type: "object",
              additionalProperties: false,
              required: ["surface_identity", "deeper_context", "private_motive", "social_mask", "money_reality", "status_pressure", "past_experience", "friction"],
              properties: {
                surface_identity: { type: "string" },
                deeper_context: { type: "string" },
                private_motive: { type: "string" },
                social_mask: { type: "string" },
                money_reality: { type: "string" },
                status_pressure: { type: "string" },
                past_experience: { type: "string" },
                friction: { type: "string" }
              }
            },
            reaction: {
              type: "object",
              additionalProperties: false,
              required: ["first_impression", "inner_voice", "felt_but_may_not_say", "likely_action", "action_probability", "emotional_intensity", "reaction_angle"],
              properties: {
                first_impression: { type: "string" },
                inner_voice: { type: "string" },
                felt_but_may_not_say: { type: "string" },
                likely_action: { type: "string" },
                action_probability: { type: "number" },
                emotional_intensity: { type: "number" },
                reaction_angle: { type: "string" }
              }
            }
          }
        }
      },
      omitted_agent_voices: { type: "integer" },
      next_simulation_inputs: {
        type: "array",
        items: { type: "string" }
      }
    }
  };
}

function extractOutputText(body) {
  if (typeof body?.output_text === "string") return body.output_text;

  const texts = [];
  for (const item of body?.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        texts.push(content.text);
      }
    }
  }
  return texts.join("");
}

function inferN({ content, objective, audienceDescription, artifactType }) {
  const wordish = `${content} ${objective} ${audienceDescription} ${artifactType}`.toLowerCase();
  let n = 120;
  if (content.length > 800) n += 80;
  if (audienceDescription.length > 300) n += 80;
  if (/(price|pricing|purchase|buy|sales|offer|lp|landing|事業|購買|価格|売る|営業)/i.test(wordish)) n += 120;
  if (/(x|twitter|profile|post|content|プロフィール|投稿|コンテンツ)/i.test(wordish)) n += 80;
  if (/(enterprise|b2b|founder|investor|agency|経営|法人|投資家)/i.test(wordish)) n += 80;
  return n;
}

function buildPopulation(input, random) {
  const weighted = archetypes.map((archetype) => ({
    archetype,
    weight: tuneShare(archetype, input)
  }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  const population = [];

  for (let i = 0; i < input.n; i += 1) {
    let cursor = random() * total;
    let picked = weighted[0].archetype;
    for (const item of weighted) {
      cursor -= item.weight;
      if (cursor <= 0) {
        picked = item.archetype;
        break;
      }
    }
    population.push(buildAgent(picked, input, i, random));
  }

  return population;
}

function tuneShare(archetype, input) {
  const text = `${input.artifact.content} ${input.objective} ${input.audience.description}`.toLowerCase();
  let weight = archetype.baseShare;
  const technicalScene = /(technical|developer|engineer|api|ai|agent|claude|codex|cursor|openclaw|hermes|x|twitter|founder|builder|indie|startup|devtool|開発|エンジニア|技術|エージェント)/i.test(text);
  const buyerScene = /(buy|purchase|sales|price|pricing|sell|revenue|smb|small business|operator|agency|client|売|購買|問い合わせ|営業|法人|中小企業)/i.test(text);
  if (technicalScene) {
    if (["taste_sensitive_builder", "skeptical_peer", "curious_nonbuyer"].includes(archetype.id)) weight += 0.16;
    if (["quiet_high_intent_buyer", "identity_resonant_follower"].includes(archetype.id)) weight += 0.08;
    if (archetype.id === "cash_near_operator" && !buyerScene) weight *= 0.45;
    if (archetype.id === "risk_averse_decider" && !buyerScene) weight *= 0.65;
  }
  if (/(buy|purchase|sales|price|pricing|売|購買|問い合わせ)/i.test(text) && archetype.id.includes("buyer")) weight += 0.08;
  if (/(profile|x|twitter|プロフィール|投稿|content|コンテンツ)/i.test(text) && archetype.id.includes("follower")) weight += 0.08;
  if (/(founder|builder|ai|agent|開発|プロダクト)/i.test(text) && archetype.id.includes("builder")) weight += 0.08;
  if (/(enterprise|b2b|法人|稟議|決裁)/i.test(text) && archetype.id.includes("risk_averse")) weight += 0.08;
  if (/(weird|taste|brand|voice|表現|センス|思想)/i.test(text) && archetype.id.includes("taste")) weight += 0.07;
  return weight;
}

function buildAgent(archetype, input, index, random) {
  const ages = [24, 27, 31, 35, 39, 44, 52];
  const roles = [
    "solo founder",
    "small business owner",
    "agency operator",
    "in-house marketer",
    "product-minded engineer",
    "creator with a niche audience",
    "consultant who sells judgment",
    "executive who buys through referrals"
  ];
  const lifeContext = pick(archetype.contexts, random);
  const privateMotive = pick(archetype.motives, random);
  const friction = pick(archetype.frictions, random);
  const role = pick(roles, random);
  const age = pick(ages, random) + Math.floor(random() * 3) - 1;
  const budget = budgetReality(role, random);

  return {
    id: `agent_${String(index + 1).padStart(4, "0")}`,
    archetype_id: archetype.id,
    human_dossier: {
      surface_identity: `${age}-year-old ${role}`,
      deeper_context: humanizeFragment(lifeContext),
      private_motive: humanizeFragment(privateMotive),
      social_mask: socialMask(archetype, random),
      money_reality: budget,
      status_pressure: statusPressure(archetype, random),
      past_experience: pastExperience(archetype, input, random),
      friction: humanizeFragment(friction)
    }
  };
}

function reactAsAgent(agent, input, index, random) {
  const angle = chooseReactionAngle(agent, input, random);
  const artifactReference = artifactPhrase(input);
  const voice = rewriteVoice(pick(angle.voice, random), agent, input, artifactReference, random);
  const nextAction = likelyAction(angle, agent, input, random);
  const intensity = Number((0.35 + random() * 0.6).toFixed(2));

  return {
    id: agent.id,
    human_dossier: agent.human_dossier,
    reaction: {
      first_impression: firstImpression(angle, artifactReference, random),
      inner_voice: voice,
      felt_but_may_not_say: feltButMayNotSay(agent, angle, random),
      likely_action: nextAction,
      action_probability: Number((actionProbability(angle, agent, input, random)).toFixed(2)),
      emotional_intensity: intensity,
      reaction_angle: angle.label
    }
  };
}

function chooseReactionAngle(agent, input, random) {
  const text = `${input.artifact.content} ${input.objective}`.toLowerCase();
  const candidates = reactionAngles.map((angle) => {
    let weight = 1;
    if (agent.archetype_id === "quiet_high_intent_buyer" && angle.id === "quiet_conversion") weight += 2.4;
    if (agent.archetype_id === "curious_nonbuyer" && angle.id === "intellectual_interest") weight += 2.2;
    if (agent.archetype_id === "skeptical_peer" && angle.id === "private_suspicion") weight += 1.8;
    if (agent.archetype_id === "overloaded_scanner" && angle.id === "dismissal") weight += 1.8;
    if (agent.archetype_id === "taste_sensitive_builder" && angle.id === "status_reaction") weight += 1.2;
    if (/(price|pricing|buy|purchase|問い合わせ|購買|売)/i.test(text) && angle.id === "quiet_conversion") weight += 0.8;
    if (/(complex|many|multiple|複雑|多い|色々)/i.test(text) && angle.id === "specific_confusion") weight += 0.8;
    return { angle, weight };
  });
  const total = candidates.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * total;
  for (const item of candidates) {
    cursor -= item.weight;
    if (cursor <= 0) return item.angle;
  }
  return candidates[0].angle;
}

function summarizeDistribution(agents) {
  const counts = new Map();
  for (const agent of agents) {
    const key = agent.reaction.reaction_angle;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([reaction, count]) => ({
      reaction,
      count,
      share: Number((count / agents.length).toFixed(3))
    }))
    .sort((a, b) => b.count - a.count);
}

function clusterVoices(agents) {
  const grouped = new Map();
  for (const agent of agents) {
    const key = `${agent.archetype_id || agent.human_dossier.surface_identity.split(" ").slice(-2).join(" ")}:${agent.reaction.reaction_angle}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(agent);
  }

  return [...grouped.values()]
    .sort((a, b) => b.length - a.length)
    .slice(0, 12)
    .map((items) => {
      const first = items[0];
      return {
        share: Number((items.length / agents.length).toFixed(3)),
        count: items.length,
        people: first.human_dossier.surface_identity,
        deeper_pattern: first.human_dossier.deeper_context,
        core_private_motive: first.human_dossier.private_motive,
        common_friction: first.human_dossier.friction,
        likely_action: mostCommon(items.map((item) => item.reaction.likely_action)),
        core_voice: first.reaction.inner_voice,
        raw_voices: items.slice(0, 6).map((item) => item.reaction.inner_voice)
      };
    });
}

function suggestNextInputs(input, clusters) {
  const suggestions = [
    "Add the exact artifact people will see, not only the idea behind it.",
    "Describe who actually reaches this artifact first, including existing audience, channel, and context.",
    "Run variants side by side when wording, positioning, price, or offer shape changes the human reaction."
  ];

  if (!input.artifact.content || input.artifact.content.length < 120) {
    suggestions.unshift("The artifact is thin; add the real profile, post, LP section, DM, or offer text for denser voices.");
  }

  if (clusters.some((cluster) => /confus|unclear|not know/i.test(cluster.core_voice))) {
    suggestions.push("Several voices are reacting to missing specificity; test a version with a clearer action path.");
  }

  return suggestions;
}

function explainN(input, n) {
  return `N=${n} was chosen from artifact complexity, audience breadth, and whether the decision involves public interpretation, buying, or identity-sensitive reaction.`;
}

function describeAudienceConstruction(input) {
  return [
    `Audience source: ${input.audience.source}.`,
    `Audience brief: ${input.audience.description}`,
    "The current engine builds a scene-specific synthetic audience from archetypes, then varies life context, money reality, status pressure, past experience, and private motives per agent."
  ].join(" ");
}

function artifactPhrase(input) {
  if (/profile|プロフィール/i.test(input.artifact.type)) return "profile";
  if (/post|content|投稿|コンテンツ/i.test(input.artifact.type)) return "content";
  if (/lp|landing|website|サイト/i.test(input.artifact.type)) return "landing page";
  if (/price|pricing|価格/i.test(input.artifact.type)) return "price";
  if (/offer|事業|product|service/i.test(input.artifact.type)) return "offer";
  return "artifact";
}

function firstImpression(angle, artifactReference, random) {
  const options = [
    `The ${artifactReference} feels interesting but asks me to infer too much.`,
    `The ${artifactReference} has a real signal, but I immediately look for the concrete proof.`,
    `The ${artifactReference} makes me pause, which is better than most things I see.`,
    `The ${artifactReference} sounds useful, but the use case needs to meet me where I am.`
  ];
  if (angle.id === "dismissal") return `The ${artifactReference} does not connect to a live problem for me fast enough.`;
  if (angle.id === "quiet_conversion") return `The ${artifactReference} touches an active problem I have been carrying around.`;
  return pick(options, random);
}

function rewriteVoice(base, agent, input, artifactReference, random) {
  const dossier = agent.human_dossier;
  const additions = [
    `For someone like me, the decisive part: ${lowerFirst(dossier.private_motive)}.`,
    `What slows me down: ${dossier.friction}.`,
    `I am reading it through my own situation: ${dossier.deeper_context}.`,
    `I would not say this publicly, but ${lowerFirst(stripTrailingPeriod(dossier.status_pressure))}.`
  ];
  return `${base} ${pick(additions, random)} The ${artifactReference} has to answer that before I move.`;
}

function feltButMayNotSay(agent, angle, random) {
  const options = [
    agent.human_dossier.status_pressure,
    `I am comparing this to the last time I paid for advice and felt the output was too generic.`,
    `I want the result to make me feel less alone in the decision, not just more informed.`,
    `If this reveals something embarrassing but useful, I would value it more than a polite report.`
  ];
  if (angle.id === "status_reaction") {
    options.push("I care whether being associated with this makes me look early or naive.");
  }
  return pick(options, random);
}

function likelyAction(angle, agent, input, random) {
  if (angle.id === "quiet_conversion") return pick(["asks for a sample", "opens the contact path", "runs one paid test", "sends it to a cofounder privately"], random);
  if (angle.id === "intellectual_interest") return pick(["follows", "shares with commentary", "bookmarks without buying", "asks a conceptual question"], random);
  if (angle.id === "specific_confusion") return pick(["rereads then leaves", "asks what the concrete use case is", "waits for an example", "compares it to a familiar tool"], random);
  if (angle.id === "private_suspicion") return pick(["looks for proof", "checks the creator's history", "does not engage yet", "tests a small case only"], random);
  if (angle.id === "dismissal") return pick(["scrolls past", "ignores it", "mentally files it as not for them"], random);
  return angle.action;
}

function actionProbability(angle, agent, input, random) {
  const base = {
    quiet_conversion: 0.62,
    desire_with_reservation: 0.44,
    intellectual_interest: 0.32,
    status_reaction: 0.28,
    specific_confusion: 0.18,
    private_suspicion: 0.16,
    dismissal: 0.04
  }[angle.id] || 0.2;
  return clampNumber(base + (random() - 0.5) * 0.18, 0.01, 0.95);
}

function socialMask(archetype, random) {
  return pick([
    "presents as more certain than they feel",
    "acts analytical in public but decides emotionally when risk is personal",
    "does not want to look behind the curve",
    "likes to appear hard to impress",
    "publicly values novelty but privately needs reassurance"
  ], random);
}

function stripTrailingPeriod(text) {
  return String(text).replace(/[.。]+$/u, "");
}

function lowerFirst(text) {
  const value = String(text);
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function humanizeFragment(text) {
  const value = stripTrailingPeriod(text);
  if (/^(they|this person|for them|their)\b/i.test(value)) return value;
  const replacements = [
    [/^is\b/i, "They are"],
    [/^has\b/i, "They have"],
    [/^may\b/i, "They may"],
    [/^can\b/i, "They can"],
    [/^will\b/i, "They will"],
    [/^wants\b/i, "They want"],
    [/^needs\b/i, "They need"],
    [/^likes\b/i, "They like"],
    [/^dislikes\b/i, "They dislike"],
    [/^runs\b/i, "They run"],
    [/^owns\b/i, "They own"],
    [/^builds\b/i, "They build"],
    [/^uses\b/i, "They use"],
    [/^cares\b/i, "They care"],
    [/^prefers\b/i, "They prefer"],
    [/^responds\b/i, "They respond"],
    [/^enjoys\b/i, "They enjoy"],
    [/^collects\b/i, "They collect"],
    [/^acts\b/i, "They act"],
    [/^gets\b/i, "They get"],
    [/^rejects\b/i, "They reject"],
    [/^spots\b/i, "They spot"],
    [/^worries\b/i, "They worry"],
    [/^bounces\b/i, "They bounce"],
    [/^mistakes\b/i, "They mistake"],
    [/^looks\b/i, "They look"],
    [/^often\b/i, "They often"],
    [/^reads\b/i, "They read"]
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(value)) return fixTheyAgreement(value.replace(pattern, replacement));
  }
  return fixTheyAgreement(value);
}

function fixTheyAgreement(text) {
  return String(text)
    .replace(/\band has\b/g, "and have")
    .replace(/\band cares\b/g, "and care")
    .replace(/\band judges\b/g, "and judge")
    .replace(/\band rarely pays\b/g, "and rarely pay")
    .replace(/\bbut judges\b/g, "but judge")
    .replace(/\bbut is\b/g, "but are");
}

function statusPressure(archetype, random) {
  return pick([
    "They want to avoid looking naive in front of sharper peers.",
    "They want to feel they noticed the category before it became obvious.",
    "They do not want to admit that this decision is emotionally loaded.",
    "They are comparing themselves to people who seem more AI-native.",
    "They want a tool that makes their judgment look stronger, not outsourced."
  ], random);
}

function pastExperience(archetype, input, random) {
  return pick([
    "paid for advice once and felt the final deliverable was too generic",
    "has had one unusually good expert call and keeps looking for that feeling again",
    "has used AI tools that were impressive in demos but weak on their own real context",
    "has watched peers get attention from sharper positioning and felt late",
    "has made at least one public-facing decision that looked fine internally and landed weirdly outside"
  ], random);
}

function budgetReality(role, random) {
  if (/executive|business owner|agency/.test(role)) {
    return pick(["can test $100-$300 quickly, but larger spend needs a concrete case", "can pay if it saves a bad public or sales decision", "has budget, but hates feeling like an experiment"], random);
  }
  if (/founder|consultant/.test(role)) {
    return pick(["will pay small amounts for sharp leverage", "can justify $49-$199 if the output feels immediately usable", "has more appetite than budget"], random);
  }
  return pick(["interested but price-sensitive", "will use free examples first", "needs a current painful decision before paying"], random);
}

function mostCommon(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || values[0];
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
