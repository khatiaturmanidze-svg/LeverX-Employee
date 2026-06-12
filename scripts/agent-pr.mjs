import { spawnSync } from 'node:child_process';

const ticketKey = process.argv[2];

if (!ticketKey) {
  console.error('Usage: npm run agent:pr -- IEMEREDU44-8');
  process.exit(1);
}

const prompt = `
Use Atlassian/Jira MCP to fetch Jira ticket ${ticketKey}.

The local code changes have already been manually reviewed and approved.

Create a commit and pull request for the current branch.

Workflow:
1. Check git status.
2. Create a commit with a clear message that includes ${ticketKey}.
3. Push the current branch to origin.
4. Create a GitHub pull request.
5. The PR description should include:
   - Jira ticket key
   - Jira task summary
   - Implementation summary
   - Tests/checks run
   - Note that GitHub Actions are configured to run on the PR

Rules:
- Do not make additional code changes.
- Do not amend unrelated commits.
- Do not merge the PR.
- Do not approve the PR.
`;

console.log(`Commiting and creating PR for ${ticketKey}...`);

const result = spawnSync('codex', ['exec', '-'], {
  input: prompt,
  encoding: 'utf-8',
  shell: true,
});

if (result.error) {
  console.error('Failed to run Codex:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error('Codex failed.');
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

console.log('\nPlan created:\n');
console.log(result.stdout);
