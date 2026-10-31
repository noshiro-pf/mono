import {
  AST_NODE_TYPES,
  type ParserServicesWithTypeInformation,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { DeepReadonly, StrictPick } from 'ts-type-forge';
import * as ts from 'typescript';
import { typeWrapperLayers } from './type-wrappers.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

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

/**
 * The type of a node at each of its type-wrapper layers, outermost first (see
 * {@link typeWrapperLayers}).
 */
export type GetLayerTypes = (
  node: DeepReadonly<TSESTree.Node>,
) => readonly ts.Type[];

/**
 * Builds a {@link GetLayerTypes}: `x as A` gives the types of `x as A` and of
 * `x`.
 *
 * A conclusion a rule draws from a type is drawn only when it holds for every
 * one of them. A widening `as` (`b as boolean | number`) is then the author
 * saying the value may be something else, and is respected, while a narrowing
 * one (`n as unknown as boolean`) leaves the value's own type to decide.
 */
export const createGetLayerTypes =
  (
    services: StrictPick<
      ParserServicesWithTypeInformation,
      'esTreeNodeToTSNodeMap' | 'program'
    >,
  ): GetLayerTypes =>
  (node) => {
    const checker = services.program.getTypeChecker();

    return typeWrapperLayers(node).map((layer) =>
      checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(asNode(layer)),
      ),
    );
  };

export const isComparison = (
  node: DeepReadonly<TSESTree.Node>,
): node is ComparisonExpression =>
  node.type === AST_NODE_TYPES.BinaryExpression &&
  Object.hasOwn(INVERTED_COMPARISON_OPERATOR, node.operator);

/**
 * Whether inverting the operator gives exactly the negation.
 *
 * An equality always does. A relational comparison does unless an operand
 * converts to `NaN`: every relational comparison with `NaN` is `false`, so
 * `!(a < b)` is `true` there while `a >= b` is `false`. It cannot when both
 * sides are strings (compared as strings), or both are numeric values that are
 * never `NaN` — number literals, `bigint`, booleans, and number brands that
 * declare `NaNValue: false` (`ValidNumber`, `Int`, `FiniteNumber`, …).
 *
 * `getLayerTypes` gives an operand's type at each of its type-wrapper layers,
 * and every one of them has to say so: `(v as number) < 1` may be `NaN` even
 * when `v` is a `ValidNumber`, and `(n as ValidNumber) < 1` still may when `n`
 * is a `number`.
 */
