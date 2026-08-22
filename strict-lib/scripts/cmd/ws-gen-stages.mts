#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const parsedConcurrency = Number(process.env['WS_GEN_CONCURRENCY']);

const concurrency =
  Number.isSafeInteger(parsedConcurrency) && parsedConcurrency > 0
    ? parsedConcurrency
    : 3;

await runCmdInStagesAcrossWorkspaces({
  cmd: 'gen',
  concurrency,
  rootPackageJsonDir: projectRootPath,
});
