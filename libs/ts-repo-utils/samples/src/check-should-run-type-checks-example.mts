// Example: src/functions/should-run.mts (checkShouldRunTypeChecks)
import { checkShouldRunTypeChecks } from 'ts-repo-utils';

// embed-sample-code-ignore-above
// Use the defaults: compare against origin/main, ignore docs/md/txt files
await checkShouldRunTypeChecks();

// Custom ignore patterns
await checkShouldRunTypeChecks({
  pathsIgnore: ['.eslintrc.json', 'docs/', '**.md', 'scripts/'],
});

// Custom base branch
await checkShouldRunTypeChecks({
  baseBranch: 'origin/develop',
});
// embed-sample-code-ignore-below
