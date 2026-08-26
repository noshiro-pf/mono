import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Json, Num, Result, pipe } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { makeEmptyDir, pathExists } from 'ts-repo-utils';
import { type Context } from '../context.mjs';
import { type ConverterConfig } from '../convert-dts/common.mjs';
import { typeUtilsName } from '../convert-dts/constants.mjs';
import { formatDir } from './utils/format.mjs';
import { replaceWithNoMatchCheck } from './utils/node-utils.mjs';

/**
 * Copied verbatim into every bundle from `scripts-common/assets/`. It is
 * plain JavaScript because it runs from inside a consumer's `node_modules`,
 * where nothing of ours is available to it.
 */
const LINKER_FILE = 'link-libs.mjs';

/**
 * The published package needs one of its own. `changeset publish` releases
 * this package — it is not private — and the changesets action reads the
 * changelog of every package whose version moved, to build the release notes.
 * The version moves here on every release, because `changeset:version-packages`
 * regenerates these manifests after `changeset version` has bumped the
 * harnesses. Without the file the release fails outright, before publishing
 * anything: `ENOENT: ... strict-lib/v5.0/output/lib/CHANGELOG.md`.
 */
const CHANGELOG_FILE = 'CHANGELOG.md';

/** The subset of `package.json` fields this generator reads. */
const packageJsonType = t.record({
  name: t.optional(t.string()),
  private: t.optional(t.boolean()),
  version: t.optional(t.string()),
  devDependencies: t.optional(t.keyValueRecord(t.string(), t.string())),
});

type PackageJson = t.TypeOf<typeof packageJsonType>;

const parsePackageJson = (jsonStr: string): PackageJson | undefined => {
  const parsed = Json.parse(jsonStr);

  if (Result.isErr(parsed)) return undefined;

  const result = packageJsonType.validate(parsed.value);

  return Result.isOk(result) ? result.value : undefined;
};

/**
 * Generate the published package: `output/lib`, with `libs/` and
 * `libs-branded/` inside it.
 */
export const genPackages = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const { paths } = ctx;

  const version = await getSubPackageVersion(ctx);

  if (version === undefined) {
    return Result.err(
      `version field is missing in ${paths.strictTsLib.source.packageJson}`,
    );
  }

  const tsTypeForgeRange = await getTsTypeForgeRange(ctx);

  if (tsTypeForgeRange === undefined) {
    return Result.err(
      `${typeUtilsName} is missing from devDependencies in source/package.json`,
    );
  }

  const results = await Promise.all(
    ctx.configs.map((config) =>
      createPackages(ctx, config, version, tsTypeForgeRange),
    ),
  );

  for (const res of results) {
    if (Result.isErr(res)) {
      return res;
    }
  }

  // After both flavors, not inside either: they run concurrently and share
  // `output/lib`, and this writes and formats a file that sits directly in it.
  // Doing it from one of the passes is how the torn-manifest bug happened
  // before — two writers on one path, and the next oxfmt pass dies parsing the
  // result.
  const bundleResult = await genBundlePackage(ctx, version, tsTypeForgeRange);

  if (Result.isErr(bundleResult)) {
    return bundleResult;
  }

  return Result.ok(undefined);
};

