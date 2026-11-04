import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { RUNTIME_DEPENDENCY_FIELDS } from '../lib/dependency-fields.mjs';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a SynState benchmark source imports a workspace package the
 * baseline cache key of `synstate-benchmark.yml` does not digest.
 *
 * The key ("Compute the baseline cache key") digests the source of the
 * workspace packages `@synstate/docs` reaches through its runtime dependencies
 * (`pnpm --filter-prod '@synstate/docs^...'`) and the benchmark files
 * themselves. A scenario that imports a package outside that closure — one that
 * is only a `devDependency` of the docs app — leaves the key unchanged when
 * that package changes, so `main`'s baseline is reused and the committed tables
 * are judged against numbers measured before the change. Nothing else fails.
 * A relative import of a file outside the directories the key digests is the
 * same hole, and fails the same way.
 *
 * It also fails when the key step stops reading the closure or one of the
 * benchmark directories this reads, so that the two lists cannot drift apart.
 */
export const checkSynstateBenchmarkImports = (): Promise<
  Result<number, string>
> =>
  Result.safeTry(async function* () {
    const workflow = yield* Result.safeUnwrap(
      await readRepositoryFile(WORKFLOW_FILE),
    );

    const workspace = await getWorkspacePackages(projectRootPath);

    const manifests = workspace.map((pkg) => ({
      name: pkg.name,
      manifest: pkg.packageJson,
    }));

    if (manifests.every((pkg) => pkg.name !== DOCS_PACKAGE)) {
      return Result.err(
        `❌ No workspace package is named ${DOCS_PACKAGE}; if the docs app was renamed, point this check at it.`,
      );
    }

    const files = yield* Result.safeUnwrap(await readBenchmarkSources());

    const violations = [
      ...collectKeyStepViolations(workflow),
      ...collectImportViolations({
        files,
        workspaceNames: new Set(manifests.map((pkg) => pkg.name)),
        closure: runtimeClosure(manifests, DOCS_PACKAGE),
      }),
    ] as const;

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok(files.length);
  });

/**
 * The directories the key digests the files of, as the key step names them.
 * `spring-demo` only for its `.mts` modules, which the deep chain's adapters
 * load; test files nowhere ({@link isBenchmarkSource}).
 */
export const BENCHMARK_DIRS = [
  'libs/synstate/samples/docs-site/benchmark',
  'apps/synstate-docs/scripts/benchmark',
  'apps/synstate-docs/src/components/throughput-demo/adapters',
  'apps/synstate-docs/src/components/spring-demo',
] as const;

/**
 * Whether the key digests a path, from the repository root: a file under one of
 * {@link BENCHMARK_DIRS}, a test file aside, and under `spring-demo` a `.mts`
 * one alone.
 */
export const isDigestedByKey = (file: string): boolean => {
  if (file.endsWith('.test.mts')) {
    return false;
  }

  const dir = BENCHMARK_DIRS.find((d) => file.startsWith(`${d}/`));

  return (
    dir !== undefined &&
    (dir !== SPRING_DEMO_DIR || path.posix.extname(file) === '.mts')
  );
};

/** Whether a tracked path is a benchmark source this reads the imports of. */
export const isBenchmarkSource = (file: string): boolean =>
  CODE_FILE.test(file) && isDigestedByKey(file);

/** The package a bare import specifier names, or `undefined` for any other. */
export const packageNameOf = (specifier: string): string | undefined => {
  if (/^[./]/u.test(specifier) || specifier.startsWith('node:')) {
    return undefined;
  }

  const segments = specifier.split('/');

  return specifier.startsWith('@')
    ? Arr.take(segments, 2).join('/')
    : segments[0];
};

/**
 * The workspace packages `root` reaches through the runtime dependency fields
 * of the manifests (not `devDependencies`), as `pnpm --filter-prod
 * '<root>^...'` selects them: `root` itself is not in it.
 */
export const runtimeClosure = (
  manifests: readonly Readonly<{ name: string; manifest: unknown }>[],
  root: string,
): ReadonlySet<string> => {
  const byName = new Map(manifests.map((pkg) => [pkg.name, pkg.manifest]));

  const mut_reached = new Set<string>();

  const mut_queue: string[] = [root];

  for (let mut_name = mut_queue.shift(); mut_name !== undefined;) {
    for (const dependency of runtimeDependencyNames(byName.get(mut_name))) {
      if (!byName.has(dependency) || mut_reached.has(dependency)) {
        continue;
      }

      mut_reached.add(dependency);

      mut_queue.push(dependency);
    }

    mut_name = mut_queue.shift();
  }

  mut_reached.delete(root);

  return mut_reached;
};

/**
 * One message per import of a workspace package outside `closure`, and per
 * relative import of a file the key does not digest ({@link isDigestedByKey}),
 * each starting with the file's path. Type-only and dynamic imports count: a
 * type can change what a scenario compiles to, and a dynamic import loads the
 * module as much as a static one does.
 */
