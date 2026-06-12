import fs from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';

const ticketKey = process.argv[2];

if (!ticketKey) {
  console.error('Usage: npm run agent:pr -- IEMEREDU44-8');
  process.exit(1);
}

function run(command) {
  return execSync(command, {
    encoding: 'utf-8',
    shell: 'powershell.exe',
  }).trim();
}

function runVisible(command) {
  console.log(`\n> ${command}`);
  execSync(command, {
    stdio: 'inherit',
    shell: 'powershell.exe',
  });
}

function extractSection(text, label) {
  const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i');
  return text.match(regex)?.[1]?.trim();
}

console.log(`Creating PR for ${ticketKey}...`);

const branch = run('git branch --show-current');

if (!branch) {
  console.error('Could not detect current branch.');
  process.exit(1);
}

console.log(`Current branch: ${branch}`);

const status = run('git status --short');

if (!status) {
  console.error('No changes found. Nothing to commit or create PR for.');
  process.exit(1);
}

const diffStat = run('git diff --stat');

console.log('\nChanged files:');
console.log(status);

console.log('\nGenerating PR title and description with Codex...');

const prPrompt = `
Use Atlassian/Jira MCP to fetch Jira ticket ${ticketKey}.

Generate a GitHub pull request title and description for the current branch.

Context:
- Current branch: ${branch}
- Changed files:
${status}

- Diff summary:
${diffStat}

Requirements:
- PR title must include the Jira ticket key.
- PR body must be based on the Jira ticket and actual changed files.
- Do not invent checks that were not run.
- If checks were only expected to run in GitHub Actions, say that.
- Keep it professional and concise.

Return only this exact format:

TITLE:
<PR title>

BODY:
## Summary
<summary>

## Changes
- <change>
- <change>

## Checks
- <checks run or expected>

## Jira
${ticketKey}
`;

const prResult = spawnSync('codex', ['exec', '-'], {
  input: prPrompt,
  encoding: 'utf-8',
  shell: true,
});

if (prResult.error) {
  console.error('Failed to run Codex:', prResult.error.message);
  process.exit(1);
}

if (prResult.status !== 0) {
  console.error('Codex PR description generation failed.');
  console.error(prResult.stderr || prResult.stdout);
  process.exit(prResult.status ?? 1);
}

const generated = prResult.stdout;

const prTitle = extractSection(generated, 'TITLE');
const prBody = extractSection(generated, 'BODY');

if (!prTitle || !prBody) {
  console.error('Could not parse PR title/body from Codex output.');
  console.log(generated);
  process.exit(1);
}

const prBodyPath = `agent-pr-body-${ticketKey}.md`;
fs.writeFileSync(prBodyPath, prBody);

console.log('\nGenerated PR title:');
console.log(prTitle);

console.log(`\nGenerated PR body saved to ${prBodyPath}`);

const commitMessage = `${ticketKey} ${prTitle.replace(`${ticketKey}:`, '').trim()}`;

runVisible('git add .');
runVisible(`git commit -m "${commitMessage}"`);
runVisible(`git push -u origin ${branch}`);

runVisible(
  `gh pr create --base develop --head ${branch} --title "${prTitle}" --body-file "${prBodyPath}"`,
);

console.log('\nPR creation completed.');
