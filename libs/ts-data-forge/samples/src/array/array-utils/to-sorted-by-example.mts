// Example: src/array/array-utils.mts (toSortedBy)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const projects = [
  { name: 'compiler', issues: 7 },
  { name: 'docs', issues: 2 },
  { name: 'ui', issues: 5 },
] as const;

const byIssueCount = Arr.toSortedBy(projects, (project) => project.issues);
const byIssueCountDescending = Arr.toSortedBy(
  projects,
  (project) => project.issues,
  (left, right) => right - left,
);

const expectedByIssues = [
  { name: 'docs', issues: 2 },
  { name: 'ui', issues: 5 },
  { name: 'compiler', issues: 7 },
] as const;

const expectedByIssueCountDescending = [
  { name: 'compiler', issues: 7 },
  { name: 'ui', issues: 5 },
  { name: 'docs', issues: 2 },
] as const;

assert.deepStrictEqual(byIssueCount, expectedByIssues);
assert.deepStrictEqual(byIssueCountDescending, expectedByIssueCountDescending);
