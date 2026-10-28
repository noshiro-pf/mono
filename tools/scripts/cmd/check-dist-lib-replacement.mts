import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  Arr,
  asUint32,
  hasKey,
  isRecord,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when what a package's `build` compiles would change with the standard
 * library: each `configs/tsconfig.build.json` is compiled twice, with
 * `--libReplacement true` and `false`, and the two outputs have to be
 * identical byte for byte.
 *
 * A package that opts in is type-checked against the strict library
 * (`tsconfig.json`) but built against the stock one, because
 * `configs/tsconfig.build.json` extends the shared configs rather than
 * `tsconfig.json`, and none of them sets `libReplacement`. That is sound only
 * while the two libraries spell every emitted declaration the same way. A
 * type inferred from a library call — `export const keys = Object.keys(r)`,
 * which `explicit-function-return-type` does not reach — is spelled
 * differently by each, and the strict spelling names `StrictLibInternals`,
 * which no consumer has. Before this, the comparison was made by hand at each
 * opt-in (docs/strict-typescript-lib-integration.md), and a change after it
 * failed nothing.
 *
 * Only the compiler is run, into a temporary directory: the strip pass and
 * whatever else `build` does after it are deterministic, so identical
 * compiler output is identical `dist/`. Each run's `--listFiles` has to show
 * the strict bundle loaded with `true` and not with `false`, so that a match
 * cannot come from two runs on the same library.
 *
 * The packages compared are the workspace members whose `tsconfig.json` sets
 * `libReplacement` to `true` and that have a `configs/tsconfig.build.json`.
 * The apps have none — Vite emits their JavaScript, which no library changes.
 * The rest of the build's inputs are the siblings' `dist/`, hence the
 * `assert-deps-built.mts --workspace` in front of this script.
 */
export const checkDistLibReplacement = async (): Promise<
  Result<number, string>
> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const strictLibRoot = await fs
    .realpath(path.resolve(projectRootPath, 'node_modules', BUNDLE_NAME))
    .catch(() => undefined);

  if (strictLibRoot === undefined) {
    return Result.err(`${BUNDLE_NAME} is not installed; run \`pnpm install\`.`);
  }

  const targets = await findTargets();

  const workDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'check-dist-lib-replacement-'),
  );

  try {
    const reports = await mapWithConcurrency(targets, CONCURRENCY, (target) =>
      compareTarget({ target, strictLibRoot, workDir }),
    );

    const failures = reports.filter((report) => report !== undefined);

    if (Arr.isNonEmpty(failures)) {
      return Result.err(
        [
          `❌ ${failures.length} of ${targets.length} package(s) compile differently with the strict standard library:`,
          '',
          ...failures,
          'A declaration whose type is inferred from a standard library call is',
          'spelled differently by each library. Write the type out (a return',
          'type, or an annotation on the exported binding) so that it does not',
          'depend on which library compiled it. See',
          'docs/strict-typescript-lib-integration.md.',
        ].join('\n'),
      );
    }

    return Result.ok(targets.length);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
};

/**
 * Whether a `tsconfig.json`'s own `compilerOptions` set `libReplacement` to
 * `true`. Inherited values are not looked at: `check:root:tsconfig-lib-replacement`
 * requires every member to state it in the file itself.
 */
export const optsIntoStrictLib = (content: string): boolean => {
  const parsed: unknown = ts.parseConfigFileTextToJson(
    'tsconfig.json',
    content,
  ).config;

  return (
    isRecord(parsed) &&
    hasKey(parsed, 'compilerOptions') &&
    isRecord(parsed.compilerOptions) &&
    hasKey(parsed.compilerOptions, 'libReplacement') &&
    parsed.compilerOptions.libReplacement === true
  );
};

/**
 * The files that differ between two output directories, by path relative to
 * them, in path order. A file present on one side only is a difference.
 */
