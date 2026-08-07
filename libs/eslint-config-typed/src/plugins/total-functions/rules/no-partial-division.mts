import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { Arr, isNonNullObject } from 'ts-data-forge';
import { intersectionTypeParts, unionTypeParts } from 'tsutils';
import {
  type BigIntLiteralType,
  type PseudoBigInt,
  type Type,
} from 'typescript';
import { createRule } from './common.mjs';

/** An ESLint rule to ban partial division. */

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
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

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

    return {
      BinaryExpression: (node) => {
        if (node.operator !== '/') {
          // Binary expressions other than division are safe.
          return;
        }

        if (
          node.right.type === AST_NODE_TYPES.Literal &&
          node.right.value !== 0 &&
          node.right.value !== 0n
        ) {
          // Division by a literal that isn't zero is safe.
          return;
        }

        if (node.right.type === AST_NODE_TYPES.Identifier) {
          const denominatorNode = parserServices.esTreeNodeToTSNodeMap.get(
            node.right,
          );

          const denominatorNodeType =
            checker.getTypeAtLocation(denominatorNode);

          if (isSafeDenominator(denominatorNodeType)) {
            return;
          }
        }

        // All other division is not provably safe.

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
  defaultOptions: [],
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

const isBigIntLiteral = (type: Type): type is BigIntLiteralType =>
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  isPseudoBigInt((type as Partial<BigIntLiteralType>)?.value);