// Generate declarations into the published package, one flavor per call
const createPackages = async (
  ctx: Context,
  config: ConverterConfig,
  subPackageVersion: string,
  tsTypeForgeRange: string,
): Promise<Result<undefined, unknown>> => {
  const { paths, versionConfig } = ctx;

  // Each flavor owns one subdirectory of the published package, so emptying
  // it cannot disturb the other flavor or the manifest beside them both.
  const outDir =
    paths.strictTsLib.output.lib[
      config.useBrandedNumber ? 'libsBranded' : 'libs'
    ].$;

  await makeEmptyDir(outDir);

  const packageDirList = await getPackageDirListFromLibFiles(ctx, config);

  console.info(
    'target directories:',
    packageDirList.map((a) => path.resolve(outDir, a.packageRelativePath)),
  );

  const results = await Promise.all(
    packageDirList.map(async ({ filename, packageRelativePath }) => {
      const outputDir = path.resolve(outDir, packageRelativePath);

      if (!(await pathExists(outputDir))) {
        await fs.mkdir(outputDir, { recursive: true });
      }

      // index.d.ts (rewrite `<reference path>` back into `<reference lib>`)
      {
        const outputFile = path.resolve(outputDir, 'index.d.ts');

        const content = await fs.readFile(
          path.resolve(
            paths.strictTsLib.output[
              config.useBrandedNumber ? 'libFilesBranded' : 'libFiles'
            ].$,
            filename,
          ),
          { encoding: 'utf8' },
        );

        await fs.writeFile(
          outputFile,
          pipe(content).map(
            replaceWithNoMatchCheck(
              /\/\/\/ <reference path="\.\/lib\.(.+)\.d\.ts" \/>/gu,
              '/// <reference lib="$1" />',
              {
                onNotFound: 'off',
              },
            ),
          ).value,
        );

        console.info(`${outputFile} generated.`);
      }

      // package.json — only where something actually resolves it.
      //
      // Every generated lib directory used to get one, naming it as its own
      // publishable package. That was the point of the per-lib layout, and the
      // bundle replaced it: the published package ships the declarations and
      // nothing else, and the workspace globs never reached in here.
      //
      // What still needs a manifest is the harness's own `lib-check`. It sets
      // `libReplacement: true` and lets tsc resolve `@typescript/lib-<group>`
      // by name out of `node_modules`, which works because each harness
      // devDepends on `file:output/lib/libs/<group>`. `paths` would not do:
      // TypeScript resolves lib replacements with a fixed Node10 lookup that
      // ignores `paths` (measured on 6.0.3), and these harnesses span tsc 5.0
      // to 7.0.
      //
      // So: top-level group directories of the non-branded flavor, which is
      // exactly the set those devDependencies name. Sub-libs
      // (`es2020/bigint`) and everything branded are reachable through the
      // group's own `<reference lib>` graph and are never resolved by name.
      if (!config.useBrandedNumber && !packageRelativePath.includes('/')) {
        const outputFile = path.resolve(outputDir, 'package.json');

        // Non-branded and top-level by the guard above, so neither the
        // `-branded` suffix nor flattening a nested path applies here.
        const subPackageName =
          `${versionConfig.libName}-${packageRelativePath}` as const;

        await fs.writeFile(
          outputFile,

          JSON.stringify({
            name: subPackageName,
            version: subPackageVersion,
            private: false,
            description: 'Strict TypeScript lib',
            repository: {
              type: 'git',
              url: versionConfig.repo,
            },
            license: versionConfig.license,
            author: 'noshiro-pf <noshiro.pf@gmail.com>',
            sideEffects: false,
            type: 'module',
            types: './index.d.ts',
            // ts-type-forge is a real runtime-resolvable dependency: the
            // generated lib references its types via `import('ts-type-forge')`,
            // so consumers must have it installed (not merely provide it).
            dependencies: {
              [typeUtilsName]: tsTypeForgeRange,
            },
            peerDependencies: {
              typescript: versionConfig.typescriptVersionRange,
            },
          }),
        );

        console.info(`${outputFile} generated.`);
      }

      return Result.ok(undefined);
    }),
  );

  for (const res of results) {
    if (Result.isErr(res)) {
      return res;
    }
  }

  return Result.ok(undefined);
};

/**
 * Generates the published package's manifest and README at `output/lib`.
 *
 * This is the only package a consumer installs, and it sits beside the
 * declarations rather than above them: `libs/` and `libs-branded/` are written
 * into this same directory by the two flavor passes, so what is on disk is
 * what ships.
 *
 * It used to be an umbrella whose dependencies were the ~107 per-lib packages,
 * one URL each, so that a package manager would resolve them transitively and
 * the consumer needed no configuration. That worked while the per-lib packages
 * came from a registry. It stopped working when distribution moved to GitHub
 * Release assets, because pnpm refuses URL *sub*dependencies
 * (`ERR_PNPM_EXOTIC_SUBDEP`) — and lifting that requires `blockExoticSubdeps:
 * false` *and* `publicHoistPattern`, since a transitive dependency never
 * reaches the root `node_modules` where `libReplacement` looks. Shipping the
 * libs inside this package removes both: the only dependency a consumer
 * declares is direct, which pnpm always allows, and `paths` points TypeScript
 * at `libs/*` or `libs-branded/*`.
 */
