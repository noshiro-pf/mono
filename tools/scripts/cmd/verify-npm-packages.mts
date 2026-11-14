import type { Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  Json,
  Num,
  Obj,
  Optional,
  Result,
} from 'ts-data-forge';
import {
  $,
  formatFilesGlob,
  getWorkspacePackages,
  isDirectlyExecuted,
  type Package,
} from 'ts-repo-utils';
import type {
  JsonValue,
  MutableRecord,
  NonEmptyArray,
  NonEmptyTuple,
  ReadonlyRecord,
} from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Installs what the packages publish, into a workspace that stays on disk, and
 * runs a small program against each one.
 *
 * There are two spaces, sharing one set of checks:
 *
 * - `local` installs tarballs packed from this checkout — what the next
 *   release will be.
 * - `published` installs from npm the exact version pinned in
 *   `verify-npm-packages/published/packages/<name>/package.json` — what
 *   consumers have, as of the last time `--update` (run by `pnpm-update`)
 *   moved the pins to `latest`. A new release reaches it only then (see
 *   `publishedVersionPin`), and the check it runs is the one committed beside
 *   the pin (see `writeCheckCopy`).
 *
 * Both exist because they answer different questions. `local` fails on a
 * regression before it ships; `published` fails when something already released
 * is broken, which no amount of checking a working tree can tell you.
 *
 * The repository has shipped, and every check it had passed each time:
 * executables importing packages a consumer is never given, and `module` /
 * `types` naming files the build never emitted.
 */
export const verifyNpmPackages = async (
  target: Target,
  options?: Readonly<{ updatePins?: boolean }>,
): Promise<Result<undefined, string>> => {
  const spaceDir = spaceDirOf(target);

  const publishable = await readPublishablePackages();

  if (Result.isErr(publishable)) {
    return publishable;
  }

  const packages = publishable.value;

  console.info(`Verifying ${packages.length} packages against "${target}".\n`);

  const tarballs =
    target === 'local'
      ? await packAll(packages)
      : Result.ok<ReadonlyRecord<string, string>>({});

  if (Result.isErr(tarballs)) {
    return tarballs;
  }

  if (target === 'local') {
    const advertised = await checkAdvertisedPaths(tarballs.value);

    if (Result.isErr(advertised)) {
      return advertised;
    }
  }

  const generated = await generateSpace(target, packages, {
    updatePins: options?.updatePins ?? false,
  });

  if (Result.isErr(generated)) {
    return generated;
  }

  // What the space actually contains, which in the published space is not every
  // publishable package — see `generateSpace`.
  const included = generated.value;

  console.info(
    `Installing into ${path.relative(projectRootPath, spaceDir)} ...`,
  );

  const installed = await installProjects(spaceDir, included);

  if (Result.isErr(installed)) {
    return installed;
  }

  console.info('ok\n');

  return withoutRootLibLinks(async () => {
    if (target === 'published' && options?.updatePins === true) {
      await refreshPublishedChecks(spaceDir, included, { smokeDir, runCheck });
    }

    // Every project again, the ones just refreshed included: the list this
    // prints is then each project's check as it will be committed, and what
    // that costs is one more run of the few checks that moved.
    return runChecks(spaceDir, included);
  });
};

/**
 * Writes a project's check, `content` being the one under `smoke/` — unless the
 * project is a published one that already has a check, which is left as it is.
 *
 * A check under `smoke/` may assert an API that is not released yet: the
 * `local` space, packed from this checkout, has it, and the version a published
 * project pins does not. So a published project keeps the check that last
 * passed on its pin, committed, and that is the one a published run executes;
 * `refreshPublishedChecks` is what moves it forward. Copied on every run, as it
 * used to be, a published run executed assertions the pinned version could not
 * meet, and left the tree dirty with copies no dependency update may commit.
 *
 * A project with no check is a package new to npm, which has nothing older to
 * keep.
 */
export const writeCheckCopy = async (
  target: Target,
  file: string,
  content: string,
): Promise<void> => {
  if (target === 'published' && (await fileExists(file))) {
    return;
  }

  await writeFile(file, content);
};

/**
 * Brings each published project's check up to the one under `smoke/`, where
 * that one passes on the version now installed, and returns the names of the
 * packages whose committed check was kept because it does not.
 *
 * Run by `--update`, after the install and before the checks: the pins have
 * just moved, so a check written ahead of a release may pass now. One that
 * still fails is taken to be an assertion for something not on npm yet, so the
 * committed bytes go back and the run goes on to execute those. A check that is
 * already the one under `smoke/` is not run here at all.
 */
