import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

type Options = readonly [];

type MessageIds = 'preferNumberLineOrder' | 'reorderRange';

/**
 * Write a range check in the order of the number line, smaller to the left:
 *
 * | written                  | fixed to                 |
 * | :----------------------- | :----------------------- |
 * | `x >= min && max >= x`   | `min <= x && x <= max`   |
 * | `x < max && x >= min`    | `min <= x && x < max`    |
 * | `min > x \|\| x > max`   | `x < min \|\| max < x`   |
 * | `max < x \|\| x < min`   | `x < min \|\| max < x`   |
 *
 * A range check is two relational comparisons joined by `&&` or `||`,
 * adjacent in a chain of that operator, that share one operand — the value
 * tested — which is smaller than the other operand in one comparison and
 * larger in the other. A shared operand that is a literal is a bound, not a
 * value tested, and `a < 0 && 0 < b` is left alone.
 *
 * Writing `a > b` as `b < a` is exact, `NaN` included. It does evaluate the
 * operands in the other order, and moving the lower bound's comparison first
 * changes which one `&&` or `||` may skip, so an operand with a side effect
 * leaves the report with a suggestion instead of a fix.
 */
export const preferRangeInNumberLineOrder: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Write a range check in the order of the number line (`x >= min && max >= x` → `min <= x && x <= max`, `min > x || x > max` → `x < min || max < x`).',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      preferNumberLineOrder:
        'Write the range in the order of the number line: `{{replacement}}`.',
      reorderRange: 'Replace with `{{replacement}}`.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const tokensOf = (node: DeepReadonly<TSESTree.Node>): string =>
      sourceCode
        .getTokens(asNode(node))
        .map((token) => token.value)
        .join(' ');

    const isSame = (
      a: DeepReadonly<TSESTree.Node>,
      b: DeepReadonly<TSESTree.Node>,
    ): boolean => tokensOf(a) === tokensOf(b);

    /**
     * The text of one side of `node`, with the parentheses and comments
     * written between it and the operator.
     */
    const sideText = (
      node: RelationalComparison,
      side: 'left' | 'right',
    ): string => {
      const operator = sourceCode.getFirstTokenBetween(
        asNode(node.left),
        asNode(node.right),
        (token) => token.value === node.operator,
      );

      if (operator === null) {
        return sourceCode.getText(asNode(node[side]));
      }

      return (
        side === 'left'
          ? sourceCode.text.slice(node.range[0], operator.range[0])
          : sourceCode.text.slice(operator.range[1], node.range[1])
      ).trim();
    };

    /** `node` as `lower < upper` or `lower <= upper`, as source text. */
    const ascendingText = (node: RelationalComparison): string => {
      const { operator } = node;

      if (operator === '<' || operator === '<=') {
        return sourceCode.getText(asNode(node));
      }

      const left = sideText(node, 'left');

      // The left operand of a relational comparison may itself be one (or an
      // `as`, `in`, …) without parentheses; on the right it may not.
      const upper =
        bindsAsLooseAsRelational(node.left) &&
        !ASTUtils.isParenthesized(asNode(node.left), sourceCode)
          ? `(${left})`
          : left;

      return `${sideText(node, 'right')} ${ASCENDING_OPERATOR[operator]} ${upper}`;
    };

    const checkPair = (
      logical: '&&' | '||',
      first: RelationalComparison,
      second: RelationalComparison,
    ): boolean => {
      const a = ascending(first);

      const b = ascending(second);

      // In `lo < x && x < hi` the value tested is the upper side of the first
      // comparison; in `x < lo || hi < x`, the lower side.
      const valueIsUpperInFirst = logical === '&&';

      const inOrder = valueIsUpperInFirst
        ? isSame(a.upper, b.lower)
        : isSame(a.lower, b.upper);

      const reversed =
        !inOrder &&
        (valueIsUpperInFirst
          ? isSame(a.lower, b.upper)
          : isSame(a.upper, b.lower));

      if (!inOrder && !reversed) {
        return false;
      }

      const [lowerBoundSide, upperBoundSide] = inOrder ? [a, b] : [b, a];

      const value = valueIsUpperInFirst
        ? lowerBoundSide.upper
        : lowerBoundSide.lower;

      if (isLiteralLike(value)) {
        return false;
      }

      if (inOrder && !lowerBoundSide.swapped && !upperBoundSide.swapped) {
        return true;
      }

      const firstText = ascendingText(lowerBoundSide.node);

      const secondText = ascendingText(upperBoundSide.node);

      const replacement = [
        firstText,
        sourceCode.text.slice(first.range[1], second.range[0]),
        secondText,
      ].join('');

      const fix = (fixer: TSESLint.RuleFixer): readonly TSESLint.RuleFix[] => [
        fixer.replaceText(asNode(first), firstText),
        fixer.replaceText(asNode(second), secondText),
      ];

      const loc = { start: first.loc.start, end: second.loc.end } as const;

      const data = { replacement: replacement.replaceAll(/\s+/gu, ' ') };

      if (
        [first.left, first.right, second.left, second.right].some((operand) =>
          ASTUtils.hasSideEffect(asNode(operand), sourceCode),
        )
      ) {
        context.report({
          loc,
          messageId: 'preferNumberLineOrder',
          data,
          suggest: [{ messageId: 'reorderRange', data, fix }],
        });
      } else {
        context.report({
          loc,
          messageId: 'preferNumberLineOrder',
          data,
          fix,
        });
      }

      return true;
    };

    const checkChain = (
      logical: '&&' | '||',
      operands: readonly DeepReadonly<TSESTree.Expression>[],
      index: number,
    ): void => {
      const first = operands[index];

      const second = operands[index + 1];

      if (first === undefined || second === undefined) {
        return;
      }

      const isRange =
        isRelationalComparison(first) &&
        isRelationalComparison(second) &&
        checkPair(logical, first, second);

      // A comparison belongs to one range check at most.
      checkChain(logical, operands, index + (isRange ? 2 : 1));
    };

    return {
      LogicalExpression: (node) => {
        const { operator } = node;

        if (
          operator === '??' ||
          (node.parent.type === AST_NODE_TYPES.LogicalExpression &&
            node.parent.operator === operator)
        ) {
          return;
        }

        checkChain(operator, flattenChain(node, operator), 0);
      },
    };
  },
  defaultOptions: [],
} as const;