export const isExactlyInvertible = (
  node: ComparisonExpression,
  getLayerTypes: GetLayerTypes,
  checker: ts.TypeChecker,
): boolean => {
  if (!RELATIONAL_OPERATORS.has(node.operator)) {
    return true;
  }

  const sides = [
    ...getLayerTypes(node.left),
    ...getLayerTypes(node.right),
  ].flatMap(constituentsOf);

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

/** What {@link negationOf} needs to know about the code it negates. */
export type NegationContext = Readonly<{
  sourceCode: DeepReadonly<TSESLint.SourceCode>;
  checker: ts.TypeChecker;
  getLayerTypes: GetLayerTypes;
  /**
   * Whether `node`'s value is a boolean, so that the negation of `!node` may be
   * `node` itself. Where only the truthiness of the negation is read — the test
   * of an `if` — any value will do, and this may answer `true` for every node.
   */
  isBoolean: (node: DeepReadonly<TSESTree.Expression>) => boolean;
}>;

/**
 * The negation of `node`, written the short way, as the source text of an
 * operand of `operandOf` (parenthesized if need be), or of a whole expression
 * when `operandOf` is `undefined`:
 *
 * | `node`             | negation          | when                                  |
 * | :----------------- | :---------------- | :------------------------------------ |
 * | `!a`               | `a`               | `a` is a boolean (`context.isBoolean`) |
 * | `a === b`          | `a !== b`         | always                                |
 * | `a < b`            | `a >= b`          | no operand can be `NaN`               |
 * | `a && b`, `a \|\| b` | `!a \|\| !b`, `!a && !b` | always, each side negated the same way |
 * | anything else      | `!a`, `!(a)`      | always                                |
 *
 * `undefined` when the first two rows' condition does not hold: then the only
 * exact negation is `!!a` or `!(a < b)`, and a caller decides whether to write
 * it (with {@link prefixedNegationOf}) or to give up. Inside `&&` and `||`, a
 * side with no short negation is written with `!`.
 *
 * The node is taken as written: a comparison under a type wrapper is not looked
 * into, since inverting it would drop the wrapper.
 */
export const negationOf = (
  node: DeepReadonly<TSESTree.Expression>,
  context: NegationContext,
  operandOf: '&&' | '||' | undefined,
): string | undefined => {
  const negation = shortNegationOf(node, context);

  return negation === undefined ? undefined : asOperand(negation, operandOf);
};

/**
 * `!node`, with `node` parenthesized unless `!` already binds to all of it:
 * `!a`, `!f(x)`, `!(a === b)`.
 */
export const prefixedNegationOf = (
  node: DeepReadonly<TSESTree.Expression>,
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
): string => {
  const text = sourceCode.getText(asNode(node));

  return BINDS_AS_TIGHT_AS_UNARY.has(node.type) ? `!${text}` : `!(${text})`;
};

/**
 * Whether `node`, written as an operand of `operator`, needs parentheses to
 * stay one operand: `a || b` under `&&`, `a ?? b` under either, and anything
 * binding looser than both (`a ? b : c`, `a = b`, …).
 */
export const needsParenthesesAsOperandOf = (
  node: DeepReadonly<TSESTree.Node>,
  operator: '&&' | '||',
): boolean => isLooserThan(precedenceOf(node), operator);

/**
 * How tightly an expression binds, as far as putting it under `&&` or `||` is
 * concerned.
 */
type Precedence = '&&' | '||' | 'looser' | 'tighter';

type Negation = Readonly<{
  text: string;
  precedence: Precedence;
}>;

const isLooserThan = (precedence: Precedence, operator: '&&' | '||'): boolean =>
  precedence === 'looser' || (operator === '&&' && precedence === '||');

const asOperand = (
  negation: Negation,
  operator: '&&' | '||' | undefined,
): string =>
  operator !== undefined && isLooserThan(negation.precedence, operator)
    ? (`(${negation.text})` as const)
    : negation.text;

const precedenceOf = (node: DeepReadonly<TSESTree.Node>): Precedence => {
  if (node.type === AST_NODE_TYPES.LogicalExpression) {
    // `??` cannot be mixed with `&&` or `||` without parentheses.
    return node.operator === '??' ? 'looser' : node.operator;
  }

  return LOOSER_THAN_LOGICAL.has(node.type) ? 'looser' : 'tighter';
};

/**
 * The parser's node, which the source code and the token store take as mutable,
 * for one that this package only reads.
 */
const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;

const shortNegationOf = (
  node: DeepReadonly<TSESTree.Expression>,
  context: NegationContext,
): Negation | undefined => {
  if (node.type === AST_NODE_TYPES.UnaryExpression && node.operator === '!') {
    return context.isBoolean(node.argument)
      ? {
          text: context.sourceCode.getText(asNode(node.argument)),
          precedence: precedenceOf(node.argument),
        }
      : undefined;
  }

  if (isComparison(node)) {
    return isExactlyInvertible(node, context.getLayerTypes, context.checker)
      ? {
          text: invertedComparisonText(node, context.sourceCode),
          precedence: 'tighter',
        }
      : undefined;
  }

  if (
    node.type === AST_NODE_TYPES.LogicalExpression &&
    node.operator !== '??'
  ) {
    const operator = node.operator === '&&' ? '||' : '&&';

    const side = (operand: DeepReadonly<TSESTree.Expression>): string =>
      asOperand(
        shortNegationOf(operand, context) ?? {
          text: prefixedNegationOf(operand, context.sourceCode),
          precedence: 'tighter',
        },
        operator,
      );

    return {
      text: `${side(node.left)} ${operator} ${side(node.right)}`,
      precedence: operator,
    };
  }

  return {
    text: prefixedNegationOf(node, context.sourceCode),
    precedence: 'tighter',
  };
};

const LOOSER_THAN_LOGICAL: ReadonlySet<AST_NODE_TYPES> =
  new Set<AST_NODE_TYPES>([
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.AssignmentExpression,
    AST_NODE_TYPES.ConditionalExpression,
    AST_NODE_TYPES.SequenceExpression,
    AST_NODE_TYPES.YieldExpression,
  ]);

/** Expressions `!` can be put in front of without parentheses. */
const BINDS_AS_TIGHT_AS_UNARY: ReadonlySet<AST_NODE_TYPES> =
  new Set<AST_NODE_TYPES>([
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

const RELATIONAL_OPERATORS: ReadonlySet<ComparisonOperator> =
  new Set<ComparisonOperator>(['<', '<=', '>', '>=']);

const constituentsOf = (type: ts.Type): readonly ts.Type[] =>
  type.isUnion() ? type.types : ([type] as const);

const isNeverNaN = (type: ts.Type, checker: ts.TypeChecker): boolean => {
  // Read `ts.TypeFlags` here, not at module scope: every importer of this
  // package's index evaluates the module, and a `typescript` without the JS
  // API (7.x) would fail the import even for rules that never get here.
  const neverNaNFlags =
    ts.TypeFlags.NumberLiteral |
    ts.TypeFlags.BigIntLike |
    ts.TypeFlags.BooleanLike |
    ts.TypeFlags.Null;

  if ((type.flags & neverNaNFlags) !== 0) {
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
