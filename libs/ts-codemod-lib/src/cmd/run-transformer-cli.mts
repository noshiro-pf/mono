/* eslint-disable no-await-in-loop */

import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, expectType, Result, unknownToString } from 'ts-data-forge';
import {
  getDiffFrom,
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
  glob,
} from 'ts-repo-utils';
import {
  transformSourceCode,
  type TsMorphTransformer,
} from '../functions/index.mjs';

type GetFilesOptions = Readonly<{
  baseDir: string;
  exclude: readonly string[];
  uncommitted: boolean;
  diffFrom: string | undefined;
  silent: boolean;
}>;

type TransformerCLIOptions = GetFilesOptions;

export const runTransformerCLI = async (
  options: TransformerCLIOptions,
  transformers: readonly TsMorphTransformer[],
): Promise<Result<undefined, undefined>> => {
  const echoIfNotSilent = options.silent ? () => {} : console.log;

  const errorIfNotSilent = options.silent ? () => {} : console.error;

  const filesResult = await getFilesForTransformation(options);

  if (Result.isErr(filesResult)) {
    errorIfNotSilent(
      options.diffFrom !== undefined
        ? `Error getting diff files from "${options.diffFrom}":`
        : options.uncommitted
          ? 'Error getting uncommitted files:'
          : 'Error finding files matching pattern:',
      filesResult.value,
    );

    return Result.err(undefined);
  }

  const files = filesResult.value;

  if (Arr.isArrayOfLength(files, 0)) {
    echoIfNotSilent(
      options.diffFrom !== undefined
        ? `No files found in diff from "${options.diffFrom}" matching pattern: ${options.baseDir}`
        : options.uncommitted
          ? 'No uncommitted files found'
          : `No files found matching pattern: ${options.baseDir}`,
    );

    return Result.ok(undefined);
  }

  const { errorFiles, transformedCount, unchangedCount } = await transformFiles(
    files,
    transformers,
    options.silent,
  );

  const hr = '='.repeat(50);

  echoIfNotSilent(dedent`
    ${hr}
    Summary:
      ✅ Transformed: ${transformedCount}
      ⏭️ Unchanged:   ${unchangedCount}
      ❌ Errors:      ${errorFiles.length}
      📊 Total:       ${files.length}
  `);

  if (Arr.isNonEmpty(errorFiles)) {
    echoIfNotSilent('\nFiles with errors:');

    for (const fileName of errorFiles) {
      echoIfNotSilent(`  - ${fileName}`);
    }
  }

  echoIfNotSilent(hr);

  if (Arr.isNonEmpty(errorFiles)) {
    return Result.err(undefined);
  }

  return Result.ok(undefined);
};

const getFilesForTransformation = async (
  options: GetFilesOptions,
): Promise<
  Result<
    readonly string[],
    | readonly unknown[]
    | Readonly<{
        message: string;
      }>
  >
> => {
  const filesFromGlob = await getFilesFromGlob(
    options.baseDir,
    options.exclude,
    options.silent,
  );

  if (Result.isErr(filesFromGlob)) {
    return filesFromGlob;
  }

  let mut_files = filesFromGlob.value;

  if (options.uncommitted) {
    const uncommittedFiles = await getUncommittedFiles(options.silent);

    if (Result.isErr(uncommittedFiles)) {
      return uncommittedFiles;
    }

    mut_files = Arr.setIntersection(mut_files, uncommittedFiles.value);
  }

  if (options.diffFrom !== undefined) {
    const diffFiles = await getDiffFrom(options.diffFrom, {
      silent: options.silent,
    });

    if (Result.isErr(diffFiles)) {
      return diffFiles;
    }

    mut_files = Arr.setIntersection(mut_files, diffFiles.value);
  }

  return Result.ok(mut_files);
};

const getUncommittedFiles = async (
  silent: boolean,
): Promise<
  Result<
    readonly string[],
    | readonly unknown[]
    | Readonly<{
        message: string;
      }>
  >
