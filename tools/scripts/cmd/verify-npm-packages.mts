import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, isString, Json, Result } from 'ts-data-forge';
import {
  $,
  formatFilesGlob,
  getWorkspacePackages,
  isDirectlyExecuted,
} from 'ts-repo-utils';
import {
  type JsonValue,
  type MutableRecord,
  type ReadonlyRecord,
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
 * - `published` installs `latest` from npm — what consumers have now, which
 *   may be older.
 *
 * Both exist because they answer different questions. `local` fails on a
 * regression before it ships; `published` fails when something already
 * released is broken, which no amount of checking a working tree can tell you.
 *
 * The repository has shipped, and every check it had passed each time:
 * executables importing packages a consumer is never given, and `module` /
 * `types` naming files the build never emitted.
 */
export const verifyNpmPackages = async (
  target: Target,
  options?: Readonly<{ updatePins?: boolean }>,
): Promise<Result<undefined, string>> => {
  const spaceDir = path.resolve(verifyDir, target);

  const packages = await readPublishablePackages();

  console.info(`Verifying ${packages.length} packages against "${target}".\n`);

  const tarballs =
    target === 'local'
      ? await packAll(packages)
      : Result.ok<ReadonlyRecord<string, string>>({});

  if (Result.isErr(tarballs)) return tarballs;

  if (target === 'local') {
    const advertised = await checkAdvertisedPaths(tarballs.value);

    if (Result.isErr(advertised)) return advertised;
  }

  const generated = await generateSpace(target, spaceDir, packages, {
    updatePins: options?.updatePins ?? false,
  });

  if (Result.isErr(generated)) return generated;

  console.info(
    `Installing into ${path.relative(projectRootPath, spaceDir)} ...`,
  );

  // Neither space can be installed incrementally. The tarballs are packed
  // under names without versions in them, so their paths do not change
  // between runs even though their contents do, and pnpm keys a `file:`
  // dependency on the path. Measured: with `cmd-ts` removed from
  // ts-codemod-cli's dependencies, reinstalling — with `--force`, and with the
  // lockfile deleted — still produced a tree containing `cmd-ts`, and the
  // check passed. Only removing `node_modules` re-extracts the tarball.
  // `latest` in the published space is a moving target for the same reason.
  await fs.rm(path.resolve(spaceDir, 'node_modules'), {
    recursive: true,
    force: true,
  });

  await fs.rm(path.resolve(spaceDir, 'pnpm-lock.yaml'), { force: true });

  // `1>&2` because pnpm reports the fault — `ERR_PNPM_NO_MATCHING_VERSION`,
  // and which package asked for what — on stdout, while Node puts only stderr
  // into the error it hands back. Without the redirect a failed install
  // reached CI as "Command failed: pnpm install" and nothing else.
  const installed = await $(
    `pnpm --dir ${spaceDir} install --no-frozen-lockfile 1>&2`,
    { silent: true },
  );

  if (Result.isErr(installed)) {
    return Result.err(`Install failed: ${installed.value.message}`);
  }

  console.info('ok\n');

  return runChecks(spaceDir, packages);
};

export type Target = 'local' | 'published';

const verifyDir = path.resolve(projectRootPath, 'verify-npm-packages');

const smokeDir = path.resolve(verifyDir, 'smoke');

const tarballDir = path.resolve(verifyDir, '.tarballs');

type PackageToCheck = Readonly<{
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

const collectPaths = (manifest: JsonValue): readonly string[] => {
  if (!isRecord(manifest)) return [];

  const fromTopLevel = (['main', 'module', 'types'] as const)
    .map((key) => manifest[key])
    .filter(isString);

  const binField = manifest['bin'];

  const fromBin = isRecord(binField)
    ? Object.values(binField).filter(isString)
    : isString(binField)
      ? [binField]
      : [];

  return [
    ...fromTopLevel,
    ...fromBin,
    ...collectExportsPaths(manifest['exports']),
  ]
    .filter((p) => p.startsWith('./'))
    .map((p) => p.slice('./'.length));
};

/** `exports` nests conditions arbitrarily deep; every leaf string is a path. */
const collectExportsPaths = (
  exportsField: JsonValue | undefined,
): readonly string[] => {
  if (isString(exportsField)) return [exportsField];

  if (Arr.isArray(exportsField))
    return exportsField.flatMap(collectExportsPaths);

  if (isRecord(exportsField)) {
    return Object.values(exportsField).flatMap(collectExportsPaths);
  }

  return [];
};

/**
 * Writes the space: one project per package, each depending only on that
 * package and the peers it needs, with the shared check copied in.
 *
 * The files are generated and committed, so that CI's repository-is-clean
 * check fails if `verify-npm-packages/smoke/` and the spaces ever disagree.
 */
const generateSpace = async (
  target: Target,
  spaceDir: string,
  packages: readonly PackageToCheck[],
  options: Readonly<{ updatePins: boolean }>,
): Promise<Result<undefined, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.resolve(spaceDir, 'packages'), { recursive: true });

  await writeJson(path.resolve(spaceDir, 'package.json'), {
    name: `verify-npm-packages-${target}`,
    version: '0.0.0',
    private: true,
    type: 'module',
  });

  await writeFile(
    path.resolve(spaceDir, 'pnpm-workspace.yaml'),
    [
      "packages:\n  - 'packages/*'",
      '',
      '# Without this, pnpm fills `node_modules/.pnpm/node_modules` and puts it',
      '# on the resolution path, so a package that forgot to declare a',
      '# dependency still finds it as long as something else depends on it —',
      '# which is exactly the fault these checks look for.',
      'hoist: false',
      '',
      '# What is under test is the packages, not whether someone else’s',
      '# postinstall script is on pnpm’s allow list.',
      'strictDepBuilds: false',
      '',
      '# The repository holds new releases back for a week. Here that would',
      '# mean "published" quietly meaning "published a week ago".',
      'minimumReleaseAge: 0',
      '',
      ...(target === 'local' ? siblingOverrides(spaceDir, packages) : []),
    ].join('\n'),
  );

  for (const pkg of packages) {
    const dir = path.resolve(spaceDir, 'packages', pkg.name);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(dir, { recursive: true });

    const spec =
      target === 'local'
        ? `file:${path.relative(dir, path.resolve(tarballDir, `${pkg.name}.tgz`))}`
        : await publishedVersionPin(dir, pkg.name, options.updatePins);

    if (spec === undefined) {
      return Result.err(
        `Could not determine a published version for ${pkg.name}.`,
      );
    }

    await writeJson(path.resolve(dir, 'package.json'), {
      name: `verify-${pkg.name}`,
      version: '0.0.0',
      private: true,
      type: 'module',
      // Peer dependencies are deliberately not listed. pnpm installs them
      // from the range the *installed* package declares, which is what a
      // consumer gets — and in the published space that is the published
      // range, not this checkout's.
      dependencies: {
        [pkg.name]: spec,
        // A types-only package is checked by compiling against it.
        ...(typesOnlyPackages.has(pkg.name) ? { typescript: 'latest' } : {}),
      },
    });

    const source = path.resolve(smokeDir, smokeFileName(pkg.name));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(source, 'utf8').catch(() => undefined);

    if (content === undefined) {
      return Result.err(`No check for ${pkg.name}: expected ${source}`);
    }

    await writeFile(path.resolve(dir, smokeFileName(pkg.name)), content);

    if (typesOnlyPackages.has(pkg.name)) {
      await writeJson(path.resolve(dir, 'tsconfig.json'), {
        compilerOptions: {
          strict: true,
          noUncheckedIndexedAccess: true,
          target: 'ESNext',
          module: 'NodeNext',
          moduleResolution: 'nodenext',
          noEmit: true,
          skipLibCheck: false,
        },
        include: [smokeFileName(pkg.name)],
      });
    }
  }

  // The generated files are committed, and CI checks the working tree is
  // clean. Formatting them here means regenerating never shows up as a diff
  // just because `JSON.stringify` and Prettier disagree about line breaks.
  const formatted = await formatFilesGlob(
    `${spaceDir}/**/*.{json,mjs,mts,yaml}`,
    {
      silent: true,
    },
  );

  return Result.isErr(formatted)
    ? Result.err(`Failed to format the generated files in ${spaceDir}.`)
    : Result.ok(undefined);
};

