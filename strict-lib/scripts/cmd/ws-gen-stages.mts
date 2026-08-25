#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { workspaceRootPath } from '../project-root-path.mjs';

const parsedConcurrency = Number(process.env['WS_GEN_CONCURRENCY']);

const concurrency =
  Number.isSafeInteger(parsedConcurrency) && parsedConcurrency > 0
    ? parsedConcurrency
    : 3;

await runCmdInStagesAcrossWorkspaces({
  cmd: 'gen',
  concurrency,
  rootPackageJsonDir: workspaceRootPath,
  // Same reason as `ws:build`: the workspace's devDependencies are cyclic
  // (the toolchain packages depend on each other), so ordering by them leaves
  // no valid stage order at all. What matters here is only that
  // `strict-ts-lib-scripts-common` is built before the harnesses that import
  // it, and that is a `dependencies` edge.
  dependencyFields: ['dependencies', 'peerDependencies'],
});
