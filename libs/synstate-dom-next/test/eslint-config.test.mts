/**
 * The check of synstate-next's `test/ported/eslint-config.test.mts`, with the
 * paths and the allowed names of synstate-dom-next.
 */
import { ESLint } from 'eslint';
import * as path from 'node:path';

const packageRootPath = path.resolve(import.meta.dirname, '..');

// The import allow-list in eslint.config.mts is what keeps `Arr`, `SafeUint`
// and the like from the ts-data-forge root out of src/, and a block after it
// that sets `no-restricted-imports` again turns it off with nothing failing.
// So this lints probe text the way `check:lint` lints a source file.
describe('eslint.config.mts', () => {
  // The probe text is linted under the path of a real file. With `CI` set,
  // typescript-estree assumes no file changes during the run and parses that
  // file from disk instead of the text given, so that inference is turned off.
  // Only the rule under test runs: rules that read the TypeScript program can
  // still see the file's contents.
  const eslint = new ESLint({
    cwd: packageRootPath,
    overrideConfig: {
      languageOptions: {
        parserOptions: { disallowAutomaticSingleRunInference: true },
      },
    },
    ruleFilter: ({ ruleId }) => ruleId === 'no-restricted-imports',
  });

  const filePath = path.resolve(packageRootPath, 'src/render.mts');

  const restrictedImportLines = async (
    code: string,
  ): Promise<readonly number[]> => {
    const results = await eslint.lintText(code, { filePath });

    return results
      .flatMap((r) => r.messages)
      .filter((m) => m.ruleId === 'no-restricted-imports')
      .map((m) => m.line);
  };

  test('refuses objects from the ts-data-forge root in src/', async () => {
    const lines = await restrictedImportLines(
      [
        "import { Arr as A } from 'ts-data-forge';",
        "import { SafeUint as B } from 'ts-data-forge';",
        "import { Num as C } from 'ts-data-forge';",
        "import { Arr as D } from 'ts-std-forge';",
        '',
        'export const used = [A, B, C, D];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, [1, 2, 3, 4]);
  }, 60_000);

  test('allows the subpath, standalone functions and type imports', async () => {
    const lines = await restrictedImportLines(
      [
        "import * as A from 'ts-data-forge/array';",
        "import { isNonNullObject as B, type SafeUint } from 'ts-data-forge';",
        "import { Optional as C } from 'ts-std-forge';",
        '',
        'export const used: readonly [unknown, unknown, unknown, SafeUint | undefined] = [',
        '  A,',
        '  B,',
        '  C,',
        '  undefined,',
        '];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);
});
