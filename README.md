# Self Research

Self Research is an AI research agent built to make scientists 10x more productive through Recursive Language Models and real-time context sharing.

## Problem

The biggest bottleneck in research is comparison at scale.

Scientists need to compare experimental results against massive volumes of papers, notes, datasets, and multimodal evidence. That information is fragmented, inconsistent, and often conflicting.

Standard LLMs fail here. Once comparison requires too much context, the model drops details, reliability collapses, and the cost of context becomes the bottleneck.

## Solution

Self Research uses Recursive Language Models to process huge amounts of scientific data through recursive decomposition, comparison, and aggregation.

This gives the system an effective context window of roughly 30 million tokens and makes large-scale research comparison practical.

Research outputs are then persisted into UltraContext and exposed in real time through MCP, so the entire team can inspect and reuse the work with AI agents.

## How it works

1. It uses Recursive Language Models to research across massive datasets, papers, and experimental evidence.
2. It shares the outputs through a real-time context sharing layer built on UltraContext.
3. It makes that research accessible to other researchers through an MCP server.

## What it does

- compares large bodies of papers, results, and scientific evidence
- helps falsify or validate hypotheses
- supports iterative experiment planning
- persists research state in UltraContext
- makes research available to the full team through MCP

## Current templates

- Falsiability
- Hypothesis Verification
- Self-Experimentation

## Local development

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

Optional:

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
