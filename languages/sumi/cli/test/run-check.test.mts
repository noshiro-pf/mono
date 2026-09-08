import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { runCheck } from '../src/index.mjs';

const projectRootPath = path.resolve(import.meta.dirname, '..');

/**
 * End to end: a throwaway project per case, its tsconfig extending the base
 * one by path (a package name would need a node_modules), and the real
 * native tsc and oxlint spawned.
 */
const baseTsconfigPath = path.join(projectRootPath, 'tsconfig.base.json');

const makeProject = (
  files: ReadonlyRecord<string, string>,
  compilerOptions: ReadonlyRecord<string, unknown> = {},
): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-check-'));

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(dir, 'tsconfig.json'),
    JSON.stringify({
      extends: baseTsconfigPath,
      compilerOptions,
      include: ['**/*.mts'],
    }),
  );

  for (const [name, content] of Object.entries(files)) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(dir, name), `${content}\n`);
  }

  return dir;
};

describe(runCheck, () => {
  test('a clean project passes', () => {
    const dir = makeProject({
      'a.mts': dedent`
        export const double = (x: number): number => x * 2;
      `,
    });

    const result = runCheck(dir);

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(result.value.kind, 'checked');

    if (result.value.kind !== 'checked') return;

    assert.strictEqual(result.value.ok, true);

    assert.strictEqual(result.value.fileCount, 1);

    assert.deepStrictEqual(result.value.typeCheck.diagnostics, []);

    assert.deepStrictEqual(result.value.lint.diagnostics, []);
  });

  test('reports type errors and lint problems together', () => {
    const dir = makeProject({
      'a.mts': dedent`
        var n: number = 'x';
        export const m = n;
      `,
    });

    const result = runCheck(path.join(dir, 'tsconfig.json'));

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(result.value.kind, 'checked');

    if (result.value.kind !== 'checked') return;

    assert.strictEqual(result.value.ok, false);

    assert.deepStrictEqual(
      result.value.typeCheck.diagnostics.map((d) => [
        path.basename(d.filename),
        d.line,
        d.code,
      ]),
      [['a.mts', 1, 'TS2322']],
    );

    assert.deepStrictEqual(
      result.value.lint.diagnostics.map((d) => [
        path.basename(d.filename),
        d.line,
        d.code,
      ]),
      [['a.mts', 1, 'eslint(no-var)']],
    );
  });

  test('stops at a locked option overridden by the project', () => {
    const dir = makeProject(
      { 'a.mts': 'export const x = 1;' },
      { strict: false, module: 'esnext' },
    );

    const result = runCheck(dir);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, {
      kind: 'config-violation',
      tsconfigPath: path.join(dir, 'tsconfig.json'),
      violations: [
        { option: 'strict', expected: true, actual: false },
        { option: 'module', expected: 'nodenext', actual: 'esnext' },
      ],
    });
  });

  test('fails to start without a tsconfig', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-check-empty-'));

    const result = runCheck(dir);

    assert.isTrue(Result.isErr(result));
  });
});
