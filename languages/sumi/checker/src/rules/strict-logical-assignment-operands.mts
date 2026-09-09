import {
  isBinaryExpression,
  SyntaxKind,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import {
  TypeFlags,
  type Checker,
  type Type,
} from 'typescript-native/unstable/sync';
import { type Rule } from '../engine/index.mjs';

/**
 * `boolean/strict-logical-assignment-operands` — both operands of `&&=` and
 * `||=` are boolean (Sumi D-29, spec/booleans-and-logic.md).
 *
 * `x &&= y` means `x = x && y`, so under the boolean strictness Sumi applies
 * to `&&` and `||` the same constraint belongs here. It is a separate rule
 * because `@typescript-eslint/strict-boolean-expressions` examines
 * `LogicalExpression`, condition positions and `!` — not the operands of an
 * assignment (measured 2026-09-05, typescript-eslint 8.67), which leaves the
 * truthiness idiom (`opts ||= {}`) legal where `opts || {}` is not.
 *
 * `??=` coalesces a value rather than folding booleans, so it is exempt.
 */
export const strictLogicalAssignmentOperands: Rule = {
  ruleId: 'boolean/strict-logical-assignment-operands',
  description:
    'Require both operands of `&&=` and `||=` to be boolean, as `&&` and `||` already are (Sumi D-29).',
  visit: (node, { checker, report }) => {
    if (!isBinaryExpression(node)) return;

    const operator = node.operatorToken.kind;

    if (
      operator !== SyntaxKind.AmpersandAmpersandEqualsToken &&
      operator !== SyntaxKind.BarBarEqualsToken
    ) {
      return;
    }

    const offending = [
      { side: 'left', operand: node.left },
      { side: 'right', operand: node.right },
    ].filter(({ operand }) => !isBooleanTyped(checker, operand));

    if (offending.length === 0) return;

    report(
      node,
      `${offending.map(({ side }) => `The ${side} operand`).join(' and ')} of \`${operatorText(operator)}\` ${offending.length === 1 ? 'is' : 'are'} not boolean. \`x ${operatorText(operator)} y\` is \`x = x ${operatorText(operator).slice(0, -1)} y\`, and Sumi folds booleans there rather than truthiness (D-29). Compare explicitly, or use \`??=\` when coalescing a value.`,
    );
  },
} as const;

const operatorText = (
  operator:
    SyntaxKind.AmpersandAmpersandEqualsToken | SyntaxKind.BarBarEqualsToken,
): string =>
  operator === SyntaxKind.AmpersandAmpersandEqualsToken ? '&&=' : '||=';

/**
 * Whether the operand's type is boolean, `true`, `false`, or a union of
 * those. `TypeFlags.BooleanLike` covers the literal types as well as
 * `boolean` itself, which TypeScript models as their union.
 */
const isBooleanTyped = (
  // `Checker` and `Node` are TypeScript's own interfaces, declared mutable;
  // this package does not get to restate them.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
   
  operand: TsNode,
): boolean => {
  const type = checker.getTypeAtLocation(operand);

  if (type === undefined) return false;

  return type.isUnionType()
    ? type.getTypes().every(isBooleanLike)
    : isBooleanLike(type);
};

const isBooleanLike = (type: Type): boolean =>
  (type.flags & TypeFlags.BooleanLike) !== 0;