export const compareOutputs = async (
  withStrictLib: string,
  withStockLib: string,
): Promise<readonly Difference[]> => {
  const [strictFiles, stockFiles] = await Promise.all([
    listFilesRecursively(withStrictLib),
    listFilesRecursively(withStockLib),
  ]);

  const strictSet = new Set(strictFiles);

  const stockSet = new Set(stockFiles);

  const all = Arr.uniq([...strictFiles, ...stockFiles]).toSorted();

  const differences = await Promise.all(
    all.map(async (file): Promise<Difference | undefined> => {
      if (!stockSet.has(file)) {
        return { file, kind: 'strict-only' };
      }

      if (!strictSet.has(file)) {
        return { file, kind: 'stock-only' };
      }

      const [a, b] = await Promise.all([
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.join(withStrictLib, file)),
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.join(withStockLib, file)),
      ]);

      return a.equals(b) ? undefined : { file, kind: 'content' };
    }),
  );

  return differences.filter((difference) => difference !== undefined);
};

export type Difference = Readonly<{
  file: string;
  kind: 'content' | 'stock-only' | 'strict-only';
}>;

type Target = Readonly<{
  /** Relative to the repository root, for messages. */
  relativeDir: string;
  buildConfig: string;
  /**
   * Whether the build config sets `declarationDir`, which then has to be
   * redirected along with `outDir`. Passing it when the config does not emit
   * declarations is an error (TS5069), so it is not passed unconditionally.
   */
  hasDeclarationDir: boolean;
}>;

type CompileResult = Readonly<{
  succeeded: boolean;
  /** The compiler's own output: `--listFiles`, then any diagnostics. */
  output: string;
}>;

const BUNDLE_NAME = 'strict-ts-lib-v7.0';

/**
 * How many packages are compiled at once, two compilers each. The native
 * compiler is itself multi-threaded, and the runners have four cores.
 */
const CONCURRENCY = 3;

/**
 * The native compiler, the one `build` runs. See the comment on `nativeTsc`
 * in a library's `scripts/cmd/build.mts`.
 */
const nativeTsc = path.resolve(
  projectRootPath,
  'node_modules/typescript-native/bin/tsc',
);

const findTargets = async (): Promise<readonly Target[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const targets = await Promise.all(
    packages.map(async (pkg): Promise<Target | undefined> => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const tsconfig = await fs
        .readFile(path.join(pkg.path, 'tsconfig.json'), 'utf8')
        .catch(() => undefined);

      const buildConfig = path.join(pkg.path, 'configs/tsconfig.build.json');

      const hasBuildConfig = await fs
        .access(buildConfig)
        .then(() => true)
        .catch(() => false);

      return hasBuildConfig &&
        tsconfig !== undefined &&
        optsIntoStrictLib(tsconfig)
        ? {
            relativeDir: path.relative(projectRootPath, pkg.path),
            buildConfig,
            hasDeclarationDir: hasDeclarationDir(buildConfig),
          }
        : undefined;
    }),
  );

  return targets
    .filter((target) => target !== undefined)
    .toSorted((a, b) => a.relativeDir.localeCompare(b.relativeDir));
};

const hasDeclarationDir = (buildConfig: string): boolean =>
  ts.getParsedCommandLineOfConfigFile(
    buildConfig,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: () => {},
    },
  )?.options.declarationDir !== undefined;

/**
 * Compiles one package both ways and returns what to report, or `undefined`
 * when the outputs are identical.
 */