> => {
  const mut_files: string[] = [];

  const untrackedFilesResult = await getUntrackedFiles({ silent });

  if (Result.isErr(untrackedFilesResult)) {
    return untrackedFilesResult;
  }

  mut_files.push(...untrackedFilesResult.value);

  const modifiedFilesResult = await getModifiedFiles({ silent });

  if (Result.isErr(modifiedFilesResult)) {
    return modifiedFilesResult;
  }

  mut_files.push(...modifiedFilesResult.value);

  const stagedFilesResult = await getStagedFiles({ silent });

  if (Result.isErr(stagedFilesResult)) {
    return stagedFilesResult;
  }

  mut_files.push(...stagedFilesResult.value);

  return Result.ok(Arr.uniq(mut_files));
};

const getFilesFromGlob = async (
  baseDir: string,
  exclude: readonly string[],
  silent: boolean,
): Promise<
  Result<
    readonly string[],
    | readonly unknown[]
    | Readonly<{
        message: string;
      }>
  >
> => {
  const globResult = await glob(baseDir, {
    // Never transform files inside dependencies. With pnpm,
    // `packages/*/node_modules/<dep>` are symlinks whose `src/` directory would
    // otherwise be matched by patterns such as
    // `packages/**/{src,scripts,samples,test}/**`, so the codemod would rewrite
    // dependency source files (and could hit pathological types there).
    ignore: Arr.toPushed(exclude, '**/node_modules/**'),
    absolute: true,
    // Do not escape the project tree by following symlinks (e.g. the pnpm
    // `node_modules` symlinks above, or workspace-package links).
    followSymbolicLinks: false,
  });

  if (Result.isErr(globResult)) {
    if (!silent) {
      console.error('Error finding files matching pattern:', globResult.value);
    }

    return Result.err([globResult.value]);
  }

  return Result.ok(globResult.value);
};

const transformFiles = async (
  filePaths: readonly string[],
  transformers: readonly TsMorphTransformer[],
  silent: boolean,
): Promise<
  Readonly<{
    transformedCount: number;
    unchangedCount: number;
    errorFiles: readonly string[];
  }>
> => {
  let mut_transformedCount: number = 0;

  let mut_unchangedCount: number = 0;

  const mut_errorFiles: string[] = [];

  for (const filePath of filePaths) {
    const result = await transformOneFile(filePath, transformers, silent);

    if (Result.isOk(result)) {
      expectType<typeof result.value, 'unchanged' | 'transformed'>('=');

      if (result.value === 'transformed') {
        mut_transformedCount += 1;
      } else {
        mut_unchangedCount += 1;
      }
    } else {
      mut_errorFiles.push(path.basename(filePath));
    }
  }

  return {
    transformedCount: mut_transformedCount,
    unchangedCount: mut_unchangedCount,
    errorFiles: mut_errorFiles,
  };
};

const transformOneFile = async (
  filePath: string,
  transformers: readonly TsMorphTransformer[],
  silent: boolean,
): Promise<Result<'unchanged' | 'transformed', string>> => {
  const echoIfNotSilent = silent ? () => {} : console.log;

  const errorIfNotSilent = silent ? () => {} : console.error;

  const fileName = path.basename(filePath);

  const isTsx = fileName.endsWith('.tsx') || fileName.endsWith('.jsx');

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const originalCode = await fs.readFile(filePath, 'utf8');

    const transformedCode = transformSourceCode(
      originalCode,
      isTsx,
      transformers,
    );

    if (transformedCode === originalCode) {
      echoIfNotSilent(`⏭️ ${fileName} - no changes needed`);

      return Result.ok('unchanged');
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, transformedCode, 'utf8');

    echoIfNotSilent(`✅ ${fileName} - transformed`);

    return Result.ok('transformed');
  } catch (error) {
    const errStr = unknownToString(error);

    errorIfNotSilent(`❌ ${fileName} - error: ${errStr}`);

    return Result.err(errStr);
  }
};
