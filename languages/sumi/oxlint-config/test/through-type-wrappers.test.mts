import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runOxlint } from '../src/index.mjs';

/**
 * The plugin rules that match a callee or a specifier, read through `as`,
 * `satisfies`, `!` and `<T>` (docs/writing-lint-rules.md at the repository
 * root). The corpus holds the `satisfies` and `as` forms; `<T>` does not parse
 * in an `.mts` file (TS7059) and `!` is a violation of its own there, so those
 * two are exercised here on `.ts` files, through the real preset.
 */

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-type-wrappers-'));

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
      lib: ['esnext'],
    },
    include: ['*.ts'],
  }),
);

const files = {
  constructorCallAsserted: write(
    'constructor-call-asserted.ts',
    [
      "export const parsed = (<NumberConstructor>Number)('1');",
      'export const truthy = Boolean!(1);',
      '',
    ].join('\n'),
  ),
  constructorCallShadowed: write(
    'constructor-call-shadowed.ts',
    [
      'const convert = (Number: (text: string) => number): number =>',
      "  (Number satisfies (text: string) => number)('1');",
      'export const converted = convert((text) => text.length);',
      '',
    ].join('\n'),
  ),
  newArrayAsserted: write(
    'new-array-asserted.ts',
    [
      'export const holes = new (<ArrayConstructor>Array)(3);',
      'export const pair = new Array!(1, 2);',
      '',
    ].join('\n'),
  ),
} as const;

const run = runOxlint(Object.values(files));

const linesOf = (file: string, code: string): readonly number[] =>
  run.diagnostics
    .filter((d) => d.filename === file && d.code === code)
    .map((d) => d.line);

describe('the plugin rules through type wrappers', () => {
  test('sumi/no-constructor-call sees a callee behind `<T>` and `!`', () => {
    assert.deepStrictEqual(
      linesOf(files.constructorCallAsserted, 'sumi(no-constructor-call)'),
      [1, 2],
    );
  });

  test('sumi/no-constructor-call still leaves a local binding alone', () => {
    assert.deepStrictEqual(
      linesOf(files.constructorCallShadowed, 'sumi(no-constructor-call)'),
      [],
    );
  });

  test('sumi/no-new-array sees a constructor behind `<T>` and `!`', () => {
    assert.deepStrictEqual(
      linesOf(files.newArrayAsserted, 'sumi(no-new-array)'),
      [1, 2],
    );
  });
});
