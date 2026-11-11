import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { defineImportProbe } from '../../../tools/configs/eslint-import-probe.mjs';

// The import allow-list in eslint.config.mts is what keeps `Arr`, `SafeUint`
// and the like from the ts-data-forge root out of src/, and a block after it
// that sets `no-restricted-imports` again (the Sumi block did) turns it off with
// nothing failing. So this lints probe text the way `check:lint` lints a source
// file.
describe('eslint.config.mts', () => {
  const restrictedImportLines = defineImportProbe({
    packageRoot: path.resolve(import.meta.dirname, '..'),
    sourcePath: 'src/core/combine/zip.mts',
  });

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
        "import { asSafeUint as B, type SafeUint } from 'ts-data-forge';",
        "import { Optional as C } from 'ts-std-forge';",
        '',
        'export const used: readonly [unknown, unknown, unknown, SafeUint] = [',
        '  A,',
        '  B,',
        '  C,',
        '  B(0),',
        '];',
        '',
      ].join('\n'),
    );

    assert.deepStrictEqual(lines, []);
  }, 60_000);
});
