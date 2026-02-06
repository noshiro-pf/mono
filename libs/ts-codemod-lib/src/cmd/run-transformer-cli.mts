/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable no-await-in-loop */

import dedent from 'dedent';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from 'ts-repo-utils';
import {
  transformSourceCode,
  type TsMorphTransformer,
} from '../functions/index.mjs';

type GetFilesOptions = Readonly<{
  baseDir: string;
  exclude: readonly string[];
  uncommitted: boolean;
  silent: boolean;
}>;

type TransformerCLIOptions = GetFilesOptions;

export const runTransformerCLI = async (
  options: TransformerCLIOptions,
  transformers: readonly TsMorphTransformer[],
): Promise<Result<undefined, undefined>> => {
  const echoIfNotSilent = options.silent ? () => {} : echo;

  const errorIfNotSilent = options.silent ? () => {} : console.error;

  const filesResult = await getFilesForTransformation(options);

  if (Result.isErr(filesResult)) {
    errorIfNotSilent(
      options.uncommitted
        ? 'Error getting uncommitted files:'
        : 'Error finding files matching pattern:',
      filesResult.value,
    );

    return Result.err(undefined);
  }

  const files = filesResult.value;

  if (files.length === 0) {
    echoIfNotSilent(
      options.uncommitted
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

  if (errorFiles.length > 0) {
    echoIfNotSilent('\nFiles with errors:');

    for (const fileName of errorFiles) {
      echoIfNotSilent(`  - ${fileName}`);
    }
  }

  echoIfNotSilent(hr);

  if (errorFiles.length > 0) {
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

  if (options.uncommitted) {
    const uncommittedFiles = await getUncommittedFiles(options.silent);

    if (Result.isErr(uncommittedFiles)) {
      return uncommittedFiles;
    }

    return Result.map(filesFromGlob, (files) =>
      Arr.setIntersection(files, uncommittedFiles.value),
    );
  }

  return filesFromGlob;
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
    ignore: exclude,
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
      switch (result.value) {
        case 'transformed':
          mut_transformedCount += 1;

          break;

        case 'unchanged':
          mut_unchangedCount += 1;

          break;
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
  const echoIfNotSilent = silent ? () => {} : echo;

  const errorIfNotSilent = silent ? () => {} : console.error;

  const fileName = path.basename(filePath);

  const isTsx = fileName.endsWith('.tsx') || fileName.endsWith('.jsx');

  try {
    const originalCode = await fs.readFile(filePath, 'utf8');

    const transformedCode = transformSourceCode(
      originalCode,
      isTsx,
      transformers,
    );

    if (transformedCode === originalCode) {
      echoIfNotSilent(`⏭️ ${fileName} - no changes needed`);

      return Result.ok('unchanged');
    } else {
      await fs.writeFile(filePath, transformedCode, 'utf8');

      echoIfNotSilent(`✅ ${fileName} - transformed`);

      return Result.ok('transformed');
    }
  } catch (error) {
    const errStr = unknownToString(error);

    errorIfNotSilent(`❌ ${fileName} - error: ${errStr}`);

    return Result.err(errStr);
  }
};
