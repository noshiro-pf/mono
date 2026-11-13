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

          const reset = (state: State) =>
            produce((state as State) satisfies State, (draft) => {
              draft.count = 0;
            });
          const spaced = (state: State|undefined) =>
            produce(state as State | undefined, (draft) => {
              draft.count = 0;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const reset = produce<State>((draft) => {
            draft.count = 0;
          });
          const spaced = produce<State|undefined>((draft) => {
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

describe('prefer-curried-produce with a narrowing cast on the base', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'an `as` narrower than the parameter would narrow what callers may pass',
        code: dedent`
          import { produce } from 'immer';

          const reset = (state: State | undefined) =>
            produce(state as State, (draft) => {
              draft.count = 0;
            });
          const widen = (state: Wide) =>
            produce(state as unknown as State, (draft) => {
              draft.count = 0;
            });
          const wrapped = (state: Wide) =>
            produce((state as unknown as State) satisfies State, (draft) => {
              draft.count = 0;
            });
          const angle = (state: Wide) =>
            produce(<State>state, (draft) => {
              draft.count = 0;
            });
        `,
      },
      {
        name: 'a cast on an unannotated parameter, whose type may come from the context',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(state as State, (draft) => {
              draft.count += 1;
            });
          const f: (s: State | undefined) => State = (state) =>
            produce(state as State, (draft) => {
              draft.count += 1;
            });
          const ys = xs.map((s) => produce(s as unknown as State, () => undefined));
        `,
      },
    ],
    invalid: [
      {
        name: 'an `as` naming the parameter type is fixed',
        code: dedent`
          import { produce } from 'immer';

          const reset = (state: State) =>
            produce(state as State, (draft) => {
              draft.count = 0;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const reset = produce<State>((draft) => {
            draft.count = 0;
          });
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});

describe('prefer-curried-produce resolves produce to immer', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'a local function named produce',
        code: dedent`
          const produce = (topic, callback) => callback(topic);

          const send = (topic) => produce(topic, () => undefined);
        `,
      },
      {
        name: 'produce imported from another module',
        code: dedent`
          import { produce } from 'kafka';

          const send = (topic) => produce(topic, () => undefined);
        `,
      },
      {
        name: 'a parameter that shadows the immer import',
        code: dedent`
          import { produce } from 'immer';

          const run = (produce) => (state) => produce(state, () => undefined);
        `,
      },
      {
        name: 'a shadowed namespace or default import',
        code: dedent`
          import * as immer from 'immer';
          import produce from 'immer';

          const a = (immer) => (state) => immer.produce(state, () => undefined);
          const b = (immer) => (state) =>
            (immer as ImmerLike).produce(state, () => undefined);
          const c = () => {
            const produce = (topic, callback) => callback(topic);

            return (state) => produce(state, () => undefined);
          };
        `,
      },
      {
        name: 'another immer export',
        code: dedent`
          import { createDraft as produce } from 'immer';

          const run = (state) => produce(state, () => undefined);
        `,
      },
    ],
    invalid: [
      {
        name: 'an aliased import',
        code: dedent`
          import { produce as update } from 'immer';

          const next = (state) =>
            update(state, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          import { produce as update } from 'immer';

          const next = update((draft) => {
            draft.count += 1;
          });
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
      {
        name: 'a default import (immer 9 and earlier)',
        code: dedent`
          import produce from 'immer';
          import { default as update } from 'immer';
          import * as immer from 'immer';

          const a = (state) => produce(state, () => undefined);
          const b = (state) => update(state, () => undefined);
          const c = (state) => immer.default(state, () => undefined);
        `,
        output: dedent`
          import produce from 'immer';
          import { default as update } from 'immer';
          import * as immer from 'immer';

          const a = produce(() => undefined);
          const b = update(() => undefined);
          const c = immer.default(() => undefined);
        `,
        errors: [
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
        ],
      },
      {
        name: 'a namespace import',
        code: dedent`
          import * as immer from 'immer';

          const next = (state: State) =>
            immer.produce(state, (draft) => {
              draft.count += 1;
            });
        `,
        output: dedent`
          import * as immer from 'immer';

          const next = immer.produce<State>((draft) => {
            draft.count += 1;
          });
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});

describe('prefer-curried-produce with the call or callee in a type wrapper', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [
      {
        name: 'the call under `as` or `<T>`, whose return type no curried form keeps',
        code: dedent`
          import { produce } from 'immer';

          const a = (state: State) => produce(state, () => undefined) as View;
          const b = (state) => <View>produce(state, () => undefined);
          const c = (state) => (produce(state, () => undefined) satisfies State) as View;
        `,
      },
    ],
    invalid: [
      {
        name: 'the call in `satisfies` or `!` is reported but not fixed, since the fix cannot keep the wrapper',
        code: dedent`
          import { produce } from 'immer';

          const b = (state) => produce(state, () => undefined) satisfies State;
          const c = (state) => produce(state, () => undefined)!;
        `,
        output: null,
        errors: [
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
        ],
      },
      {
        name: 'the callee in a type wrapper is reported but not fixed',
        code: dedent`
          import { produce } from 'immer';

          const a = (state) => (produce as typeof produce)(state, () => undefined);
          const b = (state) => (produce satisfies typeof produce)(state, () => undefined);
        `,
        output: null,
        errors: [
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
        ],
      },
      {
        name: 'the namespace object in a type wrapper is reported but not fixed',
        code: dedent`
          import * as immer from 'immer';

          const a = (state) => (immer as ImmerLike).produce(state, () => undefined);
        `,
        output: null,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
      {
        name: 'parentheses around the call are not a wrapper',
        code: dedent`
          import { produce } from 'immer';

          const a = (state) => (produce(state, () => undefined));
        `,
        output: dedent`
          import { produce } from 'immer';

          const a = produce(() => undefined);
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});

describe('prefer-curried-produce keeps comments', () => {
  tester.run(ruleName, preferCurriedProduceRule, {
    valid: [],
    invalid: [
      {
        name: 'a comment outside the recipe is reported but not fixed',
        code: dedent`
          import { produce } from 'immer';

          const a = (state) => /* keep */ produce(state, () => undefined);
          const b = (state) =>
            produce(
              state, // the base
              () => undefined,
            );
          const c = (/* the state */ state) => produce(state, () => undefined);
        `,
        output: null,
        errors: [
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
          { messageId: 'useCurriedProduce' },
        ],
      },
      {
        name: 'a comment inside the recipe goes with it',
        code: dedent`
          import { produce } from 'immer';

          const update = (state) =>
            produce(state, (draft) => {
              // count up
              draft.count += 1;
            });
        `,
        output: dedent`
          import { produce } from 'immer';

          const update = produce((draft) => {
            // count up
            draft.count += 1;
          });
        `,
        errors: [{ messageId: 'useCurriedProduce' }],
      },
    ],
  });
});
