---
name: jira-to-github-task
description: Use this skill when implementing a Jira ticket in the current repository and preparing a GitHub pull request.
---

# Jira to GitHub Task Skill

## Goal

Implement a small Jira task in the current repository safely and prepare a GitHub pull request.

## Workflow

1. Fetch and summarize the Jira ticket.
2. Extract acceptance criteria.
3. Create an implementation plan.
4. Implement only the required changes.
5. Run relevant checks: lint, tests, typecheck, and build if available.
6. Summarize changed files.
7. Wait for manual approval before commit, push, or PR creation.
8. After approval, commit, push, and create a PR with a Jira-based summary.

## Rules

- Use Jira MCP to read the ticket.
- Use GitHub tools only when needed for PR creation.
- Do not modify unrelated files.
- Do not commit or push during planning or implementation.
- Do not create a PR before manual approval.
- Do not merge or approve PRs.
- If tests/checks are unavailable, say so clearly.
- Follow existing project conventions.
