import dedent from 'dedent';
import { ESLint, type Linter } from 'eslint';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { eslintNRules } from '../rules/index.mjs';
import type { FlatConfig } from '../types/index.mjs';
import { eslintConfigForJest } from './jest.mjs';
import { eslintConfigForPlaywright } from './playwright.mjs';
import { eslintConfigForTypeScript } from './typescript.mjs';
import { eslintConfigForVitest } from './vitest.mjs';

// Two rules that report the same code report each violation twice, and a
// suppression has to name both. Each case is code that two or more rules of the
// presets once all reported; only the one kept may still report it. A rule
// turned back on in the same overlap fails here.
//
// The cases name each pair rather than look for overlap in general: many rules
// that report some of the same code each report code the other does not
// (`@typescript-eslint/prefer-includes` and `unicorn/prefer-includes`), and
// only a comparison case by case tells a rule that adds nothing from one that
// adds a little.
describe('rules whose reports another rule already makes', () => {
  const packageRoot = path.resolve(import.meta.dirname, '../..');

  const extraConfigs = {
    typescript: [],
    vitest: [eslintConfigForVitest()],
    jest: [
      {
        ...eslintConfigForJest(),
        // `jest` is not installed here, and `jest/no-deprecated-functions`
        // refuses to load without knowing its version.
        settings: { jest: { version: 30 } },
      },
    ],
    playwright: [eslintConfigForPlaywright()],
    // `eslintNRules` is exported for a config to spread, not applied by any
    // preset.
    node: [{ rules: eslintNRules }],
  } as const satisfies ReadonlyRecord<string, readonly FlatConfig[]>;

  type Preset = keyof typeof extraConfigs;

  const lint = async (
    preset: Preset,
    code: string,
  ): Promise<readonly string[]> => {
    const eslint = new ESLint({
      cwd: packageRoot,
      overrideConfigFile: true,
      overrideConfig: [
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the preset's flat config, which ESLint validates
        ...(eslintConfigForTypeScript({
          tsconfigFileName: 'tsconfig.json',
          tsconfigRootDir: packageRoot,
          packageDirs: [packageRoot],
        }) as readonly Linter.Config[]),
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the preset's flat config, which ESLint validates
        ...(extraConfigs[preset] as readonly Linter.Config[]),
        {
          // As in `typescript.test.mts`: under `CI=true` typescript-eslint
          // would lint the file on disk rather than the code given.
          languageOptions: {
            parserOptions: { disallowAutomaticSingleRunInference: true },
          },
        },
      ],
    });

    const [result] = await eslint.lintText(code, {
      filePath: path.join(packageRoot, 'src/entry-point.mts'),
    });

    assert.isDefined(result);

    return result.messages.map(({ ruleId }) => ruleId ?? '');
  };

  const testBlocks = dedent`
    describe('a', () => {
      const x = 1;
      beforeAll(() => {});
      afterAll(() => {});
      beforeEach(() => {});
      afterEach(() => {});
      test('b', () => {
        expect(x).toBe(1);
        const y = 2;
        expect(y).toBe(2);
      });
      // c
      test('c', () => {});
    });
  `;

  const paddingAround = [
    'after-all-blocks',
    'after-each-blocks',
    'all',
    'before-all-blocks',
    'before-each-blocks',
    'describe-blocks',
    'expect-groups',
    'test-blocks',
  ] as const;

  test.each([
    {
      preset: 'vitest',
      kept: '@stylistic/padding-line-between-statements',
      dropped: paddingAround.map((name) => `vitest/padding-around-${name}`),
      code: testBlocks,
    },
    {
      preset: 'jest',
      kept: '@stylistic/padding-line-between-statements',
      dropped: paddingAround.map((name) => `jest/padding-around-${name}`),
      code: testBlocks,
    },
    {
      preset: 'playwright',
      kept: '@stylistic/padding-line-between-statements',
      dropped: ['playwright/consistent-spacing-between-blocks'],
      code: dedent`
        import { expect, test } from '@playwright/test';
        test.describe('a', () => {
          test.beforeEach(async ({ page }) => {
            await page.goto('/');
          });
          test('b', async ({ page }) => {
            await expect(page).toHaveTitle('b');
          });
          // c
          test('c', async ({ page }) => {
            await expect(page).toHaveTitle('c');
          });
        });
      `,
    },
    {
      preset: 'node',
      kept: 'unicorn/prefer-node-protocol',
      dropped: ['n/prefer-node-protocol'],
      code: dedent`
        import * as fs from 'fs';

        export const readFile = fs.readFileSync;
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-anonymous-default-export',
      dropped: ['import-x/no-anonymous-default-export'],
      code: dedent`
        export default (): number => 1;
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/prefer-number-is-safe-integer',
      dropped: ['math/prefer-number-is-safe-integer'],
      code: dedent`
        export const isSafe = (x: number): boolean =>
          Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/prefer-string-starts-ends-with',
      dropped: ['unicorn/prefer-string-starts-ends-with'],
      code: dedent`
        export const isFoo = (s: string): boolean => /^foo/u.test(s);
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/prefer-array-flat',
      dropped: ['array-func/prefer-flat'],
      code: dedent`
        export const flatten = (
          xss: readonly (readonly number[])[],
        ): readonly number[] =>
          xss.reduce<readonly number[]>((a, b) => a.concat(b), []);
      `,
    },
    {
      preset: 'typescript',
      kept: 'array-func/from-map',
      dropped: ['unicorn/prefer-array-from-map'],
      code: dedent`
        export const doubled = (xs: ArrayLike<number>): readonly number[] =>
          Array.from(xs).map((x) => x * 2);
      `,
    },
    {
      preset: 'typescript',
      kept: 'math/abs',
      dropped: ['unicorn/prefer-math-abs'],
      code: dedent`
        export const abs = (x: number): number => (x < 0 ? -x : x);
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-new-buffer',
      dropped: ['security/detect-new-buffer'],
      code: dedent`
        export const alloc = (n: number): Buffer => new Buffer(n);
      `,
    },
    {
      preset: 'typescript',
      kept: 'no-eval',
      dropped: ['security/detect-eval-with-expression'],
      code: dedent`
        export const run = (s: string): unknown => eval(s);
      `,
    },
    {
      preset: 'typescript',
      kept: 'import-x/no-dynamic-require',
      dropped: ['security/detect-non-literal-require'],
      code: dedent`
        export const load = (m: string): unknown => require(m);
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/no-extraneous-class',
      dropped: ['unicorn/no-static-only-class'],
      code: dedent`
        export class StaticOnly {
          static a = 1;
        }
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-useless-promise-resolve-reject',
      dropped: ['promise/no-return-wrap'],
      code: dedent`
        export const next = (p: Promise<number>): Promise<number> =>
          p.then((x) => Promise.resolve(x + 1));
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/no-this-alias',
      dropped: ['unicorn/no-this-assignment', 'consistent-this'],
      code: dedent`
        export function getA(this: Readonly<{ a: number }>): number {
          const self = this;

          return self.a;
        }
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-this-outside-of-class',
      dropped: ['@typescript-eslint/no-invalid-this'],
      code: dedent`
        export const self = (): unknown => this;
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/no-unnecessary-boolean-literal-compare',
      dropped: ['unicorn/no-unnecessary-boolean-comparison'],
      code: dedent`
        export const isTrue = (b: boolean): boolean => b === true;
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/no-unnecessary-type-conversion',
      dropped: ['unicorn/no-useless-coercion'],
      code: dedent`
        export const same = (n: number): number => Number(n);
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/no-unnecessary-template-expression',
      dropped: ['unicorn/no-useless-template-literals'],
      code: dedent`
        export const ab = \`a\${'b'}\`;
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-multiple-promise-resolver-calls',
      dropped: ['promise/no-multiple-resolved'],
      code: dedent`
        export const twice = (): Promise<number> =>
          new Promise((resolve) => {
            resolve(1);

            resolve(2);
          });
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/method-signature-style',
      dropped: ['functional/prefer-property-signatures'],
      code: dedent`
        export type T = Readonly<{
          f(): void;
        }>;
      `,
    },
    {
      preset: 'typescript',
      kept: '@typescript-eslint/await-thenable',
      dropped: ['unicorn/no-unnecessary-await'],
      code: dedent`
        export const one = async (): Promise<number> => {
          const x = await 1;

          return x;
        };
      `,
    },
    {
      preset: 'typescript',
      kept: 'unicorn/no-for-loop',
      dropped: ['@typescript-eslint/prefer-for-of'],
      code: dedent`
        export const sum = (xs: readonly number[]): number => {
          let mut_s = 0;

          for (let mut_i = 0; mut_i < xs.length; mut_i += 1) {
            mut_s += xs[mut_i] ?? 0;
          }

          return mut_s;
        };
      `,
    },
    {
      preset: 'typescript',
      kept: 'ts-restrictions/prefer-catch',
      dropped: ['unicorn/prefer-then-catch'],
      code: dedent`
        export const recovered = (p: Promise<number>): Promise<number> =>
          p.then(
            (x) => x,
            () => 0,
          );
      `,
    },
  ] as const satisfies readonly Readonly<{
    preset: Preset;
    kept: string;
    dropped: readonly string[];
    code: string;
  }>[])('$preset: $kept', async ({ preset, kept, dropped, code }) => {
    const ruleIds = await lint(preset, code);

    expect(ruleIds).toContain(kept);

    const droppedIds = new Set<string>(dropped);

    assert.deepStrictEqual(
      Arr.uniq(ruleIds).filter((id) => droppedIds.has(id)),
      [],
    );
  });
});
