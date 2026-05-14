#!/usr/bin/env node

import fs from "node:fs/promises";
import { simulateReaction } from "../src/simulation/engine.mjs";
import { loadDotEnv } from "../src/simulation/env.mjs";

loadDotEnv();

function usage() {
  return `Reaction Simulation API tools

Usage:
  node bin/reaction-sim.mjs sample
  node bin/reaction-sim.mjs run --input request.json

Commands:
  sample              Print a sample request body.
  run --input <file>  Run the simulation engine and print JSON.
`;
}

function sampleRequest() {
  return {
    artifact: {
      type: "x_profile",
      content: "AI-native agency founder. Building Mora and synthetic human voice simulation for better decisions."
    },
    objective: "Understand how people would interpret this X profile and what actions they might take.",
    audience: {
      source: "described",
      description: "AI-native founders, small business owners, consultants, curious peers, and potential buyers who may encounter this profile on X."
    },
    simulation: {
      target_n: 120,
      detail: "voices",
      max_agent_voices: 12,
      provider: "llm"
    }
  };
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log(usage());
    return;
  }

  if (command === "sample") {
    console.log(JSON.stringify(sampleRequest(), null, 2));
    return;
  }

  if (command === "run") {
    const inputFlagIndex = args.indexOf("--input");
    const inputPath = inputFlagIndex >= 0 ? args[inputFlagIndex + 1] : null;
    if (!inputPath) {
      throw new Error("Missing --input <file>.");
    }
    const input = JSON.parse(await fs.readFile(inputPath, "utf8"));
    console.log(JSON.stringify(await simulateReaction(input), null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error.message);
  console.error("");
  console.error(usage());
  process.exit(1);
});
