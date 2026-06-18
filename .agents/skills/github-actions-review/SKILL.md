---
name: github-actions-review
description: Use this skill when reviewing GitHub Actions workflow runs, CI failures, failed builds, test failures, deployment failures, or CI/CD status. Do not use it for unrelated GitHub questions.
---

# GitHub Actions Review Skill

## Goal

Turn GitHub Actions workflow/run data into a short engineering update.

## Explanation

This skill is used after CI fails. The GitHub Actions workflow gives Codex the
failed run metadata, and the skill tells codex to respond like an engineering
what failed, what is probably wrong, which branch or PR is affected,
and what to do next.

The skill is intentionally read-only for demos. It should explain the failure,
not rerun jobs or change code unless someone explicitly asks for that.

## Always produce this format

1. Summary
2. Failed or cancelled workflows
3. Likely cause
4. Affected branch, commit, or PR
5. Suggested next actions

## Review rules

- Keep the update short and practical.
- Highlight failed, cancelled, or timed-out workflow runs.
- Mention the workflow name, branch, commit, PR, actor, and timestamp if available.
- If logs are available, summarize the failing step.
- If logs are not available, say that the cause is uncertain.
- Do not trigger, cancel, rerun, approve, merge, or modify anything unless explicitly asked.
- For demos, prefer read-only analysis.
- Do not pretend you saw logs if only workflow status was available.

## Tone

Use a clear engineering update style.
Avoid overexplaining basic GitHub Actions concepts.