export const refreshPublishedChecks = async (
  spaceDir: string,
  packages: readonly PackageToCheck[],
  {
    smokeDir: sourceDir,
    runCheck: run,
  }: Readonly<{
    smokeDir: string;
    runCheck: (
      space: string,
      pkg: PackageToCheck,
    ) => Promise<Result<undefined, string>>;
  }>,
): Promise<readonly string[]> => {
  const mut_kept: string[] = [];

  for (const pkg of packages) {
    const copy = path.resolve(
      spaceDir,
      'packages',
      pkg.name,
      smokeFileName(pkg.name),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const current = await fs.readFile(
      path.resolve(sourceDir, smokeSourceName(pkg.name)),
      'utf8',
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const committed = await fs.readFile(copy, 'utf8');

    if (current === committed) {
      continue;
    }

    await writeFile(copy, current);

    // The trial copy stays only once its check has passed: a `run` that throws
    // must not leave in the tree, for the next step to bundle, a check that
    // never passed on the pin. A run killed here cannot put it back, and the
    // copy then shows as a change to a tracked file; `git checkout` undoes it.
    let mut_tried: Result<undefined, string> | undefined = undefined;

    try {
      mut_tried = await run(spaceDir, pkg);
    } finally {
      if (mut_tried === undefined || Result.isErr(mut_tried)) {
        await writeFile(copy, committed);
      }
    }

    if (Result.isOk(mut_tried)) {
      continue;
    }

    mut_kept.push(pkg.name);

    // A release that is broken where the new check looks fails here just as an
    // API not released yet does, and nothing in the failure tells them apart.
    // It is not a failure of this run either way — the committed check goes on
    // guarding the pin, and the `local` space runs the new one on every branch
    // — so what the check reported is printed for whoever reads why a copy
    // stays behind.
    console.info(
      `  kept the committed check of ${pkg.name}: the one under smoke/ does not pass on the pinned version yet.\n${indent(mut_tried.value)}`,
    );
  }

  return mut_kept;
};

/**
 * The files of a space that a generation formats: everything it writes, a
 * published project's check aside.
 *
 * The generated files are committed, and CI checks the working tree is clean.
 * Formatting them means regenerating never shows up as a diff just because
 * `JSON.stringify` and Prettier disagree about line breaks.
 *
 * A published project's check is left out: a run may change it only to the
 * bytes `smoke/` has, which is the one change to it `pnpm-update.yml` commits.
 * Reprinted — by a Prettier the same run has just updated — a copy would enter
 * the patch as something else.
 */
export const generatedFilesGlob = (target: Target, spaceDir: string): string =>
  `${spaceDir}/**/*.${target === 'published' ? '{json,yaml}' : '{json,mjs,mts,yaml}'}` as const;

/**
 * Writes the committed files of the `local` space, and removes from both spaces
 * the projects of packages that are no longer publishable (see `generateSpace`),
 * and nothing else: no pack, no install, no check.
 *
 * What they say comes from the manifests in this checkout alone (the tarball
 * paths do not carry a version, and the peers are read from the workspace), so
 * this is enough to bring them in line with a manifest that changed. The
 * version pull request needs exactly that: `changeset version` rewrites a peer
 * range such as `synstate: >=4.1.0` when that peer takes a major, and the
 * release job, which holds `id-token: write`, should not install thirty-odd
 * projects to follow it.
 */
export const generateLocalSpace = async (): Promise<
  Result<undefined, string>
> => {
  const publishable = await readPublishablePackages();

  if (Result.isErr(publishable)) {
    return publishable;
  }

  const generated = await generateSpace('local', publishable.value, {
    updatePins: false,
  });

  return Result.map(generated, () => undefined);
};

/**
 * The hand-written checks under `verify-npm-packages/smoke/` that no
 * publishable package maps to through `smokeSourceName`: left behind by a
 * package renamed, removed or made private. The generator copies a check into
 * the project of the package it is for, so one no package maps to is run by
 * nothing, and it looks like a live check. A file that is not a `.mjs` or
 * `.mts` module is no check, and is not named.
 */
export const findOrphanedSmokeSources = (
  smokeFiles: readonly string[],
  packageNames: readonly string[],
): readonly string[] => {
  const used = new Set<string>(packageNames.map(smokeSourceName));

  return smokeFiles
    .filter((file) => /\.m[jt]s$/u.test(file) && !used.has(file))
    .toSorted();
};

/**
 * The spaces a run for `target` removes stale projects from, its own first.
 *
 * A `local` run prunes `published` too: the rest of that space needs the
 * registry, but which projects it may hold does not, and nothing that runs on a
 * pull request regenerates it. That is what makes the pull request removing a
 * package remove both of its projects, rather than leave the published one for
 * the next `pnpm-update` to delete in a patch its allow-list refuses. A
 * `published` run, which `pnpm-update` makes, touches only its own space.
 */
export const spacesToPrune = (target: Target): readonly Target[] =>
  target === 'local'
    ? (['local', 'published'] as const)
    : (['published'] as const);

/**
 * Removes every entry under `<spaceDir>/packages/` that is not the project of
 * one of `packageNames`, and returns their names, sorted.
 *
 * `generateSpace` writes a project per package and would otherwise never take
 * one away, so the project of a package renamed, removed or made private stayed
 * committed, depending on a tarball no longer packed, and regenerating left it
 * untouched where the dirty-tree check could not see it. `packageNames` is every
 * publishable package rather than those written this run: a package
 * `notYetPublished` leaves out of the published space is left out on purpose,
 * and one after a missing check was simply not reached.
 *
 * `packageNames` is never empty, which the type holds: an empty list would say
 * the workspace was misread, not that every project is stale, and
 * `readPublishablePackages` refuses it before anything is packed or written.
 *
 * A directory whose name starts with `@` is a scope, whose projects are one
 * level down (`packages/@scope/name/`), whether or not any package is in it:
 * the names returned are always the projects', so a scope no package is in any
 * longer is reported as each project it held. A scope directory left with no
 * project is removed with them; one that held none is left alone, since it
 * removes no project and git does not see an empty directory.
 */
export const removeStaleProjects = async (
  spaceDir: string,
  packageNames: NonEmptyTuple<string>,
): Promise<readonly string[]> => {
  const packagesDir = path.resolve(spaceDir, 'packages');

  const keep = new Set<string>(packageNames);

  const mut_stale: string[] = [];

  // What is removed: a stale entry itself, or a scope directory whose every
  // project is stale.
  const mut_toRemove: string[] = [];

  for (const entry of await readEntriesIfAny(packagesDir)) {
    if (!entry.isDirectory() || !entry.name.startsWith('@')) {
      if (!keep.has(entry.name)) {
        mut_stale.push(entry.name);

        mut_toRemove.push(entry.name);
      }

      continue;
    }

    const childNames = await readNamesIfAny(
      path.resolve(packagesDir, entry.name),
    );

    const children = childNames.map((child) => `${entry.name}/${child}`);

    const staleChildren = children.filter((name) => !keep.has(name));

    mut_stale.push(...staleChildren);

    if (
      Arr.isNonEmpty(staleChildren) &&
      staleChildren.length === children.length
    ) {
      mut_toRemove.push(entry.name);
    } else {
      mut_toRemove.push(...staleChildren);
    }
  }

  for (const name of mut_toRemove) {
    await fs.rm(path.resolve(packagesDir, name), {
      recursive: true,
      force: true,
    });
  }

  return mut_stale.toSorted();
};

/**
 * The workspace packages not marked `private`, sorted by name, or an error when
 * there are none: that says the workspace was misread, and it is refused here,
 * before anything is packed, written or removed, so that no later step needs a
 * guard of its own.
 */
export const publishablePackagesOf = (
  workspacePackages: readonly Package[],
): Result<NonEmptyArray<PackageToCheck>, string> => {
  const packages = workspacePackages
    .filter(
      (pkg) => isRecord(pkg.packageJson) && pkg.packageJson['private'] !== true,
    )
    .map((pkg) => ({
      name: pkg.name,
      path: pkg.path,
      manifest: pkg.packageJson,
    }))
    // Sorted because the generated files are committed and CI checks the
    // working tree is clean. `getWorkspacePackages` reads the directories
    // concurrently and hands them back in whatever order they finished, so
    // without this the `overrides` block of the generated `pnpm-workspace.yaml`
    // is shuffled on every run and the repository never looks clean twice.
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return Arr.isNonEmpty(packages)
    ? Result.ok(packages)
    : Result.err(
        'No publishable package was found in the workspace, so it was misread; nothing was packed, written or removed.',
      );
};

/**
 * The strict standard library packages all share one check, because they only
 * differ by the TypeScript minor they were generated from — and what is being
 * verified is the same for each: that the published tarball's `libs/` layout is
 * what `libReplacement` asks for.
 */
export const smokeSourceName = (packageName: string): string =>
  isStrictLibPackage(packageName)
    ? 'strict-ts-lib.mts'
    : smokeFileName(packageName);

/**
 * A package that publishes types only is checked by compiling against it rather
 * than importing it — there is nothing to import. Its check is written as
 * `.mts`, and the presence of that file is what selects the mode.
 */
export const smokeFileName = (packageName: string): string =>
  isTypesOnly(packageName)
    ? (`${packageName}.mts` as const)
    : (`${packageName}.mjs` as const);

const spaceDirOf = (target: Target): string => path.resolve(verifyDir, target);

/**
 * `removeStaleProjects` for one space, saying what it removed.
 */
const pruneSpace = async (
  target: Target,
  packages: NonEmptyArray<PackageToCheck>,
): Promise<void> => {
  const removed = await removeStaleProjects(
    spaceDirOf(target),
    Arr.map(packages, (pkg) => pkg.name),
  );

  if (Arr.isNonEmpty(removed)) {
    console.info(
      `Removed from the ${target} space, as no publishable package's project: ${removed.join(', ')}.\n`,
    );
  }
};

/** Whether a file system call failed because the path is not there. */
const isNotFound = (error: unknown): boolean =>
  isRecord(error) && error['code'] === 'ENOENT';

/**
 * The entries of `dir`, or none when it does not exist. Any other failure is
 * thrown: reading nothing would leave every stale project in place unnoticed.
 */
const readEntriesIfAny = async (dir: string): Promise<readonly Dirent[]> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return await fs.readdir(dir, { withFileTypes: true });
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return [];
    }

    throw error;
  }
};