const compareTarget = async ({
  target,
  strictLibRoot,
  workDir,
}: Readonly<{
  target: Target;
  strictLibRoot: string;
  workDir: string;
}>): Promise<string | undefined> => {
  // Both output directories sit at the same depth, so the relative source
  // paths written into the source maps are the same on both sides.
  const outDir = (libReplacement: boolean): string =>
    path.join(
      workDir,
      target.relativeDir.replaceAll(path.sep, '__'),
      libReplacement ? 'true' : 'false',
    );

  const [strict, stock] = await Promise.all([
    compile(target, true, outDir(true)),
    compile(target, false, outDir(false)),
  ]);

  const header = `  ${target.relativeDir}` as const;

  const failedRuns = [
    ...(strict.succeeded
      ? ([] as const)
      : ([['true', strict.output]] as const)),
    ...(stock.succeeded ? ([] as const) : ([['false', stock.output]] as const)),
  ] as const;

  if (Arr.isNonEmpty(failedRuns)) {
    return [
      header,
      ...failedRuns.map(
        ([value, output]) =>
          `    did not compile with \`--libReplacement ${value}\`:\n${indent(diagnosticsOf(output))}`,
      ),
      '',
    ].join('\n');
  }

  const loadsStrictLib = (output: string): boolean =>
    output
      .split('\n')
      .some((line) => line.startsWith(`${strictLibRoot}${path.sep}`));

  if (!loadsStrictLib(strict.output) || loadsStrictLib(stock.output)) {
    return [
      header,
      `    \`--libReplacement\` did not switch the library (strict bundle loaded with true: ${loadsStrictLib(strict.output)}, with false: ${loadsStrictLib(stock.output)}).`,
      '    Run `pnpm run check:root:strict-lib-links`.',
      '',
    ].join('\n');
  }

  const differences = await compareOutputs(outDir(true), outDir(false));

  if (!Arr.isNonEmpty(differences)) {
    return undefined;
  }

  const details = await Promise.all(
    differences.map(async ({ file, kind }) => {
      switch (kind) {
        case 'strict-only':
          return `    ${file}: emitted only with \`--libReplacement true\``;

        case 'stock-only':
          return `    ${file}: emitted only with \`--libReplacement false\``;

        // A source map differs whenever the file it maps does, and its
        // one-line diff says nothing the other one does not.
        case 'content':
          return file.endsWith('.map')
            ? `    ${file}: differs`
            : `    ${file}:\n${indent(
                await unifiedDiff(
                  path.join(outDir(true), file),
                  path.join(outDir(false), file),
                  file,
                ),
              )}`;
      }
    }),
  );

  return [header, ...details, ''].join('\n');
};

/**
 * Runs the native compiler on the build config with `libReplacement` forced
 * either way and the output redirected.
 */
const compile = (
  target: Target,
  libReplacement: boolean,
  outDir: string,
): Promise<CompileResult> =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      [
        nativeTsc,
        '-p',
        target.buildConfig,
        '--libReplacement',
        libReplacement ? 'true' : 'false',
        '--outDir',
        outDir,
        ...(target.hasDeclarationDir ? ['--declarationDir', outDir] : []),
        '--listFiles',
      ],
      { cwd: projectRootPath, maxBuffer: 2 ** 26 },
      (error, stdout, stderr) => {
        resolve({ succeeded: error === null, output: `${stdout}${stderr}` });
      },
    );
  });

/** `--listFiles` interleaves file paths with diagnostics; keep the latter. */
const diagnosticsOf = (output: string): string =>
  output
    .split('\n')
    .filter((line) => line !== '' && !path.isAbsolute(line))
    .join('\n');

const unifiedDiff = (
  withStrictLib: string,
  withStockLib: string,
  label: string,
): Promise<string> =>
  new Promise((resolve) => {
    execFile(
      'diff',
      [
        '-u',
        '--label',
        `${label} (--libReplacement true)`,
        '--label',
        `${label} (--libReplacement false)`,
        withStrictLib,
        withStockLib,
      ],
      { maxBuffer: 2 ** 26 },
      (_error, stdout, stderr) => {
        resolve(`${stdout}${stderr}`.trimEnd());
      },
    );
  });

const listFilesRecursively = async (
  dir: string,
): Promise<readonly string[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await fs
    .readdir(dir, { recursive: true, withFileTypes: true })
    .catch(() => []);

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(dir, path.join(entry.parentPath, entry.name)),
    );
};

const indent = (text: string): string =>
  text
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');

/**
 * `Promise.all(items.map(fn))`, with at most `concurrency` calls in flight.
 */
const mapWithConcurrency = async <A, B>(
  items: readonly A[],
  concurrency: number,
  fn: (item: A) => Promise<B>,
): Promise<readonly B[]> => {
  const mut_results: B[] = [];

  const mut_cursor = { next: 0 };

  const worker = async (): Promise<void> => {
    while (mut_cursor.next < items.length) {
      const index = mut_cursor.next;

      mut_cursor.next += 1;

      const item = items[index];

      if (item !== undefined) {
        // One package at a time per worker is the point of the pool.

        mut_results[index] = await fn(item);
      }
    }
  };

  await Promise.all(Arr.seq(asUint32(concurrency)).map(worker));

  return mut_results;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDistLibReplacement().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} package(s) compile to the same output with and without the strict standard library.`,
  );
}
