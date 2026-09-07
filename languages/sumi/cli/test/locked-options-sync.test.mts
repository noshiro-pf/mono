import * as fs from 'node:fs';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  lockedCompilerOptions,
  validateCompilerOptions,
} from '../src/index.mjs';

const projectRootPath = path.resolve(import.meta.dirname, '..');

/**
 * The files that carry the lock in JSON form have to agree with
 * `lockedCompilerOptions`, the single source of truth the checker reads.
 */
const readCompilerOptions = (
  jsoncPath: string,
): ReadonlyRecord<string, unknown> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const raw = fs.readFileSync(jsoncPath, 'utf8');

  const text = raw
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('//'))
    .join('\n')
    .replaceAll(/,(\s*[}\]])/gu, '$1');

  const parsed: unknown = JSON.parse(text);

  const compilerOptions =
    isRecord(parsed) && hasKey(parsed, 'compilerOptions')
      ? parsed.compilerOptions
      : undefined;

  return isRecord(compilerOptions) ? compilerOptions : {};
};

describe('locked compilerOptions', () => {
  test('tsconfig.base.json carries every locked entry verbatim', () => {
    const compilerOptions = readCompilerOptions(
      path.join(projectRootPath, 'tsconfig.base.json'),
    );

    for (const [option, expected] of Object.entries(lockedCompilerOptions)) {
      assert.deepStrictEqual(
        [option, compilerOptions[option]],
        [option, expected],
      );
    }

    assert.deepStrictEqual(validateCompilerOptions(compilerOptions), []);
  });

  test('the conformance corpus is checked under the lock', () => {
    const compilerOptions = readCompilerOptions(
      path.join(projectRootPath, '../conformance/fixtures/tsconfig.json'),
    );

    assert.deepStrictEqual(validateCompilerOptions(compilerOptions), []);
  });
});
