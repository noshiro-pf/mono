import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';

type Options = readonly [];

type MessageIds = 'stringConversion';

/**
 * synstate-dom writes a boolean on an `aria-*` attribute as `"true"` or
 * `"false"`, and a number through `String`, so converting the value first
 * does nothing. This reports an `aria-*` value whose last step is only such a
 * conversion: `String(x)`, `x.toString()`, `map(String)`, or `x ? 'true' :
 * 'false'` (either way round), as the value itself, in a branch of a
 * conditional, or as what a function passed to a call (`map`, `mapBindable`)
 * returns.
 *
 * `String(x)` and `.toString()` are reported only on the attributes whose value
 * is a boolean, a tristate or a number (`aria-pressed`, `aria-valuenow`, …),
 * since on a string-valued one (`aria-label`, `aria-controls`) the value may be
 * neither. A conversion that is not the last step (`toNumber(String(x))`) is not
 * reported. Type wrappers (`as`, `satisfies`, `!`, `<T>`) and parentheses are
 * seen through.
 */
export const noAriaStringConversion: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Disallow converting an `aria-*` value to a string, which synstate-dom does itself.',
      },
      schema: [],
      messages: {
        stringConversion:
          'synstate-dom writes a boolean on `{{name}}` as "true" or "false" and a number through `String`; pass the value as it is.',
      },
      defaultOptions: [],
    },

    create: (context) => ({
      JSXAttribute: (node) => {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          !node.name.name.startsWith('aria-') ||
          node.value?.type !== AST_NODE_TYPES.JSXExpressionContainer ||
          node.value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
        ) {
          return;
        }

        const name = node.name.name;

        const takesValue = valueTyped.has(name);

        for (const conversion of lastSteps(node.value.expression, takesValue)) {
          context.report({
            node: conversion,
            messageId: 'stringConversion',
            data: { name },
          });
        }
      },
    }),
  } as const;

/**
 * The `aria-*` attributes whose value is a boolean, a tristate or a number,
 * which a conversion by `String` or `.toString()` can only have come from.
 */
const valueTyped: ReadonlySet<string> = new Set<string>([
  'aria-atomic',
  'aria-busy',
  'aria-checked',
  'aria-colcount',
  'aria-colindex',
  'aria-colspan',
  'aria-disabled',
  'aria-expanded',
  'aria-grabbed',
  'aria-hidden',
  'aria-level',
  'aria-modal',
  'aria-multiline',
  'aria-multiselectable',
  'aria-posinset',
  'aria-pressed',
  'aria-readonly',
  'aria-required',
  'aria-rowcount',
  'aria-rowindex',
  'aria-rowspan',
  'aria-selected',
  'aria-setsize',
  'aria-valuemax',
  'aria-valuemin',
  'aria-valuenow',
]);

/** What `fn` returns: its expression body, or its body's top-level `return`s. */
const returnedBy = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
): readonly TSESTree.Expression[] =>
  fn.body.type === AST_NODE_TYPES.BlockStatement
    ? fn.body.body.flatMap((statement) =>
        statement.type === AST_NODE_TYPES.ReturnStatement &&
        statement.argument !== null
          ? [statement.argument]
          : [],
      )
    : ([fn.body] as const);

/** `node` with type wrappers and an optional chain's wrapper taken off. */
const unwrap = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Node => {
  const unwrapped = skipTypeWrappers(node);

  return unwrapped.type === AST_NODE_TYPES.ChainExpression
    ? unwrap(unwrapped.expression)
    : unwrapped;
};

/** `String(x)`, `x.toString()` or `x ? 'true' : 'false'`. */
const isConversion = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  takesValue: boolean,
): boolean => {
  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    const branches = [unwrap(node.consequent), unwrap(node.alternate)].map(
      (branch) =>
        branch.type === AST_NODE_TYPES.Literal ? branch.value : undefined,
    );

    return (
      (branches[0] === 'true' && branches[1] === 'false') ||
      (branches[0] === 'false' && branches[1] === 'true')
    );
  }

  if (!takesValue || node.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }

  const callee = unwrap(node.callee);

  if (callee.type === AST_NODE_TYPES.Identifier) {
    return callee.name === 'String' && node.arguments.length === 1;
  }

  return (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    callee.property.name === 'toString' &&
    node.arguments.length === 0
  );
};

/**
 * The conversions that are the last step of `expression`: itself, a branch of a
 * conditional, what a function argument of a call returns, and `String` passed
 * as an argument.
 */
const lastSteps = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
  takesValue: boolean,
): readonly TSESTree.Node[] => {
  const node = unwrap(expression);

  if (isConversion(node, takesValue)) {
    return [node];
  }

  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    return [
      ...lastSteps(node.consequent, takesValue),
      ...lastSteps(node.alternate, takesValue),
    ];
  }

  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return [];
  }

  return node.arguments.flatMap((argument): readonly TSESTree.Node[] => {
    if (argument.type === AST_NODE_TYPES.SpreadElement) {
      return [];
    }

    const arg = unwrap(argument);

    if (arg.type === AST_NODE_TYPES.Identifier) {
      return takesValue && arg.name === 'String' ? [arg] : [];
    }

    if (
      arg.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      arg.type === AST_NODE_TYPES.FunctionExpression
    ) {
      return returnedBy(arg).flatMap((returned) =>
        lastSteps(returned, takesValue),
      );
    }

    // A call whose result is passed on, such as `map(…)` in `pipe(map(…))`;
    // a conversion passed to a call is not its result.
    return arg.type === AST_NODE_TYPES.CallExpression &&
      !isConversion(arg, takesValue)
      ? lastSteps(arg, takesValue)
      : [];
  });
};
