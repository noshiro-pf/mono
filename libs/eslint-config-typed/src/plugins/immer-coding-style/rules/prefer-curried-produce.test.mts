import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCurriedProduceRule } from './prefer-curried-produce.mjs';

const ruleName = 'prefer-curried-produce';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-curried-produce', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'async wrapper is left untouched',
        code: dedent`
          import { produce } from 'immer';

          const next = async (state) =>
            produce(state, (draft) => {
              draft.count += 1;
            });
        `,
      },
      {
        name: 'typed async wrapper is left untouched',
        code: dedent`
          import { produce } from 'immer';

          type State = Readonly<{ count: number }>;

          const next = async (state: State): Promise<State> =>
            produce(state, (draft) => {
              draft.count += 1;
            });
        `,
      },
      {
        name: 'generic wrapper is left untouched',
        code: dedent`
          import { produce } from 'immer';

          type State = Readonly<{ count: number }>;

          const next = <S extends State>(state: S): S =>
            produce(state, (draft) => {
              draft.count += 1;
            });
        `,
      },
      {
        name: 'Already curried',
        code: dedent`
          import { produce } from 'immer';

          const update = produce((draft) => {
            draft.count += 1;
          });
        `,
      },
      {
        name: 'Already curried with type arg',
        code: dedent`
          import { produce } from 'immer';

          const update = produce<State>((draft) => {
            draft.count += 1;
          });
        `,
      },
      {
        name: 'Multiple parameters are ignored',
        code: dedent`
          import { produce } from 'immer';

          const update = (state, action) =>
            produce(state, (draft) => {
              draft.count += action.delta;
            });
        `,
      },
      {
        name: 'Base state differs from parameter',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(other, (draft) => {
              draft.count += state.delta;
            });
        `,
      },
      {
        name: 'Parameter referenced inside recipe is ignored',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(state, (draft) => {
              draft.count += state.delta;
            });
        `,
      },
    ],
    invalid: [
      {
        name: 'Transforms simple updater',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(state, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce((draft) => {
            draft.count += 1;
          });
        `,
        errors: [
          {
            messageId: 'useCurriedProduce',
          },
        ],
      },
      {
        name: 'Transforms simple updater with type annotations',
        code: dedent`
          import { produce } from 'immer';

          const update = (state: State): State =>
            produce(state, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce<State>((draft) => {
            draft.count += 1;
          });
        `,
        errors: [
          {
            messageId: 'useCurriedProduce',
          },
        ],
      },
    ],
  });
});

describe('prefer-curried-produce fixes that would change the meaning', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'a recipe that is not an inline function may read the extra arguments the curried form passes',
        code: dedent`
          import { produce } from 'immer';

          declare const recipe: (draft: State, index: number) => void;

          const ys = xs.map((s) => produce(s, recipe));
        `,
      },
      {
        name: 'a recipe with a second parameter would receive the callback arguments',
        code: dedent`
          import { produce } from 'immer';

          const ys = xs.map((s) =>
            produce(s, (draft, index) => {
              draft.index = index;
            }),
          );
          const zs = xs.map((s) =>
            produce(s, (draft, ...rest) => {
              draft.rest = rest;
            }),
          );
        `,
      },
      {
        name: 'a function expression recipe may read `this` or `arguments`',
        code: dedent`
          import { produce } from 'immer';

          const ys = xs.map((s) =>
            produce(s, function (draft) {
              draft.count = arguments.length;
            }),
          );
        `,
      },
      {
        name: 'a patch listener would become the initial state of the curried form',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(
              state,
              (draft) => {
                draft.count += 1;
              },
              listener,
            );
        `,
      },
    ],
    invalid: [
      {
        name: 'a base state cast with `as` keeps the type as a type argument',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(state as State, (draft) => {
              draft.count += 1;
            });

          const reset = (state: Wide) =>
            produce((state as unknown as State) satisfies State, (draft) => {
              draft.count = 0;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce<State>((draft) => {
            draft.count += 1;
          });

          const reset = produce<State>((draft) => {
            draft.count = 0;
          });
        `,
        errors: [
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
        ],
      },
      {
        name: 'a recipe arrow without parameters is fixed',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) => produce(state, () => undefined);
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce(() => undefined);
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});

describe('prefer-curried-produce through type wrappers', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'a base under `!`, which drafts a narrower type than the wrapper takes',
        code: dedent`
          import { produce } from 'immer';

          const reset = (state: State | undefined) =>
            produce(state!, (draft) => {
              draft.count = 0;
            });
          const update = (state) =>
            produce((state as State | undefined)!, (draft) => {
              draft.count += 1;
            });
          // Left alone even where the type cannot be null: the rule does
          // not read types.
          const plain = (state: State) =>
            produce(state!, (draft) => {
              draft.count = 0;
            });
        `,
      },
      {
        name: 'an optional parameter, and a generic wrapper with a cast base',
        code: dedent`
          import { produce } from 'immer';

          const next = (state?: State) =>
            produce(state, (draft) => {
              draft.count = 0;
            });
          const generic = <S extends State>(state: S): S =>
            produce(state as S, (draft) => {
              draft.count = 0;
            });
        `,
      },
    ],
    invalid: [
      {
        name: 'the base state wrapped in `satisfies`',
        code: dedent`
          import { produce } from 'immer';

          const update = (state: State) =>
            produce(state satisfies State, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce<State>((draft) => {
            draft.count += 1;
          });
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});