/**
 * The names of the entries of `dir`, or none when it does not exist — see
 * `readEntriesIfAny`.
 */
const readNamesIfAny = async (dir: string): Promise<readonly string[]> => {
  const entries = await readEntriesIfAny(dir);

  return entries.map(({ name }) => name);
};

/**
 * Runs `check` with the repository's own `@typescript/lib-*` links removed, and
 * puts them back afterwards, whatever `check` returned.
 *
 * The root `prepare` links the strict library into the repository's
 * `node_modules/@typescript/`, and every project in the space sits below it.
 * TypeScript finds a lib replacement by walking up through `node_modules`, so
 * with those links in place a project whose own setup did nothing still finds
 * one — the repository's, not the package's — and its probe passes: a
 * `strict-ts-lib-v7.0` project with no links and a `paths` entry pointing
 * nowhere compiled clean.
 */
const withoutRootLibLinks = async (
  check: () => Promise<Result<undefined, string>>,
): Promise<Result<undefined, string>> => {
  const unlinked = await $('pnpm run z:link-strict-lib --unlink', {
    silent: true,
    cwd: projectRootPath,
  });

  if (Result.isErr(unlinked)) {
    return Result.err(
      `Could not remove the repository's own @typescript/lib-* links: ${unlinked.value.message}`,
    );
  }

  // In a `finally`, so that a `check` that throws does not leave the links
  // removed: they are the repository's own, and every later `tsc` in this
  // checkout reads them. `undefined` is that throw, which is on its way out
  // already, so a failure to restore can only be printed beside it.
  let mut_result: Result<undefined, string> | undefined = undefined;

  try {
    mut_result = await check();
  } finally {
    const relinked = await $('pnpm run z:link-strict-lib', {
      silent: true,
      cwd: projectRootPath,
    });

    if (Result.isErr(relinked)) {
      const message =
        `Could not restore the repository's own @typescript/lib-* links (run \`pnpm run z:link-strict-lib\`): ${relinked.value.message}` as const;

      if (mut_result === undefined) {
        console.error(message);
      } else {
        // After what the checks said, not in place of it.
        mut_result = Result.err(
          Result.isErr(mut_result)
            ? `${mut_result.value}\n${message}`
            : message,
        );
      }
    }
  }

  return mut_result;
};

/**
 * One `pnpm install` per package, each in its own workspace.
 *
 * The projects used to be one workspace with a `packages/*` glob, which is
 * cheaper — one resolution instead of thirty-two — and was enough while pnpm
 * resolved a peer dependency from the package that declares it. pnpm 12
 * resolves more of them at the importer, and in one workspace the importer is
 * shared: measured on this space, `eslint-plugin-ts-data-forge` was handed
 * `typescript@7.0.2` against its own `>=5.0.0 <7.0.0` peer range, because the
 * `ts-type-forge` project next to it asks for `typescript: latest`. That is the
 * same fault the space already splits one project per package to avoid — a
 * package passing the check on something another package brought in — and peers
 * were the way back in.
 *
 * Neither space can be installed incrementally. The tarballs are packed under
 * names without versions in them, so their paths do not change between runs
 * even though their contents do, and pnpm keys a `file:` dependency on the
 * path. Measured: with `cmd-ts` removed from ts-codemod-cli's dependencies,
 * reinstalling — with `--force`, and with the lockfile deleted — still produced
 * a tree containing `cmd-ts`, and the check passed. Only removing
 * `node_modules` re-extracts the tarball. A pinned version in the published
 * space is a moving target for the same reason.
 */
