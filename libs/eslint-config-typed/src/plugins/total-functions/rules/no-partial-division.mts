import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { createGetLayerTypes, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr, isNonNullObject } from 'ts-data-forge';
import { intersectionTypeParts, unionTypeParts } from 'tsutils';
import type { BigIntLiteralType, PseudoBigInt, Type } from 'typescript';
import { createRule } from './common.mjs';

/**
 * An ESLint rule to ban partial division: `x / y` and `x /= y` whose
 * denominator is not provably non-zero.
 *
 * The denominator is read through `as`, `satisfies`, `!` and `<T>`: a number or
 * bigint literal, or a sign applied to one, is safe by its value; anything else
 * is safe only when the type of every layer of wrappers around it is a
 * non-zero number or bigint literal (or a union of them).
 */

export const noPartialDivision = createRule({
  name: 'no-partial-division',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans partial division.',
    },
    messages: {
      errorStringGeneric:
        'Division is partial. You should wrap it in a wrapper that returns undefined when the denominator is zero.',
    },
    schema: [],
    defaultOptions: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const isSafeDenominator = (type: Type): boolean => {
      if (type.isIntersection()) {
        const numberLiteralParts = intersectionTypeParts(type).filter(
          (t) => isBigIntLiteral(t) || t.isNumberLiteral(),
        );

        return (
          Arr.isNonEmpty(numberLiteralParts) &&
          numberLiteralParts.every(isSafeDenominator)
        );
      }

      if (type.isUnion()) {
        return unionTypeParts(type).every(isSafeDenominator);
      }

      return (
        (type.isNumberLiteral() && type.value !== 0) ||
        (isBigIntLiteral(type) && type.value.base10Value !== '0')
      );
    };

    const getLayerTypes = createGetLayerTypes(parserServices);

    const isProvablySafeDenominator = (
      denominator: TSESTree.Expression,
    ): boolean =>
      nonZeroNumericLiteralKind(denominator) !== undefined ||
      // Otherwise the type has to say the value is not zero at every layer of
      // type wrappers (docs/writing-lint-rules.md, B): a narrowing assertion
      // cannot vouch for what the value's own type does not (`y as unknown as
      // 1` with `y: number`, `foo!` with `foo: 42 | null`, whose `null`
      // divides as `0`), and a widening one (`foo as 42 | null`) is respected.
      getLayerTypes(denominator).every(isSafeDenominator);

    return {
      // `x /= y` divides as `x = x / y` does, and `unicorn/operator-assignment`
      // autofixes the latter into the former, so both are checked alike.
      'BinaryExpression[operator="/"], AssignmentExpression[operator="/="]': (
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ) => {
        if (isProvablySafeDenominator(node.right)) {
          return;
        }

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
} as const);

// TODO find a way to get ahold of a BigIntLiteralType without type assertions.
// There is no equivalent of `isNumberLiteral()` for bigints.
// `isLiteral()` returns false so isn't useful.
const isPseudoBigInt = (val: unknown): val is PseudoBigInt => {
  const valAsPseudoBigInt = isNonNullObject(val)
    ? (val as Partial<PseudoBigInt>)
    : undefined;

  return (
    valAsPseudoBigInt !== undefined &&
    typeof valAsPseudoBigInt.base10Value === 'string' &&
    typeof valAsPseudoBigInt.negative === 'boolean'
  );
};

/**
 * Whether `node`, read through its type wrappers, is a non-zero number or
 * bigint literal, or a sign applied to one, and which of the two its value is:
 * `2`, `-1n`, `(2 satisfies number)`, `-(2 as number)`. `+` on a bigint throws
 * a TypeError, so it accepts only a number.
 */
const nonZeroNumericLiteralKind = (
  node: TSESTree.Node,
): 'bigint' | 'number' | undefined => {
  const unwrapped = skipTypeWrappers(node);

  if (unwrapped.type === AST_NODE_TYPES.Literal) {
    return typeof unwrapped.value === 'number' && unwrapped.value !== 0
      ? 'number'
      : typeof unwrapped.value === 'bigint' && unwrapped.value !== 0n
        ? 'bigint'
        : undefined;
  }

  if (unwrapped.type === AST_NODE_TYPES.UnaryExpression) {
    const kind = nonZeroNumericLiteralKind(unwrapped.argument);

    const { operator } = unwrapped;

    return operator === '-' || (operator === '+' && kind === 'number')
      ? kind
      : undefined;
  }

  return undefined;
};

const isBigIntLiteral = (type: Type): type is BigIntLiteralType =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  isPseudoBigInt((type as Partial<BigIntLiteralType>)?.value);
