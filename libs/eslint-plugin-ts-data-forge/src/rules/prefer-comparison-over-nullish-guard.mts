import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly, type ReadonlyRecord } from 'ts-type-forge';
import { buildCalleeResolver, getTsDataForgeImport } from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'preferComparison';

type ComparisonSpec = Readonly<{
  op: '!==' | '===';
  literal: 'null' | 'undefined';
}>;

/**
 * The nullish guards that are meant for point-free use (e.g.
 * `xs.filter(isNotUndefined)`). When called with an explicit argument a direct
 * comparison is clearer, so map each to its equivalent operator and literal.
 */
const COMPARISON_GUARDS: ReadonlyRecord<string, ComparisonSpec> = {
  isUndefined: { op: '===', literal: 'undefined' },
  isNotUndefined: { op: '!==', literal: 'undefined' },
  isNull: { op: '===', literal: 'null' },
  isNotNull: { op: '!==', literal: 'null' },
} as const;

/**
 * Argument expression kinds whose precedence is lower than equality, so they
 * must be parenthesized when placed on the left of `===` / `!==`. A node's text
 * never includes the parentheses the source wrote around it, so this is decided
 * on the kind alone. `as` / `satisfies` and a nested equality would parse as
 * intended, but are parenthesized so that the type or the grouping is not read
 * as part of the comparison.
 */
const ARG_NEEDS_PARENS: ReadonlySet<string> = new Set([
  AST_NODE_TYPES.LogicalExpression,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.YieldExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
]);

/** Binary operators that bind no tighter than `===` / `!==`. */
const LOOSE_BINARY_OPERATORS: ReadonlySet<string> = new Set([
  '|',
  '^',
  '&',
  '==',
  '!=',
  '===',
  '!==',
]);

const argumentNeedsParens = (
  argument: DeepReadonly<TSESTree.Expression>,
): boolean =>
  ARG_NEEDS_PARENS.has(argument.type) ||
  (argument.type === AST_NODE_TYPES.BinaryExpression &&
    LOOSE_BINARY_OPERATORS.has(argument.operator));

/**
 * Returns `true` when the comparison must be wrapped in parentheses to preserve
 * the original grouping given the call expression's parent context. A type
 * wrapper around the call is one such context: `x === null satisfies boolean`
 * would apply the wrapper to `null`.
 */
const needsWrappingInParent = (
  node: DeepReadonly<TSESTree.CallExpression>,
): boolean => {
  const { parent } = node;

  // `parent.type` is one of 130+ AST kinds; only a handful need wrapping.
  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (parent.type) {
    case AST_NODE_TYPES.UnaryExpression:
    case AST_NODE_TYPES.AwaitExpression:
    case AST_NODE_TYPES.BinaryExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSSatisfiesExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return true;

    case AST_NODE_TYPES.MemberExpression:
      return parent.object === node;

    case AST_NODE_TYPES.CallExpression:
    case AST_NODE_TYPES.NewExpression:
      return parent.callee === node;

    default:
      return false;
  }
};

export const preferComparisonOverNullishGuard: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer a direct `=== null` / `!== undefined` comparison over calling `isNull`, `isNotNull`, `isUndefined`, or `isNotUndefined` with an explicit argument (those guards are intended for point-free use such as `xs.filter(isNotUndefined)`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferComparison:
        'Prefer `{{comparison}}` over calling `{{name}}` with an explicit argument.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const resolveGuard = buildCalleeResolver(
      getTsDataForgeImport(sourceCode.ast),
    );

    return {
      CallExpression: (node) => {
        if (node.arguments.length !== 1) {
          return;
        }

        const argument = node.arguments[0];

        if (
          argument === undefined ||
          argument.type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        const resolved = resolveGuard(node.callee);

        if (resolved === undefined) {
          return;
        }

        const spec = COMPARISON_GUARDS[resolved.canonicalName];

        if (spec === undefined) {
          return;
        }

        const argRaw = sourceCode.getText(argument);

        const argText = argumentNeedsParens(argument) ? `(${argRaw})` : argRaw;

        const comparison = `${argText} ${spec.op} ${spec.literal}`;

        const replacement = needsWrappingInParent(node)
          ? `(${comparison})`
          : comparison;

        context.report({
          node,
          messageId: 'preferComparison',
          data: { comparison, name: resolved.canonicalName },
          fix: (fixer) => fixer.replaceText(node, replacement),
        });
      },
    };
  },
  defaultOptions: [],
} as const;
