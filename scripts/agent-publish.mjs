import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const ticketKey = process.argv[2]?.trim().toUpperCase();
const protectedBranches = new Set(['main', 'develop']);

if (!ticketKey) {
  console.error(`Usage: npm run agent:publish -- ${ticketKey}`);
  process.exit(1);
}

if (!/^[A-Z][A-Z0-9]*-\d+$/.test(ticketKey)) {
  console.error(`Invalid Jira ticket key: ${ticketKey}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const { capture = false, ...spawnOptions } = options;
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: capture ? 'pipe' : 'inherit',
    ...spawnOptions,
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (capture) {
      console.error(result.stderr || result.stdout);
    }
    process.exit(result.status ?? 1);
  }

  return capture ? result.stdout.trim() : '';
}

function section(message) {
  console.log(`\n${message}`);
}

function runNpm(args) {
  if (process.env.npm_execpath) {
    run(process.execPath, [process.env.npm_execpath, ...args]);
    return;
  }

  run('npm', args, { shell: process.platform === 'win32' });
}

section(`Preparing approved changes for ${ticketKey}`);

const branch = run('git', ['branch', '--show-current'], { capture: true });

if (!branch) {
  console.error('Could not detect the current branch.');
  process.exit(1);
}

if (protectedBranches.has(branch)) {
  console.error(
    `Refusing to publish directly from protected branch "${branch}".`,
  );
  process.exit(1);
}

if (!branch.toUpperCase().includes(ticketKey)) {
  console.error(
    `Current branch "${branch}" does not include Jira key ${ticketKey}.`,
  );
  process.exit(1);
}

const status = run('git', ['status', '--short'], { capture: true });

if (!status) {
  console.error('No local changes found. Nothing to publish.');
  process.exit(1);
}

console.log(`Branch: ${branch}`);
console.log('\nChanges proposed for commit:');
console.log(status);

const diffStat = run('git', ['diff', '--stat', 'HEAD'], { capture: true });
if (diffStat) {
  console.log('\nDiff summary:');
  console.log(diffStat);
}

if (!process.stdin.isTTY) {
  console.error('Interactive approval requires a terminal.');
  process.exit(1);
}

const prompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const approval = await prompt.question(
  `\nType ${ticketKey} to approve checks, commit, and push: `,
);
prompt.close();

if (approval.trim().toUpperCase() !== ticketKey) {
  console.error('Approval did not match the Jira key. Nothing was published.');
  process.exit(1);
}

const checks = [
  ['lint', ['run', 'lint:check']],
  ['typecheck', ['run', 'typecheck']],
  ['tests', ['run', 'test']],
  ['build', ['run', 'build']],
];

for (const [name, args] of checks) {
  section(`Running ${name}`);
  runNpm(args);
}

section('Staging approved changes');
run('git', ['add', '-A']);

const staged = run('git', ['diff', '--cached', '--name-only'], {
  capture: true,
});

if (!staged) {
  console.error('No staged changes remain after checks. Nothing to commit.');
  process.exit(1);
}

console.log(staged);

const commitMessage = `${ticketKey}: implement approved task`;

section(`Creating commit: ${commitMessage}`);
run('git', ['commit', '-m', commitMessage]);

section(`Pushing ${branch} to origin`);
run('git', ['push', '--set-upstream', 'origin', branch]);

console.log('\nCommit and push completed.');
console.log('To create the pull request:');
console.log('1. Open GitHub Actions.');
console.log('2. Select "Create pull request".');
console.log('3. Run the workflow with:');
console.log(`   head_branch: ${branch}`);
console.log(`   jira_key: ${ticketKey}`);
console.log('   task_summary: <Jira ticket title>');
console.log('   base_branch: develop');
