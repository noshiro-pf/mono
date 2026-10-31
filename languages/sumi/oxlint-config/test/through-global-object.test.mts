import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runOxlint } from '../src/index.mjs';

/**
 * The plugin rules that match a global constructor, reached through the global
 * object (`globalThis.Number`). The corpus holds the forms that reach the real
 * global; what is left alone — a global object or a constructor that a user
 * declaration shadows, and a key that is not static — is a binding the corpus
 * cannot hold, since a valid fixture must type-check under the strict standard
 * library, so it is exercised here.
 */

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-global-object-'));

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
      noEmit: true,
      types: [],
      lib: ['esnext', 'dom'],
    },
    include: ['*.ts'],
  }),
);

const files = {
  reported: write(
    'reported.ts',
    [
      "export const a = window.Number('1');",
      "export const b = self['String'](1);",
      'export const c = new globalThis.Array(3);',
      '',
    ].join('\n'),
  ),
  shadowed: write(
    'shadowed.ts',
    [
      'type Holder = { readonly Number: (text: string) => number; readonly Array: new (n: number) => unknown };',
      "export const a = (globalThis: Holder): number => globalThis.Number('1');",
      'export const b = (globalThis: Holder): unknown => new globalThis.Array(3);',
      'export const c = (Array: new (n: number) => unknown): unknown => new Array(3);',
      '',
    ].join('\n'),
  ),
  dynamicKey: write(
    'dynamic-key.ts',
    [
      "declare const key: 'Number' | 'String';",
      "export const a = globalThis[key]('1');",
      "export const b = globalThis.parseFloat('1');",
      '',
    ].join('\n'),
  ),
} as const;

const run = runOxlint(Object.values(files));

const linesOf = (file: string, code: string): readonly number[] =>
  run.diagnostics
    .filter((d) => d.filename === file && d.code === code)
    .map((d) => d.line);

describe('the plugin rules through the global object', () => {
  test('sumi/no-constructor-call sees `window` and `self` too', () => {
    assert.deepStrictEqual(
      linesOf(files.reported, 'sumi(no-constructor-call)'),
      [1, 2],
    );
  });

  test('sumi/no-new-array sees `globalThis.Array`', () => {
    assert.deepStrictEqual(linesOf(files.reported, 'sumi(no-new-array)'), [3]);
  });

  test('a shadowed global object or constructor is left alone', () => {
    assert.deepStrictEqual(
      linesOf(files.shadowed, 'sumi(no-constructor-call)'),
      [],
    );

    assert.deepStrictEqual(linesOf(files.shadowed, 'sumi(no-new-array)'), []);
  });

  test('a key that is not static, or not a banned constructor, is left alone', () => {
    assert.deepStrictEqual(
      linesOf(files.dynamicKey, 'sumi(no-constructor-call)'),
      [],
    );
  });
});