type RelationalOperator = '<' | '<=' | '>' | '>=';

type RelationalComparison = DeepReadonly<TSESTree.BinaryExpression> &
  Readonly<{
    operator: RelationalOperator;
    left: DeepReadonly<TSESTree.Expression>;
  }>;

type Ascending = Readonly<{
  node: RelationalComparison;
  lower: DeepReadonly<TSESTree.Expression>;
  upper: DeepReadonly<TSESTree.Expression>;
  /** Whether it is written `upper > lower` or `upper >= lower`. */
  swapped: boolean;
}>;

const ASCENDING_OPERATOR = {
  '>': '<',
  '>=': '<=',
} as const;

const isRelationalComparison = (
  node: DeepReadonly<TSESTree.Node>,
): node is RelationalComparison =>
  node.type === AST_NODE_TYPES.BinaryExpression &&
  node.left.type !== AST_NODE_TYPES.PrivateIdentifier &&
  (node.operator === '<' ||
    node.operator === '<=' ||
    node.operator === '>' ||
    node.operator === '>=');

const ascending = (node: RelationalComparison): Ascending =>
  node.operator === '<' || node.operator === '<='
    ? ({ node, lower: node.left, upper: node.right, swapped: false } as const)
    : ({ node, lower: node.right, upper: node.left, swapped: true } as const);

/** The operands of a chain of one logical operator, parentheses ignored. */
const flattenChain = (
  node: DeepReadonly<TSESTree.Expression>,
  operator: '&&' | '||',
): readonly DeepReadonly<TSESTree.Expression>[] =>
  node.type === AST_NODE_TYPES.LogicalExpression && node.operator === operator
    ? ([
        ...flattenChain(node.left, operator),
        ...flattenChain(node.right, operator),
      ] as const)
    : ([node] as const);

/** A literal, a negative number literal, or a template with no expression. */
const isLiteralLike = (node: DeepReadonly<TSESTree.Expression>): boolean =>
  node.type === AST_NODE_TYPES.Literal ||
  (node.type === AST_NODE_TYPES.UnaryExpression &&
    (node.operator === '-' || node.operator === '+') &&
    node.argument.type === AST_NODE_TYPES.Literal) ||
  (node.type === AST_NODE_TYPES.TemplateLiteral &&
    Arr.isEmpty(node.expressions));

/**
 * Whether `node`, as the right operand of a relational comparison, would
 * need parentheses.
 */
const bindsAsLooseAsRelational = (
  node: DeepReadonly<TSESTree.Expression>,
): boolean =>
  node.type === AST_NODE_TYPES.BinaryExpression
    ? !TIGHTER_BINARY_OPERATORS.has(node.operator)
    : LOOSER_EXPRESSIONS.has(node.type);

/** Expressions other than binary ones that bind no tighter than `<`. */
const LOOSER_EXPRESSIONS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.AssignmentExpression,
  AST_NODE_TYPES.ConditionalExpression,
  AST_NODE_TYPES.LogicalExpression,
  AST_NODE_TYPES.SequenceExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.YieldExpression,
]);

/** Binary operators binding tighter than a relational comparison. */
const TIGHTER_BINARY_OPERATORS: ReadonlySet<string> = new Set([
  '<<',
  '>>',
  '>>>',
  '+',
  '-',
  '*',
  '/',
  '%',
  '**',
]);

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
