#!/usr/bin/env node
// Copied verbatim into every published bundle by `gen-packages.mts`, and run
// by consumers as `npx <package>-link`. Plain JavaScript with no dependencies,
// because it runs from inside `node_modules` in someone else's project.
//
// WHAT IT IS FOR
//
// TypeScript resolves a lib replacement in one of two ways, and which one
// depends on the version — they are exclusive, both measured:
//
//   - TypeScript 7 reads `paths`, and no longer looks `@typescript/lib-*` up
//     by name. Those consumers need no linking; the README's `paths` entry is
//     the whole setup.
//   - TypeScript 6 and earlier ignore `paths` here and resolve
//     `@typescript/lib-<group>` as an ordinary package name, through a fixed
//     Node10 lookup. A single package shipping every lib as a subdirectory has
//     no name for them to find.
//
// This script supplies those names: one symlink per lib group, from
// `node_modules/@typescript/lib-<group>` to this package's `libs/<group>`.
// A directory holding an `index.d.ts` resolves without a manifest of its own,
// so nothing else has to ship.
//
// USAGE
//
//   npx <package>-link                 link the plain-number flavor
//   npx <package>-link --branded       link the branded flavor
//   npx <package>-link --dir <path>    treat <path> as the project root
//   npx <package>-link --unlink        remove the links again
//
// Add it to your own `package.json` so a reinstall restores the links:
//
//   { "scripts": { "prepare": "<package>-link" } }

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCOPE = '@typescript';

const main = async () => {
  const options = parseArgs(process.argv.slice(2));

  const packageDir = path.dirname(fileURLToPath(import.meta.url));

  const packageName = await readPackageName(packageDir);

  const flavor = options.branded ? 'libs-branded' : 'libs';

  const libsDir = path.join(packageDir, flavor);

  const groups = await readGroups(libsDir);

  if (groups.length === 0) {
    throw new Error(`No lib groups found in ${libsDir}.`);
  }

  const scopeDir = path.join(
    await resolveNodeModules(options.dir, packageDir, packageName),
    SCOPE,
  );

  await fs.mkdir(scopeDir, { recursive: true });

  for (const group of groups) {
    const linkPath = path.join(scopeDir, `lib-${group}`);

    await removeIfPresent(linkPath);

    if (options.unlink) continue;

    // Relative on POSIX so the tree stays portable; a Windows junction is
    // the only kind of directory link an unprivileged user can make, and it
    // takes an absolute target.
    const target =
      process.platform === 'win32'
        ? path.join(packageDir, flavor, group)
        : path.join('..', packageName, flavor, group);

    await fs.symlink(
      target,
      linkPath,
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    // A dangling link is the one failure mode that would look like success:
    // TypeScript falls back to its own declarations without saying anything.
    if (!(await exists(linkPath))) {
      throw new Error(
        `${linkPath} -> ${target} does not resolve. Is ${packageName} installed in this project?`,
      );
    }
  }

  console.info(
    options.unlink
      ? `Removed ${groups.length} ${SCOPE}/lib-* links from ${scopeDir}.`
      : `Linked ${groups.length} ${SCOPE}/lib-* to ${packageName}/${flavor} in ${scopeDir}.`,
  );
};

const parseArgs = (argv) => {
  const dirIndex = argv.indexOf('--dir');

  return {
    branded: argv.includes('--branded'),
    unlink: argv.includes('--unlink'),
    dir: dirIndex === -1 ? undefined : argv[dirIndex + 1],
  };
};

/**
 * The `node_modules` to link into: the one this package was installed in.
 *
 * Not "the nearest `node_modules` above the working directory" — in a
 * monorepo that finds the workspace root, and the links land next to a copy
 * of this package that is not there, which the caller then has to notice.
 * The anchor is the package itself:
 *
 * 1. `--dir` wins outright.
 * 2. If this file sits directly under a `node_modules`, that is the answer.
 *    npm and yarn install that way.
 * 3. pnpm does not — the real path is inside `.pnpm`, reached through a
 *    symlink — so walk up from the working directory for the first project
 *    whose `node_modules` holds this package by name.
 */
const resolveNodeModules = async (explicitDir, packageDir, packageName) => {
  if (explicitDir !== undefined) {
    return path.resolve(explicitDir, 'node_modules');
  }

  const parent = path.dirname(packageDir);

  if (
    path.basename(parent) === 'node_modules' &&
    !parent.split(path.sep).includes('.pnpm')
  ) {
    return parent;
  }

  let mut_dir = process.cwd();

  for (;;) {
    const candidate = path.join(mut_dir, 'node_modules');

    if (await exists(path.join(candidate, packageName))) return candidate;

    const next = path.dirname(mut_dir);

    if (next === mut_dir) {
      throw new Error(
        `Could not find a project with ${packageName} installed, starting from ${process.cwd()}. Run this from that project, or pass --dir <path>.`,
      );
    }

    mut_dir = next;
  }
};

const readGroups = async (libsDir) => {
  const entries = await fs.readdir(libsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

const readPackageName = async (packageDir) => {
  const raw = await fs.readFile(path.join(packageDir, 'package.json'), 'utf8');

  const name = JSON.parse(raw).name;

  if (typeof name !== 'string') {
    throw new Error(`No name in ${packageDir}/package.json.`);
  }

  return name;
};

/**
 * Only a symlink is removed. A real directory at `@typescript/lib-<group>` is
 * someone else's package, and silently deleting it would be worse than
 * failing.
 */
const removeIfPresent = async (linkPath) => {
  const stats = await fs.lstat(linkPath).catch(() => undefined);

  if (stats === undefined) return;

  if (!stats.isSymbolicLink()) {
    throw new Error(
      `${linkPath} exists and is not a symlink; refusing to replace it.`,
    );
  }

  await fs.unlink(linkPath);
};

const exists = async (target) =>
  await fs.access(target).then(
    () => true,
    () => false,
  );

await main();
