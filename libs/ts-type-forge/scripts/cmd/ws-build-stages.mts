#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { repositoryRootPath } from '../repository-root-path.mjs';

await runCmdInStagesAcrossWorkspaces({
  cmd: 'build',
  rootPackageJsonDir: repositoryRootPath,
});