const installProjects = async (
  spaceDir: string,
  packages: readonly PackageToCheck[],
): Promise<Result<undefined, string>> => {
  for (const pkg of packages) {
    const dir = path.resolve(spaceDir, 'packages', pkg.name);

    await fs.rm(path.resolve(dir, 'node_modules'), {
      recursive: true,
      force: true,
    });

    await fs.rm(path.resolve(dir, 'pnpm-lock.yaml'), { force: true });

    // `1>&2` because pnpm reports the fault — `ERR_PNPM_NO_MATCHING_VERSION`,
    // and which package asked for what — on stdout, while Node puts only stderr
    // into the error it hands back. Without the redirect a failed install
    // reached CI as "Command failed: pnpm install" and nothing else.
    const installed = await $(
      `pnpm --dir ${dir} install --no-frozen-lockfile 1>&2`,
      { silent: true },
    );

    if (Result.isErr(installed)) {
      return Result.err(
        `Install failed for ${pkg.name}: ${installed.value.message}`,
      );
    }
  }

  return Result.ok(undefined);
};

export type Target = 'local' | 'published';

const verifyDir = path.resolve(projectRootPath, 'verify-npm-packages');

const smokeDir = path.resolve(verifyDir, 'smoke');

const tarballDir = path.resolve(verifyDir, '.tarballs');

export type PackageToCheck = Readonly<{
  name: string;
  path: string;
  manifest: JsonValue;
}>;

/**
 * Packs each package under a name without its version in it, so that the
 * generated `package.json` files do not change every time a version does.
 */
