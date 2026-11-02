import { ESLint } from 'eslint';
import * as path from 'node:path';

const workspaceRootPath = path.resolve(import.meta.dirname, '..');

// `eslint.config.mts` keeps the library's own source from importing the `Arr`
// and `Num` objects, which esbuild would keep whole in a consumer's bundle. A
// later block that sets `no-restricted-imports` again would turn that off with
// nothing failing, so this lints a source file the way `check:lint` does.
describe('eslint.config.mts', () => {
  // The probe text is linted under the path of a real file. With `CI` set,
  // typescript-estree assumes no file changes during the run and parses that
  // file from disk instead of the text given, so that inference is turned off.
  // Only the rule under test runs: rules that read the TypeScript program can
  // still see the file's contents (`no-ragged-comment-wrap` throws).
  const eslint = new ESLint({
    cwd: workspaceRootPath,
    overrideConfig: {
      languageOptions: {
        parserOptions: { disallowAutomaticSingleRunInference: true },
      },
    },
    ruleFilter: ({ ruleId }) => ruleId === 'no-restricted-imports',
  });

  const restrictedImportLines = async (
    code: string,
    sourcePath = 'src/object/object.mts',
  ): Promise<readonly number[]> => {
    const results = await eslint.lintText(code, {
      filePath: path.resolve(workspaceRootPath, sourcePath),
    });

    return results
      .flatMap((r) => r.messages)
      .filter((m) => m.ruleId === 'no-restricted-imports')
      .map((m) => m.line);
  };

  test('refuses the Arr object and self-imports in src/', async () => {
    const lines = await restrictedImportLines(
      [
        "import { Arr as A } from '../array/index.mjs';",
        "import { Arr as B } from '../entry-point.mjs';",
        "import { Arr as C } from 'ts-data-forge';",
        "import * as D from 'ts-data-forge/array';",
        '',
        'export const used = [A, B, C, D];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, [1, 2, 3, 4]);
  }, 60_000);

  test('refuses the Num object in src/', async () => {
    const lines = await restrictedImportLines(
      [
        "import { Num as A } from '../number/num/index.mjs';",
        "import { Num as B } from '../number/index.mjs';",
        "import { Num as C } from '../entry-point.mjs';",
        "import * as D from 'ts-data-forge/number';",
        '',
        'export const used = [A, B, C, D];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, [1, 2, 3, 4]);
  }, 60_000);

  test('allows the impl barrel and type-only imports of Num', async () => {
    const lines = await restrictedImportLines(
      [
        "import type { Num as A } from '../number/index.mjs';",
        "import * as B from '../number/num/impl/index.mjs';",
        '',
        'export type T = typeof A;',
        '',
        'export const used = B;',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);

  test('refuses the Arr and Num objects in src/number/ too', async () => {
    const lines = await restrictedImportLines(
      [
        "import { Arr as A } from '../../array/index.mjs';",
        "import { Num as B } from '../num/index.mjs';",
        "import { PositiveInt as C } from './positive-int.mjs';",
        '',
        'export const used = [A, B, C];',
        '',
      ].join('\n'),
      'src/number/branded-types/negative-int.mts',
    );

    assert.deepStrictEqual(lines, [1, 2]);
  }, 60_000);

  test('refuses the branded-number objects outside src/number/', async () => {
    const lines = await restrictedImportLines(
      [
        "import { Uint32 as A } from '../number/index.mjs';",
        "import { SafeInt as B } from '../entry-point.mjs';",
        "import { asUint32 as C, type Uint32 as D } from '../number/index.mjs';",
        '',
        'export type T = D;',
        '',
        'export const used = [A, B, C];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, [1, 2]);
  }, 60_000);

  test('allows the impl barrel and type-only imports of Arr', async () => {
    const lines = await restrictedImportLines(
      [
        "import type { Arr as A } from '../array/index.mjs';",
        "import * as B from '../array/impl/index.mjs';",
        '',
        'export type T = typeof A;',
        '',
        'export const used = B;',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);
});
