import dedent from 'dedent';
import { Arr } from 'ts-data-forge';
import {
  assertSharedExports,
  installModuleParity,
  isModuleParityInstalled,
  listSharedExports,
  swapModuleImports,
  withSwappedCases,
} from './eslint-rule-module-parity.mjs';

const options = {
  from: 'a',
  to: 'b',
  sharedExports: ['f', 'g', 'T'],
} as const;

const swap = (source: string): string | undefined =>
  swapModuleImports(source, { ...options, isTsx: false })?.text;

describe('swapModuleImports', () => {
  test('moves named imports of shared exports, keeping the quotes', () => {
    assert.strictEqual(
      swap(dedent`
        import { f, g as h } from 'a';
        import type { T } from "a";
        import { x } from 'c';
      `),
      dedent`
        import { f, g as h } from 'b';
        import type { T } from "b";
        import { x } from 'c';
      `,
    );
  });

  test('counts the declarations it moves, none when there are none', () => {
    assert.strictEqual(
      swapModuleImports("import { f } from 'a';\nimport { g } from 'a';", {
        ...options,
        isTsx: false,
      })?.count,
      2,
    );

    assert.deepStrictEqual(
      swapModuleImports("import { x } from 'c';", { ...options, isTsx: false }),
      { text: "import { x } from 'c';", count: 0 },
    );
  });

  test('moves a namespace import read only as ns.<shared>', () => {
    assert.strictEqual(
      swap(dedent`
        import * as ns from 'a';
        declare const t: ns.T;
        ns.f(t);
      `),
      dedent`
        import * as ns from 'b';
        declare const t: ns.T;
        ns.f(t);
      `,
    );
  });

  test.each([
    ['an export only `from` has', "import { f, only } from 'a';"],
    ['an aliased export only `from` has', "import { only as f } from 'a';"],
    ['a side-effect import', "import 'a';"],
    ['a default import', "import d from 'a';"],
    ['empty braces', "import {} from 'a';"],
    ['a re-export', "export { f } from 'a';"],
    ['a type import expression', "type X = import('a').T;"],
    [
      'the module name in another string',
      "import { f } from 'a';\nconst m = 'a';",
    ],
    [
      'a namespace read as a whole',
      "import * as ns from 'a';\nconsole.log(ns);",
    ],
    [
      'a namespace read for an export only `from` has',
      "import * as ns from 'a';\nns.only();",
    ],
  ])('cannot move %s', (_, source) => {
    assert.isUndefined(swap(source));
  });

  test('parses JSX when told the case is TSX', () => {
    assert.strictEqual(
      swapModuleImports("import { f } from 'a';\nconst e = <div>{f()}</div>;", {
        ...options,
        isTsx: true,
      })?.text,
      "import { f } from 'b';\nconst e = <div>{f()}</div>;",
    );
  });
});