const packAll = async (
  packages: readonly PackageToCheck[],
): Promise<Result<ReadonlyRecord<string, string>, string>> => {
  console.info('Packing...');

  await fs.rm(tarballDir, { recursive: true, force: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(tarballDir, { recursive: true });

  const mut_tarballs: MutableRecord<string, string> = {};

  for (const pkg of packages) {
    const packed = await $(
      `pnpm --dir ${pkg.path} pack --pack-destination ${tarballDir}`,
      { silent: true },
    );

    if (Result.isErr(packed)) {
      return Result.err(`Failed to pack ${pkg.name}: ${packed.value.message}`);
    }

    // `pnpm pack` prints the path it wrote as its last line.
    const written = (
      packed.value.stdout.trim().split('\n').at(-1) ?? ''
    ).trim();

    if (!written.endsWith('.tgz')) {
      return Result.err(
        `Could not tell what \`pnpm pack\` wrote for ${pkg.name}.`,
      );
    }

    const stable = path.resolve(tarballDir, `${pkg.name}.tgz`);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.rename(written, stable);

    mut_tarballs[pkg.name] = stable;
  }

  console.info(`${packages.length} tarballs\n`);

  return Result.ok(mut_tarballs);
};

/** `exports` nests conditions arbitrarily deep; every leaf string is a path. */
const collectExportsPaths = (
  exportsField: JsonValue | undefined,
): readonly string[] =>
  isString(exportsField)
    ? ([exportsField] as const)
    : Arr.isArray(exportsField)
      ? exportsField.flatMap(collectExportsPaths)
      : isRecord(exportsField)
        ? Object.values(exportsField).flatMap(collectExportsPaths)
        : ([] as const);

const collectPaths = (manifest: JsonValue): readonly string[] => {
  if (!isRecord(manifest)) {
    return [];
  }

  const fromTopLevel = (['main', 'module', 'types'] as const)
    .map((key) => manifest[key])
    .filter(isString);

  const binField = manifest['bin'];

  const fromBin = isRecord(binField)
    ? Object.values(binField).filter(isString)
    : isString(binField)
      ? ([binField] as const)
      : ([] as const);

  return [
    ...fromTopLevel,
    ...fromBin,
    ...collectExportsPaths(manifest['exports']),
  ]
    .filter((p) => p.startsWith('./'))
    .map((p) => p.slice('./'.length));
};

/**
 * `exports`, `main`, `module`, `types` and `bin` are promises to a consumer.
 * A promise about a file that is not in the tarball is broken for everyone
 * whose resolver reads that field — which, for `module` and `types`, is
 * everyone not reading `exports`.
 */
const checkAdvertisedPaths = async (
  tarballs: ReadonlyRecord<string, string>,
): Promise<Result<undefined, string>> => {
  console.info('Checking that every advertised path is in the tarball...');

  const mut_missing: string[] = [];

  for (const [name, tarball] of Object.entries(tarballs)) {
    const listed = await $(`tar -tzf ${tarball}`, { silent: true });

    const manifestJson = await $(`tar -xzOf ${tarball} package/package.json`, {
      silent: true,
    });

    if (Result.isErr(listed) || Result.isErr(manifestJson)) {
      return Result.err(`Failed to read ${tarball}.`);
    }

    const manifest = Json.parse(manifestJson.value.stdout);

    if (Result.isErr(manifest)) {
      return Result.err(`Failed to parse the manifest of ${name}.`);
    }

    const published = new Set(
      listed.value.stdout
        .split('\n')
        .map((line) => line.trim().replace(/^package\//u, ''))
        .filter((line) => line !== ''),
    );

    for (const advertised of collectPaths(manifest.value)) {
      if (!published.has(advertised)) {
        mut_missing.push(
          `${name}: ${advertised} is advertised but not published`,
        );
      }
    }
  }

  for (const message of mut_missing) {
    console.error(`  ✗ ${message}`);
  }

  if (Arr.isNonEmpty(mut_missing)) {
    return Result.err(
      `${mut_missing.length} path(s) advertised but not published.`,
    );
  }

  console.info('ok\n');

  return Result.ok(undefined);
};

/**
 * The packages in this repository depend on each other, and `pnpm pack`
 * resolves `workspace:^` to the version in the checkout — so the tarball of
 * `github-settings-as-code` asks for `octokit-safe-types@^1.2.26` while npm
 * still has 1.2.25. Nearly every package here has a dependent, so without these
 * overrides a `chore: version packages` branch fails to install at all —
 * `ERR_PNPM_NO_MATCHING_VERSION`, until the release it exists to make goes out.
 *
 * Off a version branch the range did resolve, but to the sibling on npm, which
 * is the older one. The `local` space is meant to be what the next release will
 * be, and the packages in it are released together, so the sibling it installs
 * should come from this checkout either way. That the declared range matches
 * what is published is the `published` space's question, not this one's.
 */
const siblingOverrides = (
  dir: string,
  packages: readonly PackageToCheck[],
): readonly string[] =>
  [
    '# Depend on the sibling packed from this checkout, not the older one on',
    '# npm — on a version branch the bumped version is not published at all.',
    'overrides:',
    ...packages.map(
      (pkg) =>
        `  '${pkg.name}': 'file:${path.relative(dir, path.resolve(tarballDir, `${pkg.name}.tgz`))}'`,
    ),
    '',
  ] as const;

/**
 * Each project is its own workspace root, so that nothing another project
 * installed can reach it — see `installProjects`.
 */
const projectWorkspaceYaml = (
  target: Target,
  dir: string,
  packages: readonly PackageToCheck[],
): string =>
  [
    '# Without this, pnpm fills `node_modules/.pnpm/node_modules` and puts it',
    '# on the resolution path, so a package that forgot to declare a',
    '# dependency still finds it as long as something else depends on it —',
    '# which is exactly the fault these checks look for.',
    'hoist: false',
    '',
    '# What is under test is the packages, not whether someone else\u{2019}s',
    '# postinstall script is on pnpm\u{2019}s allow list.',
    'strictDepBuilds: false',
    '',
    '# The repository holds new releases back for a week. Here that would',
    '# mean "published" quietly meaning "published a week ago".',
    'minimumReleaseAge: 0',
    '',
    ...(target === 'local' ? siblingOverrides(dir, packages) : []),
  ].join('\n');

/** The non-optional `peerDependencies` of a manifest, as plain specs. */
const declaredPeers = (manifest: JsonValue): ReadonlyRecord<string, string> => {
  const peers = isRecord(manifest) ? manifest['peerDependencies'] : undefined;

  const meta = isRecord(manifest)
    ? manifest['peerDependenciesMeta']
    : undefined;

  if (!isRecord(peers)) {
    return {};
  }

  const isOptional = (name: string): boolean => {
    if (!isRecord(meta)) {
      return false;
    }

    const entry = meta[name];

    return isRecord(entry) && entry['optional'] === true;
  };

  return Obj.filterMap(peers, (range, name) =>
    isString(range) && !isOptional(name) ? Optional.some(range) : Optional.none,
  );
};

/** `strict-ts-lib-v7.0` and its eleven siblings, one per TypeScript minor. */
const strictLibTypeScriptMajor = (packageName: string): number | undefined => {
  const matched = /^strict-ts-lib-v(\d+)\.\d+$/u.exec(packageName);

  const major = matched?.[1];

  return major === undefined
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(major), undefined);
};

const isStrictLibPackage = (packageName: string): boolean =>
  strictLibTypeScriptMajor(packageName) !== undefined;

const isTypesOnly = (packageName: string): boolean =>
  typesOnlyPackages.has(packageName) || isStrictLibPackage(packageName);

/**
 * What the last generation wrote, read back the way `readPinnedVersion` reads
 * the pin: everything in the project's `dependencies` except the package itself
 * and the `typescript` a types-only check compiles against.
 */
const readCommittedPeers = async (
  dir: string,
  pkg: PackageToCheck,
): Promise<ReadonlyRecord<string, string> | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const raw = await fs
    .readFile(path.resolve(dir, 'package.json'), 'utf8')
    .catch(() => undefined);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = Json.parse(raw);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return undefined;
  }

  const deps = parsed.value['dependencies'];

  if (!isRecord(deps)) {
    return undefined;
  }

  return Obj.filterMap(deps, (spec, name) =>
    name !== pkg.name &&
    !(name === 'typescript' && isTypesOnly(pkg.name)) &&
    isString(spec)
      ? Optional.some(spec)
      : Optional.none,
  );
};

/**
 * The peer dependencies the package under check declares, written into the
 * project as ordinary dependencies — which is what a consumer has to do with a
 * peer anyway.
 *
 * They used to be left out, on the reasoning that pnpm installs a peer from the
 * range the *installed* package declares, so the published space would exercise
 * the published range without this file having to know it. pnpm 12 resolves a
 * peer at the importer in more cases, and an importer that declares nothing
 * gets nothing: measured on this space, every ESLint plugin
 * `eslint-config-typed` pulls in lost its `eslint` peer, and
 * `eslint-plugin-unicorn` then found the monorepo's copy — outside the space,
 * which is the one thing `isolate.mjs` exists to catch.
 *
 * The range is still the package's own, so what is exercised is unchanged.
 * Where it comes from differs by space, for the same reason the version pin
 * does:
 *
 * - `local` reads this checkout, which is what the tarball was packed from.
 * - `published` reads what is committed here, and looks the pinned version's
 *   manifest up on the registry only when `--update` moves the pins. A
 *   published version's manifest never changes, so the committed answer stays
 *   right, and the check does not spend thirty-two registry round trips on
 *   every run to be told what it already knows.
 *
 * An optional peer is left out. It is optional because a consumer may not have
 * it, and a consumer who does not is the case worth checking.
 */
const peerSpecs = async (
  target: Target,
  dir: string,
  pkg: PackageToCheck,
  spec: string,
  updatePins: boolean,
): Promise<Result<ReadonlyRecord<string, string>, string>> => {
  if (target === 'local') {
    return Result.ok(declaredPeers(pkg.manifest));
  }

  const committed = updatePins ? undefined : await readCommittedPeers(dir, pkg);

  if (committed !== undefined) {
    return Result.ok(committed);
  }

  // The whole manifest rather than the two fields by name: `npm view` given
  // several fields prints them keyed by field name only when more than one of
  // them exists, and prints the value bare otherwise — so asking for
  // `peerDependencies peerDependenciesMeta` returns two different shapes
  // depending on whether the package happens to have optional peers.
  const manifest = await $(`npm view ${pkg.name}@${spec} --json`, {
    silent: true,
  });

  if (Result.isErr(manifest)) {
    return Result.err(
      `Could not look up the peer dependencies of ${pkg.name}@${spec}: ${manifest.value.message}`,
    );
  }

  const parsed = Json.parse(manifest.value.stdout);

  return Result.isErr(parsed) || !isRecord(parsed.value)
    ? Result.err(`Could not read the manifest of ${pkg.name}@${spec}.`)
    : Result.ok(declaredPeers(parsed.value));
};

/**
 * npm reports an unknown package as `E404`, on stderr, which `exec` folds into
 * the error's message. Matched on the code rather than on the prose so that a
 * reworded message does not turn a missing package into a hard failure — and
 * narrowly enough that a 404 from somewhere else in the output does not read as
 * one.
 */
const npmSaysNotFound = (message: string): boolean =>
  message.includes('E404') || message.includes('is not in this registry');

const readPinnedVersion = async (
  dir: string,
  packageName: string,
): Promise<string | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const raw = await fs
    .readFile(path.resolve(dir, 'package.json'), 'utf8')
    .catch(() => undefined);

  if (raw === undefined) {
    return undefined;
  }

  const parsed = Json.parse(raw);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) {
    return undefined;
  }

  const deps = parsed.value['dependencies'];

  if (!isRecord(deps)) {
    return undefined;
  }

  const pinned = deps[packageName];

  return isString(pinned) ? pinned : undefined;
};

