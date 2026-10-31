import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';
import { expectType } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  isTypeWrapper,
  skipTypeWrappers,
  typeWrapperLayers,
  type WrappedExpression,
} from '../src/index.mjs';
import { probeRule, textOf } from './probe-rule.mjs';

const ruleTester = new RuleTester();

// A mutable node gives back a mutable expression and a readonly node a readonly
// one.
expectType<
  ReturnType<typeof skipTypeWrappers<TSESTree.Expression>>,
  TSESTree.Expression
>('=');

expectType<
  ReturnType<typeof skipTypeWrappers<DeepReadonly<TSESTree.Expression>>>,
  DeepReadonly<TSESTree.Expression>
>('=');

expectType<WrappedExpression<TSESTree.Identifier>, never>('=');

ruleTester.run(
  'skipTypeWrappers',
  probeRule((context, argument) => textOf(context, skipTypeWrappers(argument))),
  {
    valid: [],
    invalid: [
      ['x as A as B', 'x'],
      ['x!', 'x'],
      ['x satisfies A', 'x'],
      ['<A>x', 'x'],
      ['(x as A)!.y', '(x as A)!.y'],
      ['((x as A) satisfies B)!', 'x'],
      ['x', 'x'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'typeWrapperLayers',
  probeRule((context, argument) =>
    typeWrapperLayers(argument)
      .map((layer) => textOf(context, layer))
      .join(' | '),
  ),
  {
    valid: [],
    invalid: [
      ['x as A as B', 'x as A as B | x as A | x'],
      ['(x as A)!', '(x as A)! | x as A | x'],
      ['x', 'x'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'isTypeWrapper',
  probeRule((_, argument) => isTypeWrapper(argument).toString()),
  {
    valid: [],
    invalid: [
      ['x as A', 'true'],
      ['x!', 'true'],
      ['x satisfies A', 'true'],
      ['<A>x', 'true'],
      ['(x)', 'false'],
      ['x.y!.z', 'false'],
    ].map(([argument, result]) => ({
      code: `probe(${argument});`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);
