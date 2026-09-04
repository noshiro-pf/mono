import micromatch from 'micromatch';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  ISet,
  isString,
  pipe,
  Result,
  unknownToString,
} from 'ts-data-forge';
import {
  type DeepReadonly,
  type ReadonlyRecord,
  type StrictOmit,
} from 'ts-type-forge';
import { assertPathExists } from './assert-path-exists.mjs';
import { $ } from './exec-async.mjs';

/** Configuration for index file generation. */
export type GenIndexConfig = DeepReadonly<{
  /** Target directories to generate index files for (string or array of strings) */
  targetDirectory: string | string[];

  /**
   * Glob patterns of files or predicate function to exclude from exports
   * (default: excludes `'**\/*.{test,spec}.?(c|m)[jt]s?(x)'` and
   * `'**\/*.d.?(c|m)ts'`)
   */
  exclude?:
    | string[]
    | ((
        args: Readonly<{
          absolutePath: string;
          relativePath: string;
          fileName: string;
        }>,
      ) => boolean);

  /** File extensions of source files to export (default: ['.ts', '.tsx']) */
  targetExtensions?: `.${string}`[];

  /** File extension of index files to generate (default: '.ts') */
  indexFileExtension?: `.${string}`;

  /** File extension to use in export statements (default: '.js') */
  exportStatementExtension?: `.${string}` | 'none';

  /** Command to run for formatting generated files (optional) */
  formatCommand?: string;

  /** Whether to suppress output during execution (default: false) */
  silent?: boolean;

  /** Minimum depth to start generating index files (default: 0) */
  minDepth?: number;

  /**
   * Glob patterns of index files to leave untouched, matched against the
   * index file's own path relative to the target directory (POSIX
   * separators), e.g. `'index.mts'` for the one at the root of the walk and
   * `'v*\/index.mts'` for a whole generation of them.
   *
   * This is what protects a hand-written index file — an executable entry
   * point, or a curated list of named re-exports — from being overwritten
   * with a barrel. `exclude` cannot express it: it says what an index file
   * may not *export*, and is matched against a bare file name as well as a
   * relative path, so `'index.mts'` there would name every index file in the
   * tree rather than one of them.
   *
   * A preserved directory is still walked, so index files below it are still
   * generated, and its parent still re-exports it. (default: none)
   */
  preserve?: string[];
}>;

const defaultConfig = {
  exclude: ['**/*.{test,spec}.?(c|m)[jt]s?(x)', '**/*.d.?(c|m)ts'],
  targetExtensions: ['.ts', '.tsx'],
  indexFileExtension: '.ts',
  exportStatementExtension: '.js', // For ESM imports, .mts resolves to .mjs
  silent: false,
  minDepth: 0,
  preserve: [],
} as const satisfies Required<
  StrictOmit<GenIndexConfig, 'targetDirectory' | 'formatCommand'>
>;

type GenIndexConfigInternal = DeepReadonly<{
  formatCommand: string | undefined;
  targetDirectory: ISet<string>;
  exclude: (
    args: Readonly<{
      absolutePath: string;
      relativePath: string;
      fileName: string;
    }>,
  ) => boolean;
  targetExtensions: ISet<`.${string}`>;
  indexFileExtension: `.${string}`;
  exportStatementExtension: `.${string}` | 'none';
  silent: boolean;
  minDepth: number;
  preserve: string[];
}>;

/**
 * Generates index.ts files recursively in `config.targetDirectory`.
 *
 * @param config - Configuration for index file generation
 * @throws Error if any step fails.
 */