/**
 * The published space pins an exact version, committed, rather than tracking
 * `latest`. Two reasons: the check then only has something new to say when the
 * pin moves, and it cannot start failing on its own the moment a release goes
 * out. `--update` moves the pins, and `pnpm-update` is what runs it — a version
 * bump arrives as a reviewable diff like any other dependency.
 *
 * Returns `undefined` for a package named in `notYetPublished` that the
 * registry does not have. Any other package the registry does not have is an
 * error: a package silently dropping out of the check is exactly what this
 * would otherwise hide.
 */
const publishedVersionPin = async (
  dir: string,
  packageName: string,
  updatePins: boolean,
): Promise<Result<string | undefined, string>> => {
  const existing = updatePins
    ? undefined
    : await readPinnedVersion(dir, packageName);

  if (existing !== undefined) {
    return Result.ok(existing);
  }

  const latest = await $(`npm view ${packageName} version`, { silent: true });

  if (Result.isOk(latest)) {
    return Result.ok(latest.value.stdout.trim());
  }

  // A network fault, a registry outage or an auth error is reported as-is:
  // reading those as "not published" would drop packages from the check at
  // exactly the moment it cannot be trusted.
  if (!npmSaysNotFound(latest.value.message)) {
    return Result.err(
      `Could not look up the published version of ${packageName}: ${latest.value.message}`,
    );
  }

  return notYetPublished.has(packageName)
    ? Result.ok(undefined)
    : Result.err(
        `${packageName} is not on the registry. If it is waiting for its first manual publish, add it to \`notYetPublished\` in this file; otherwise it has been renamed or unpublished.`,
      );
};

/**
 * The `compilerOptions` a strict standard library package's own README tells a
 * consumer to write beside the linker. Nothing for a package that is not one.
 *
 * Every version resolves `@typescript/lib-*` by name, which is what the linker
 * the package ships answers; `libReplacement` stops defaulting to on at
 * TypeScript 6, and is not a known option at all before 5.8, so it is set only
 * where it is both valid and needed. TypeScript 7 also reads `paths` for a lib
 * replacement, which its README offers as a second route — see `hasPathsRoute`.
 */
const strictLibCompilerOptions = (
  packageName: string,
): ReadonlyRecord<string, JsonValue> => {
  const major = strictLibTypeScriptMajor(packageName);

  if (major === undefined) {
    return {};
  }

  return {
    // What is under test is the standard library. Without this, tsc walks up
    // out of the space and finds the repository's own `@types/*`, and with
    // `skipLibCheck: false` a modern `@types/node` against an old TypeScript
    // buries the check in `TS2451: Cannot redeclare block-scoped variable`.
    types: [],
    ...(major >= 6 ? { libReplacement: true } : {}),
  };
};

/** The `tsconfig.json` a types-only package is compiled through. */
const smokeTsconfig = (
  packageName: string,
  extra: ReadonlyRecord<string, JsonValue> = {},
): ReadonlyRecord<string, JsonValue> =>
  ({
    compilerOptions: {
      strict: true,
      noUncheckedIndexedAccess: true,
      target: 'ESNext',
      module: 'NodeNext',
      moduleResolution: 'nodenext',
      noEmit: true,
      skipLibCheck: false,
      // What the strict library check exists to verify: that the recipe in the
      // package's own README is enough for TypeScript to replace its own
      // declarations. Which recipe that is depends on the version — see
      // `strictLibCompilerOptions`.
      ...strictLibCompilerOptions(packageName),
      ...extra,
    },
    include: [smokeFileName(packageName)],
  }) as const;

/**
 * The TypeScript a package is compiled against. A strict standard library
 * replaces the declarations of one TypeScript minor and says so in its peer
 * range, so checking it against anything else checks nothing: TypeScript 7
 * rejects `strict-ts-lib-v5.6` outright, because `lib.es2022.sharedmemory` —
 * which those declarations reference — no longer exists upstream.
 */
const typescriptSpec = (pkg: PackageToCheck): string => {
  const { manifest } = pkg;

  const peers = isRecord(manifest) ? manifest['peerDependencies'] : undefined;

  const declared = isRecord(peers) ? peers['typescript'] : undefined;

  return isString(declared) ? declared : 'latest';
};

