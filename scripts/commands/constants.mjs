export const utilsDirs = [
  'packages/eslint-configs',
  'packages/utils',
  'packages/apps/lambda-calculus-interpreter-core',
  'packages/apps/event-schedule-app-shared',
];

export const wsrunOptions = [
  '--exclude-missing',
  '--fast-exit',
  '--prefix ',
  '--serial',
  '--ifDependency',
  '--report',
].join(' ');
