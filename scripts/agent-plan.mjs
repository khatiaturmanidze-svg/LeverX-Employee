import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const ticketKey = process.argv[2];

if (!ticketKey) {
  console.error(`Usage: npm run agent:plan ${ticketKey}`);
  process.exit(1);
}

const prompt = `
Use Atlassian/Jira MCP to fetch Jira ticket ${ticketKey}.

First summarize:
1. Ticket title
2. Description
3. Acceptance criteria

Then create an implementation plan.

Rules:
- Do not modify files.
- Do not run code changes.
- Do not commit.
- Do not push.
- Do not create a PR.
- Stop after the plan.
`;

console.log(`Planning implementation for ${ticketKey}...`);

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
const planPath = `agent-plan-${ticketKey}.md`;

fs.writeFileSync(planPath, result.stdout);

console.log('\nStep 3: Plan saved');
console.log(`✓ Saved to ${planPath}`);