/**
 * The packages whose README also offers `paths` instead of the linker: those
 * for TypeScript 7, the first version to read `paths` for a lib replacement.
 * Their project carries a second config, {@link PATHS_TSCONFIG}, compiled
 * before anything is linked so that it proves `paths` alone is enough.
 */
const hasPathsRoute = (packageName: string): boolean => {
  const major = strictLibTypeScriptMajor(packageName);

  return major !== undefined && major >= 7;
};

/**
 * Whether `file` is there. Any failure but its absence is thrown: reading one
 * as "not there" would overwrite a check that could not be looked at.
 */
const fileExists = async (file: string): Promise<boolean> => {
  try {
    await fs.access(file);

    return true;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return false;
    }

    throw error;
  }
};

const writeFile = async (file: string, content: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(file, content);
};

const writeJson = async (file: string, value: unknown): Promise<void> => {
  await writeFile(file, `${JSON.stringify(value, undefined, 2)}\n`);
};

/**
 * Writes the space: one project per package, each depending only on that
 * package and the peers it needs, with the shared check copied in — always in
 * the `local` space, and in the `published` one only into a project that has
 * none (see `writeCheckCopy`). A `local` run also prunes the `published` space
 * — see `spacesToPrune`.
 *
 * The files are generated and committed, so that CI's repository-is-clean check
 * fails if `verify-npm-packages/smoke/` and the `local` space ever disagree.
 */
const generateSpace = async (
  target: Target,
  packages: NonEmptyArray<PackageToCheck>,
  options: Readonly<{ updatePins: boolean }>,
): Promise<Result<readonly PackageToCheck[], string>> => {
  const spaceDir = spaceDirOf(target);

  const orphans = findOrphanedSmokeSources(
    await readNamesIfAny(smokeDir),
    packages.map(({ name }) => name),
  );

  if (Arr.isNonEmpty(orphans)) {
    return Result.err(
      [
        `No publishable package uses these checks in ${path.relative(projectRootPath, smokeDir)}/, so nothing runs them:`,
        ...orphans.map((file) => `  ${file}`),
        'Delete each, or rename it after the package it checks now.',
      ].join('\n'),
    );
  }

  // Before writing, so that a run that fails partway still removes what is
  // stale, and before formatting, so that a removal is part of what this run
  // writes and the dirty-tree check reports it like any other generated change.
  // Which spaces: `spacesToPrune`.
  for (const space of spacesToPrune(target)) {
    await pruneSpace(space, packages);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.resolve(spaceDir, 'packages'), { recursive: true });

  const mut_included: PackageToCheck[] = [];

  const mut_skipped: string[] = [];

  // A package with no check is reported once what was written is formatted:
  // `check-changed` runs this on every change, and would otherwise list each
  // manifest written before it, unformatted, as output to commit.
  let mut_missingCheck: string | undefined = undefined;

  for (const pkg of packages) {
    const dir = path.resolve(spaceDir, 'packages', pkg.name);

    const pin =
      target === 'local'
        ? Result.ok<string | undefined>(
            `file:${path.relative(dir, path.resolve(tarballDir, `${pkg.name}.tgz`))}`,
          )
        : await publishedVersionPin(dir, pkg.name, options.updatePins);

    if (Result.isErr(pin)) {
      return pin;
    }

    const spec = pin.value;

    // Named in `notYetPublished` and not on the registry, so there is nothing
    // to install and nothing to check.
    if (spec === undefined) {
      mut_skipped.push(pkg.name);

      continue;
    }

    mut_included.push(pkg);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(dir, { recursive: true });

    const peers = await peerSpecs(target, dir, pkg, spec, options.updatePins);

    if (Result.isErr(peers)) {
      return peers;
    }

    await writeFile(
      path.resolve(dir, 'pnpm-workspace.yaml'),
      projectWorkspaceYaml(target, dir, packages),
    );

    await writeJson(path.resolve(dir, 'package.json'), {
      name: `verify-${pkg.name}`,
      version: '0.0.0',
      private: true,
      type: 'module',
      dependencies: {
        [pkg.name]: spec,
        ...peers.value,
        // A types-only package is checked by compiling against it.
        ...(isTypesOnly(pkg.name) ? { typescript: typescriptSpec(pkg) } : {}),
      },
    });

    const source = path.resolve(smokeDir, smokeSourceName(pkg.name));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(source, 'utf8').catch(() => undefined);

    if (content === undefined) {
      mut_missingCheck = `No check for ${pkg.name}: expected ${source}`;

      break;
    }

    await writeCheckCopy(
      target,
      path.resolve(dir, smokeFileName(pkg.name)),
      content,
    );

    if (!isTypesOnly(pkg.name)) {
      continue;
    }

    await writeJson(
      path.resolve(dir, 'tsconfig.json'),
      smokeTsconfig(pkg.name),
    );

    if (hasPathsRoute(pkg.name)) {
      await writeJson(
        path.resolve(dir, PATHS_TSCONFIG),
        smokeTsconfig(pkg.name, {
          paths: {
            '@typescript/lib-*': [`./node_modules/${pkg.name}/libs/*`],
          },
        }),
      );
    }
  }

  // Which files, and why not a published project's check: `generatedFilesGlob`.
  const formatted = await formatFilesGlob(
    generatedFilesGlob(target, spaceDir),
    { silent: true },
  );

  if (Result.isErr(formatted)) {
    return Result.err(`Failed to format the generated files in ${spaceDir}.`);
  }

  if (mut_missingCheck !== undefined) {
    return Result.err(mut_missingCheck);
  }

  if (Arr.isNonEmpty(mut_skipped)) {
    console.info(
      `Not on npm yet, so left out of the ${target} space: ${mut_skipped.join(', ')}.\n`,
    );
  }

  return Result.ok(mut_included);
};

