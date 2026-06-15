import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const ticketKey = process.argv[2];

if (!ticketKey) {
  console.error(`Usage: npm run agent:implement -- ${ticketKey}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf-8',
    shell: true,
    ...options,
  });
}
function step(number, message) {
  console.log(`\nStep ${number}: ${message}`);
}

function done(message) {
  console.log(`✓ ${message}`);
}

const planPath = `agent-plan-${ticketKey}.md`;

step(`1, Loading saved implementation plan for ${ticketKey}...`);

if (!fs.existsSync(planPath)) {
  console.error(`Plan file not found: ${planPath}`);
  console.error(`Run: npm run agent:plan -- ${ticketKey}`);
  process.exit(1);
}

const plan = fs.readFileSync(planPath, 'utf-8');
done(`Loaded plan from ${planPath}`);

step(2, 'Preparing implementation prompt...');

const prompt = `
Use Atlassian/Jira MCP to fetch Jira ticket ${ticketKey}.

Use this approved implementation plan:

${plan}

Implement the Jira ticket in this repository.

Workflow:

If the ticket is currently in To Do and an "In Progress" transition is available, transition it to In Progress.
Implement the approved plan.
Make only the code changes required by the ticket.
Run relevant checks available in package.json, such as lint, test, typecheck, and build.
At the end, summarize:
whether Jira was moved to In Progress
what files changed
what implementation steps were completed
what checks were run

Rules:

Do not commit.
Do not push.
Do not create a PR.
Do not modify unrelated files.
Follow existing project patterns and styling.
If a check cannot be run or does not exist, say so clearly.
Do not move the Jira ticket to Done, Closed, Review, or any other status.
`;

done('Implementation prompt prepared');

step(3, 'Running Codex implementation agent...');
console.log('This may take a few minutes.');

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

done('Codex implementation finished');

step(4, 'Agent implementation summary');
console.log(result.stdout);

step(5, 'Collecting changed files...');

const status = run('git', ['status', '--short']);

if (status.status !== 0) {
  console.error('Failed to get git status.');
  console.error(status.stderr || status.stdout);
  process.exit(status.status ?? 1);
}

console.log(status.stdout || 'No changed files.');
done('Changed files collected');

step(6, 'Generating diff summary...');

const diffStat = run('git', ['diff', '--stat']);

if (diffStat.status !== 0) {
  console.error('Failed to get git diff summary.');
  console.error(diffStat.stderr || diffStat.stdout);
  process.exit(diffStat.status ?? 1);
}

console.log(diffStat.stdout || 'No diff found.');
done('Diff summary generated');

step(7, 'Manual review required');

console.log('\nReview full diff:');
console.log('git diff');

console.log('\nIf the implementation is approved, run:');
console.log(`npm run agent:publish -- ${ticketKey}`);
console.log('\nAfter the commit is pushed and reviewed, run:');
console.log(`npm run agent:create-pr -- ${ticketKey}`);

console.log('\nIf you need to revert only implementation changes:');
console.log('1. Run: git status --short');
console.log('2. Identify only the files changed by the implementation agent');
console.log('3. Revert selected tracked files with:');
console.log(' git restore path/to/file');
console.log('4. Remove selected new files with:');
console.log(' Remove-Item path/to/file');

console.log(
  '\nAvoid using git restore . unless you want to revert all uncommitted changes.',
);

done(`Implementation pipeline completed for ${ticketKey}`);
