#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await runCmdInStagesAcrossWorkspaces({
  cmd: 'build',
  rootPackageJsonDir: projectRootPath,
  // A package only has to wait for what it actually needs built: the packages
  // whose types its published sources import. devDependencies point at the
  // toolchain, which depends back on the packages it serves, so including them
  // would leave no valid order. See docs/package-dependencies.md.
  dependencyFields: ['dependencies', 'peerDependencies'],
});
