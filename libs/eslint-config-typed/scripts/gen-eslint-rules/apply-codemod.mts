#!/usr/bin/env node

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  convertInterfaceToTypeTransformer,
  convertToReadonlyTransformer,
  replaceRecordWithUnknownRecordTransformer,
  transformSourceCode,
  type TsMorphTransformer,
} from 'ts-codemod-lib';
import { Arr, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import * as ts from 'typescript';
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

    // The same three transformers in the same order as one
    // `transformSourceCode` call over the file, but the two that rewrite only
    // inside a declaration run one top-level statement at a time — see
    // `transformEachStatement`.
    const transformedCode = transformEachStatement(
      transformSourceCode(
        transformEachStatement(originalCode, [
          convertInterfaceToTypeTransformer(),
        ]),
        false,
        // It adds the `UnknownRecord` import at the top of the file, so it
        // needs the whole file.
        [replaceRecordWithUnknownRecordTransformer()],
      ),
      [convertToReadonlyTransformer()],
    );

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

    const errStr = Error.isError(error)
      ? error.message
      : unknownToString(error);

    console.error(`❌ ${fileName} - error: ${errStr}`);

    return Result.err(errStr);
  }
};

/**
 * `transformSourceCode(code, false, transformers)` applied to each top-level
 * statement of `code` by itself, for transformers that read and rewrite only
 * inside the statement they are visiting.
 *
 * Each replacement a ts-morph transformer makes reparses the source file it is
 * in, so over a whole file the transformation is quadratic in its length, and
 * the larger rule files here (one `namespace` per rule) took the better part of
 * a minute each. One statement at a time it is linear.
 *
 * Every statement but the first is transformed behind a `;` that is removed
 * again, so that its leading comments start after a token, as they do in the
 * file; at the start of a file, the comments on the same line as the statement
 * before would count as its own. What follows the last statement is kept as it
 * is.
 */
const transformEachStatement = (
  code: string,
  transformers: readonly TsMorphTransformer[],
): string => {
  const { statements } = ts.createSourceFile(
    'source.mts',
    code,
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
  );

  const last = statements.at(-1);

  if (last === undefined) {
    return transformSourceCode(code, false, transformers);
  }

  const transformedStatements = statements.map((statement, index) => {
    const statementText = code.slice(statement.pos, statement.end);

    if (index === 0) {
      return transformSourceCode(statementText, false, transformers);
    }

    const transformed = transformSourceCode(
      `${statementSeparator}${statementText}`,
      false,
      transformers,
    );

    if (!transformed.startsWith(statementSeparator)) {
      throw new Error(
        `A transformer rewrote the \`${statementSeparator}\` in front of a statement.`,
      );
    }

    return transformed.slice(statementSeparator.length);
  });

  return Arr.toPushed(transformedStatements, code.slice(last.end)).join('');
};

const statementSeparator = ';';

if (isDirectlyExecuted(import.meta.url)) {
  const args = Arr.skip(process.argv, 2);

  await (Arr.isNonEmpty(args)
    ? applyTransformationsToFile(args[0])
    : applyTypeTransformations());
}