const genBundlePackage = async (
  ctx: Context,
  version: string,
  tsTypeForgeRange: string,
): Promise<Result<undefined, unknown>> => {
  const { paths, versionConfig } = ctx;

  const bundleDir = paths.strictTsLib.output.lib.$;

  const libName = versionConfig.libName;

  // Not `makeEmptyDir`: `libs/` and `libs-branded/` live in here and are
  // written by the passes around this one.
  await fs.mkdir(bundleDir, { recursive: true });

  await fs.writeFile(
    path.resolve(bundleDir, 'package.json'),
    JSON.stringify({
      name: libName,
      version,
      private: false,
      description: `Strict TypeScript ${versionConfig.typescriptVersion} standard library (all libs in one package)`,
      repository: { type: 'git', url: versionConfig.repo },
      license: versionConfig.license,
      author: 'noshiro-pf <noshiro.pf@gmail.com>',
      sideEffects: false,
      type: 'module',
      // The per-group `package.json` files under `libs/` are excluded: they
      // exist so that this repository's own harnesses can resolve
      // `@typescript/lib-<group>` by name, which is the only way TypeScript 6
      // and earlier find a replacement (their lib resolution is a fixed Node10
      // lookup that ignores `paths`). Publishing them would not help a
      // consumer — reaching them by name means a dependency on a directory
      // inside `node_modules`, which pnpm refuses. `link-libs.mjs` answers
      // that lookup instead, with a symlink per group.
      files: [
        'libs',
        'libs-branded',
        '!libs/**/package.json',
        LINKER_FILE,
        CHANGELOG_FILE,
      ],
      // Named after the package so that two of these installed side by side
      // do not fight over one command.
      bin: { [`${libName}-link`]: `./${LINKER_FILE}` },
      // ts-type-forge is a real runtime-resolvable dependency: the generated
      // lib references its types via `import('ts-type-forge')`, so consumers
      // must have it installed (not merely provide it). Declaring it here
      // covers every `libs/*` at once — they resolve it by walking up out of
      // this package's own directory.
      dependencies: {
        [typeUtilsName]: tsTypeForgeRange,
      },
      peerDependencies: {
        typescript: versionConfig.typescriptVersionRange,
      },
    }),
  );

  const linkerPath = path.resolve(bundleDir, LINKER_FILE);

  await fs.copyFile(
    path.resolve(import.meta.dirname, '../../assets', LINKER_FILE),
    linkerPath,
  );

  // Explicitly, rather than inheriting the asset's mode: this is a `bin`, and
  // a package manager installing the package sets the bit itself. Without this
  // the two disagree — `pnpm install` writes 755, regeneration writes back
  // 644 — and the working tree flips between them, which is a dirty
  // repository as far as CI is concerned.
  await fs.chmod(linkerPath, 0o755);

  await fs.writeFile(
    path.resolve(bundleDir, CHANGELOG_FILE),
    await bundleChangelog(paths.strictTsLib.$, libName),
  );

  const repoUrl = versionConfig.repo.replace(/\.git$/u, '');

  await fs.writeFile(
    path.resolve(bundleDir, 'README.md'),
    [
      `# ${libName}`,
      '',
      `Strict rewrite of TypeScript ${versionConfig.typescriptVersion}'s built-in`,
      'standard library declarations.',
      '',
      '```sh',
      `npm install -D ${libName}`,
      '```',
      '',
      'Every built-in library ships inside this one package, in two flavors:',
      '',
      '- `libs/` — plain `number`',
      '- `libs-branded/` — branded number types (`Uint8`, `SafeUint`, …)',
      '',
      ...setupSection(libName, versionConfig.typescriptVersion),
      `See <${repoUrl}> for usage and version support.`,
      '',
    ].join('\n'),
  );

  // Format only what was just written. The bundle lives at `output*/lib`, one
  // level above `output*/packages`, so the pipeline's `format output*/packages`
  // steps do not reach it — which is why this used to shell out to
  // `pnpm -w run fmt`. That formats the whole repository (~7900 files), and
  // `ws:gen:packages` runs versions concurrently, so those repo-wide passes
  // read and rewrote *other* versions' `output*/packages/**` `package.json`
  // while those versions were still writing them. Two writers on one path
  // leaves a torn file — a minified body followed by the tail of the previous
  // formatted one — and the next oxfmt pass dies parsing it (`Expected ',' or
  // ')' but found 'Identifier'`, exit 2), taking the release down with it.
  const formatRes = await formatDir(bundleDir);

  if (Result.isErr(formatRes)) return formatRes;

  console.info(`${bundleDir} (bundle package) generated.`);

  return Result.ok(undefined);
};

