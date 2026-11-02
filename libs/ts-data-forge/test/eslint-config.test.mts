import { ESLint } from 'eslint';
import * as path from 'node:path';

const workspaceRootPath = path.resolve(import.meta.dirname, '..');

// `eslint.config.mts` keeps the library's own source from importing the `Arr`
// object, which esbuild would keep whole in a consumer's bundle. A later block
// that sets `no-restricted-imports` again would turn that off with nothing
// failing, so this lints a source file the way `check:lint` does.
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

  const filePath = path.resolve(workspaceRootPath, 'src/object/object.mts');

  const restrictedImportLines = async (
    code: string,
  ): Promise<readonly number[]> => {
    const results = await eslint.lintText(code, { filePath });

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