export const genIndex = async (
  config: GenIndexConfig,
): Promise<Result<undefined, unknown>> => {
  // Merge config with defaults
  const filledConfig: GenIndexConfigInternal = fillConfig(config);

  const conditionalEcho = filledConfig.silent ? () => {} : console.info;

  conditionalEcho('Starting index file generation...\n');

  // Normalize target directories to array
  const targetDirs =
    typeof config.targetDirectory === 'string'
      ? ([config.targetDirectory] as const)
      : config.targetDirectory;

  try {
    // Step 1: Verify target directories exist
    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);

      // eslint-disable-next-line no-await-in-loop
      await assertPathExists(resolvedDir, `Target directory: ${dir}`);
    }

    // Step 2: Generate index files
    conditionalEcho('Generating index files...');

    for (const dir of targetDirs) {
      const resolvedDir = path.resolve(dir);

      // eslint-disable-next-line no-await-in-loop
      await generateIndexFileForDir(resolvedDir, filledConfig, undefined, 0);
    }

    conditionalEcho('✓ Index files generated\n');

    // Step 3: Format generated files
    if (filledConfig.formatCommand !== undefined) {
      conditionalEcho('Formatting generated files...');

      const fmtResult = await $(filledConfig.formatCommand, {
        silent: filledConfig.silent,
      });

      if (Result.isErr(fmtResult)) {
        throw new Error(`Formatting failed: ${fmtResult.value.message}`);
      }

      conditionalEcho('✓ Formatting completed\n');
    }

    conditionalEcho('✅ Index file generation completed successfully!\n');

    return Result.ok(undefined);
  } catch (error) {
    conditionalEcho(`❌ Index generation failed: ${unknownToString(error)}\n`);

    return Result.err(error);
  }
};

const fillConfig = (config: GenIndexConfig): GenIndexConfigInternal => {
  const targetExtensions =
    config.targetExtensions ?? defaultConfig.targetExtensions;

  const exportExtension =
    config.exportStatementExtension ?? defaultConfig.exportStatementExtension;

  return {
    formatCommand: config.formatCommand,
    targetDirectory: ISet.create(
      isString(config.targetDirectory)
        ? [config.targetDirectory]
        : config.targetDirectory,
    ),
    exclude: pipe(config.exclude).map((exclude) =>
      typeof exclude === 'function'
        ? exclude
        : pipe(
            ISet.create<string>(
              Arr.generate(function* () {
                if (exclude !== undefined && Arr.isArray(exclude)) {
                  yield* exclude;
                }

                yield* defaultConfig.exclude;
              }),
            ),
          ).map(
            (set) =>
              ({
                relativePath,
                fileName,
              }: Readonly<{
                absolutePath: string;
                relativePath: string;
                fileName: string;
              }>) => {
                for (const pattern of set.values()) {
                  if (
                    micromatch.isMatch(relativePath, pattern) ||
                    micromatch.isMatch(fileName, pattern)
                  ) {
                    return true;
                  }
                }

                return false;
              },
          ).value,
    ).value,
    targetExtensions: ISet.create(targetExtensions),
    indexFileExtension:
      config.indexFileExtension ?? defaultConfig.indexFileExtension,
    exportStatementExtension: exportExtension,
    silent: config.silent ?? defaultConfig.silent,
    minDepth: config.minDepth ?? defaultConfig.minDepth,
    preserve: config.preserve ?? defaultConfig.preserve,
  };
};

/**
 * Generates an index.ts file for the given directory. Recursively calls itself
 * for subdirectories.
 *
 * @param dirPath - The absolute path to the directory to process.
 * @param config - The merged configuration object.
 * @param baseDir - The base directory path for calculating relative paths
 *   (optional, defaults to dirPath).
 * @param currentDepth - The current depth of recursion.
 * @throws Error if directory processing fails.
 */
