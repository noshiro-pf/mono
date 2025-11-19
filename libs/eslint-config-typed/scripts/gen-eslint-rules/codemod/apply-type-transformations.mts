#!/usr/bin/env node

import { Arr } from 'ts-data-forge';
import 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { convertToReadonlyTypeTransformer } from './ast-transformers/convert-to-readonly-type.mjs';
import { convertInterfaceToTypeTransformer } from './ast-transformers/index.mjs';
import { replaceRecordWithUnknownRecordTransformer } from './ast-transformers/replace-record-with-unknown-record.mjs';
import { transformSourceCode } from './ast-transformers/transform-source-code.mjs';

const TYPES_RULES_DIR = path.resolve(projectRootPath, 'src/types/rules');

export const applyTypeTransformations = async (): Promise<void> => {
  console.log('🔄 Applying type transformations to src/types/rules files...\n');

  // Get all .mts files in src/types/rules
  const fileNames = await fs.readdir(TYPES_RULES_DIR);

  const files = fileNames
    .filter((file) => file.endsWith('.mts'))
    .map((file) => path.join(TYPES_RULES_DIR, file));

  console.log(`Found ${files.length} files to process\n`);

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

  console.log(`\n${'='.repeat(50)}`);

  console.log('Summary:');

  console.log(`  ✅ Transformed: ${mut_successCount}`);

  console.log(`  ⏭️  Unchanged:   ${mut_unchangedCount}`);

  console.log(`  ❌ Errors:      ${mut_errorCount}`);

  console.log(`  📊 Total:       ${files.length}`);

  if (mut_errorFiles.length > 0) {
    console.log('\nFiles with errors:');

    for (const fileName of mut_errorFiles) {
      console.log(`  - ${fileName}`);
    }
  }

  console.log('='.repeat(50));

  if (mut_errorCount > 0) {
    process.exit(1);
  }
};

export const applyTransformationsToFile = async (
  filePath: string,
): Promise<Result<'unchanged' | 'transformed', string>> => {
  const fileName = path.basename(filePath);

  try {
    const originalCode = await fs.readFile(filePath, 'utf8');

    // Transform the code with all transformers
    const transformedCode = transformSourceCode(originalCode, false, [
      convertInterfaceToTypeTransformer(),
      convertToReadonlyTypeTransformer(),
      replaceRecordWithUnknownRecordTransformer(),
    ]);

    // Check if the code was actually changed
    if (transformedCode === originalCode) {
      console.log(`⏭️ ${fileName} - no changes needed`);

      return Result.ok('unchanged' as const);
    } else {
      // Write back the transformed code
      await fs.writeFile(filePath, transformedCode, 'utf8');

      console.log(`✅ ${fileName} - transformed`);

      return Result.ok('transformed' as const);
    }
  } catch (error) {
    console.log(typeof error);

    const errStr = Error.isError(error) ? error.message : String(error);

    console.error(`❌ ${fileName} - error: ${errStr}`);

    return Result.err(errStr);
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const args = process.argv.slice(2);

  await (Arr.isNonEmpty(args)
    ? applyTransformationsToFile(args[0])
    : applyTypeTransformations());
}
