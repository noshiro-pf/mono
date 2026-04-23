import { runCmdInParallelAcrossWorkspaces } from 'ts-repo-utils';

// Run tests in parallel across all packages
await runCmdInParallelAcrossWorkspaces({
  rootPackageJsonDir: '../',
  cmd: 'test',
  concurrency: 5,
  filterWorkspacePattern: (name) => !name.includes('experimental'),
});
