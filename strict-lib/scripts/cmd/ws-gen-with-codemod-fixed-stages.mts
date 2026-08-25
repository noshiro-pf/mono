#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { workspaceRootPath } from '../project-root-path.mjs';

const parsedConcurrency = Number(process.env['WS_GEN_CONCURRENCY']);

const concurrency =
  Number.isSafeInteger(parsedConcurrency) && parsedConcurrency > 0
    ? parsedConcurrency
    : 1;

await runCmdInStagesAcrossWorkspaces({
  cmd: 'gen:with-codemod-fixed',
  concurrency,
  rootPackageJsonDir: workspaceRootPath,
  // Same reason as `ws:build`: the workspace's devDependencies are cyclic
  // (the toolchain packages depend on each other), so ordering by them leaves
  // no valid stage order at all.
  //
  // Nothing here needs ordering. The harnesses are independent of one another,
  // and `strict-ts-lib-scripts-common` — which they all import — has no
  // `scripts` block at all: it exports its `.mts` sources directly, so there
  // is nothing to build first and it never appears in a stage. Every harness
  // lands in stage one. This option is set only to keep the cyclic
  // devDependencies out of the graph.
  dependencyFields: ['dependencies', 'peerDependencies'],
});
