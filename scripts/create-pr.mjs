export default async function createPullRequest({ github, context, core }) {
  const { owner, repo } = context.repo;
  const head = process.env.HEAD_BRANCH.trim();
  const base = process.env.BASE_BRANCH.trim();
  const jiraKey = process.env.JIRA_KEY.trim().toUpperCase();
  const taskSummary = (process.env.TASK_SUMMARY || '')
    .trim()
    .replace(/\s+/g, ' ');
  const jiraKeyPattern = /^[A-Z][A-Z0-9]*-\d+$/;

  if (!jiraKeyPattern.test(jiraKey)) {
    core.setFailed(`Invalid Jira key: ${jiraKey}`);
    return;
  }

  if (!head.toUpperCase().includes(jiraKey)) {
    core.setFailed(`Head branch "${head}" must include Jira key ${jiraKey}.`);
    return;
  }

  if (head === base) {
    core.setFailed('Head and base branches must be different.');
    return;
  }

  for (const branch of [head, base]) {
    try {
      await github.rest.repos.getBranch({ owner, repo, branch });
    } catch {
      core.setFailed(`Branch "${branch}" does not exist.`);
      return;
    }
  }

  const existing = await github.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    head: `${owner}:${head}`,
    base,
  });

  if (existing.data.length > 0) {
    core.notice(`PR already exists: ${existing.data[0].html_url}`);
    return;
  }

  const comparison = await github.rest.repos.compareCommits({
    owner,
    repo,
    base,
    head,
  });

  if (comparison.data.ahead_by === 0) {
    core.setFailed(`Branch "${head}" has no changes against "${base}".`);
    return;
  }

  const files = comparison.data.files ?? [];
  const changedFiles = files
    .slice(0, 50)
    .map((file) => `- \`${file.filename}\` (${file.status})`);

  if (files.length > 50) {
    changedFiles.push(`- ...and ${files.length - 50} more files`);
  }

  const commits = comparison.data.commits.slice(-10).map((commit) => {
    const subject = commit.commit.message.split('\n')[0];
    return `- ${commit.sha.slice(0, 7)} ${subject}`;
  });

  const fallbackTitle = `${jiraKey}: ${
    taskSummary ||
    commits.at(-1)?.replace(/^- [a-f0-9]+ /, '') ||
    'Update implementation'
  }`;
  const fallbackBody = [
    '## Summary',
    taskSummary || 'Implementation changes generated from the branch diff.',
    '',
    '## Jira',
    jiraKey,
    '',
    '## Commits',
    ...commits,
    '',
    '## Changed files',
    ...changedFiles,
    '',
    '## Validation',
    '- Local review and approval completed before push.',
    '- CI, type checking, tests, build, and configured PR reviews run through GitHub Actions.',
  ].join('\n');

  async function generateAiPrContent() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      core.notice(
        'OPENAI_API_KEY is not configured. Using fallback PR description.',
      );
      return null;
    }

    const fileSummaries = files.slice(0, 25).map((file) => ({
      filename: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch?.slice(0, 6000) || '',
    }));

    const prompt = `
Write a clear GitHub pull request title and description for this Jira task.

Requirements:
- Return only valid JSON with "title" and "body" fields.
- The title must start with "${jiraKey}: ".
- The body must be Markdown.
- Explain what changed in useful reviewer language.
- Include concise sections for Summary, Implementation, Testing, and Jira.
- Mention the Jira key: ${jiraKey}.
- Do not invent tests or behavior that are not supported by the diff.
- Keep it practical and not salesy.

Optional task summary:
${taskSummary || '(not provided)'}

Recent commits:
${commits.join('\n') || '(none)'}

Changed files and patches:
${JSON.stringify(fileSummaries, null, 2)}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          input: prompt,
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        core.warning(`OpenAI PR description generation failed: ${errorText}`);
        return null;
      }

      const data = await response.json();
      const text =
        data.output_text ||
        data.output
          ?.flatMap((item) => item.content || [])
          .map((content) => content.text)
          .filter(Boolean)
          .join('\n');

      if (!text) {
        core.warning('OpenAI returned an empty PR description response.');
        return null;
      }

      const parsed = JSON.parse(
        text.replace(/^```json\s*|\s*```$/g, '').trim(),
      );

      if (!parsed.title || !parsed.body) {
        core.warning('OpenAI response did not include both title and body.');
        return null;
      }

      return {
        title: parsed.title.startsWith(`${jiraKey}: `)
          ? parsed.title
          : `${jiraKey}: ${parsed.title.replace(
              new RegExp(`^${jiraKey}:\\s*`, 'i'),
              '',
            )}`,
        body: parsed.body,
      };
    } catch (error) {
      core.warning(`OpenAI PR description generation failed: ${error.message}`);
      return null;
    }
  }

  const aiPrContent = await generateAiPrContent();
  const title = aiPrContent?.title || fallbackTitle;
  const body = aiPrContent?.body || fallbackBody;

  const pullRequest = await github.rest.pulls.create({
    owner,
    repo,
    head,
    base,
    title,
    body,
  });

  core.notice(`Created PR: ${pullRequest.data.html_url}`);
}
