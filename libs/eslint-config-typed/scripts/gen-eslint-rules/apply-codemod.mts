#!/usr/bin/env node

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  convertInterfaceToTypeTransformer,
  convertToReadonlyTransformer,
  replaceRecordWithUnknownRecordTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';
import { Arr } from 'ts-data-forge';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const TYPES_RULES_DIR = path.resolve(projectRootPath, 'src/types/rules');

export const applyTypeTransformations = async (): Promise<void> => {
  console.info(
    '🔄 Applying type transformations to src/types/rules files...\n',
  );

  // Get all .mts files in src/types/rules
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const fileNames = await fs.readdir(TYPES_RULES_DIR);

  const files = fileNames
    .filter((file) => file.endsWith('.mts'))
    .map((file) => path.join(TYPES_RULES_DIR, file));

  console.info(`Found ${files.length} files to process\n`);

  let mut_successCount = 0;

  let mut_unchangedCount = 0;

  let mut_errorCount = 0;

  const mut_errorFiles: string[] = [];

  for (const filePath of files) {
    const result = await applyTransformationsToFile(filePath);

    const fileName = path.basename(filePath);

    if (Result.isErr(result)) {
      mut_errorCount += 1;

      mut_errorFiles.push(fileName);
    } else {
      switch (result.value) {
        case 'transformed': {
          mut_successCount += 1;

          break;
        }

        case 'unchanged': {
          mut_unchangedCount += 1;

          break;
        }
      }
    }
  }

  console.info(`\n${'='.repeat(50)}`);

  console.info('Summary:');

  console.info(`  ✅ Transformed: ${mut_successCount}`);

  console.info(`  ⏭️  Unchanged:   ${mut_unchangedCount}`);

  console.info(`  ❌ Errors:      ${mut_errorCount}`);

  console.info(`  📊 Total:       ${files.length}`);

  if (Arr.isNonEmpty(mut_errorFiles)) {
    console.info('\nFiles with errors:');

    for (const fileName of mut_errorFiles) {
      console.info(`  - ${fileName}`);
    }
  }

  console.info('='.repeat(50));

  if (mut_errorCount > 0) {
    process.exit(1);
  }
};

export const applyTransformationsToFile = async (
  filePath: string,
): Promise<Result<'unchanged' | 'transformed', string>> => {
  const fileName = path.basename(filePath);

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const originalCode = await fs.readFile(filePath, 'utf8');

    // Transform the code with all transformers
    const transformedCode = transformSourceCode(originalCode, false, [
      convertInterfaceToTypeTransformer(),
      replaceRecordWithUnknownRecordTransformer(),
      convertToReadonlyTransformer(),
    ]);

    // Check if the code was actually changed
    if (transformedCode === originalCode) {
      console.info(`⏭️ ${fileName} - no changes needed`);

      return Result.ok('unchanged' as const);
    }

    // Write back the transformed code
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, transformedCode, 'utf8');

    console.info(`✅ ${fileName} - transformed`);

    return Result.ok('transformed' as const);
  } catch (error) {
    console.info(typeof error);

    const errStr = Error.isError(error) ? error.message : String(error);

    console.error(`❌ ${fileName} - error: ${errStr}`);

    return Result.err(errStr);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const args = Arr.skip(process.argv, 2);

  await (Arr.isNonEmpty(args)
    ? applyTransformationsToFile(args[0])
    : applyTypeTransformations());
}
