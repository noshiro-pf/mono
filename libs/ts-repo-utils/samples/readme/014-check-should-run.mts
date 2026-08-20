import { $, checkShouldRun, checkShouldRunTypeChecks } from 'ts-repo-utils';

// Gate any step on the paths it cares about
const shouldRunStyleChecks = await checkShouldRun({
  pathsIgnore: ['experimental/'],
});

if (shouldRunStyleChecks) {
  await $('npm run fmt:check');
}

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