/**
 * The packages in this repository depend on each other, and `pnpm pack`
 * resolves `workspace:^` to the version in the checkout — so the tarball of
 * `github-settings-as-code` asks for `octokit-safe-types@^1.2.26` while npm
 * still has 1.2.25. Nearly every package here has a dependent, so without
 * these overrides a `chore: version packages` branch fails to install at all
 * — `ERR_PNPM_NO_MATCHING_VERSION`, until the release it exists to make goes
 * out.
 *
 * Off a version branch the range did resolve, but to the sibling on npm,
 * which is the older one. The `local` space is meant to be what the next
 * release will be, and the packages in it are released together, so the
 * sibling it installs should come from this checkout either way. That the
 * declared range matches what is published is the `published` space's
 * question, not this one's.
 */
const siblingOverrides = (
  spaceDir: string,
  packages: readonly PackageToCheck[],
): readonly string[] => [
  '# Depend on the sibling packed from this checkout, not the older one on',
  '# npm — on a version branch the bumped version is not published at all.',
  'overrides:',
  ...packages.map(
    (pkg) =>
      `  '${pkg.name}': 'file:${path.relative(spaceDir, path.resolve(tarballDir, `${pkg.name}.tgz`))}'`,
  ),
  '',
];

/**
 * The published space pins an exact version, committed, rather than tracking
 * `latest`. Two reasons: the check then only has something new to say when the
 * pin moves, and it cannot start failing on its own the moment a release goes
 * out. `--update` moves the pins, and `pnpm-update` is what runs it — a
 * version bump arrives as a reviewable diff like any other dependency.
 */
