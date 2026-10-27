import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { explicitCollectionTypeArguments } from './explicit-collection-type-arguments.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

describe('explicit-collection-type-arguments', () => {
  tester.run(
    'explicit-collection-type-arguments',
    explicitCollectionTypeArguments,
    {
      valid: [
        {
          name: 'type arguments on an empty Set',
          code: 'const s = new Set<number>();',
        },
        {
          name: 'type arguments on a Map from an array literal',
          code: "const m = new Map<string, number>([['a', 1]]);",
        },
        {
          name: 'a Set from a variable takes its element type from it',
          code: dedent`
            declare const xs: readonly number[];
            const s = new Set(xs);
          `,
        },
        {
          name: 'a Map from a call takes its entry type from it',
          code: dedent`
            declare const r: Readonly<Record<string, number>>;
            const m = new Map(Object.entries(r));
          `,
        },
        {
          name: 'a Set from a variable inside `satisfies` is still a variable',
          code: dedent`
            declare const xs: readonly number[];
            const s = new Set(xs satisfies readonly number[]);
          `,
        },
        {
          name: 'a locally declared `Set` is not the global one',
          code: dedent`
            class Set {}
            const s = new Set();
          `,
        },
        {
          name: 'an imported `Map` is not the global one',
          code: dedent`
            import { Map } from 'immutable';
            const m = new Map();
          `,
        },
        {
          name: 'a member expression callee is out of scope',
          code: 'const s = new globalThis.Set([1]);',
        },
        {
          name: 'other constructors are out of scope',
          code: 'const xs = new Array(3);',
        },
      ],
      invalid: [
        {
          name: 'an empty Set with nothing to take its type from',
          code: 'const s = new Set();',
          errors: [
            {
              messageId: 'missingTypeArguments',
              data: { name: 'Set' },
            },
          ],
        },
        {
          name: 'a Set from an array literal',
          code: 'const s = new Set([1, 2]);',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a Map from an array literal',
          code: "const m = new Map([['a', 1]]);",
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a WeakMap and a WeakSet',
          code: dedent`
            const a = new WeakMap();
            const b = new WeakSet([]);
          `,
          errors: [
            { messageId: 'missingTypeArguments', data: { name: 'WeakMap' } },
            { messageId: 'missingTypeArguments', data: { name: 'WeakSet' } },
          ],
        },
        {
          name: 'a ReadonlySet annotation supplies the type arguments',
          code: dedent`
            type Id = \`task:\${string}\`;
            const s: ReadonlySet<Id> = new Set(['task:a']);
          `,
          output: dedent`
            type Id = \`task:\${string}\`;
            const s: ReadonlySet<Id> = new Set<Id>(['task:a']);
          `,
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a ReadonlyMap annotation supplies both type arguments',
          code: 'let mut_m: ReadonlyMap<string, readonly number[]> = new Map();',
          output:
            'let mut_m: ReadonlyMap<string, readonly number[]> = new Map<string, readonly number[]>();',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a class property annotation supplies the type argument',
          code: dedent`
            class C {
              readonly #seen: ReadonlySet<string> = new Set();
            }
          `,
          output: dedent`
            class C {
              readonly #seen: ReadonlySet<string> = new Set<string>();
            }
          `,
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'an annotation naming the constructor itself is left to consistent-generic-constructors',
          code: 'const s: Set<number> = new Set();',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'an annotation of another collection kind is not copied',
          code: 'const s: ReadonlyMap<string, number> = new Set();',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'an object property is reported without a fix',
          code: dedent`
            type State = Readonly<{ seen: ReadonlySet<string> }>;
            const state: State = { seen: new Set() };
          `,
          errors: [{ messageId: 'missingTypeArguments' }],
        },
      ],
    },
  );
});