const generateIndexFileForDir = async (
  dirPath: string,
  config: GenIndexConfigInternal,
  baseDir?: string,
  currentDepth: number = 0,
): Promise<void> => {
  const conditionalEcho = config.silent ? () => {} : console.info;

  try {
    const actualBaseDir = baseDir ?? dirPath;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const mut_subDirectories: string[] = [];

    const mut_filesToExport: string[] = [];

    for (const entry of entries) {
      const entryName = entry.name;

      const entryPath = path.join(dirPath, entryName);

      const relativePath = path.relative(actualBaseDir, entryPath);

      if (
        config.exclude({
          absolutePath: entryPath,
          relativePath,
          fileName: entryName,
        })
      ) {
        continue; // Skip excluded directories/files
      }

      if (entry.isDirectory()) {
        mut_subDirectories.push(entryName);

        // Recursively call for subdirectories first
        // eslint-disable-next-line no-await-in-loop
        await generateIndexFileForDir(
          entryPath,
          config,
          actualBaseDir,
          currentDepth + 1,
        );
      } else if (
        entry.isFile() &&
        shouldExportFile({
          absolutePath: entryPath,
          filePath: relativePath,
          config,
        })
      ) {
        mut_filesToExport.push(entryName);
      }
    }

    if (currentDepth >= config.minDepth) {
      const indexPath = path.join(dirPath, `index${config.indexFileExtension}`);

      if (
        isPreservedIndex(
          path.relative(actualBaseDir, indexPath),
          config.preserve,
        )
      ) {
        conditionalEcho(
          `Preserved: ${path.relative(process.cwd(), indexPath)}`,
        );
      } else {
        const indexContent = generateIndexContent(
          mut_subDirectories,
          mut_filesToExport,
          config,
        );

        if (await indexIsUpToDate(indexPath, indexContent)) {
          conditionalEcho(
            `Unchanged: ${path.relative(process.cwd(), indexPath)}`,
          );
        } else {
          await writeFileAtomic(indexPath, indexContent);

          conditionalEcho(
            `Generated: ${path.relative(process.cwd(), indexPath)}`,
          );
        }
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to generate index for directory ${dirPath}: ${unknownToString(error)}`,
      { cause: error },
    );
  }
};

/**
 * Whether the index file about to be written is one the caller asked to keep.
 *
 * Matched against the path relative to the target directory alone, never
 * against the bare file name — every index file in the tree shares that name,
 * so `'index.mts'` would otherwise mean "generate nothing anywhere" instead of
 * naming the one at the root of the walk.
 *
 * @param indexRelativePath - The index file's path relative to the target
 *   directory, in this platform's separators.
 * @param preserve - Glob patterns, in POSIX separators.
 * @returns True if the file must be left as it is on disk.
 */
const isPreservedIndex = (
  indexRelativePath: string,
  preserve: readonly string[],
): boolean => {
  const normalized = indexRelativePath.split(path.sep).join('/');

  return preserve.some((pattern) => micromatch.isMatch(normalized, pattern));
};

if (import.meta.vitest !== undefined) {
  describe('isPreservedIndex', () => {
    test.each([
      // Nothing is preserved by default.
      ['index.mts', [], false],
      // `'index.mts'` names the index at the root of the walk, and only it —
      // this is what `exclude` could not express.
      ['index.mts', ['index.mts'], true],
      ['utils/index.mts', ['index.mts'], false],
      ['v2/index.mts', ['index.mts'], false],
      // A whole generation of hand-written index files.
      ['v2/index.mts', ['v*/index.mts'], true],
      ['v2/index.mts', ['v[2-8]/index.mts'], true],
      ['v9/index.mts', ['v[2-8]/index.mts'], false],
      // A pattern matches at its own depth, not below it.
      ['v2/types/index.mts', ['v*/index.mts'], false],
      // Any one pattern matching is enough.
      ['index.mts', ['v*/index.mts', 'index.mts'], true],
    ] as const)(
      'isPreservedIndex($0, $1) to be $2',
      (indexRelativePath, preserve, expected) => {
        expect(isPreservedIndex(indexRelativePath, preserve)).toBe(expected);
      },
    );
  });
}

const indexRegex = /^index\.[cm]?[jt]s[x]?$/u;

/**
 * Determines if a file should be exported in the index file. A file is exported
 * if:
 *
 * - It has one of the configured source extensions
 * - It's not an index file itself
 * - It doesn't match any exclusion patterns
 *
 * @param filePath - The relative path to the file from the target directory.
 * @param absolutePath - The absolute path to the file.
 * @param config - The merged configuration object.
 * @returns True if the file should be exported.
 */
const shouldExportFile = ({
  absolutePath,
  filePath,
  config,
}: Readonly<{
  absolutePath: string;
  filePath: string;
  config: GenIndexConfigInternal;
}>): boolean => {
  const fileName = path.basename(filePath);

  const ext = path.extname(fileName);

  // Must have the correct source extension
  if (!config.targetExtensions.has(ext)) {
    return false;
  }

  // Don't export the index file itself
  if (
    indexRegex.test(fileName) // Matches index.ts, index.mts, index.js, index.tsx
  ) {
    return false;
  }

  // Check against exclusion patterns
  if (
    config.exclude({
      absolutePath,
      relativePath: filePath,
      fileName,
    })
  ) {
    return false;
  }

  return true;
};

if (import.meta.vitest !== undefined) {
  describe('index file regex', () => {
    test.each([
      ['index.ts', true],
      ['index.js', true],
      ['index.mts', true],
      ['index.mjs', true],
      ['index.cts', true],
      ['index.cjs', true],
      ['index.tsx', true],
      ['index.jsx', true],
      ['not-index.ts', false],
      ['index.txt', false],
    ] as const)('indexRegex.test($0) to be $1', (fileName, expected) => {
      expect(indexRegex.test(fileName)).toBe(expected);
    });
  });
}

/**
 * The extension a module specifier needs for a source file with this
 * extension.
 *
 * TypeScript resolves a specifier by the name the file *emits*, so the answer
 * follows the source's own extension rather than one configured value: `.mts`
 * emits `.mjs`, while `.tsx` — like `.ts` — emits `.js`. A directory holding
 * both therefore needs two different extensions, which is why
 * `exportStatementExtension` cannot decide this on its own; it is the fallback
 * for extensions with no known emit.
 */
const specifierExtension = (
  sourceExtension: string,
  fallback: `.${string}`,
): `.${string}` =>
  hasKey(emittedExtensions, sourceExtension)
    ? emittedExtensions[sourceExtension]
    : fallback;

const emittedExtensions = {
  '.cjs': '.cjs',
  '.cts': '.cjs',
  '.js': '.js',
  '.jsx': '.js',
  '.mjs': '.mjs',
  '.mts': '.mjs',
  '.ts': '.js',
  '.tsx': '.js',
} as const satisfies ReadonlyRecord<string, `.${string}`>;

if (import.meta.vitest !== undefined) {
  describe('specifierExtension', () => {
    test.each([
      // A directory holding both needs two different extensions, whatever
      // `exportStatementExtension` says: this is what `--export-ext .mjs`
      // together with `--target-ext .tsx` used to get wrong.
      ['./a.mts', '.mjs' as const, '.mjs'],
      ['./a.tsx', '.mjs' as const, '.js'],
      ['./a.ts', '.mjs' as const, '.js'],
      ['./a.cts', '.mjs' as const, '.cjs'],
      // An extension with no known emit keeps the configured value.
      ['./a.vue', '.mjs' as const, '.mjs'],
      ['./a', '.js' as const, '.js'],
    ] as const)(
      'specifierExtension($0, $1) to be $2',
      (filePath, fallback, expected) => {
        expect(specifierExtension(path.extname(filePath), fallback)).toBe(
          expected,
        );
      },
    );
  });
}

/**
 * Whether the index file already on disk re-exports exactly what would be
 * generated for it, so that nothing has to be written.
 *
 * The comparison is on the set of module specifiers rather than on the bytes,
 * because the two never match: this generator emits double quotes, no trailing
 * newline and subdirectories first, and the formatter that runs afterwards
 * rewrites all three. Comparing bytes would therefore report every index file
 * as changed on every run, which is what the check exists to avoid.
 *
 * Avoiding the write is not an optimization. `genIndex` is called from a
 * package's `build`, and in a workspace those builds run several at a time,
 * each importing its siblings' sources through `tsx`. A rewritten index file
 * is unreadable while it is being rewritten, so a barrel touched needlessly is
 * a sibling build that fails with "does not provide an export named ..." for
 * no reason at all.
 *
 * @param indexPath - Absolute path of the index file.
 * @param indexContent - The content that would be written.
 * @returns True when the file exists and exports the same specifiers.
 */
const indexIsUpToDate = async (
  indexPath: string,
  indexContent: string,
): Promise<boolean> => {
  const existing = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(indexPath, 'utf8'),
  );

  if (Result.isErr(existing)) {
    return false; // No index file yet, or one that cannot be read.
  }

  const onDisk = exportedSpecifiers(existing.value);

  const generated = exportedSpecifiers(indexContent);

  if (onDisk === undefined || generated === undefined) {
    return false;
  }

  return (
    onDisk.length === generated.length &&
    onDisk.every((specifier, index) => specifier === generated[index])
  );
};

/** What a directory with nothing to re-export gets. */
const emptyIndexContent = 'export {};';

/** Matches one `export * from '...';` statement, quoted either way. */
const exportAllRegex = /^export \* from ['"](?<specifier>[^'"]+)['"];$/u;

/**
 * The module specifiers a generated index file re-exports, sorted.
 *
 * Returns `undefined` for anything this generator would not have written —
 * a hand-written barrel with named re-exports, say — so that the caller falls
 * back to writing the file rather than assuming it is already correct.
 *
 * @param source - Contents of an index file.
 * @returns The sorted specifiers, or `undefined` if the file is not a plain
 *   list of `export * from '...';` statements.
 */
const exportedSpecifiers = (source: string): readonly string[] | undefined => {
  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

  if (Arr.isEmpty(lines)) {
    return undefined; // Not a module at all; write the file.
  }

  if (Arr.isFixedLengthArray(1, lines) && lines[0] === emptyIndexContent) {
    return [];
  }

  const mut_specifiers: string[] = [];

  for (const line of lines) {
    const matched = exportAllRegex.exec(line);

    const specifier = matched?.groups?.['specifier'];

    if (specifier === undefined) {
      return undefined;
    }

    mut_specifiers.push(specifier);
  }

  return mut_specifiers.toSorted();
};

if (import.meta.vitest !== undefined) {
  describe('exportedSpecifiers', () => {
    test('reads the statements this generator writes', () => {
      assert.deepStrictEqual(
        exportedSpecifiers(
          'export * from "./b.mjs";\nexport * from "./a.mjs";',
        ),
        ['./a.mjs', './b.mjs'],
      );
    });

    test('reads the formatted spelling of the same file back', () => {
      // The formatter that runs after generation rewrites the quotes, the
      // order and the trailing newline; all three have to compare equal.
      assert.deepStrictEqual(
        exportedSpecifiers(
          "export * from './a.mjs';\nexport * from './b.mjs';\n",
        ),
        ['./a.mjs', './b.mjs'],
      );
    });

    test('reads an index for a directory with nothing to export', () => {
      assert.deepStrictEqual(exportedSpecifiers('export {};\n'), []);
    });

    test('gives up on anything else, so that the file is rewritten', () => {
      expect(
        exportedSpecifiers('export { a } from "./a.mjs";'),
      ).toBeUndefined();

      expect(
        exportedSpecifiers('// a note\nexport * from "./a.mjs";'),
      ).toBeUndefined();

      expect(exportedSpecifiers('')).toBeUndefined();
    });
  });
}

/**
 * Writes `content` to `filePath` through a temporary file in the same
 * directory, so that a reader never sees the file half-written.
 *
 * `fs.writeFile` truncates first, which leaves a window in which the file is
 * empty or partial; `rename` within one directory replaces it in one step.
 *
 * @param filePath - Absolute path of the file to write.
 * @param content - The content to write.
 */
const writeFileAtomic = async (
  filePath: string,
  content: string,
): Promise<void> => {
  const tempPath = `${filePath}.${process.pid}.tmp` as const;

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(tempPath, content);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.rename(tempPath, filePath);
  } catch (error) {
    await fs.rm(tempPath, { force: true });

    throw error;
  }
};

/**
 * Generates the content for an index file.
 *
 * @param subDirectories - Array of subdirectory names.
 * @param filesToExport - Array of file names to export.
 * @param config - The merged configuration object.
 * @returns The index file content.
 */
const generateIndexContent = (
  subDirectories: readonly string[],
  filesToExport: readonly string[],
  config: GenIndexConfigInternal,
): string => {
  const exportStatements = [
    ...subDirectories.map((subDir) =>
      config.exportStatementExtension === 'none'
        ? `export * from "./${subDir}";`
        : `export * from "./${subDir}/index${specifierExtension(
            config.indexFileExtension,
            config.exportStatementExtension,
          )}";`,
    ),
    ...filesToExport.map((file) => {
      const fileNameWithoutExt = path.basename(file, path.extname(file));

      return config.exportStatementExtension === 'none'
        ? `export * from "./${fileNameWithoutExt}";`
        : `export * from "./${fileNameWithoutExt}${specifierExtension(
            path.extname(file),
            config.exportStatementExtension,
          )}";`;
    }),
  ] as const;

  return Arr.isEmpty(exportStatements)
    ? emptyIndexContent
    : exportStatements.join('\n');
};