describe('withSwappedCases', () => {
  test('adds a copy of each movable case after the originals', () => {
    const swapped = withSwappedCases(
      {
        valid: ["import { f } from 'a';", "import { x } from 'c';"],
        invalid: [
          {
            name: 'reported',
            code: "import { f } from 'a';\nf(1);",
            output: "import { f } from 'a';\nf(2);",
            errors: [
              {
                messageId: 'm',
                suggestions: [
                  { messageId: 's', output: "import { f, g } from 'a';" },
                ],
              },
            ],
          },
        ],
      },
      options,
    );

    assert.deepStrictEqual(swapped, {
      valid: [
        "import { f } from 'a';",
        "import { x } from 'c';",
        {
          code: "import { f } from 'b';",
          name: "import { f } from 'a'; [imported from b]",
        },
      ],
      invalid: [
        {
          name: 'reported',
          code: "import { f } from 'a';\nf(1);",
          output: "import { f } from 'a';\nf(2);",
          errors: [
            {
              messageId: 'm',
              suggestions: [
                { messageId: 's', output: "import { f, g } from 'a';" },
              ],
            },
          ],
        },
        {
          name: 'reported [imported from b]',
          code: "import { f } from 'b';\nf(1);",
          output: "import { f } from 'b';\nf(2);",
          errors: [
            {
              messageId: 'm',
              suggestions: [
                { messageId: 's', output: "import { f, g } from 'b';" },
              ],
            },
          ],
        },
      ],
    });
  });

  test('keeps `output: null` and multi-pass outputs', () => {
    const swapped = withSwappedCases(
      {
        valid: [],
        invalid: [
          { code: "import { f } from 'a';", output: null, errors: [] },
          {
            code: "import { f } from 'a';",
            output: [
              "import { f } from 'a';\n1;",
              "import { f } from 'a';\n2;",
            ],
            errors: [],
          },
        ],
      },
      options,
    );

    assert.deepStrictEqual(
      Arr.skip(swapped.invalid, 2).map((testCase) => testCase.output),
      [null, ["import { f } from 'b';\n1;", "import { f } from 'b';\n2;"]],
    );
  });

  test('leaves out a case whose fix adds an export only `from` has', () => {
    const swapped = withSwappedCases(
      {
        valid: [],
        invalid: [
          {
            code: "import { f } from 'a';",
            output: "import { f, only } from 'a';",
            errors: [],
          },
          {
            code: "import { f } from 'a';",
            errors: [
              {
                suggestions: [{ output: "import { f, only } from 'a';" }],
              },
            ],
          },
        ],
      },
      options,
    );

    assert.strictEqual(swapped.invalid.length, 2);
  });
});

describe('installModuleParity', () => {
  test('runs every case and its copy, once however often installed', () => {
    const mut_runs: unknown[] = [];

    class Tester {
      // eslint-disable-next-line @typescript-eslint/class-methods-use-this
      run(_ruleName: string, _rule: unknown, tests: unknown): void {
        mut_runs.push(tests);
      }
    }

    assert.isFalse(isModuleParityInstalled(Tester));

    installModuleParity(Tester, options);

    installModuleParity(Tester, options);

    assert.isTrue(isModuleParityInstalled(Tester));

    const tester = new Tester();

    tester.run('rule', {}, { valid: ["import { f } from 'a';"], invalid: [] });

    assert.deepStrictEqual(mut_runs, [
      {
        valid: [
          "import { f } from 'a';",
          {
            code: "import { f } from 'b';",
            name: "import { f } from 'a'; [imported from b]",
          },
        ],
        invalid: [],
      },
    ]);
  });
});

// Reading both packages' types takes seconds: read them once for every test.
// Read when the file is collected, so a missing build fails the whole file;
// `check:root:test` names the build first (`assert-deps-built.mts`).
const packages = {
  packageDir: `${import.meta.dirname}/../../libs/eslint-plugin-ts-data-forge`,
  from: 'ts-data-forge',
  definedIn: 'ts-std-forge',
} as const;

const shared = listSharedExports(packages);

describe('listSharedExports', () => {
  test('lists what ts-data-forge re-exports from ts-std-forge, and nothing of its own', () => {
    assert.includeMembers(Array.from(shared), [
      'Optional',
      'isRecord',
      'Some',
      'pipe',
    ]);

    assert.notInclude(Array.from(shared), 'Arr');

    assert.notInclude(Array.from(shared), 'isString');
  });

  test('names the package it cannot resolve', () => {
    assert.throws(
      () =>
        listSharedExports({
          packageDir: import.meta.dirname,
          from: 'no-such-package-for-module-parity',
          definedIn: 'ts-std-forge',
        }),
      /no-such-package-for-module-parity/u,
    );
  });
});

describe('assertSharedExports', () => {
  test('passes for the list the packages give', () => {
    assert.doesNotThrow(() => {
      assertSharedExports(shared, packages);
    });
  });

  test('names what the declared list misses and what it has too many of', () => {
    const declared = Arr.toPushed(
      shared.filter((name) => name !== 'isRecord'),
      'Arr',
    );

    assert.throws(() => {
      assertSharedExports(declared, packages);
    }, /missing: isRecord\n {2}not shared: Arr/u);
  });
});
