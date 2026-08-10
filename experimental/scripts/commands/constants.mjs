export const utilsDirs = [
  'packages/eslint-configs',
  'packages/utils',
  'packages/apps/lambda-calculus-interpreter-core',
  'packages/apps/event-schedule-app-shared',
];

export const pnpmParallelOptions = [
  // Run packages independently of the dependency graph, capped concurrency.
  '--no-sort',
  '--workspace-concurrency=5',
].join(' ');

export const pnpmStagesOptions = [
  // pnpm orders recursive runs topologically by default.
  '--workspace-concurrency=5',
].join(' ');
