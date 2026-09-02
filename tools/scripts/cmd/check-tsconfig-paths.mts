import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a package's `tsconfig` maps a module name it has no business
 * mapping, or maps one at a file that is not there.
 *
 * A workspace sibling is reached through its `exports`, not through `paths` —
 * pnpm's part ends at the `node_modules/<name>` symlink, and what the name
 * resolves *to* is decided by the target's own `package.json`. The one
 * legitimate mapping is a package's own name, so that `samples/` can import
 * the way a consumer does while still being checked against the source being
 * edited. See docs/workspace-package-linking.md.
 *
 * Both halves exist because TypeScript reports neither. A `paths` entry for a
 * sibling silently bypasses the dependency declaration, so
 * `import-x/no-extraneous-dependencies` and knip stop seeing the edge; a
 * `paths` entry whose target does not exist falls back to ordinary resolution
 * with no error at all, which is how four entries sat pointing at a
 * non-existent `src/entry-point.mts` — resolving to `dist/` — for months.
 */
export const checkTsconfigPaths = async (): Promise<Result<number, string>> => {
  const filesResult = await collectTsconfigFiles();

  if (Result.isErr(filesResult)) {
    return Result.err(filesResult.value);
  }

  const files = filesResult.value;

  const perFile = await Promise.all(files.map(checkFile));

  const violations = perFile.flat();

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} tsconfig \`paths\` violation(s):`,
        '',
        ...violations.flatMap((violation) => [
          `  ${violation.file}`,
          `    "${violation.key}": ${violation.detail}`,
          `    → ${violation.hint}`,
          '',
        ]),
        'A workspace sibling resolves through its own `exports`; only a',
        "package's own name belongs in `paths`. See",
        'docs/workspace-package-linking.md.',
      ].join('\n'),
    );
  }

  return Result.ok(files.length);
};

type Violation = Readonly<{
  /** Repository-relative path of the offending tsconfig. */
  file: string;
  /** The `paths` key. */
  key: string;
  detail: string;
  hint: string;
}>;

/**
 * Where a tsconfig is not checked at all.
 *
 * - `experimental/` is outside the pnpm workspace: nothing there is installed,
 *   built or type-checked, and its configs are snapshots of the repositories
 *   they came from.
 * - `verify-npm-packages/` holds generated consumer projects that install from
 *   tarballs and from npm. They have no workspace siblings to resolve, and
 *   their `@typescript/lib-*` mapping is what the strict standard library's
 *   README tells a consumer on TypeScript 7 to write.
 */
const excludedDirs = ['experimental', 'verify-npm-packages'] as const;

const collectTsconfigFiles = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await glob('**/tsconfig*.json', {
    cwd: projectRootPath,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      ...excludedDirs.map((dir) => `${dir}/**`),
    ],
    absolute: true,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `❌ Failed to list tsconfig files: ${unknownToString(result.value)}`,
    );
  }

  return Result.ok(result.value.toSorted());
};

const checkFile = async (file: string): Promise<readonly Violation[]> => {
  const paths = await readPaths(file);

  if (paths === undefined) return [];

  const packageDir = await findPackageDir(path.dirname(file));

  // No package of its own: the nearest `package.json` is the repository root.
  // `tools/configs/tsconfig.tsx.json` is the case here, and its `paths` are a
  // different mechanism — `tsx`'s runtime resolution for build scripts that
  // run before any `dist/` exists. See CLAUDE.md, "Building from a clean
  // checkout".
  if (packageDir === undefined) return [];

  const packageName = await readPackageName(packageDir);

  const relativeFile = path.relative(projectRootPath, file);

  if (packageName === undefined) {
    return [
      {
        file: relativeFile,
        key: Object.keys(paths.entries).join(', '),
        detail: 'is declared in a package whose `package.json` has no `name`.',
        hint: 'Name the package, or drop the `paths` block.',
      },
    ];
  }

  const perEntry = await Promise.all(
    Object.entries(paths.entries).map(async ([key, value]) =>
      checkEntry({
        key,
        value,
        relativeFile,
        packageName,
        packageDir,
        basePath: paths.basePath,
      }),
    ),
  );

  return perEntry.flat();
};

