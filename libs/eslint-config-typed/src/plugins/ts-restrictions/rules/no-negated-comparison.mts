import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import type * as ts from 'typescript';
import {
  type ComparisonExpression,
  invertedComparisonText,
  isComparison,
  isExactlyInvertible,
} from './comparison-utils.mjs';

type Options = readonly [];

type MessageIds =
  'negatedComparison' | 'negatedComparisonMaybeNaN' | 'invertComparison';

/**
 * Fold a negation into the comparison it negates: `!(a === b)` → `a !== b`,
 * `!(a < b)` → `a >= b`.
 *
 * An equality is always fixed. A relational comparison is fixed only when no
 * operand can be `NaN` (see {@link isExactlyInvertible}); otherwise the
 * inversion is offered as a suggestion, because every relational comparison
 * with `NaN` is `false` — `!(x >= 0)` holds for `NaN` and `x < 0` does not —
 * and a check written that way may be relying on it.
 *
 * `!!(a === b)` is a conversion to boolean, not a negation, and is left alone.
 * A comment the fix would drop leaves the report without a fix.
 */
export const noNegatedComparison: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Invert the operator of a negated comparison instead of negating it (`!(a === b)` → `a !== b`, `!(a < b)` → `a >= b` when no operand can be NaN).',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      negatedComparison:
        'Invert the comparison instead of negating it: `{{replacement}}`.',
      negatedComparisonMaybeNaN:
        'Invert the comparison instead of negating it, if no operand can be NaN: `{{replacement}}`. `!(a < b)` is true for NaN, and `a >= b` is not.',
      invertComparison: 'Replace with `{{replacement}}`.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = ESLintUtils.getParserServices(context);

    const checker = services.program.getTypeChecker();

    const getType = (node: DeepReadonly<TSESTree.Node>): ts.Type =>
      checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(asNode(node)),
      );

    /** A comment between the `!` and the comparison, which the fix drops. */
    const hasCommentOutside = (
      node: DeepReadonly<TSESTree.UnaryExpression>,
      comparison: ComparisonExpression,
    ): boolean =>
      sourceCode
        .getCommentsInside(asNode(node))
        .some(
          (comment) =>
            comment.range[1] <= comparison.range[0] ||
            comment.range[0] >= comparison.range[1],
        );

    /**
     * Whether the replacement starts a statement that, without `;`, would
     * continue the line before it.
     */
    const needsSemicolonBefore = (
      node: DeepReadonly<TSESTree.UnaryExpression>,
      replacement: string,
    ): boolean => {
      if (!STARTS_CONTINUING_A_LINE.test(replacement)) {
        return false;
      }

      const statement = statementStartingWith(node);

      if (statement === undefined) {
        return false;
      }

      const tokenBefore = sourceCode.getTokenBefore(asNode(statement));

      return (
        tokenBefore !== null && !STATEMENT_BOUNDARIES.has(tokenBefore.value)
      );
    };

    const report = (
      node: DeepReadonly<TSESTree.UnaryExpression>,
      comparison: ComparisonExpression,
    ): void => {
      const inverted = invertedComparisonText(comparison, sourceCode);

      const grouped = needsParentheses(node) ? `(${inverted})` : inverted;

      const replacement = needsSemicolonBefore(node, grouped)
        ? `;${grouped}`
        : grouped;

      const fix = hasCommentOutside(node, comparison)
        ? undefined
        : (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
            fixer.replaceText(asNode(node), replacement);

      if (isExactlyInvertible(comparison, getType, checker)) {
        context.report({
          node: asNode(node),
          messageId: 'negatedComparison',
          data: { replacement: inverted },
          ...(fix === undefined ? {} : { fix }),
        });

        return;
      }

      context.report({
        node: asNode(node),
        messageId: 'negatedComparisonMaybeNaN',
        data: { replacement: inverted },
        suggest:
          fix === undefined
            ? []
            : [
                {
                  messageId: 'invertComparison',
                  data: { replacement: inverted },
                  fix,
                },
              ],
      });
    };

    return {
      UnaryExpression: (node) => {
        if (
          node.operator !== '!' ||
          !isComparison(node.argument) ||
          (node.parent.type === AST_NODE_TYPES.UnaryExpression &&
            node.parent.operator === '!')
        ) {
          return;
        }

        report(node, node.argument);
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * Whether the comparison, taking the negation's place, needs parentheses to
 * keep binding as tightly. It does anywhere an operator binding tighter than
 * a comparison could take an operand from it: under a unary operator, in
 * another binary expression, as the object of a member access, and so on.
 */
const needsParentheses = (
  node: DeepReadonly<TSESTree.UnaryExpression>,
): boolean => {
  const { parent } = node;

  if (
    (parent.type === AST_NODE_TYPES.CallExpression ||
      parent.type === AST_NODE_TYPES.NewExpression) &&
    parent.callee !== node
  ) {
    return false;
  }

  return !LOOSER_CONTEXTS.has(parent.type);
};

/** The expression statement `node` is the first token of, if there is one. */
const statementStartingWith = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.ExpressionStatement> | undefined => {
  const { parent } = node;

  return parent?.range[0] !== node.range[0]
    ? undefined
    : parent.type === AST_NODE_TYPES.ExpressionStatement
      ? parent
      : statementStartingWith(parent);
};

/** Where an expression is taken whole, or by an operator binding looser. */
const LOOSER_CONTEXTS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.AssignmentPattern,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ExpressionStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.IfStatement,
  AST_NODE_TYPES.JSXExpressionContainer,
  AST_NODE_TYPES.LogicalExpression,
  AST_NODE_TYPES.Property,
  AST_NODE_TYPES.ReturnStatement,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.ThrowStatement,
  AST_NODE_TYPES.VariableDeclarator,
  AST_NODE_TYPES.WhileStatement,
  AST_NODE_TYPES.YieldExpression,
]);

/** Tokens after which a statement starts, whatever comes next. */
const STATEMENT_BOUNDARIES: ReadonlySet<string> = new Set([';', '{', '}']);

/** A statement starting so would continue the line before it without `;`. */
const STARTS_CONTINUING_A_LINE = /^[([`+\-/]/u;

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
