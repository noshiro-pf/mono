import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { glob, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/**
 * Fails on a `// Result:` comment in `samples/src/` that is not inside an
 * `expectType<…>(…)` call. A sample's result is copied into the JSDoc
 * `@example` of the type, and a comment is checked by nothing, so a wrong one
 * ships in the published docs (#2966); written as the second type argument of
 * `expectType<…, …>('=')`, a wrong result fails `check:types`.
 *
 * Read line by line, as the samples are written: an `expectType<` line opens
 * the call, and the line holding its `>(` closes it.
 */
const findUncheckedResults = (text: string): readonly number[] => {
  const mut_lines: number[] = [];

  let mut_inExpectType = false;

  for (const [index, line] of text.split(/\r?\n/u).entries()) {
    if (line.includes('expectType<')) {
      mut_inExpectType = true;
    }

    if (!mut_inExpectType && line.trimStart().startsWith('// Result:')) {
      mut_lines.push(index + 1);
    }

    if (mut_inExpectType && line.includes('>(')) {
      mut_inExpectType = false;
    }
  }

  return mut_lines;
};

const filesResult = await glob('samples/src/**/*.mts', {
  cwd: workspaceRootPath,
});

if (Result.isErr(filesResult)) {
  console.error(filesResult.value);

  process.exit(1);
}

const files: readonly string[] = filesResult.value;

const perFile = await Promise.all(
  files.map(async (file) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a sample file of this package.
    const text = await fs.readFile(
      path.resolve(workspaceRootPath, file),
      'utf8',
    );

    return findUncheckedResults(text).map((line) => `  ${file}:${line}`);
  }),
);

const offenders = perFile.flat();

if (Arr.isNonEmpty(offenders)) {
  console.error(
    [
      `❌ ${offenders.length} sample result(s) written as a comment nothing checks:`,
      '',
      ...offenders,
      '',
      "State the result as the second type argument of `expectType<…, …>('=')` (from ts-data-forge), keeping `// Result:` inside it.",
    ].join('\n'),
  );

  process.exit(1);
}

console.info(
  `${files.length} sample file(s) state their results with expectType.`,
);
