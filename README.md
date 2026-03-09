# Self Research

Self Research is a bio-research workspace built to make research at least 10x more productive.

The core idea is simple: most important research work is not generation, it is comparison. Researchers need to compare long papers, conflicting findings, experiment logs, notes, datasets, and multimodal evidence. This is exactly where standard LLMs fail. They degrade on long contexts, lose details across documents, and break even harder once multimodal inputs are involved.

Self Research takes a different approach. It uses Recursive Language Models (RLMs) to process massive amounts of information through recursive decomposition, evidence comparison, and structured aggregation. In practice, this extends the usable context window by roughly 30x, enabling research workflows over the equivalent of a 30 million token context window.

On top of that, results are persisted into UltraContext and made available in real time for the rest of the team through MCP.

## Why this exists

Modern research is bottlenecked by context fragmentation:

- important evidence is spread across long papers, supplements, datasets, and internal notes
- comparison across sources is more valuable than summarizing any single source
- standard LLMs are weak at cross-document comparison and contradiction tracing
- adding images, charts, and other modalities usually makes reliability worse
- useful research state often stays trapped inside one person’s session instead of becoming team memory

Self Research is designed to solve that problem.

## What Self Research does

- runs recursive research workflows over very large bodies of evidence
- compares findings across papers and large datasets instead of just summarizing them
- helps validate or falsify hypotheses
- supports iterative experiment planning and research loops
- stores research contexts in UltraContext
- exposes saved research to the rest of the team through MCP

## Core thesis

If you want to accelerate science, you need a system that can:

1. ingest large amounts of scientific context
2. compare evidence across many sources
3. preserve research state over time
4. make that state accessible to the entire team immediately

Self Research is that system.

## How it works

### 1. Recursive Language Models

Instead of forcing a single model call to reason over everything at once, Self Research breaks research into recursive subproblems. Each branch can inspect a slice of the evidence, produce intermediate outputs, and feed structured results back into the global research graph.

This makes large-context comparison feasible where flat prompting fails.

### 2. Massive effective context windows

By distributing reasoning recursively and aggregating results, Self Research extends the effective state of the art by roughly 30x. The goal is not a marketing number. The goal is to make genuinely large-scale research comparison practical.

### 3. UltraContext as shared memory

Research outputs are persisted to UltraContext so they do not disappear when a single run ends. That context can then be reloaded in the app and accessed externally through MCP, turning individual work into team-available research memory.

## Current research templates

- Falsiability
- Hypothesis Verification
- Self-Experimentation

These templates reflect the current focus of the product: biological research, evidence comparison, and iterative scientific workflows.

## Example use cases

- compare dozens or hundreds of biology papers around a mechanism or target
- identify contradictions across literature and assay results
- evaluate whether a biological hypothesis is actually supported by the evidence
- design the next experiment loop from prior runs, failures, and constraints
- keep a persistent research record that the full team can query via MCP

## Product direction

Self Research is being built for a future where researchers work with AI systems that can:

- reason over massive scientific context
- compare instead of merely summarize
- retain research memory across runs
- collaborate through shared context infrastructure

The ambition is to help research teams move faster, make better decisions, and accelerate progress.

## Stack

- Next.js
- React
- Recursive Language Model execution workflow
- UltraContext for context persistence and MCP availability
- React Flow for research graph visualization

## Local development

Install dependencies and run the app:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Environment variables

Required:

```bash
ULTRACONTEXT_API_KEY=...
```

Optional, depending on the workflows you use:

```bash
ULTRACONTEXT_BASE_URL=...
HYPERBROWSER_API_KEY=...
DAYTONA_API_KEY=...
DAYTONA_API_URL=...
DAYTONA_TARGET=us
```

## Useful scripts

```bash
pnpm dev
pnpm lint
pnpm ingest:research-contexts
```

## MCP

One of the main goals of Self Research is to make research outputs accessible to the entire team, not just the person who ran them.

That is why research contexts are ingested into UltraContext with project-level metadata and exposed through MCP. In practice, this means a completed research run can become shared operational memory for the team.

## Status

Self Research is an active prototype focused on large-context biological research workflows.
