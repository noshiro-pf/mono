import dedent from 'dedent';
import { ESLint, type Linter } from 'eslint';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Num, Result } from 'ts-data-forge';
import {
  nodeVersionGatedApis,
  nodeVersionGatedGlobals,
  nodeVersionGatedStaticApis,
  nodeVersionGatedSyntax,
} from '../rules/index.mjs';
import { eslintConfigForTypeScript } from './typescript.mjs';

// `--fix` rewrites without saying so, and an unsafe rewrite surfaces later as a
// changed test result or a type error that names no rule. Each case is a fix
// some rule in the preset once applied; the preset must leave the code as it
// was, whether by a rule being off or by a fix being only a suggestion.
describe(eslintConfigForTypeScript, () => {
  const packageRoot = path.resolve(import.meta.dirname, '../..');

  const eslintOf = (applyFixes: boolean): ESLint =>
    new ESLint({
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
      fix: applyFixes,
    });

  const eslint = eslintOf(true);

  // For a report that another rule's fix would otherwise answer first.
  const eslintWithoutFix = eslintOf(false);

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

  // Each of these rules fixes code into an API that not every Node.js in
  // `engines` has, and the result throws `TypeError: … is not a function` only
  // when the line runs there.
  test.each([
    {
      rule: 'unicorn/prefer-regexp-escape',
      api: 'RegExp.escape',
      code: String.raw`export const escape = (text: string): string => text.replace(/[$.*+?^{}()|[\]\\]/g, '\\$&');`,
    },
    {
      rule: 'unicorn/prefer-promise-try',
      api: 'Promise.try',
      code: dedent`
        export const attempt = async (f: () => number): Promise<number> =>
          new Promise((resolve) => resolve(f()));
      `,
    },
    {
      rule: 'unicorn/prefer-uint8array-base64',
      api: 'Base64',
      code: dedent`
        export const encode = (bytes: Uint8Array): string =>
          Buffer.from(bytes).toString('base64');
      `,
    },
    {
      rule: 'unicorn/prefer-get-or-insert-computed',
      api: 'getOrInsertComputed',
      code: dedent`
        declare const compute: () => number;

        export const cached = (
          cache: Readonly<{ getOrInsert: (key: string, value: number) => number }>,
          key: string,
        ): number => cache.getOrInsert(key, compute());
      `,
    },
  ])('`$rule` does not lead to `$api`', async ({ rule, api, code }) => {
    const { output, ruleIds } = await fix(code);

    expect(output).not.toContain(api);

    // Off, not suggestion-only: until every supported Node.js has the API there
    // is nothing to suggest.
    expect(ruleIds).not.toContain(rule);
  });

  describe('an API newer than the `engines.node` floor', () => {
    const gated = [
      ...nodeVersionGatedApis,
      ...nodeVersionGatedGlobals,
      ...nodeVersionGatedSyntax,
    ] as const;

    test.each(nodeVersionGatedApis)(
      '`$name` written by hand is reported',
      async ({ object, property }) => {
        const code =
          object === undefined
            ? (`export const f = (x: Readonly<{ ${property}: unknown }>): unknown => x.${property};\n` as const)
            : (`export const f = (): unknown => ${object}.${property};\n` as const);

        const { ruleIds } = await fix(code);

        expect(ruleIds).toContain('no-restricted-properties');
      },
    );

    test.each(nodeVersionGatedStaticApis)(
      '`globalThis.$name` written by hand is reported',
      async ({ object, property }) => {
        // Without `--fix`, because `unicorn/no-unnecessary-global-this` would
        // first rewrite it to the bare form.
        const [result] = await eslintWithoutFix.lintText(
          `export const f = (): unknown => globalThis.${object}.${property};\n`,
          { filePath: path.join(packageRoot, 'src/entry-point.mts') },
        );

        assert.isDefined(result);

        expect(result.messages.map(({ ruleId }) => ruleId)).toContain(
          'no-restricted-syntax',
        );
      },
    );

    test('every entry is one the floor has not reached', async () => {
      // An entry whose version the floor has reached fails here: delete it, and
      // turn back on what its comment names.
      const manifest: unknown = JSON.parse(
        await fs.readFile(path.join(packageRoot, 'package.json'), 'utf8'),
      );

      assert.isTrue(isRecord(manifest));

      const { engines } = manifest;

      assert.isTrue(isRecord(engines));

      const { node } = engines;

      assert.isTrue(typeof node === 'string');

      // `>=X.Y.Z`, as `check:root:node-support` writes it. Any other form fails
      // too, so that it is read before an entry goes.
      const floor = /^>=(?<major>\d+)\.\d+\.\d+$/u.exec(node)?.groups?.[
        'major'
      ];

      assert.isDefined(floor);

      const floorMajor = Num.safeParseInt(floor);

      assert.isTrue(Result.isOk(floorMajor));

      assert.deepStrictEqual(
        gated.filter(
          ({ nodeMajor }) =>
            nodeMajor !== undefined && nodeMajor <= floorMajor.value,
        ),
        [],
      );
    });

    // #3462: an entry's rules once lived in a comment, and nothing noticed one
    // turned back on while its entry stood.
    test.each(
      gated.flatMap(({ name, rules }) => rules.map((rule) => ({ name, rule }))),
    )('`$rule`, which writes `$name`, is off', async ({ rule }) => {
      const config: unknown = await eslintWithoutFix.calculateConfigForFile(
        path.join(packageRoot, 'src/entry-point.mts'),
      );

      assert.isTrue(isRecord(config) && isRecord(config['rules']));

      const setting: unknown = config['rules'][rule];

      const severity = Arr.isArray(setting) ? setting[0] : setting;

      assert.include([0, 'off'], severity);
    });

    test.each(nodeVersionGatedGlobals)(
      '`$name` written by hand is reported',
      async ({ name }) => {
        const [result] = await eslintWithoutFix.lintText(
          `export const f = (): unknown => ${name};\n`,
          { filePath: path.join(packageRoot, 'src/entry-point.mts') },
        );

        assert.isDefined(result);

        expect(result.messages.map(({ ruleId }) => ruleId)).toContain(
          'no-restricted-globals',
        );
      },
    );

    test('a `using` declaration written by hand is reported', async () => {
      const [result] = await eslintWithoutFix.lintText(
        dedent`
          export const f = (resource: Disposable): void => {
            using held = resource;

            console.log(held);
          };
        `,
        { filePath: path.join(packageRoot, 'src/entry-point.mts') },
      );

      assert.isDefined(result);

      expect(result.messages.map(({ ruleId }) => ruleId)).toContain(
        'no-restricted-syntax',
      );
    });
  });
});