/**
 * Packages that are in the workspace but not on npm yet, and so are left out of
 * the published space.
 *
 * A package's first publish is manual (`libs/first-release.md`): npm's trusted
 * publishing is configured per package and cannot be configured before the
 * package exists, so between the pull request that adds a package and that
 * first publish there is nothing to pin and nothing for a consumer to install.
 * Without an entry here that window fails `verify-published` on every pull
 * request that moves the pins.
 *
 * Naming them one by one rather than treating every `E404` as "not published
 * yet" is deliberate: a package that stops resolving for any other reason — a
 * rename, an unpublish, a typo in a manifest — has to fail rather than quietly
 * leave the check. Delete the entry once the package has been published; from
 * then on it is verified like any other.
 *
 * "Published" has to mean *working*, not merely present. A first publish that
 * happens before the sibling release its code needs is on the registry and
 * broken: `eslint-plugin-ts-std-forge@0.1.0` shipped importing `SafeArray` from
 * `ts-std-forge`, with `workspace:*` resolved to the exact `0.4.0` in the
 * checkout — a version that does not have it. Removing the entry then only pins
 * the breakage. Wait for the release that fixes it.
 */
const notYetPublished: ReadonlySet<string> = new Set<string>([
  'eslint-plugin-ts-restrictions',
  'eslint-plugin-ts-ui-restrictions',
  'synstate-router-preact',
  'ts-std-forge-keys',
]);

const typesOnlyPackages: ReadonlySet<string> = new Set<string>([
  'ts-std-forge-keys',
  'ts-type-forge',
]);

const PATHS_TSCONFIG = 'tsconfig.paths.json';

const indent = (text: string): string =>
  text
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');

/**
 * Runs one project's check against what is installed in it, and returns what
 * the command reported when it fails.
 */
const runCheck = async (
  spaceDir: string,
  pkg: PackageToCheck,
): Promise<Result<undefined, string>> => {
  const dir = path.resolve(spaceDir, 'packages', pkg.name);

  const file = smokeFileName(pkg.name);

  // `--import isolate.mjs` refuses any resolution outside the project — its own
  // `node_modules` and nothing above. These projects sit inside the monorepo,
  // so without it Node walks up into the repository's own `node_modules` and a
  // package missing a dependency finds it there — the check then passes on a
  // package a consumer cannot use.
  // Through NODE_OPTIONS rather than an argument, so that a check which spawns
  // the package's own executable — several do — carries the boundary into that
  // child process too.
  const isolation =
    `VERIFY_SPACE_ROOT=${dir} NODE_OPTIONS='--import ${path.resolve(verifyDir, 'isolate.mjs')}'` as const;

  const tsc = (tsconfig: string): string =>
    `${path.resolve(dir, 'node_modules', '.bin', 'tsc')} --noEmit -p ${path.resolve(dir, tsconfig)}` as const;

  // A strict standard library is set up by the linker it ships, exactly as its
  // README instructs — which makes the linker itself part of what is under
  // test. `--dir` because the linker is run from the repository root rather
  // than from the project, and under pnpm it cannot tell where it was installed
  // from its own path — a consumer running `npx` in their project needs
  // neither.
  const linker =
    `${path.resolve(dir, 'node_modules', '.bin', `${pkg.name}-link`)} --dir ${dir}` as const;

  // The `paths` route goes first, after removing any links an earlier run left:
  // with them in place, the name lookup would replace the libs on its own and
  // the route would pass whether `paths` worked or not.
  const pathsRoute = hasPathsRoute(pkg.name)
    ? (`${linker} --unlink && ${tsc(PATHS_TSCONFIG)} && ` as const)
    : '';

  const cmd = isStrictLibPackage(pkg.name)
    ? (`${pathsRoute}${linker} && ${tsc('tsconfig.json')}` as const)
    : file.endsWith('.mts')
      ? tsc('tsconfig.json')
      : (`${isolation} node ${path.resolve(dir, file)}` as const);

  // From the project directory, which is where a consumer runs their own build.
  // It is not cosmetic: TypeScript 5.0 resolves `@typescript/lib-*` relative to
  // the current directory rather than to the config that asked for it, so run
  // from anywhere else the replacement silently does not happen and the probe
  // stops erroring.
  //
  // `1>&2` because `tsc` reports its diagnostics on stdout, while the error
  // handed back carries only stderr: a failed compile read as "Command failed"
  // and nothing else.
  const result = await $(`{ ${cmd}; } 1>&2`, { silent: true, cwd: dir });

  return Result.isErr(result)
    ? Result.err(result.value.message)
    : Result.ok(undefined);
};

const runChecks = async (
  spaceDir: string,
  packages: readonly PackageToCheck[],
): Promise<Result<undefined, string>> => {
  console.info('Running the checks...');

  const mut_failures: string[] = [];

  for (const pkg of packages) {
    const result = await runCheck(spaceDir, pkg);

    if (Result.isErr(result)) {
      mut_failures.push(pkg.name);

      console.error(`  ✗ ${pkg.name}\n${indent(result.value)}`);
    } else {
      console.info(`  ✓ ${pkg.name}`);
    }
  }

  return Arr.isNonEmpty(mut_failures)
    ? Result.err(
        `${mut_failures.length} package(s) failed: ${mut_failures.join(', ')}`,
      )
    : Result.ok(undefined);
};

/** `publishablePackagesOf` the workspace. */
const readPublishablePackages = async (): Promise<
  Result<NonEmptyArray<PackageToCheck>, string>
> => publishablePackagesOf(await getWorkspacePackages(projectRootPath));

if (isDirectlyExecuted(import.meta.url)) {
  const target: Target = process.argv.includes('--published')
    ? 'published'
    : 'local';

  // `--gen` writes the local space, prunes both spaces, and stops — see
  // `generateLocalSpace`.
  const generateOnly = process.argv.includes('--gen');

  const result = generateOnly
    ? await generateLocalSpace()
    : await verifyNpmPackages(target, {
        updatePins: process.argv.includes('--update'),
      });

  if (Result.isErr(result)) {
    console.error(`\n❌ ${result.value}`);

    process.exit(1);
  }

  console.info(
    generateOnly
      ? '\n✅ The local space is generated, and both spaces are pruned.'
      : `\n✅ The ${target} packages import and run.`,
  );
}
