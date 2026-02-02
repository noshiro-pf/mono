#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import * as cmd from 'cmd-ts';
import dedent from 'dedent';
import { castMutable, Result, unknownToString } from 'ts-data-forge';
import 'ts-repo-utils';
import {
  replaceRecordWithUnknownRecordTransformer,
  transformSourceCode,
} from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'replace-record-with-unknown-record',
  version: '1.3.1',
  args: {
    baseDir: cmd.positional({
      type: cmd.string,
      displayName: 'baseDir',
      description: 'The base directory in which to perform the conversion',
    }),
    exclude: cmd.multioption({
      long: 'exclude',
      type: cmd.optional(cmd.array(cmd.string)),
      description:
        'Glob patterns of files to exclude from the base directory (e.g., "src/generated/**/*.mts")',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
    }),
  },
  handler: (args) => {
    replaceRecordWithUnknownRecordCLI({
      baseDir: args.baseDir,
      exclude: args.exclude ?? [],
      silent: args.silent ?? false,
    }).catch((error: unknown) => {
      console.error('An error occurred:', error);

      process.exit(1);
    });
  },
});

type Args = Readonly<{
  baseDir: string;
  exclude: readonly string[];
  silent: boolean;
}>;

const replaceRecordWithUnknownRecordCLI = async (
  args: Args,
): Promise<Result<undefined, undefined>> => {
  const echoIfNotSilent = args.silent ? () => {} : echo;

  const errorIfNotSilent = args.silent ? () => {} : console.error;

  // Find all files matching the glob
  const globResult = await glob(args.baseDir, {
    ignore: castMutable(args.exclude),
  });

  if (Result.isErr(globResult)) {
    errorIfNotSilent('Error finding files matching pattern:', globResult.value);

    return Result.err(undefined);
  }

  const files = globResult.value;

  if (files.length === 0) {
    echoIfNotSilent('No files found matching pattern:', args.baseDir);

    return Result.ok(undefined);
  }

  const { errorFiles, transformedCount, unchangedCount } = await transformFiles(
    files,
    args.silent,
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

const transformFiles = async (
  filePaths: readonly string[],
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
    const result = await transformOneFile(filePath, silent);

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
  silent: boolean,
): Promise<Result<'unchanged' | 'transformed', string>> => {
  const echoIfNotSilent = silent ? () => {} : echo;

  const errorIfNotSilent = silent ? () => {} : console.error;

  const fileName = path.basename(filePath);

  const isTsx = fileName.endsWith('.tsx') || fileName.endsWith('.jsx');

  try {
    const originalCode = await fs.readFile(filePath, 'utf8');

    // Transform the code with all transformers
    const transformedCode = transformSourceCode(originalCode, isTsx, [
      replaceRecordWithUnknownRecordTransformer(),
    ]);

    // Check if the code was actually changed
    if (transformedCode === originalCode) {
      echoIfNotSilent(`⏭️ ${fileName} - no changes needed`);

      return Result.ok('unchanged');
    } else {
      // Write back the transformed code
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

await cmd.run(cmdDef, process.argv.slice(2));
