import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runOxlint } from '../src/index.mjs';

/**
 * The corpus is `.mts`-only, where `<T>(...)` does not even parse (TS7060),
 * so the rule's positive case is exercised here on `.ts` / `.tsx` files,
 * through the real preset (`runOxlint`), in a temporary project.
 */

const CODE = 'sumi(generic-arrow-trailing-comma)';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-trailing-comma-'));

const write = (name: string, code: string): string => {
  const file = path.join(dir, name);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, code);

  return file;
};

write(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      strict: true,
      module: 'nodenext',
      moduleResolution: 'nodenext',
      target: 'esnext',
      jsx: 'react-jsx',
      noEmit: true,
      types: [],
      lib: ['esnext'],
    },
    include: ['*.ts', '*.tsx'],
  }),
);

const files = {
  missing: write(
    'missing.ts',
    'export const id = <T>(value: T): T => value;\n',
  ),
  present: write(
    'present.ts',
    'export const id = <T,>(value: T): T => value;\n',
  ),
  two: write(
    'two.tsx',
    'export const pair = <A, B>(a: A, b: B): readonly [A, B] => [a, b];\n',
  ),
  none: write('none.tsx', 'export const plain = (n: number): number => n;\n'),
} as const;

const run = runOxlint(Object.values(files));

const codesOf = (file: string): readonly string[] =>
  run.diagnostics.filter((d) => d.filename === file).map((d) => d.code);

describe('generic-arrow-trailing-comma (on .ts / .tsx)', () => {
  test('reports a single type parameter written without the trailing comma', () => {
    assert.deepStrictEqual(codesOf(files.missing), [CODE]);
  });

  test('accepts `<T,>`, two type parameters, and no type parameters', () => {
    assert.deepStrictEqual(codesOf(files.present), []);

    assert.deepStrictEqual(codesOf(files.two), []);

    assert.deepStrictEqual(codesOf(files.none), []);
  });
});
