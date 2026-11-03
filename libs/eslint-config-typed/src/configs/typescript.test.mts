import dedent from 'dedent';
import { ESLint, type Linter } from 'eslint';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import { eslintConfigForTypeScript } from './typescript.mjs';

// `--fix` rewrites without saying so, and an unsafe rewrite surfaces later as a
// changed test result or a type error that names no rule. Each case is a fix
// some rule in the preset once applied; the preset must leave the code as it
// was, whether by a rule being off or by a fix being only a suggestion.
describe(eslintConfigForTypeScript, () => {
  const packageRoot = path.resolve(import.meta.dirname, '../..');

  const eslint = new ESLint({
    cwd: packageRoot,
    overrideConfigFile: true,
    overrideConfig: Array.from(
      Arr.toPushed(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the preset's flat config, which ESLint validates
        eslintConfigForTypeScript({
          tsconfigFileName: 'tsconfig.json',
          tsconfigRootDir: packageRoot,
          packageDirs: [packageRoot],
        }) as readonly Linter.Config[],
        {
          // Under `CI=true` typescript-eslint infers a single run and builds
          // the program from the files on disk, so `lintText` would lint
          // `src/entry-point.mts` as it is rather than the code given.
          languageOptions: {
            parserOptions: { disallowAutomaticSingleRunInference: true },
          },
        } satisfies Linter.Config,
      ),
    ),
    fix: true,
  });

  /**
   * The text `--fix` leaves, and the rules still reporting on it, linted as a
   * source file of this package.
   */
  const fix = async (
    code: string,
  ): Promise<Readonly<{ output: string; ruleIds: readonly string[] }>> => {
    const [result] = await eslint.lintText(code, {
      filePath: path.join(packageRoot, 'src/entry-point.mts'),
    });

    assert.isDefined(result);

    return {
      output: result.output ?? code,
      ruleIds: result.messages.map(({ ruleId }) => ruleId ?? ''),
    };
  };

  test('`.then(onFulfilled, onRejected)` keeps both handlers in one call', async () => {
    // `.catch(onRejected).then(onFulfilled)` calls `onFulfilled` after a
    // rejection too, so this would always resolve to `true`.
    const code = dedent`
      export const settled = async (
        promise: Promise<unknown>,
      ): Promise<boolean> =>
        promise.then(
          () => true,
          () => false,
        );
    `;

    const { output, ruleIds } = await fix(code);

    expect(output).not.toContain('.catch(');

    // Still reported, with a suggestion an editor applies only when asked.
    expect(ruleIds).toContain('unicorn/prefer-then-catch');
  });

  test('a spread array is not rewritten to `Iterator.concat`', async () => {
    // Neither the TypeScript standard library nor every supported Node.js
    // version has `Iterator.concat`.
    const code = dedent`
      export const merge = (
        a: ReadonlyMap<string, number>,
        b: ReadonlyMap<string, number>,
      ): ReadonlyMap<string, number> => new Map([...a, ...b]);
    `;

    const { output, ruleIds } = await fix(code);

    expect(output).not.toContain('Iterator.concat');

    // Off, not suggestion-only: there is nothing to suggest until the library
    // and every supported Node.js version have `Iterator.concat`.
    expect(ruleIds).not.toContain('unicorn/prefer-iterator-concat');
  });

  test('`instanceof Error` is not rewritten to `Error.isError`', async () => {
    // Node.js 22, which `engines` still admits, has no `Error.isError`, so the
    // fix would throw `TypeError: Error.isError is not a function` there.
    const code = dedent`
      export const isErrorValue = (value: unknown): boolean =>
        value instanceof Error;
    `;

    const { output, ruleIds } = await fix(code);

    expect(output).not.toContain('Error.isError');

    expect(ruleIds).not.toContain('unicorn/prefer-error-is-error');

    // Still reported, with no fix, as every `instanceof` on a builtin is.
    expect(ruleIds).toContain('unicorn/no-instanceof-builtins');
  });

  test('`Error.isError` written by hand is reported', async () => {
    const code = dedent`
      export const isErrorValue = (value: unknown): boolean =>
        Error.isError(value);
    `;

    const { ruleIds } = await fix(code);

    expect(ruleIds).toContain('no-restricted-properties');
  });

  test('`Error.isError` stays restricted only while `engines` admits a Node.js without it', async () => {
    // When the floor reaches 24 this fails: turn
    // `unicorn/prefer-error-is-error` and `useErrorIsError` back on, drop the
    // `no-restricted-properties` entry (here and in the oxlint table), and
    // delete these tests.
    const manifest: unknown = JSON.parse(
      await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'),
    );

    assert.isTrue(isRecord(manifest));

    const { engines } = manifest;

    assert.isTrue(isRecord(engines));

    const { node } = engines;

    assert.isTrue(typeof node === 'string');

    // `>=X.Y.Z`, as `check:root:node-support` writes it, with `X` below 24. Any
    // other form fails too, so that it is read before the restriction goes.
    assert.match(node, /^>=(?:1?\d|2[0-3])\.\d+\.\d+$/u);
  });
});
