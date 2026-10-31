import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { mutPrefixedDraftRule } from './mut-prefixed-draft.mjs';

const ruleName = 'mut-prefixed-draft';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('mut-prefixed-draft', () => {
  tester.run(ruleName, mutPrefixedDraftRule, {
    valid: [
      {
        name: 'Curried recipe with a mut_ draft',
        code: dedent`
          const update = produce((mut_draft) => {
            mut_draft.count += 1;
          });
        `,
      },
      {
        name: 'Recipe with a mut_ draft',
        code: dedent`
          const next = produce(state, (mut_draft) => {
            mut_draft.count += 1;
          });
        `,
      },
      {
        name: 'produceWithPatches with a mut_ draft',
        code: dedent`
          const [next] = produceWithPatches(state, (mut_draft) => {
            mut_draft.count += 1;
          });
        `,
      },
      {
        name: 'A draft that is never referenced',
        code: dedent`
          const next = produce(state, (_draft) => undefined);
        `,
      },
      {
        name: 'A draft with a default value that is never used',
        code: dedent`
          const update = produce((draft = initial) => undefined);
        `,
      },
      {
        name: 'A function literal base state of a call with a patch listener',
        code: dedent`
          const next = produce((x) => x, recipe, (patches) => patches.length);
        `,
      },
      {
        name: 'A function literal base state followed by a spread',
        code: dedent`
          const next = produce((x) => {
            x.a = 1;
          }, ...rest);
        `,
      },
      {
        name: 'A spread first argument hides which function is the recipe',
        code: dedent`
          const next = produce(...args, (patches) => {
            patches.push(1);
          });
        `,
      },
      {
        name: 'A recipe without parameters',
        code: dedent`
          const next = produce(state, () => undefined);
        `,
      },
      {
        name: 'A destructured draft is left alone',
        code: dedent`
          const next = produce(state, ({ items }) => {
            items.push(1);
          });
        `,
      },
      {
        name: 'A recipe passed by name',
        code: dedent`
          const next = produce(state, recipe);
        `,
      },
      {
        name: 'Another function named differently',
        code: dedent`
          const next = create(state, (draft) => {
            draft.count += 1;
          });
        `,
      },
      {
        name: 'A patch listener is not the recipe',
        code: dedent`
          const next = produce(state, recipe, (patches) => {
            patches.push(1);
          });
        `,
      },
    ],
    invalid: [
      {
        name: 'Curried recipe',
        code: dedent`
          const update = produce((draft) => {
            draft.count += 1;
          });
        `,
        output: dedent`
          const update = produce((mut_draft) => {
            mut_draft.count += 1;
          });
        `,
        errors: [
          {
            messageId: 'requireMutPrefix',
            data: { name: 'draft', suggested: 'mut_draft' },
          },
        ],
      },
      {
        name: 'Curried recipe with an initial state',
        code: dedent`
          const update = produce((draft, delta: number) => {
            draft.count += delta;
          }, initialState);
        `,
        output: dedent`
          const update = produce((mut_draft, delta: number) => {
            mut_draft.count += delta;
          }, initialState);
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Recipe of a non-curried call, with a type annotation',
        code: dedent`
          const next = produce(state, (draft: Draft<State>) => {
            draft.count += 1;
            draft.items.push(draft.count);
          });
        `,
        output: dedent`
          const next = produce(state, (mut_draft: Draft<State>) => {
            mut_draft.count += 1;
            mut_draft.items.push(mut_draft.count);
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A function expression recipe',
        code: dedent`
          const next = produce(state, function (s) {
            s.count += 1;
          });
        `,
        output: dedent`
          const next = produce(state, function (mut_s) {
            mut_s.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A function expression recipe with a this annotation',
        code: dedent`
          const next = produce(state, function (this: unknown, s: State) {
            s.count += 1;
          });
        `,
        output: dedent`
          const next = produce(state, function (this: unknown, mut_s: State) {
            mut_s.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'produceWithPatches',
        code: dedent`
          const [next, patches] = produceWithPatches(state, (draft) => {
            draft.count += 1;
          });
        `,
        output: dedent`
          const [next, patches] = produceWithPatches(state, (mut_draft) => {
            mut_draft.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A reference in a nested function and a shorthand property',
        code: dedent`
          const next = produce(state, (draft) => {
            items.forEach((item) => {
              draft.items.push(item);
            });
            log({ draft });
          });
        `,
        output: dedent`
          const next = produce(state, (mut_draft) => {
            items.forEach((item) => {
              mut_draft.items.push(item);
            });
            log({ draft: mut_draft });
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A draft with a default value',
        code: dedent`
          const update = produce((draft = initial) => {
            draft.count += 1;
          });
        `,
        output: dedent`
          const update = produce((mut_draft = initial) => {
            mut_draft.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the draft is the target of a shorthand pattern with a default',
        code: dedent`
          const next = produce(state, (draft) => {
            ({ draft = fallback } = source);
            draft.count += 1;
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the draft is reassigned',
        code: dedent`
          const next = produce(state, (draft) => {
            for (draft of drafts) {
              draft.count += 1;
            }
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the recipe declares the name again',
        code: dedent`
          const next = produce(state, (draft) => {
            draft.count = 1;
            function draft() {}
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A function base state: the second argument is the recipe',
        code: dedent`
          const next = produce(() => 1, (draft) => {
            draft.count += 1;
          });
        `,
        output: dedent`
          const next = produce(() => 1, (mut_draft) => {
            mut_draft.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the new name would shadow an outer draft',
        code: dedent`
          const next = produce(state, (mut_draft) => {
            mut_draft.items = produce(mut_draft.items, (draft) => {
              draft.push(1);
            });
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A parameter name spelt with an escape',
        code: String.raw`produce(state, (\u0064raft) => { draft.count += 1; });`,
        output: 'produce(state, (mut_draft) => { mut_draft.count += 1; });',
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Nested recipes whose drafts share a name: only the outer one is fixed',
        code: dedent`
          const next = produce(state, (draft) => {
            draft.items = produce(draft.items, (draft) => {
              draft.push(1);
            });
          });
        `,
        output: dedent`
          const next = produce(state, (mut_draft) => {
            mut_draft.items = produce(mut_draft.items, (draft) => {
              draft.push(1);
            });
          });
        `,
        errors: [
          { messageId: 'requireMutPrefix' },
          { messageId: 'requireMutPrefix' },
        ],
      },
      {
        name: 'Reported without a fix when the recipe reads an undeclared global of the new name',
        code: dedent`
          const next = produce(state, (draft) => {
            draft.items = mut_draft;
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'An outer binding of the same name that is not a recipe draft',
        code: dedent`
          const f = (draft) =>
            produce(draft, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          const f = (draft) =>
            produce(draft, (mut_draft) => {
              mut_draft.count += 1;
            });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the recipe calls eval',
        code: dedent`
          const next = produce(state, (draft) => {
            eval('draft.x = 1');
            draft.y = 1;
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A non-recipe binding between two recipe drafts of the same name',
        code: dedent`
          const next = produce(state, (x) => {
            x.a = 1;
            const f = (x) =>
              produce(x, (x) => {
                x.b = 1;
              });
          });
        `,
        output: dedent`
          const next = produce(state, (mut_x) => {
            mut_x.a = 1;
            const f = (x) =>
              produce(x, (x) => {
                x.b = 1;
              });
          });
        `,
        errors: [
          { messageId: 'requireMutPrefix' },
          { messageId: 'requireMutPrefix' },
        ],
      },
      {
        name: 'An unused outer draft of the same name does not hold the fix back',
        code: dedent`
          const next = produce(state, (draft) =>
            produce(other, (draft) => {
              draft.b = 1;
            }),
          );
        `,
        output: dedent`
          const next = produce(state, (draft) =>
            produce(other, (mut_draft) => {
              mut_draft.b = 1;
            }),
          );
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'An extra parameter of a curried recipe is not a draft',
        code: dedent`
          const update = produce((d, draft) => {
            d.x = produce(draft, (draft) => {
              draft.y = 1;
            });
          });
        `,
        output: dedent`
          const update = produce((mut_d, draft) => {
            mut_d.x = produce(draft, (mut_draft) => {
              mut_draft.y = 1;
            });
          });
        `,
        errors: [
          { messageId: 'requireMutPrefix' },
          { messageId: 'requireMutPrefix' },
        ],
      },
      {
        name: 'A type of the new name does not hold the fix back',
        code: dedent`
          type mut_draft = 1;
          const next = produce(state, (draft) => {
            draft.a = 1;
          });
        `,
        output: dedent`
          type mut_draft = 1;
          const next = produce(state, (mut_draft) => {
            mut_draft.a = 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A type reference to the new name does not hold the fix back',
        code: dedent`
          type mut_draft = 1;
          const next = produce(state, (draft) => {
            const v: mut_draft = 1;
            draft.a = v;
          });
        `,
        output: dedent`
          type mut_draft = 1;
          const next = produce(state, (mut_draft) => {
            const v: mut_draft = 1;
            mut_draft.a = v;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the new name is declared inside the recipe',
        code: dedent`
          const next = produce(state, (draft) => {
            const mut_draft = [];
            draft.items = mut_draft;
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'Reported without a fix when the recipe reads an outer binding of the new name',
        code: dedent`
          const mut_draft = [];
          const next = produce(state, (draft) => {
            draft.items = mut_draft;
          });
        `,
        output: null,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
    ],
  });
});

describe('mut-prefixed-draft through type wrappers', () => {
  tester.run(ruleName, mutPrefixedDraftRule, {
    valid: [],
    invalid: [
      {
        name: 'A recipe wrapped in satisfies',
        code: dedent`
          const update = produce(((draft) => {
            draft.count += 1;
          }) satisfies Recipe);
        `,
        output: dedent`
          const update = produce(((mut_draft) => {
            mut_draft.count += 1;
          }) satisfies Recipe);
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A recipe of a non-curried call wrapped in as',
        code: dedent`
          const next = produce(state as State, ((draft) => {
            draft.count += 1;
          }) as Recipe);
        `,
        output: dedent`
          const next = produce(state as State, ((mut_draft) => {
            mut_draft.count += 1;
          }) as Recipe);
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A callee wrapped in a non-null assertion',
        code: dedent`
          const update = produce!((draft) => {
            draft.count += 1;
          });
        `,
        output: dedent`
          const update = produce!((mut_draft) => {
            mut_draft.count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'An outer recipe wrapped in as still holds back a nested fix',
        code: dedent`
          const next = produce(state, ((draft) => {
            draft.items = produce(draft.items, (draft) => {
              draft.push(1);
            });
          }) as Recipe);
        `,
        output: dedent`
          const next = produce(state, ((mut_draft) => {
            mut_draft.items = produce(mut_draft.items, (draft) => {
              draft.push(1);
            });
          }) as Recipe);
        `,
        errors: [
          { messageId: 'requireMutPrefix' },
          { messageId: 'requireMutPrefix' },
        ],
      },
      {
        name: 'A recipe in an angle-bracket type assertion',
        code: dedent`
          const next = produce(state, <Recipe>((draft) => {
            draft.count += 1;
          }));
        `,
        output: dedent`
          const next = produce(state, <Recipe>((mut_draft) => {
            mut_draft.count += 1;
          }));
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
      {
        name: 'A draft referenced through a type wrapper',
        code: dedent`
          const next = produce(state, (draft) => {
            (draft satisfies State).count += 1;
          });
        `,
        output: dedent`
          const next = produce(state, (mut_draft) => {
            (mut_draft satisfies State).count += 1;
          });
        `,
        errors: [{ messageId: 'requireMutPrefix' }],
      },
    ],
  });
});
