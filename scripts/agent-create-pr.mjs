import { spawnSync } from 'node:child_process';

const ticketKey = process.argv[2]?.trim().toUpperCase();
const baseBranch = process.env.AGENT_PR_BASE_BRANCH?.trim() || 'develop';

if (!ticketKey) {
  console.error('Usage: npm run agent:create-pr -- IEMEREDU-123');
  process.exit(1);
}

if (!/^[A-Z][A-Z0-9]*-\d+$/.test(ticketKey)) {
  console.error(`Invalid Jira ticket key: ${ticketKey}`);
  process.exit(1);
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: capture ? 'pipe' : 'inherit',
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (capture) {
      console.error((result.stderr || result.stdout).trim());
    }
    process.exit(result.status ?? 1);
  }

  return capture ? result.stdout.trim() : '';
}

const branch = run('git', ['branch', '--show-current'], { capture: true });

if (!branch) {
  console.error('Could not detect the current branch.');
  process.exit(1);
}

if (!branch.toUpperCase().includes(ticketKey)) {
  console.error(
    `Current branch "${branch}" does not include Jira key ${ticketKey}.`,
  );
  process.exit(1);
}

if (branch === baseBranch) {
  console.error('Head and base branches must be different.');
  process.exit(1);
}

// PR creation is a separate, explicit step after agent:publish. Refuse to
// dispatch the workflow while the local branch contains commits not on origin.
const upstream = run(
  'git',
  ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'],
  { capture: true },
);
const unpushedCommitCount = run(
  'git',
  ['rev-list', '--count', `${upstream}..HEAD`],
  { capture: true },
);

if (unpushedCommitCount !== '0') {
  console.error(
    `Current branch has ${unpushedCommitCount} unpushed commit(s). Run agent:publish first.`,
  );
  process.exit(1);
}

console.log(`Creating a pull request for ${ticketKey}`);
console.log(`Head: ${branch}`);
console.log(`Base: ${baseBranch}`);

// Verify credentials before dispatching so an expired gh token produces a
// direct, actionable error instead of a less obvious workflow failure.
run('gh', ['auth', 'status']);

run('gh', [
  'workflow',
  'run',
  'create-pr.yml',
  '--ref',
  branch,
  '-f',
  `head_branch=${branch}`,
  '-f',
  `jira_key=${ticketKey}`,
  '-f',
  `base_branch=${baseBranch}`,
]);

console.log('\nCreate pull request workflow dispatched.');
console.log('Track it with: gh run list --workflow=create-pr.yml --limit 1');
