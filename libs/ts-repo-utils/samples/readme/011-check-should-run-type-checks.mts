import { checkShouldRunTypeChecks } from 'ts-repo-utils';

// Use default settings (compare against origin/main)
const shouldRun = await checkShouldRunTypeChecks();

if (shouldRun) {
  await $('npm run type-check');
}

// Custom ignore patterns and base branch
const shouldRun2 = await checkShouldRunTypeChecks({
  pathsIgnore: ['.eslintrc.json', 'docs/', '**.md', 'scripts/'],
  baseBranch: 'origin/develop',
});

// embed-sample-code-ignore-below
export { shouldRun2 };