const checkEntry = async ({
  key,
  value,
  relativeFile,
  packageName,
  packageDir,
  basePath,
}: Readonly<{
  key: string;
  value: unknown;
  relativeFile: string;
  packageName: string;
  packageDir: string;
  basePath: string;
}>): Promise<readonly Violation[]> => {
  if (key !== packageName && !key.startsWith(`${packageName}/`)) {
    return [
      {
        file: relativeFile,
        key,
        detail: `maps \`${key}\`, which is not \`${packageName}\`.`,
        hint: `Delete it. If \`${key}\` cannot be resolved by name, the fix is an \`exports\` field in \`${key}\`, not a mapping here.`,
      },
    ];
  }

  if (!Arr.isArray(value) || !value.every(isString)) {
    return [
      {
        file: relativeFile,
        key,
        detail: 'is not an array of strings.',
        hint: 'A `paths` value is an array of file paths.',
      },
    ];
  }

  const perTarget = await Promise.all(
    value.map(async (target) =>
      checkTarget({ key, target, relativeFile, packageDir, basePath }),
    ),
  );

  return perTarget.flat();
};

const checkTarget = async ({
  key,
  target,
  relativeFile,
  packageDir,
  basePath,
}: Readonly<{
  key: string;
  target: string;
  relativeFile: string;
  packageDir: string;
  basePath: string;
}>): Promise<readonly Violation[]> => {
  const resolved = path.resolve(basePath, target);

  const inside = path.relative(packageDir, resolved);

  if (inside.startsWith('..') || path.isAbsolute(inside)) {
    return [
      {
        file: relativeFile,
        key,
        detail: `points at \`${target}\`, which is outside the package.`,
        hint: "A package's own name resolves to its own source.",
      },
    ];
  }

  // A pattern cannot be checked for existence: `*` stands for whatever the
  // importer wrote. The containment check above still applies to it.
  if (target.includes('*')) return [];

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stat = await Result.fromPromise(fs.stat(resolved));

  if (Result.isOk(stat) && stat.value.isFile()) return [];

  return [
    {
      file: relativeFile,
      key,
      detail: `points at \`${target}\`, which is not a file.`,
      hint: 'TypeScript falls back to ordinary resolution here without an error, so the mapping does nothing.',
    },
  ];
};

/**
 * The `paths` block of one tsconfig, with the directory its entries resolve
 * against.
 *
 * Only this file's own block is read: `paths` is not merged through `extends`
 * — a child that declares one replaces its parent's wholesale — so a config
 * without a block of its own has nothing to answer for. `baseUrl` is read the
 * same way, which is exact as long as no shared base sets one; none does.
 */
type PathsBlock = Readonly<{
  entries: ReadonlyRecord<string, unknown>;
  basePath: string;
}>;

const readPaths = async (file: string): Promise<PathsBlock | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = await Result.fromPromise(fs.readFile(file, 'utf8'));

  if (Result.isErr(text)) return undefined;

  // These files are JSONC. `parseConfigFileTextToJson` is what tsc itself
  // reads them with, so comments and trailing commas are handled exactly as
  // the compiler handles them.
  const parsed: unknown = ts.parseConfigFileTextToJson(file, text.value).config;

  if (!isRecord(parsed) || !hasKey(parsed, 'compilerOptions')) return undefined;

  const compilerOptions: unknown = parsed.compilerOptions;

  if (!isRecord(compilerOptions) || !hasKey(compilerOptions, 'paths')) {
    return undefined;
  }

  const entries: unknown = compilerOptions.paths;

  if (!isRecord(entries)) return undefined;

  const baseUrl: unknown = hasKey(compilerOptions, 'baseUrl')
    ? compilerOptions.baseUrl
    : undefined;

  const dir = path.dirname(file);

  return {
    entries,
    basePath: isString(baseUrl) ? path.resolve(dir, baseUrl) : dir,
  };
};

/**
 * The directory of the package a file belongs to, or `undefined` when the
 * nearest `package.json` is the repository root — that is, when the file
 * belongs to no package.
 */
const findPackageDir = async (
  startDir: string,
): Promise<string | undefined> => {
  const walk = async (dir: string): Promise<string | undefined> => {
    if (dir === projectRootPath) return undefined;

    const stat = await Result.fromPromise(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.stat(path.resolve(dir, 'package.json')),
    );

    return Result.isOk(stat) && stat.value.isFile()
      ? dir
      : walk(path.dirname(dir));
  };

  return walk(startDir);
};

const readPackageName = async (
  packageDir: string,
): Promise<string | undefined> => {
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.resolve(packageDir, 'package.json'), 'utf8'),
  );

  if (Result.isErr(text)) return undefined;

  const parsed: unknown = JSON.parse(text.value);

  if (!isRecord(parsed) || !hasKey(parsed, 'name')) return undefined;

  const name: unknown = parsed.name;

  return isString(name) ? name : undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsconfigPaths().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tsconfig file(s) checked; every \`paths\` entry maps its own package at a file that exists.`,
  );
}
