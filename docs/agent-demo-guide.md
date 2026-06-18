# Agent Jira-to-GitHub Demo Guide

This repository demonstrates a controlled agent workflow for taking a Jira
ticket, planning the implementation, making code changes, validating them, and
preparing a GitHub pull request.

The main idea: the agent is allowed to help, but publishing steps stay explicit
and human-approved.

## Demo Flow

1. Run `npm run agent:plan -- JIRA-123`.
2. Codex uses Jira MCP to fetch the ticket and writes `agent-plan-JIRA-123.md`.
3. Review the generated plan.
4. Run `npm run agent:implement -- JIRA-123`.
5. Codex re-reads the Jira ticket, follows the saved plan, edits code, and runs
   available checks.
6. Review `git diff`.
7. Run `npm run agent:publish -- JIRA-123`.
8. The script asks for typed approval, runs checks, commits, and pushes.
9. In GitHub Actions, manually run `Create pull request`.
10. PR workflows run CI, optional AI PR review, and optional CI failure review.

## What MCP Means Here

MCP stands for Model Context Protocol. In this demo, it is how Codex gets access
to external work systems, especially Jira.

Without MCP, the agent only knows what is in the local repo and the prompt. With
Jira MCP, the agent can read the ticket, description, acceptance criteria,
status, and available transitions through a controlled tool interface.

Important points for questions:

- MCP is not magic project knowledge. It is a tool connection.
- The agent still needs explicit instructions about what to do with the data.
- The local scripts use prompts that tell Codex when it may read Jira, when it
  may edit files, and when it must stop.
- The implementation script may move a Jira ticket to In Progress if that
  transition is available, but it must not move the ticket to Done or Review.

## What Skills Are

Skills are local instruction packs for Codex. In this repo they live under
`.agents/skills/`.

A skill does not run by itself. It is guidance the agent loads when the user or a
workflow asks for a matching task.

This repo has two local skills:

- `.agents/skills/jira-to-github-task/SKILL.md`
  Explains the safe Jira implementation workflow: fetch ticket, extract
  acceptance criteria, plan, implement only the required scope, run checks, and
  wait for human approval before publishing.
- `.agents/skills/github-actions-review/SKILL.md`
  Explains how to summarize failed GitHub Actions runs in a short engineering
  update.

Good demo sentence:

> MCP gives the agent controlled access to external systems; skills tell the
> agent how to behave for a specific kind of work.

## Local Scripts

The scripts are the local command-line workflow around Codex.

### `scripts/agent-plan.mjs`

This is the read-only planning step.

It asks Codex to use Jira MCP to fetch the ticket and produce:

- ticket title
- description
- acceptance criteria
- implementation plan

The prompt explicitly says not to modify files, commit, push, or create a PR.
The output is saved as `agent-plan-<ticket>.md`.

### `scripts/agent-implement.mjs`

This is the implementation step.

It loads the saved plan, asks Codex to fetch the Jira ticket again, and tells it
to implement the approved plan. It may transition the Jira ticket to In Progress
when that transition is available.

It still forbids commits, pushes, and PR creation. At the end it prints changed
files and a diff summary so the human can review the result.

### `scripts/agent-publish.mjs`

This is the guarded publishing step.

It checks that:

- a Jira key was provided
- the current branch is not `main` or `develop`
- the branch name contains the Jira key
- there are local changes to publish

Then it asks the user to type the Jira key before running lint, typecheck,
tests, and build. Only after those checks pass does it stage, commit, and push.

### `scripts/create-pr.mjs`

This is used by the `Create pull request` GitHub Actions workflow.

It validates the Jira key, branch names, branch existence, existing PRs, and
whether the feature branch has changes against the base branch. Then it creates a
PR.

If `OPENAI_API_KEY` is configured, it asks OpenAI to generate a clearer PR title
and body from the branch diff. If not, it uses deterministic fallback content.

### `scripts/ai-pr-review.mjs`

This is used by the `AI PR Review` workflow.

It gets the frontend diff and asks OpenAI for a practical review focused on
bugs, TypeScript, React, architecture, tests, performance, and maintainability.
The workflow posts the result as a PR comment.

## GitHub Actions Workflows

### `.github/workflows/ci.yml`

Runs the normal validation gate:

- install dependencies
- lint check
- typecheck
- build
- test

This runs on pull requests and pushes to `develop` or `main`.

### `.github/workflows/create-pr.yml`

This is manually triggered after a reviewed branch has been pushed to GitHub.
For the demo, `agent-publish` is the recommended way to push because it runs
checks and asks for typed approval first. Technically, the workflow can also be
run after a manual `git push` if the branch exists on GitHub and the workflow
inputs are valid.

It imports `scripts/create-pr.mjs`, validates the inputs, and creates the pull
request. Keeping the logic in `scripts/create-pr.mjs` makes the workflow easier
to read and the code easier to explain.

### `.github/workflows/ai-pr-review.yml`

Runs when a PR is opened or marked ready for review, only for frontend-relevant
paths. If `OPENAI_API_KEY` exists, it runs `scripts/ai-pr-review.mjs` and posts
the generated review as a PR comment.

### `.github/workflows/ci-failure-review.yml`

Runs after the `CI` workflow completes. It only continues when CI failed.

It uses `openai/codex-action` with the `github-actions-review` skill to produce
a short failure analysis, finds the related open PR, and comments with the
summary.

## Safety Model

The workflow separates risk into stages:

- Planning is read-only.
- Implementation can edit code but cannot publish.
- Publishing requires typed human approval.
- PR creation is manual in GitHub Actions.
- CI and review automation comment on PRs instead of merging anything.

This is useful to emphasize in the demo: the agent is not given one giant
"do everything" command. Each step has a smaller permission boundary.
