import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { hasKey } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';

/** Each comparison operator, and the one that is true exactly when it is not. */
export const INVERTED_COMPARISON_OPERATOR = {
  '===': '!==',
  '!==': '===',
  '==': '!=',
  '!=': '==',
  '<': '>=',
  '>=': '<',
  '>': '<=',
  '<=': '>',
} as const;

export type ComparisonOperator = keyof typeof INVERTED_COMPARISON_OPERATOR;

export type ComparisonExpression = DeepReadonly<TSESTree.BinaryExpression> &
  Readonly<{ operator: ComparisonOperator }>;

export const isComparison = (
  node: DeepReadonly<TSESTree.Node>,
): node is ComparisonExpression =>
  node.type === AST_NODE_TYPES.BinaryExpression &&
  hasKey(INVERTED_COMPARISON_OPERATOR, node.operator);

/**
 * Whether inverting the operator gives exactly the negation.
 *
 * An equality always does. A relational comparison does unless an operand
 * converts to `NaN`: every relational comparison with `NaN` is `false`, so
 * `!(a < b)` is `true` there while `a >= b` is `false`. It cannot when both
 * sides are strings (compared as strings), or both are numeric values that are
 * never `NaN` — number literals, `bigint`, booleans, and number brands that
 * declare `NaNValue: false` (`ValidNumber`, `Int`, `FiniteNumber`, …).
 */
export const isExactlyInvertible = (
  node: ComparisonExpression,
  getType: (target: DeepReadonly<TSESTree.Node>) => ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if (!RELATIONAL_OPERATORS.has(node.operator)) {
    return true;
  }

  const sides = [getType(node.left), getType(node.right)].flatMap(
    constituentsOf,
  );

  return (
    sides.every((type) => (type.flags & ts.TypeFlags.StringLike) !== 0) ||
    sides.every((type) => isNeverNaN(type, checker))
  );
};

/**
 * The source of `node` with its operator inverted, and everything else —
 * operands, comments, line breaks — as written.
 */
export const invertedComparisonText = (
  node: ComparisonExpression,
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
): string => {
  const text = sourceCode.getText(asNode(node));

  const operator = sourceCode.getFirstTokenBetween(
    asNode(node.left),
    asNode(node.right),
    (token) => token.value === node.operator,
  );

  if (operator === null) {
    return `${sourceCode.getText(asNode(node.left))} ${INVERTED_COMPARISON_OPERATOR[node.operator]} ${sourceCode.getText(asNode(node.right))}`;
  }

  const [start] = node.range;

  return [
    text.slice(0, operator.range[0] - start),
    INVERTED_COMPARISON_OPERATOR[node.operator],
    text.slice(operator.range[1] - start),
  ].join('');
};

const RELATIONAL_OPERATORS: ReadonlySet<ComparisonOperator> =
  new Set<ComparisonOperator>(['<', '<=', '>', '>=']);

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const constituentsOf = (type: ts.Type): readonly ts.Type[] =>
  type.isUnion() ? type.types : ([type] as const);

const NEVER_NAN_FLAGS =
  ts.TypeFlags.NumberLiteral |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.Null;

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isNeverNaN = (type: ts.Type, checker: ts.TypeChecker): boolean => {
  if ((type.flags & NEVER_NAN_FLAGS) !== 0) {
    return true;
  }

  if (!type.isIntersection()) {
    return false;
  }

  const brand = checker.getPropertyOfType(type, 'NaNValue');

  if (brand === undefined) {
    return false;
  }

  const brandType = checker.getTypeOfSymbol(brand);

  return (
    type.types.some(
      (member) => (member.flags & ts.TypeFlags.NumberLike) !== 0,
    ) &&
    (brandType.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
    checker.typeToString(brandType) === 'false'
  );
};

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
