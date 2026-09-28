import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { jsxValuePositionOf, type JsxValuePosition } from './jsx-utils.mjs';

type Options = readonly [];

type MessageIds = 'booleanOperands' | 'nonBooleanLeft';

/**
 * In JSX, `&&` and `||` take booleans on both sides. What either operand holds
 * can be the value that comes out of the braces, and a value that is not a
 * boolean is rendered or passed on: `{count && <X />}` renders `0`, and
 * `{a && <X />}` puts a JSX element through an operator that is about truth.
 * A ternary says which value is meant instead:
 *
 * | written          | as a child                | as an attribute       |
 * | :--------------- | :------------------------ | :-------------------- |
 * | `{a && <X />}`   | `{a ? <X /> : undefined}` | `{a ? <X /> : false}` |
 * | `{a \|\| <X />}` | `{a ? undefined : <X />}` | `{a ? true : <X />}`  |
 *
 * The fix applies when the left operand is a boolean, and keeps what comes
 * out: a child `false`, `true` and `undefined` all render nothing, and an
 * attribute keeps the exact `false` / `true` it was given. A left operand that
 * is not a boolean is only reported. Turning it into a ternary's test would
 * change what is rendered (no more `0`) and still not be a boolean, so the
 * comparison it stands for (`n !== 0`, `s !== ''`, or `??` for a fallback) is
 * the author's to write.
 *
 * An operand is "in JSX" when its value can come out of the braces: the
 * expression in `{…}` itself, a branch of a ternary there, or an operand of a
 * longer `&&` / `||` / `??` chain. The test of a ternary is not. This replaces
 * `react/jsx-no-leaked-render`, which reported every `&&` alike, whatever its
 * operands were.
 */
export const jsxBooleanLogicalOperands: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require booleans on both sides of `&&` and `||` whose value is rendered or passed in JSX, and write the rest as a ternary (`{a && <X />}` → `{a ? <X /> : undefined}`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      booleanOperands:
        'In JSX, `{{operator}}` takes booleans on both sides. Write `{{replacement}}`.',
      nonBooleanLeft:
        'In JSX, `{{operator}}` takes booleans on both sides, and its left operand is not one. Compare it explicitly (`n !== 0`, `s !== ""`), or use `??` for a fallback.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = ESLintUtils.getParserServices(context);

    const checker = services.program.getTypeChecker();

    const isBoolean = (node: DeepReadonly<TSESTree.Node>): boolean =>
      typeIsBoolean(
        checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(asNode(node)),
        ),
        checker,
      );

    const textOf = (node: DeepReadonly<TSESTree.Node>): string =>
      sourceCode.getText(asNode(node));

    const ternaryOf = (
      node: DeepReadonly<TSESTree.LogicalExpression>,
      position: JsxValuePosition,
    ): string => {
      const test = LOOSER_THAN_TERNARY_TEST.has(node.left.type)
        ? `(${textOf(node.left)})`
        : textOf(node.left);

      const other =
        node.right.type === AST_NODE_TYPES.SequenceExpression
          ? `(${textOf(node.right)})`
          : textOf(node.right);

      // What the operator yields when it does not take the right operand.
      const own =
        position === 'child'
          ? 'undefined'
          : node.operator === '&&'
            ? 'false'
            : 'true';

      return node.operator === '&&'
        ? `${test} ? ${other} : ${own}`
        : `${test} ? ${own} : ${other}`;
    };

    return {
      LogicalExpression: (node) => {
        if (node.operator === '??') {
          return;
        }

        const position = jsxValuePositionOf(node);

        if (position === undefined) {
          return;
        }

        if (!isBoolean(node.left)) {
          context.report({
            node,
            messageId: 'nonBooleanLeft',
            data: { operator: node.operator },
          });

          return;
        }

        if (isBoolean(node.right)) {
          return;
        }

        const replacement = ternaryOf(node, position);

        context.report({
          node,
          messageId: 'booleanOperands',
          data: { operator: node.operator, replacement },
          fix: (fixer) => fixer.replaceText(node, replacement),
        });
      },
    };
  },
  defaultOptions: [],
} as const;

/** Expressions that need parentheses as the test of a ternary. */
const LOOSER_THAN_TERNARY_TEST: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.YieldExpression,
]);

/**
 * Whether every value of `type` is `true` or `false`. `never` holds none, so
 * it is one; `any`, `unknown` and an unconstrained type parameter are not.
 */
const typeIsBoolean = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if ((type.flags & (ts.TypeFlags.BooleanLike | ts.TypeFlags.Never)) !== 0) {
    return true;
  }

  if (type.isUnion()) {
    return type.types.every((member) => typeIsBoolean(member, checker));
  }

  if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
    const constraint = checker.getBaseConstraintOfType(type);

    return (
      constraint !== undefined &&
      constraint !== type &&
      typeIsBoolean(constraint, checker)
    );
  }

  return false;
};

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
