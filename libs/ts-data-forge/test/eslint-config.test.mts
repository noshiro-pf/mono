import * as path from 'node:path';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules
import { defineImportProbe } from '../../../tools/configs/eslint-import-probe.mjs';

// `eslint.config.mts` keeps the library's own source from importing the `Arr`
// and `Num` objects, which esbuild would keep whole in a consumer's bundle. A
// later block that sets `no-restricted-imports` again would turn that off with
// nothing failing, so this lints a source file the way `check:lint` does.
describe('eslint.config.mts', () => {
  const restrictedImportLines = defineImportProbe({
    packageRoot: path.resolve(import.meta.dirname, '..'),
    sourcePath: 'src/object/object.mts',
  });

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
