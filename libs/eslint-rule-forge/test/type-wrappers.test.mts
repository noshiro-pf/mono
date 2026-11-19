import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { expectType } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  isCallee,
  isTypeWrapper,
  outermostTypeWrapper,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
  typeHoldsAtSomeLayer,
  typeWrapperLayers,
  type WrappedExpression,
} from '../src/index.mjs';
import { probeRule, textOf, type ProbeContext } from './probe-rule.mjs';

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

const typedRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      projectService: { allowDefaultProject: ['*.ts*'] },
      tsconfigRootDir: `${import.meta.dirname}/..`,
    },
  },
});

/** Whether a type is `bigint` or a bigint literal. */
const isBigInt = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => (type.flags & ts.TypeFlags.BigIntLike) !== 0;

// `b` is a bigint, `n` a number, `u` unknown.
const declarations = 'declare const b: bigint; declare const n: number;';

const layerCases = [
  // [argument, at every layer, at some layer]
  ['b', 'true', 'true'],
  ['n', 'false', 'false'],
  ['b as unknown as number', 'false', 'true'],
  ['(n as unknown as bigint)!', 'false', 'true'],
  ['b satisfies bigint', 'true', 'true'],
] as const;

typedRuleTester.run(
  'typeHoldsAtEveryLayer',
  probeRule((context, argument) =>
    typeHoldsAtEveryLayer(context.sourceCode, argument, isBigInt).toString(),
  ),
  {
    valid: [],
    invalid: layerCases.map(([argument, result]) => ({
      code: `${declarations} probe(${argument});`,
      errors: [{ messageId: 'result' as const, data: { result } }],
    })),
  },
);

typedRuleTester.run(
  'typeHoldsAtSomeLayer',
  probeRule((context, argument) =>
    typeHoldsAtSomeLayer(context.sourceCode, argument, isBigInt).toString(),
  ),
  {
    valid: [],
    invalid: layerCases.map(([argument, , result]) => ({
      code: `${declarations} probe(${argument});`,
      errors: [{ messageId: 'result' as const, data: { result } }],
    })),
  },
);

// Without type information each holds of nothing.
ruleTester.run(
  'typeHoldsAtSomeLayer without type information',
  probeRule((context, argument) =>
    [
      typeHoldsAtEveryLayer(context.sourceCode, argument, () => true),
      typeHoldsAtSomeLayer(context.sourceCode, argument, () => true),
    ].join(' '),
  ),
  {
    valid: [],
    invalid: [
      {
        code: 'probe(b as unknown as number);',
        errors: [{ messageId: 'result', data: { result: 'false false' } }],
      },
    ],
  },
);

/**
 * A rule that reports each identifier named `target` with what `read` gives of
 * it: the helpers below start from a node inside its wrappers, which
 * `probeRule`'s argument is not.
 */
const targetRule = (
  read: (
    // A rule context is not readonly, as in probe-rule.mts.
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    context: ProbeContext,
    target: DeepReadonly<TSESTree.Identifier>,
  ) => string,
): TSESLint.RuleModule<'result'> =>
  ({
    meta: {
      type: 'problem',
      messages: { result: '{{result}}' },
      schema: [],
      defaultOptions: [],
    },
    create: (context) => ({
      Identifier: (node) => {
        if (node.name === 'target') {
          context.report({
            node,
            messageId: 'result',
            data: { result: read(context, node) },
          });
        }
      },
    }),
  }) as const;

ruleTester.run(
  'outermostTypeWrapper',
  targetRule((context, target) => {
    const [start, end] = outermostTypeWrapper(target).range;

    return context.sourceCode.text.slice(start, end);
  }),
  {
    valid: [],
    invalid: [
      ['target as A as B', 'target as A as B'],
      ['(target as A)!', '(target as A)!'],
      ['target satisfies A', 'target satisfies A'],
      ['<A>target', '<A>target'],
      ['f(target!)', 'target!'],
      ['target', 'target'],
      ['(target as A).b', 'target as A'],
    ].map(([code, result]) => ({
      code: `${code};`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'isCallee',
  targetRule((_, target) => isCallee(target).toString()),
  {
    valid: [],
    invalid: [
      ['target()', 'true'],
      ['target!()', 'true'],
      ['(target as F)()', 'true'],
      ['(target satisfies F)()', 'true'],
      ['(<F>target)()', 'true'],
      ['target?.()', 'true'],
      ['f(target)', 'false'],
      ['new target()', 'false'],
      ['target`x`', 'false'],
      ['(target as F).call()', 'false'],
    ].map(([code, result]) => ({
      code: `${code};`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);

ruleTester.run(
  'isCallee through an optional chain',
  targetRule((context, target) => {
    const member = target.parent;

    return member.type === AST_NODE_TYPES.MemberExpression
      ? `${context.sourceCode.text.slice(member.range[0], member.range[1])}: ${isCallee(member).toString()}`
      : 'no member';
  }),
  {
    valid: [],
    invalid: [
      ['(o?.target)()', 'o?.target: true'],
      ['o?.target()', 'o?.target: true'],
      ['(o?.target as F)()', 'o?.target: true'],
      ['f(o?.target)', 'o?.target: false'],
    ].map(([code, result]) => ({
      code: `${code};`,
      errors: [{ messageId: 'result', data: { result } }],
    })),
  },
);
