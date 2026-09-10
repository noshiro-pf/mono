// Example: src/functions/should-run.mts (checkShouldRun)
import { checkShouldRun } from 'ts-repo-utils';

// embed-sample-code-ignore-above
// Skip when the diff only touches a directory nothing checks
await checkShouldRun({ pathsIgnore: ['experimental/'] });

// Custom base branch
await checkShouldRun({
  pathsIgnore: ['docs/', '**.md'],
  baseBranch: 'origin/develop',
});
// embed-sample-code-ignore-below