const publishedVersionPin = async (
  dir: string,
  packageName: string,
  updatePins: boolean,
): Promise<string | undefined> => {
  const existing = updatePins
    ? undefined
    : await readPinnedVersion(dir, packageName);

  if (existing !== undefined) return existing;

  const latest = await $(`npm view ${packageName} version`, { silent: true });

  return Result.isErr(latest) ? undefined : latest.value.stdout.trim();
};

const readPinnedVersion = async (
  dir: string,
  packageName: string,
): Promise<string | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const raw = await fs
    .readFile(path.resolve(dir, 'package.json'), 'utf8')
    .catch(() => undefined);

  if (raw === undefined) return undefined;

  const parsed = Json.parse(raw);

  if (Result.isErr(parsed) || !isRecord(parsed.value)) return undefined;

  const deps = parsed.value['dependencies'];

  if (!isRecord(deps)) return undefined;

  const pinned = deps[packageName];

  return isString(pinned) ? pinned : undefined;
};

/**
 * A package that publishes types only is checked by compiling against it
 * rather than importing it — there is nothing to import. Its check is written
 * as `.mts`, and the presence of that file is what selects the mode.
 */
const smokeFileName = (packageName: string): string =>
  typesOnlyPackages.has(packageName)
    ? `${packageName}.mts`
    : `${packageName}.mjs`;

const typesOnlyPackages: ReadonlySet<string> = new Set(['ts-type-forge']);

const runChecks = async (
  spaceDir: string,
  packages: readonly PackageToCheck[],
): Promise<Result<undefined, string>> => {
  console.info('Running the checks...');

  const mut_failures: string[] = [];

  for (const pkg of packages) {
    const dir = path.resolve(spaceDir, 'packages', pkg.name);

    const file = smokeFileName(pkg.name);

    // `--import isolate.mjs` refuses any resolution outside the space. These
    // projects sit inside the monorepo, so without it Node walks up into the
    // repository's own `node_modules` and a package missing a dependency finds
    // it there — the check then passes on a package a consumer cannot use.
    // Through NODE_OPTIONS rather than an argument, so that a check which
    // spawns the package's own executable — several do — carries the boundary
    // into that child process too.
    const isolation = `VERIFY_SPACE_ROOT=${spaceDir} NODE_OPTIONS='--import ${path.resolve(verifyDir, 'isolate.mjs')}'`;

    const cmd = file.endsWith('.mts')
      ? `${path.resolve(dir, 'node_modules', '.bin', 'tsc')} --noEmit -p ${path.resolve(dir, 'tsconfig.json')}`
      : `${isolation} node ${path.resolve(dir, file)}`;

    const result = await $(cmd, { silent: true });

    if (Result.isErr(result)) {
      mut_failures.push(pkg.name);

      console.error(`  ✗ ${pkg.name}\n${indent(result.value.message)}`);
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

const indent = (text: string): string =>
  text
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');

const writeJson = async (file: string, value: unknown): Promise<void> => {
  await writeFile(file, `${JSON.stringify(value, undefined, 2)}\n`);
};

const writeFile = async (file: string, content: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(file, content);
};

const readPublishablePackages = async (): Promise<
  readonly PackageToCheck[]
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return packages
    .filter((pkg) =>
      isRecord(pkg.packageJson) ? pkg.packageJson['private'] !== true : false,
    )
    .map((pkg) => ({
      name: pkg.name,
      path: pkg.path,
      manifest: pkg.packageJson,
    }));
};

if (isDirectlyExecuted(import.meta.url)) {
  const target: Target = process.argv.includes('--published')
    ? 'published'
    : 'local';

  const result = await verifyNpmPackages(target, {
    updatePins: process.argv.includes('--update'),
  });

  if (Result.isErr(result)) {
    console.error(`\n❌ ${result.value}`);

    process.exit(1);
  }

  console.info(`\n✅ The ${target} packages import and run.`);
}
