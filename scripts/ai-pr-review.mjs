import OpenAI from 'openai';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const FRONTEND_PATH = 'apps/frontend';
const BASE_BRANCH = process.env.GITHUB_BASE_REF || 'develop';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is missing.');
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(`Reviewing changes against base branch: ${BASE_BRANCH}`);

let diff = '';

try {
  // Keep the model focused on reviewer-relevant frontend changes instead of
  // sending the whole repository.
  diff = execSync(`git diff origin/${BASE_BRANCH}...HEAD -- ${FRONTEND_PATH}`, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 10,
  });
} catch (error) {
  console.error('Failed to get git diff.');
  console.error(error.message);
  process.exit(1);
}

if (!diff.trim()) {
  console.log('No frontend changes found.');
  fs.writeFileSync(
    'ai-review.md',
    'No frontend changes were detected, so AI review was skipped.',
  );
  process.exit(0);
}

// The model acts as a reviewer here. It produces a Markdown review that the
// workflow posts as a PR comment for humans to inspect.
const prompt = `
You are a senior frontend code reviewer.

Project context:
- Monorepo structure
- Frontend app is inside apps/frontend
- Stack: React, TypeScript, Vite, Vitest
- Architecture: Feature-Sliced Design
- The goal is to review frontend PR changes before human review

Review the following pull request diff.

Focus on:
- possible bugs
- TypeScript issues
- React issues
- bad naming
- unnecessary complexity
- missing tests
- weak tests
- Feature-Sliced Design violations
- risky imports between layers
- performance concerns
- readability
- maintainability

Do NOT be overly dramatic.
Do NOT comment on things that are fine.
Do NOT invent problems.
If the diff looks good, say so.

Return the review in this format:

## Summary
Briefly explain what changed.

## Important Issues
List only important problems. If none, say "No major issues found."

## Suggestions
Give practical improvement suggestions.

## Test Suggestions
Mention what should be tested.

## Risk Level
Low / Medium / High, with one sentence explaining why.

PR diff:
${diff}
`;

let review = '';

try {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    input: prompt,
  });

  review = response.output_text;
} catch (error) {
  console.error('OpenAI request failed.');
  console.error(error.message);
  process.exit(1);
}

fs.writeFileSync('ai-review.md', review);

console.log('AI review created successfully.');