describe('explicit-collection-type-arguments through type wrappers', () => {
  tester.run(
    'explicit-collection-type-arguments',
    explicitCollectionTypeArguments,
    {
      valid: [
        {
          name: 'type arguments with the whole expression wrapped',
          code: 'const s = new Set<number>([1]) satisfies ReadonlySet<number>;',
        },
      ],
      invalid: [
        {
          name: 'an array literal inside `as const`',
          code: "const s = new Set(['a', 'b'] as const);",
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'an array literal inside `satisfies`',
          code: 'const s = new Set([1] satisfies readonly number[]);',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a parenthesized initializer still takes the annotation',
          code: 'const s: ReadonlySet<number> = (new Set());',
          output: 'const s: ReadonlySet<number> = (new Set<number>());',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'an `as` around the initializer is reported without a fix',
          code: 'const s = new Set([1]) as ReadonlySet<number>;',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
        {
          name: 'a `satisfies` around the initializer is reported without a fix',
          code: 'const s: ReadonlySet<number> = new Set([1]) satisfies ReadonlySet<number>;',
          errors: [{ messageId: 'missingTypeArguments' }],
        },
      ],
    },
  );
});

const typedTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('explicit-collection-type-arguments with type information', () => {
  typedTester.run(
    'explicit-collection-type-arguments',
    explicitCollectionTypeArguments,
    {
      valid: [],
      invalid: [
        {
          name: 'the inferred type arguments are offered as a suggestion',
          code: dedent`
            declare const f: (s: ReadonlySet<number>) => void;
            f(new Set([1]));
          `,
          errors: [
            {
              messageId: 'missingTypeArguments',
              suggestions: [
                {
                  messageId: 'addInferredTypeArguments',
                  data: { typeArguments: '<number>' },
                  output: dedent`
                    declare const f: (s: ReadonlySet<number>) => void;
                    f(new Set<number>([1]));
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'both Map type arguments come from the context, not the literal',
          code: dedent`
            type State = Readonly<{ byId: ReadonlyMap<string, readonly number[]> }>;
            const state: State = { byId: new Map([['a', [1]]]) };
          `,
          errors: [
            {
              messageId: 'missingTypeArguments',
              suggestions: [
                {
                  messageId: 'addInferredTypeArguments',
                  output: dedent`
                    type State = Readonly<{ byId: ReadonlyMap<string, readonly number[]> }>;
                    const state: State = { byId: new Map<string, readonly number[]>([['a', [1]]]) };
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'an empty collection in a typed property takes the context',
          code: dedent`
            type State = Readonly<{ seen: ReadonlySet<string> | undefined }>;
            const state: State = { seen: new Set() };
          `,
          errors: [
            {
              messageId: 'missingTypeArguments',
              suggestions: [
                {
                  messageId: 'addInferredTypeArguments',
                  output: dedent`
                    type State = Readonly<{ seen: ReadonlySet<string> | undefined }>;
                    const state: State = { seen: new Set<string>() };
                  `,
                },
              ],
            },
          ],
        },
        {
          // TypeScript prints the alias of a template literal type expanded.
          name: 'the context wins over a narrower inference from the literals',
          code: dedent`
            type Id = \`task:\${string}\`;
            declare const f: (s: ReadonlySet<Id>) => void;
            f(new Set(['task:a']));
          `,
          errors: [
            {
              messageId: 'missingTypeArguments',
              suggestions: [
                {
                  messageId: 'addInferredTypeArguments',
                  output: dedent`
                    type Id = \`task:\${string}\`;
                    declare const f: (s: ReadonlySet<Id>) => void;
                    f(new Set<\`task:\${string}\`>(['task:a']));
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'no suggestion when nothing better than `any` is inferred',
          code: 'const s = new Set();',
          errors: [{ messageId: 'missingTypeArguments', suggestions: [] }],
        },
        {
          name: 'the annotation fix wins over the suggestion',
          code: 'const s: ReadonlySet<number> = new Set();',
          output: 'const s: ReadonlySet<number> = new Set<number>();',
          errors: [{ messageId: 'missingTypeArguments', suggestions: [] }],
        },
      ],
    },
  );
});