/**
 * How a consumer points TypeScript at the flavor they chose — which differs by
 * TypeScript version, so each package documents only its own.
 *
 * TypeScript resolves a lib replacement in one of two ways, and they are
 * exclusive. Measured, package against its own TypeScript:
 *
 * | TypeScript | route          | `libReplacement`                     |
 * | :--------- | :------------- | :----------------------------------- |
 * | 5.0 – 5.7  | name lookup    | not a known option; setting it errors |
 * | 5.8 – 5.9  | name lookup    | defaults to on                        |
 * | 6.x        | name lookup    | defaults to **off**; must be set      |
 * | 7.x        | `paths`        | defaults to **off**; must be set      |
 */
const setupSection = (
  libName: string,
  typescriptVersion: string,
): readonly string[] => {
  const [major = 0, minor = 0] = typescriptVersion
    .split('.')
    .map((part) => Result.unwrapOkOr(Num.safeParseInt(part), 0));

  if (major >= 7) {
    return [
      'Point `paths` at the one you want, in your `tsconfig.json`:',
      '',
      '```jsonc',
      '{',
      '    "compilerOptions": {',
      '        "libReplacement": true,',
      '        "paths": {',
      `            "@typescript/lib-*": ["./node_modules/${libName}/libs/*"],`,
      '        },',
      '    },',
      '}',
      '```',
      '',
      'Two things to watch, because both fail silently — the replacement simply',
      'does not happen, with no error:',
      '',
      '- **`paths` is replaced, not merged, by a config that `extends` another**,',
      '  so it has to be written in whichever config TypeScript actually loads.',
      '- **The path is relative to the config that contains it**, which in a',
      '  monorepo package is usually `../../node_modules/…`.',
      '',
    ];
  }

  return [
    `TypeScript ${major}.${minor} resolves \`@typescript/lib-*\` as ordinary`,
    'package names, through a fixed Node10 lookup — it does not read `paths`',
    'for this. Run the linker this package ships to supply those names. It',
    'creates one symlink per lib group under `node_modules/@typescript/`:',
    '',
    '```sh',
    `npx ${libName}-link             # plain \`number\``,
    `npx ${libName}-link --branded   # branded number types`,
    '```',
    '',
    'Add it to your own `package.json` so that a reinstall restores the links:',
    '',
    '```jsonc',
    '{',
    '    "scripts": {',
    `        "prepare": "${libName}-link",`,
    '    },',
    '}',
    '```',
    '',
    ...(major >= 6
      ? [
          'Then set `libReplacement` — it defaults to off from TypeScript 6, and',
          'the lookup does not happen without it:',
          '',
          '```jsonc',
          '{',
          '    "compilerOptions": {',
          '        "libReplacement": true,',
          '    },',
          '}',
          '```',
          '',
        ]
      : minor >= 8
        ? [
            'Nothing goes in `tsconfig.json`: `libReplacement` defaults to on at',
            `TypeScript ${major}.${minor}. Just do not turn it off.`,
            '',
          ]
        : [
            'Nothing goes in `tsconfig.json`: the lookup is unconditional at',
            `TypeScript ${major}.${minor}, where \`libReplacement\` is not yet a known`,
            'option — setting it is an error.',
            '',
          ]),
    '`--unlink` removes the links again.',
    '',
  ];
};

/**
 * The bundle's changelog, taken from the harness that changesets actually
 * manages. The two share a version — the `fixed` group keeps every harness on
 * one, and this package's `version` is written from it — so their entries are
 * the same. Only the heading differs: the harness is named `…-source`, and a
 * consumer reading this on npm wants the name they installed.
 *
 * `changeset version` rewrites the harness changelog before
 * `strict-lib:gen:packages` runs, so the entry for the new version is already
 * there by the time this copies it.
 */
