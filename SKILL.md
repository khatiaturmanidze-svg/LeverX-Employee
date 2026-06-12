# GitHub Actions Review Skill

Use this skill when reviewing GitHub Actions workflow runs, CI failures, pull requests, or repository automation.

## Goal

Turn GitHub workflow/run data into a short engineering update.

## Output format

Always respond with:

1. Summary
2. Failed workflows
3. Likely cause
4. Affected branch or PR
5. Suggested next actions
6. Draft message to team lead

## Rules

- Keep the explanation short.
- Highlight failed or cancelled runs.
- Mention the branch, commit, PR, or actor if available.
- Do not trigger, cancel, rerun, or modify workflows unless explicitly asked.
- Prefer read-only analysis for the demo.