export const collectImportViolations = ({
  files,
  workspaceNames,
  closure,
}: Readonly<{
  files: readonly Readonly<{ file: string; source: string }>[];
  workspaceNames: ReadonlySet<string>;
  closure: ReadonlySet<string>;
}>): readonly string[] =>
  Arr.generate(function* () {
    for (const { file, source } of files) {
      const specifiers = Arr.uniq(
        ts
          .preProcessFile(source, true, true)
          .importedFiles.map((ref) => ref.fileName),
      );

      const outside = Arr.uniq(
        specifiers
          .map(packageNameOf)
          .filter(
            (name) =>
              name !== undefined &&
              workspaceNames.has(name) &&
              !closure.has(name),
          ),
      );

      for (const name of outside) {
        yield `${file}: imports \`${name}\``;
      }

      for (const specifier of specifiers) {
        const target = specifier.startsWith('.')
          ? importedPath(file, specifier)
          : undefined;

        if (
          target !== undefined &&
          !isDigestedByKey(target) &&
          !UNMEASURED_MODULES.has(target)
        ) {
          yield `${file}: imports \`${specifier}\`, a file the key does not digest`;
        }
      }
    }
  });

/**
 * One message per thing the key step no longer reads that this check assumes it
 * does: the closure, and each of {@link BENCHMARK_DIRS}.
 */
export const collectKeyStepViolations = (workflow: string): readonly string[] =>
  Arr.generate(function* () {
    if (!workflow.includes(CLOSURE_FILTER)) {
      yield `the key no longer reads \`pnpm ${CLOSURE_FILTER}\``;
    }

    for (const dir of BENCHMARK_DIRS) {
      if (!workflow.includes(dir)) {
        yield `the key no longer digests \`${dir}\``;
      }
    }
  });

/**
 * Modules a benchmark source imports that the key leaves out on purpose,
 * because nothing they do changes a number. Each with the reason.
 */
const UNMEASURED_MODULES: ReadonlyMap<string, string> = new Map<string, string>(
  [
    [
      'apps/synstate-docs/scripts/workspace-root-path.mts',
      'resolves the repository root for the paths the runners read and write',
    ],
  ],
);

const DOCS_PACKAGE = '@synstate/docs';

const CLOSURE_FILTER = `--filter-prod '${DOCS_PACKAGE}^...'` as const;

const WORKFLOW_FILE = '.github/workflows/synstate-benchmark.yml';

const SPRING_DEMO_DIR = 'apps/synstate-docs/src/components/spring-demo';

const CODE_FILE = /\.(?:[cm]?[jt]s|[jt]sx)$/u;

/**
 * The path, from the repository root, of the file a relative specifier in
 * `file` names, its `.mjs` / `.js` extension read as the `.mts` / `.ts` source
 * the repository has.
 */
const importedPath = (file: string, specifier: string): string =>
  path.posix
    .join(path.posix.dirname(file), specifier)
    .replace(/\.m?js$/u, (ext) => (ext === '.mjs' ? '.mts' : '.ts'));

const runtimeDependencyNames = (manifest: unknown): readonly string[] =>
  isRecord(manifest)
    ? RUNTIME_DEPENDENCY_FIELDS.flatMap((field) => {
        const entries = manifest[field];

        return isRecord(entries) ? Object.keys(entries) : [];
      })
    : ([] as const);

/** The benchmark sources, as the working tree has them. */
const readBenchmarkSources = async (): Promise<
  Result<readonly Readonly<{ file: string; source: string }>[], string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const files = tracked.value.filter(isBenchmarkSource);

  if (!Arr.isNonEmpty(files)) {
    return Result.err(
      `❌ No benchmark source is tracked under ${BENCHMARK_DIRS.join(', ')}; if the benchmark moved, point this check and the key at it.`,
    );
  }

  const results = await Promise.all(
    files.map(async (file) => {
      const read = await readRepositoryFile(file);

      return Result.isErr(read)
        ? Result.err(`❌ ${read.value}`)
        : Result.ok({ file, source: read.value });
    }),
  );

  const firstError = results.find(Result.isErr);

  return firstError !== undefined
    ? Result.err(firstError.value)
    : Result.ok(results.filter(Result.isOk).map((r) => r.value));
};

const formatViolations = (violations: readonly string[]): string =>
  [
    `❌ The SynState benchmark's baseline cache key (${WORKFLOW_FILE},`,
    '   "Compute the baseline cache key") would not change with what the',
    '   benchmark runs:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'A workspace package a benchmark source imports has to be a runtime',
    `dependency of ${DOCS_PACKAGE}, directly or through another, so that the key`,
    'digests its source: add it to the `dependencies` of',
    '`apps/synstate-docs/package.json`. A file it imports by a relative path',
    'has to be under a directory the key digests: move it there, or add its',
    'directory to the key step and to `BENCHMARK_DIRS` in this check; one that',
    'changes no number goes in `UNMEASURED_MODULES`, with the reason. If the',
    'key step changed, make it read the closure and every directory above',
    'again, or change this check',
    '(`tools/scripts/cmd/check-synstate-benchmark-imports.mts`) with it.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkSynstateBenchmarkImports().catch((error: unknown) =>
    Result.err(`❌ ${unknownToString(error)}`),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every module the SynState benchmark imports is in its cache key (${result.value} files).`,
  );
}
