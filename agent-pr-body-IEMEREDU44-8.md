## Summary
Exclude Admin users from the employee table and display a clear empty state when no eligible employees remain.

## Changes
- Filter Admin users, preserve the table header, skip virtualized rendering when empty, and add matching styles and unit tests.
- Update the PR automation script and ignore its temporary files.

## Checks
- `git diff --check` passed; tests, lint, type checking, and build were not run locally and are expected to run in GitHub Actions.

## Jira
IEMEREDU44-8