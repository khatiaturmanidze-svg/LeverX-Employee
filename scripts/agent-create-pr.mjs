import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';

const ticketKey = process.argv[2]?.toUpperCase();
const baseBranch = process.env.GITHUB_BASE_REF || 'develop';
const baseRef = `origin/${baseBranch}`;
const protectedBranches = new Set(['main', 'develop']);

if (!ticketKey) {
  console.error('Usage: npm run agent:create-pr -- IEMEREDU44-8');
  process.exit(1);
}

if (!/^[A-Z][A-Z0-9]+-\d+$/.test(ticketKey)) {
  console.error(`Invalid Jira ticket key: ${ticketKey}`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  if (result.error) {
    console.error(`Failed to run ${command}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

function runInteractiveCodex(prompt) {
  let command = 'codex';
  let args = ['--no-alt-screen', prompt];

  if (process.platform === 'win32') {
    const codexCommand = run('where.exe', ['codex.cmd']).split(/\r?\n/)[0];
    const codexEntry = path.join(
      path.dirname(codexCommand),
      'node_modules',
      '@openai',
      'codex',
      'bin',
      'codex.js',
    );

    command = process.execPath;
    args = [codexEntry, '--no-alt-screen', prompt];
  }

  const result = spawnSync(command, args, {
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(
      `Failed to launch interactive Codex: ${result.error.message}`,
    );
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const branch = run('git', ['branch', '--show-current']);

if (!branch) {
  console.error('Could not detect the current branch.');
  process.exit(1);
}

if (protectedBranches.has(branch)) {
  console.error(`Refusing to create a PR from protected branch "${branch}".`);
  process.exit(1);
}

if (!branch.toUpperCase().includes(ticketKey)) {
  console.error(
    `Current branch "${branch}" does not include Jira key ${ticketKey}.`,
  );
  process.exit(1);
}

const upstream = run('git', [
  'rev-parse',
  '--abbrev-ref',
  '--symbolic-full-name',
  '@{upstream}',
]);
const localCommit = run('git', ['rev-parse', 'HEAD']);
const remoteCommit = run('git', ['rev-parse', upstream]);

if (localCommit !== remoteCommit) {
  console.error(
    `Local branch and ${upstream} differ. Push the approved commit before creating the PR.`,
  );
  process.exit(1);
}

const commitMessage = run('git', ['log', '-1', '--pretty=%s']);
const changedFiles = run('git', ['diff', '--name-only', `${baseRef}...HEAD`]);
const diffStat = run('git', ['diff', '--stat', `${baseRef}...HEAD`]);

if (!changedFiles) {
  console.error(`No changes found between ${baseBranch} and ${branch}.`);
  process.exit(1);
}

console.log(`\nTicket: ${ticketKey}`);
console.log(`Base branch: ${baseBranch}`);
console.log(`Head branch: ${branch}`);
console.log(`Commit: ${localCommit}`);
console.log('\nChanges included in the pull request:');
console.log(diffStat);

if (!process.stdin.isTTY) {
  console.error('Interactive approval requires a terminal.');
  process.exit(1);
}

const approvalPrompt = createInterface({
  input: process.stdin,
  output: process.stdout,
});
const approval = await approvalPrompt.question(
  `\nType CREATE PR to approve Jira/GitHub MCP pull request creation: `,
);
approvalPrompt.close();

if (approval.trim().toUpperCase() !== 'CREATE PR') {
  console.error('PR creation was not approved.');
  process.exit(1);
}

const prPrompt = `
Use Atlassian/Jira MCP and GitHub MCP.

Create a pull request for the already-pushed branch "${branch}" based on Jira
ticket ${ticketKey}.

Context:
- Base branch: ${baseBranch}
- Head branch: ${branch}
- Commit: ${localCommit}
- Commit message: ${commitMessage}
- Changed files:
${changedFiles}
- Checks completed before the branch was pushed:
  - npm run lint:check
  - npm run typecheck
  - npm run test
  - npm run build

Workflow:
1. Fetch Jira ticket ${ticketKey}.
2. Inspect the pushed branch and commit.
3. Generate a concise PR title and description from the Jira ticket and actual
   branch changes.
4. Create one pull request from "${branch}" into "${baseBranch}".

Rules:
- Do not modify files.
- Do not create commits.
- Do not push.
- Do not use GitHub CLI.
- Do not merge or approve the pull request.
- Do not trigger or rerun workflows.
- The PR title must include ${ticketKey}.
- The PR description must include:
  - Jira ticket key and summary
  - implementation summary
  - changed files
  - checks completed
- If a pull request already exists for this branch, report its URL instead of
  creating a duplicate.
`;

console.log(
  '\nLaunching interactive Codex. Approve the GitHub MCP create-PR action when prompted.',
);
runInteractiveCodex(prPrompt);

console.log('\nInteractive PR session finished.');
