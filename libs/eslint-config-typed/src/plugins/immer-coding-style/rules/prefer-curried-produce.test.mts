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
