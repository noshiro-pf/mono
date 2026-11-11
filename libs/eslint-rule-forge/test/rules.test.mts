import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import dedent from 'dedent';
import {
  composedOf,
  createNoSideEffectImport,
  createPreferArrayIsArray,
  createPreferEmptinessGuard,
  createPreferIsNonNullObject,
  createPreferIsRecordAndHasKey,
  createPreferSafeParseFloat,
  createPreferSafeParseInt,
  ruleFactoriesOf,
} from '../src/index.mjs';

// The rules are tested in full by the plugins that build them, each with its
// own module; these cases check only that what a factory is told reaches the
// messages, the fix and the import it writes.

const ruleTester = new RuleTester();

ruleTester.run(
  'createPreferIsNonNullObject',
  createPreferIsNonNullObject({ moduleName: 'my-lib' }),
  {
    valid: [
      {
        name: 'leaves a name the file does not declare alone',
        code: dedent`
          const ok = typeof u === 'object' && u !== null;
        `,
      },
    ],
    invalid: [
      {
        name: 'imports from the module it is given',
        code: dedent`
          const u: unknown = {};
          const ok = typeof u === 'object' && u !== null;
        `,
        output: dedent`
          import { isNonNullObject } from 'my-lib';
          const u: unknown = {};
          const ok = isNonNullObject(u);
        `,
        errors: [{ messageId: 'useIsNonNullObject' }],
      },
      {
        name: 'names the alias the fix writes',
        code: dedent`
          import { isNonNullObject as isObj } from 'my-lib';
          const u: unknown = {};
          const ok = typeof u === 'object' && u !== null;
        `,
        output: dedent`
          import { isNonNullObject as isObj } from 'my-lib';
          const u: unknown = {};
          const ok = isObj(u);
        `,
        errors: [
          {
            messageId: 'useIsNonNullObject',
            data: { isNonNullObject: 'isObj' },
          },
        ],
      },
      {
        name: 'writes through a namespace import',
        code: dedent`
          import * as lib from 'my-lib';
          const u: unknown = {};
          const ok = typeof u === 'object' && u !== null;
        `,
        output: dedent`
          import * as lib from 'my-lib';
          const u: unknown = {};
          const ok = lib.isNonNullObject(u);
        `,
        errors: [
          {
            messageId: 'useIsNonNullObject',
            data: { isNonNullObject: 'lib.isNonNullObject' },
          },
        ],
      },
    ],
  },
);