const bundleChangelog = async (
  harnessDir: string,
  libName: string,
): Promise<string> => {
  const harnessChangelog = await fs
    .readFile(path.resolve(harnessDir, CHANGELOG_FILE), 'utf8')
    .catch(() => undefined);

  // Before the first release there is nothing to carry over, and the file
  // still has to exist: the changesets action reads it either way.
  if (harnessChangelog === undefined) return `# ${libName}\n`;

  const [heading, ...rest] = harnessChangelog.split('\n');

  // Swap the harness's `# …-source` heading for the published name, and keep
  // everything below it. A harness that somehow has no heading keeps its whole
  // text, under a heading of ours.
  return heading?.startsWith('# ') === true
    ? `# ${libName}\n${rest.join('\n')}`
    : `# ${libName}\n\n${harnessChangelog}`;
};

const getPackageDirListFromLibFiles = async (
  ctx: Context,
  config: ConverterConfig,
): Promise<
  readonly Readonly<{ filename: string; packageRelativePath: string }>[]
> => {
  const libFilesDir =
    ctx.paths.strictTsLib.output[
      config.useBrandedNumber ? 'libFilesBranded' : 'libFiles'
    ].$;

  const filenames = await fs.readdir(libFilesDir);

  return filenames
    .filter((filename) => /^lib.*\.d\.ts$/u.test(filename))
    .filter((filename) => filename !== 'lib.d.ts')
    .map((filename) => ({
      filename,
      packageRelativePath: libFilenameToPath(filename),
    }));
};

/**
 * "lib.es2018.asynciterable.d.ts" -> "es2018/asynciterable"
 * "lib.es2015.symbol.wellknown.d.ts" -> "es2015/symbol-wellknown"
 *
 * Mirrors TypeScript's own `getLibraryNameFromLibFileName`: only the FIRST
 * component after the lib group becomes a path segment, and any further
 * components are joined with `-`. Replacing every dot with `/` instead nests the
 * three-component lib files one level too deep (`es2015/symbol/wellknown`),
 * which is a subpath `libReplacement` never looks up — so those lib files are
 * published but silently ignored, and consumers keep getting the stock
 * declarations for them.
 */
const libFilenameToPath = (libFilename: string): string => {
  const stem = libFilename.replaceAll('lib.', '').replaceAll('.d.ts', '');

  const firstDot = stem.indexOf('.');

  return firstDot === -1
    ? stem
    : `${stem.slice(0, firstDot)}/${stem
        .slice(firstDot + 1)
        .replaceAll('.', '-')}`;
};

const getSubPackageVersion = async (
  ctx: Context,
): Promise<string | undefined> => {
  const packageJsonStr = await fs.readFile(
    ctx.paths.strictTsLib.source.packageJson,
    { encoding: 'utf8' },
  );

  return parsePackageJson(packageJsonStr)?.version;
};

/** Major version of the `ts-type-forge` this workspace actually installed. */
const installedTypeForgeMajor = async (
  ctx: Context,
): Promise<string | undefined> => {
  const installed = await fs
    .readFile(
      path.resolve(
        ctx.paths.root,
        'node_modules',
        typeUtilsName,
        'package.json',
      ),
      { encoding: 'utf8' },
    )
    .catch(() => undefined);

  if (installed === undefined) return undefined;

  return /(\d+)/u.exec(parsePackageJson(installed)?.version ?? '')?.[1];
};

const getTsTypeForgeRange = async (
  ctx: Context,
): Promise<string | undefined> => {
  const packageJsonStr = await fs.readFile(
    ctx.paths.strictTsLibSourcePackageJsonPath,
    { encoding: 'utf8' },
  );

  const value =
    parsePackageJson(packageJsonStr)?.devDependencies?.[typeUtilsName];

  if (value === undefined) return undefined;

  // The declaration carries a version to read when it is a plain range, and
  // nothing to read when it is `workspace:*` — which is what it says inside a
  // monorepo that builds `ts-type-forge` itself. Fall back to the version that
  // actually got installed, so the published range describes the library the
  // declarations were generated against either way.
  const major =
    /(\d+)/u.exec(value)?.[1] ?? (await installedTypeForgeMajor(ctx));

  // Relax the peer range to a major-version match (e.g. "7.2.1" -> "^7.0.0"),
  // so consumers are not pinned to the exact ts-type-forge version the lib was
  // generated with. This is why `update-packages` filters the generated
  // bundles out: `pnpm update --latest` would write the exact current version
  // into all twelve manifests and the next run of this generator would undo it.
  return major === undefined ? undefined : `^${major}.0.0`;
};
