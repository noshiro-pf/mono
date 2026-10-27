#!/usr/bin/env tsx

import { runCmdInStagesAcrossWorkspaces } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';
import {
  findLinkedPackages,
  workspaceStartDirs,
} from './assert-deps-built.mjs';

// `ws:build` limited to the packages another member resolves through
// `node_modules` — the set `assert-deps-built.mts --workspace` checks, read off
// the same graph, so every check behind that guard can run afterwards. What
// nothing links to (the apps, a CLI run from its sources) is skipped; a check
// that reads a package's own `dist/` (`check:dist`, `doc`,
// `verify:npm-packages`) still needs `ws:build`.
const linkedNames = new Set(
  findLinkedPackages(projectRootPath, workspaceStartDirs(projectRootPath)).map(
    (p) => p.packageName,
  ),
);

await runCmdInStagesAcrossWorkspaces({
  cmd: 'build',
  rootPackageJsonDir: projectRootPath,
  // As in `ws-build-stages.mts`. The linked set is closed under these fields,
  // so every package's build order stays within it.
  dependencyFields: ['dependencies', 'peerDependencies'],
  filterWorkspacePattern: (packageName) => linkedNames.has(packageName),
});