ruleTester.run(
  'createPreferIsRecordAndHasKey',
  createPreferIsRecordAndHasKey({ moduleName: 'my-lib' }),
  {
    valid: [],
    invalid: [
      {
        name: 'suggests, from the module it is given, keeping isRecord without type information',
        code: dedent`
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'my-lib';
                  const ok = (isRecord(obj) && hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'writes through a namespace import, and names what it writes',
        code: dedent`
          import * as lib from 'my-lib';
          const ok = Object.hasOwn(obj, 'a');
        `,
        output: null,
        errors: [
          {
            messageId: 'hasOwnAcceptsFunctions',
            data: {
              original: "Object.hasOwn(obj, 'a')",
              replacement: "lib.isRecord(obj) && lib.hasKey(obj, 'a')",
            },
            suggestions: [
              {
                messageId: 'suggestRecordCheck',
                output: dedent`
                  import * as lib from 'my-lib';
                  const ok = (lib.isRecord(obj) && lib.hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'suggests `in` from the module it is given, without type information',
        code: dedent`
          const ok = 'a' in obj;
        `,
        output: null,
        errors: [
          {
            messageId: 'inReadsPrototypeChain',
            suggestions: [
              {
                messageId: 'suggestOwnPropertyCheck',
                output: dedent`
                  import { isRecord, hasKey } from 'my-lib';
                  const ok = (isRecord(obj) && hasKey(obj, 'a'));
                `,
              },
            ],
          },
        ],
      },
    ],
  },
);

ruleTester.run(
  'createPreferArrayIsArray',
  createPreferArrayIsArray({
    moduleName: 'my-lib',
    namespace: 'Lib',
  }),
  {
    valid: [
      {
        name: 'a computed member is not `isArray`',
        code: dedent`
          const result = Array[isArray](value);
        `,
      },
    ],
    invalid: [
      {
        name: 'writes the namespace it is given',
        code: dedent`
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Lib } from 'my-lib';
          const result = Lib.isArray(value);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
      {
        name: 'names the alias the fix writes',
        code: dedent`
          import { Lib as L } from 'my-lib';
          const result = Array.isArray(value);
        `,
        output: dedent`
          import { Lib as L } from 'my-lib';
          const result = L.isArray(value);
        `,
        errors: [
          { messageId: 'useIsArray', data: { replacement: 'L.isArray' } },
        ],
      },
      {
        name: 'writes through a namespace import',
        code: dedent`
          import * as lib from 'my-lib';
          const result = Array.isArray(value);
        `,
        output: dedent`
          import * as lib from 'my-lib';
          const result = lib.Lib.isArray(value);
        `,
        errors: [
          { messageId: 'useIsArray', data: { replacement: 'lib.Lib.isArray' } },
        ],
      },
      {
        name: 'with no fix, names the export',
        code: dedent`
          import type { Lib } from 'my-lib';
          const result = Array.isArray(value);
        `,
        output: null,
        errors: [
          { messageId: 'useIsArray', data: { replacement: 'Lib.isArray' } },
        ],
      },
    ],
  },
);

ruleTester.run(
  'createPreferSafeParseInt and createPreferSafeParseFloat',
  createPreferSafeParseInt({
    moduleName: 'my-lib',
    namespace: 'Num',
    method: 'parseInt',
  }),
  {
    valid: [
      {
        name: 'without type information nothing is known to be a string',
        code: dedent`
          const n = parseInt(s, 10);
        `,
      },
    ],
    invalid: [],
  },
);

ruleTester.run(
  'createPreferSafeParseFloat',
  createPreferSafeParseFloat({
    moduleName: 'my-lib',
    namespace: 'Num',
    method: 'parseFloat',
  }),
  {
    valid: [
      {
        name: 'without type information nothing is known to be a string',
        code: dedent`
          const n = Number(s);
        `,
      },
    ],
    invalid: [],
  },
);

ruleTester.run(
  'createNoSideEffectImport',
  createNoSideEffectImport({
    moduleName: 'my-lib',
    type: 'problem',
    description: 'Remove it.',
    message: 'Remove `import "my-lib"`.',
  }),
  {
    valid: [
      {
        name: 'an import that binds a name',
        code: "import { a } from 'my-lib';",
      },
      {
        name: 'a subpath',
        code: "import 'my-lib/global';",
      },
    ],
    invalid: [
      {
        name: 'removes the bare side-effect import with its line',
        code: dedent`
          import 'my-lib';
          import { a } from 'other';
        `,
        output: dedent`
          import { a } from 'other';
        `,
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
    ],
  },
);

const typedRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['*.ts*'] },
      tsconfigRootDir: `${import.meta.dirname}/..`,
    },
  },
});

typedRuleTester.run(
  'createPreferEmptinessGuard',
  createPreferEmptinessGuard({ moduleName: 'my-lib', namespace: 'Xs' }),
  {
    valid: [
      {
        name: 'a bound that says more than empty or not',
        code: dedent`
          declare const xs: readonly number[];
          const a = xs.length >= 2;
          const b = xs.length < 3;
          const c = xs.length === 1;
        `,
      },
      {
        name: 'a string has a length too',
        code: dedent`
          declare const s: string;
          const a = s.length === 0;
        `,
      },
      {
        name: 'two lengths compared',
        code: dedent`
          declare const xs: readonly number[];
          declare const ys: readonly number[];
          const a = xs.length === ys.length;
        `,
      },
    ],
    invalid: (
      [
        ['xs.length === 0', 'isEmpty'],
        ['xs.length <= 0', 'isEmpty'],
        ['xs.length < 1', 'isEmpty'],
        ['0 === xs.length', 'isEmpty'],
        ['0 >= xs.length', 'isEmpty'],
        ['1 > xs.length', 'isEmpty'],
        ['xs.length !== 0', 'isNonEmpty'],
        ['xs.length > 0', 'isNonEmpty'],
        ['xs.length >= 1', 'isNonEmpty'],
        ['0 !== xs.length', 'isNonEmpty'],
        ['0 < xs.length', 'isNonEmpty'],
        ['1 <= xs.length', 'isNonEmpty'],
        ['(xs.length as number) > (0 as const)', 'isNonEmpty'],
      ] as const
    ).map(([comparison, guard]) => ({
      name: `${comparison} is Xs.${guard}`,
      code: dedent`
        declare const xs: readonly number[];
        const a = ${comparison};
      `,
      output: dedent`
        import { Xs } from 'my-lib';
        declare const xs: readonly number[];
        const a = Xs.${guard}(xs);
      `,
      errors: [
        {
          messageId:
            guard === 'isEmpty'
              ? ('useIsEmpty' as const)
              : ('useIsNonEmpty' as const),
        },
      ],
    })),
  },
);

typedRuleTester.run(
  'createPreferEmptinessGuard with equivalent modules and a comparison handled elsewhere',
  createPreferEmptinessGuard({
    moduleName: 'my-lib',
    namespace: 'Xs',
    equivalentModules: [{ moduleName: 'other-lib', exportNames: ['Xs'] }],
    isHandledElsewhere: (node) =>
      node.parent.type === AST_NODE_TYPES.LogicalExpression,
  }),
  {
    valid: [
      {
        name: 'leaves what isHandledElsewhere claims',
        code: dedent`
          declare const xs: readonly number[];
          const a = xs.length >= 1 && xs.length <= 3;
        `,
      },
    ],
    invalid: [
      {
        name: 'reuses the namespace imported from an equivalent module',
        code: dedent`
          import { Xs as Ys } from 'other-lib';
          declare const xs: readonly number[];
          const a = xs.length > 0;
        `,
        output: dedent`
          import { Xs as Ys } from 'other-lib';
          declare const xs: readonly number[];
          const a = Ys.isNonEmpty(xs);
        `,
        errors: [
          {
            messageId: 'useIsNonEmpty',
            data: {
              original: 'xs.length > 0',
              arrayName: 'xs',
              namespace: 'Ys',
            },
          },
        ],
      },
    ],
  },
);

describe(ruleFactoriesOf, () => {
  test('names the factory each rule was built by', () => {
    const cases = [
      [
        createNoSideEffectImport,
        createNoSideEffectImport({
          moduleName: 'm',
          type: 'problem',
          description: 'd',
          message: 'm',
        }),
      ],
      [
        createPreferArrayIsArray,
        createPreferArrayIsArray({ moduleName: 'm', namespace: 'N' }),
      ],
      [
        createPreferEmptinessGuard,
        createPreferEmptinessGuard({ moduleName: 'm', namespace: 'N' }),
      ],
      [
        createPreferIsNonNullObject,
        createPreferIsNonNullObject({ moduleName: 'm' }),
      ],
      [
        createPreferIsRecordAndHasKey,
        createPreferIsRecordAndHasKey({ moduleName: 'm' }),
      ],
      [
        createPreferSafeParseInt,
        createPreferSafeParseInt({
          moduleName: 'm',
          namespace: 'N',
          method: 'p',
        }),
      ],
      [
        createPreferSafeParseFloat,
        createPreferSafeParseFloat({
          moduleName: 'm',
          namespace: 'N',
          method: 'p',
        }),
      ],
    ] as const;

    for (const [factory, rule] of cases) {
      assert.deepStrictEqual(ruleFactoriesOf(rule), [factory]);
    }
  });

  test('a composed rule counts as built by every factory of its parts', () => {
    const parts = [
      createPreferEmptinessGuard({ moduleName: 'm', namespace: 'N' }),
      createPreferArrayIsArray({ moduleName: 'm', namespace: 'N' }),
    ] as const;

    const composed = composedOf(parts, handWritten);

    assert.deepStrictEqual(ruleFactoriesOf(composed), [
      createPreferEmptinessGuard,
      createPreferArrayIsArray,
    ]);

    assert.strictEqual(composed.meta, handWritten.meta);
  });

  test('a rule written by hand has none', () => {
    assert.deepStrictEqual(ruleFactoriesOf(handWritten), []);
  });
});

const handWritten: TSESLint.RuleModule<'m', readonly []> = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { m: 'm' },
    defaultOptions: [],
  },
  create: () => ({}),
} as const;
