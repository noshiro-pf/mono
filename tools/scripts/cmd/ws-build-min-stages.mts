#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Builds every package without type-checking it, to break the bootstrap cycle
 * on a clean checkout.
 *
 * `ws:build` type-checks each package as it builds, and a package's own
 * `eslint.config.mts` is part of what gets type-checked. Those configs import
 * the eslint plugins, and the plugins depend on the very package being built —
 * for example ts-type-forge's config pulls in eslint-plugin-ts-type-forge,
 * whose `ts-type-forge` dependency resolves back into the workspace. With no
 * `dist/` anywhere yet, that resolution has nothing to point at.
 *
 * Emitting `dist/` first without checks, then running the full `ws:build`,
 * gives every package something to resolve against.
 */
await runCmdInStagesAcrossWorkspaces({
  cmd: 'build:min',
  rootPackageJsonDir: projectRootPath,
  dependencyFields: ['dependencies', 'peerDependencies'],
});
