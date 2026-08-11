#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

await runCmdInStagesAcrossWorkspaces({
  cmd: 'build',
  rootPackageJsonDir: projectRootPath,
});
