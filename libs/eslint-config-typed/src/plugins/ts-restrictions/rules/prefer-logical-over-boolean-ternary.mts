import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  invertedComparisonText,
  isComparison,
  isExactlyInvertible,
} from './comparison-utils.mjs';

type Options = readonly [];

type MessageIds = 'preferLogical';

/**
 * Replace a ternary with one boolean literal branch by the logical operator it
 * spells out:
 *
 * | written          | fixed to    | when                        |
 * | :--------------- | :---------- | :-------------------------- |
 * | `a ? false : b`  | `!a && b`   | always                      |
 * | `a ? b : true`   | `!a \|\| b` | always                      |
 * | `a ? true : b`   | `a \|\| b`  | `a` is a boolean            |
 * | `a ? b : false`  | `a && b`    | `a` is a boolean            |
 *
 * The last two keep the ternary's value only when `a` is itself `true` or
 * `false`: `0 ? b : false` is `false`, while `0 && b` is `0`. The type decides,
 * and anything not known to be a boolean is left alone.
 *
 * The negation is written the short way where there is one: `!a` → `a` (when
 * `a` is a boolean), `a === b` → `a !== b`, and a relational comparison is
 * inverted when no operand can be `NaN`. A relational comparison that may be
 * `NaN` has no exact short negation, so that ternary is left alone.
 *
 * A ternary whose branches are both boolean literals is `no-unneeded-ternary`'s.
 * One directly in JSX is not turned into `&&`, which the JSX conventions and
 * react/jsx-no-leaked-render keep out of it.
 */
export const preferLogicalOverBooleanTernary: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace a ternary with one boolean literal branch by `&&` or `||` (`a ? false : b` → `!a && b`, `a ? true : b` → `a || b`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferLogical: 'Write this ternary as `{{replacement}}`.',
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

    const textOf = (node: DeepReadonly<TSESTree.Node>): string =>
      sourceCode.getText(asNode(node));

    /** `node` as an operand of `operator`, parenthesized if need be. */
    const operand = (
      node: DeepReadonly<TSESTree.Node>,
      operator: '&&' | '||',
    ): string =>
      !ASTUtils.isParenthesized(asNode(node), sourceCode) &&
      bindsLooserThan(node, operator)
        ? `(${textOf(node)})`
        : textOf(node);

    const isBoolean = (node: DeepReadonly<TSESTree.Node>): boolean =>
      (node.type === AST_NODE_TYPES.UnaryExpression && node.operator === '!') ||
      (node.type === AST_NODE_TYPES.BinaryExpression &&
        (isComparison(node) ||
          node.operator === 'in' ||
          node.operator === 'instanceof')) ||
      constituentsOf(getType(node)).every(
        (type) => (type.flags & ts.TypeFlags.BooleanLike) !== 0,
      );

    /**
     * The negation of `node`, as an operand of `&&` or `||` — or `undefined`
     * when the only exact one is `!!a` or a `NaN`-unsafe inversion.
     */
    const negationOf = (
      node: DeepReadonly<TSESTree.Expression>,
      operator: '&&' | '||',
    ): string | undefined => {
      if (
        node.type === AST_NODE_TYPES.UnaryExpression &&
        node.operator === '!'
      ) {
        return isBoolean(node.argument)
          ? operand(node.argument, operator)
          : undefined;
      }

      if (isComparison(node)) {
        return isExactlyInvertible(node, getType, checker)
          ? invertedComparisonText(node, sourceCode)
          : undefined;
      }

      return ASTUtils.isParenthesized(asNode(node), sourceCode) ||
        BINDS_AS_TIGHT_AS_UNARY.has(node.type)
        ? `!${textOf(node)}`
        : `!(${textOf(node)})`;
    };

    const replacementOf = (
      node: DeepReadonly<TSESTree.ConditionalExpression>,
    ): string | undefined => {
      const { test, consequent, alternate } = node;

      const consequentValue = booleanLiteralValue(consequent);

      const alternateValue = booleanLiteralValue(alternate);

      if (consequentValue !== undefined && alternateValue !== undefined) {
        return undefined;
      }

      if (consequentValue === true) {
        return isBoolean(test)
          ? `${operand(test, '||')} || ${operand(alternate, '||')}`
          : undefined;
      }

      // In JSX, `&&` is what react/jsx-no-leaked-render rewrites into
      // `cond ? x : null`, turning the `false` this came from into `null`.
      if (
        (consequentValue === false || alternateValue === false) &&
        node.parent.type === AST_NODE_TYPES.JSXExpressionContainer
      ) {
        return undefined;
      }

      if (consequentValue === false) {
        const negation = negationOf(test, '&&');

        return negation === undefined
          ? undefined
          : `${negation} && ${operand(alternate, '&&')}`;
      }

      if (alternateValue === false) {
        return isBoolean(test)
          ? `${operand(test, '&&')} && ${operand(consequent, '&&')}`
          : undefined;
      }

      if (alternateValue === true) {
        const negation = negationOf(test, '||');

        return negation === undefined
          ? undefined
          : `${negation} || ${operand(consequent, '||')}`;
      }

      return undefined;
    };

    return {
      ConditionalExpression: (node) => {
        const replacement = replacementOf(node);

        if (replacement === undefined) {
          return;
        }

        context.report({
          node,
          messageId: 'preferLogical',
          data: { replacement },
          fix: (fixer) => fixer.replaceText(node, replacement),
        });
      },
    };
  },
  defaultOptions: [],
} as const;

const booleanLiteralValue = (
  node: DeepReadonly<TSESTree.Node>,
): boolean | undefined =>
  node.type === AST_NODE_TYPES.Literal && typeof node.value === 'boolean'
    ? node.value
    : undefined;

/** Whether `node`, as an operand of `operator`, needs parentheses. */
const bindsLooserThan = (
  node: DeepReadonly<TSESTree.Node>,
  operator: '&&' | '||',
): boolean =>
  node.type === AST_NODE_TYPES.LogicalExpression
    ? node.operator === '??' || (operator === '&&' && node.operator === '||')
    : LOOSER_THAN_LOGICAL.has(node.type);

const LOOSER_THAN_LOGICAL: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.YieldExpression,
]);

/** Expressions `!` can be put in front of without parentheses. */
const BINDS_AS_TIGHT_AS_UNARY: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.AwaitExpression,
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.ChainExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.MetaProperty,
  AST_NODE_TYPES.NewExpression,
  AST_NODE_TYPES.ObjectExpression,
  AST_NODE_TYPES.TaggedTemplateExpression,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.UnaryExpression,
]);

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const constituentsOf = (type: ts.Type): readonly ts.Type[] =>
  type.isUnion() ? type.types : ([type] as const);

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
