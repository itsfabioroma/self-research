# Self Research

Self Research is an AI research agent built to make scientists 10x more productive through Recursive Language Models and real-time context sharing.

The core idea is simple: the biggest bottleneck in research today is comparison at scale. Scientists need to compare experimental results against massive volumes of papers, internal notes, datasets, and multimodal evidence. That information is often fragmented, inconsistent, and sometimes conflicting. The work is not just reading. The work is comparison.

This is exactly where standard LLMs fail. As soon as you ask them to compare one experiment against a large body of literature, the context window becomes the bottleneck. The comparison becomes too expensive context-wise, important details get dropped, and reliability collapses. In practice, the model cannot hold enough of the evidence at once to do the job well.

Self Research takes a different approach. It uses Recursive Language Models (RLMs) to process massive amounts of information through recursive decomposition, evidence comparison, and structured aggregation. In practice, this extends the usable context window by roughly 30x, enabling research workflows over the equivalent of a 30 million token context window.

On top of that, research outputs are persisted into UltraContext and shared in real time with the rest of the team through MCP. The result is not just a better chat interface. It is a shared research system that can process huge amounts of scientific data and expose the resulting research live so the entire team can evaluate it using AI agents.

## Why this exists

Modern research is bottlenecked by context fragmentation:

- important evidence is spread across long papers, supplements, datasets, and internal notes
- comparison across sources is more valuable than summarizing any single source
- scientists constantly need to compare experiment results against a broad and messy body of literature
- many relevant findings are conflicting, partial, or hard to reconcile
- standard LLMs are weak at cross-document comparison and contradiction tracing
- context windows make this kind of research expensive and brittle
- adding images, charts, and other modalities usually makes reliability worse
- useful research state often stays trapped inside one person’s session instead of becoming team memory

Self Research is designed to solve that problem by combining large-scale recursive reasoning with real-time context sharing.

## What Self Research does

- runs recursive research workflows over very large bodies of evidence
- processes huge amounts of papers, results, and scientific context that do not fit in normal LLM workflows
- compares findings across papers and large datasets instead of just summarizing them
- helps validate or falsify hypotheses
- supports iterative experiment planning and research loops
- stores research contexts in UltraContext
- makes research outputs available to the entire team in real time through MCP

## Core thesis

If you want to make scientists dramatically more productive, you need a system that can:

1. ingest large amounts of scientific context
2. compare evidence across many sources
3. preserve research state over time
4. make that state accessible to the entire team immediately

Self Research is that system: an AI research agent with massive effective context and shared team memory.

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
