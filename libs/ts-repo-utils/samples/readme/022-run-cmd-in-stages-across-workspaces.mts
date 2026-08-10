import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';

// Run build in dependency order
await runCmdInStagesAcrossWorkspaces({
  rootPackageJsonDir: '../',
  cmd: 'build',
  concurrency: 3,
  filterWorkspacePattern: (name) => !name.includes('experimental'),
});
