---
sidebar_position: 5
---

# Working with AI agents

This repo is set up for [Matt Pocock's engineering skills](https://github.com/mattpocock/skills),
a set of instructions that coding agents (Claude Code, opencode, and others) follow when they
plan, build, and review changes. If you use an agent on this repo, this page explains what it
reads and why.

## What's configured

| File | What it tells the agent |
|---|---|
| [`AGENTS.md`](https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer/blob/main/AGENTS.md) | Where to find everything below. Most agents read this file automatically. |
| [`docs/agents/issue-tracker.md`](https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer/blob/main/docs/agents/issue-tracker.md) | Work is tracked as GitHub Issues. Because issues are public, the agent drafts each issue, comment, label change, and close, and a person approves it first. It reuses the repo's existing labels. |
| [`docs/agents/domain.md`](https://github.com/CA-Visualizer-for-Education/Clean-Architecture-Visualizer/blob/main/docs/agents/domain.md) | Project vocabulary lives in `GLOSSARY.md` at the repo root; design decisions are recorded as ADRs (architecture decision records) in `docs/developers/adr/`, which also appear on this site. |

## The order we use

1. **`grill-with-docs`**: the agent interviews you until you agree on the design, recording terms
   in the glossary and decisions as ADRs.
2. **`to-spec`**: the agent writes a spec from that shared understanding, with no new interview.
3. **`to-tickets`**: the agent breaks the spec into small end-to-end tickets ("tracer bullets"),
   each listing what blocks it, as GitHub Issues.
4. **`implement`**: one ticket at a time, test first.
5. **`code-review`**: a fresh agent checks the change against the spec and the repo's coding
   standards.
6. **`retro`**: what the review found becomes new rules and checks, so the next change starts
   better.

Each step is a software engineering skill you're learning in CSC207: requirements,
specification, decomposition, testing, and code review. The better you are at each one, the
better the instructions and checks you give the agent.

## Changing the setup

Edit the files in `docs/agents/` directly. Re-running the setup skill
(`setup-matt-pocock-skills`) is only needed to switch to a different issue tracker.
