import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { hasForeignBinding } from '../bindings.mjs';
import { bindValueImports } from '../imports.mjs';
import { getRangeWithParens, parenthesesDepth } from '../parentheses.mjs';
import { skipTypeWrappers } from '../type-wrappers.mjs';

/**
 * Builds a rule that replaces `typeof u === 'object' && u !== null`, in either
 * order and anywhere in an `&&` chain, with `isNonNullObject(u)` imported from
 * `moduleName`.
 */
export const createPreferIsNonNullObject = ({
  moduleName,
}: Readonly<{
  /** The module that exports `isNonNullObject`. */
  moduleName: string;
}>): TSESLint.RuleModule<'useIsNonNullObject', readonly []> =>
  ({
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace \`typeof u === "object" && u !== null\`, in either order and anywhere in an \`&&\` chain, with \`isNonNullObject(u)\` from ${moduleName}.`,
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsNonNullObject: `Replace the object/null check with \`isNonNullObject()\` from ${moduleName}.`,
      },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const mut_pairsToFix: (NonNullObjectPair &
        Readonly<{ chain: TSESTree.LogicalExpression }>)[] = [];

      return {
        LogicalExpression: (node) => {
          // A chain is read once, from its outermost `&&`.
          if (node.operator !== '&&' || isChainOperand(sourceCode, node)) {
            return;
          }

          mut_pairsToFix.push(
            ...findNonNullObjectPairs(sourceCode, node).map((pair) => ({
              ...pair,
              chain: node,
            })),
          );
        },
        'Program:exit': () => {
          const binding = bindValueImports(sourceCode, moduleName, [
            'isNonNullObject',
          ]);

          const localName = binding?.localNames[0];

          // Every fix brings `isNonNullObject` into scope itself, so that one
          // applied alone (an editor's quick fix) is complete.
          for (const { range, identifierName, chain } of mut_pairsToFix) {
            const loc = {
              start: sourceCode.getLocFromIndex(range[0]),
              end: sourceCode.getLocFromIndex(range[1]),
            } as const;

            context.report({
              loc,
              messageId: 'useIsNonNullObject',
              fix:
                binding === undefined ||
                localName === undefined ||
                hasForeignBinding(sourceCode, chain, localName, moduleName)
                  ? null
                  : (fixer) => [
                      ...binding.edits(fixer),
                      fixer.replaceTextRange(
                        range,
                        `${localName}(${identifierName})`,
                      ),
                    ],
            });
          }
        },
      };
    },
  }) as const;

/**
 * A `typeof u === 'object'` and a `u !== null` next to each other in an `&&`
 * chain, as the source range from the first to the second (parentheses
 * included) and the name of `u`.
 */
type NonNullObjectPair = Readonly<{
  range: TSESTree.Range;
  identifierName: string;
}>;

/**
 * Whether `node` is an operand of an enclosing `&&` chain: a `&&` written
 * directly under another one, without parentheses.
 */
const isChainOperand = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.LogicalExpression,
): boolean =>
  node.parent.type === AST_NODE_TYPES.LogicalExpression &&
  node.parent.operator === '&&' &&
  parenthesesDepth(sourceCode, node) === 0;

/**
 * The operands of the `&&` chain `node`, left to right. A parenthesized `&&`
 * is one operand: its halves cannot be replaced without its parentheses.
 */
const chainOperands = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.LogicalExpression,
): readonly TSESTree.Expression[] =>
  [node.left, node.right].flatMap((operand) =>
    operand.type === AST_NODE_TYPES.LogicalExpression &&
    operand.operator === '&&' &&
    parenthesesDepth(sourceCode, operand) === 0
      ? chainOperands(sourceCode, operand)
      : [operand],
  );

// Every operand below is read through its type wrappers: `typeof (u satisfies
// unknown) === 'object' && u! !== null` is the same check.

const isLiteralOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  value: string | null,
): boolean => node.type === AST_NODE_TYPES.Literal && node.value === value;

/** `u` of `typeof u === 'object'`, in either operand order. */
const getTypeofObjectIdentifierName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): string | undefined => {
  if (
    node.type !== AST_NODE_TYPES.BinaryExpression ||
    node.operator !== '==='
  ) {
    return undefined;
  }

  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  const typeofSide = isLiteralOf(right, 'object')
    ? left
    : isLiteralOf(left, 'object')
      ? right
      : undefined;

  if (
    typeofSide?.type !== AST_NODE_TYPES.UnaryExpression ||
    typeofSide.operator !== 'typeof'
  ) {
    return undefined;
  }

  const argument = skipTypeWrappers(typeofSide.argument);

  return argument.type === AST_NODE_TYPES.Identifier
    ? argument.name
    : undefined;
};

/**
 * `u` of `u !== null`, in either operand order. `u != null` also excludes
 * `undefined`, which `typeof u === 'object'` has already excluded, so it is
 * the same check here.
 */
const getNonNullCheckIdentifierName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): string | undefined => {
  if (
    node.type !== AST_NODE_TYPES.BinaryExpression ||
    (node.operator !== '!==' && node.operator !== '!=')
  ) {
    return undefined;
  }

  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  const checked = isLiteralOf(right, null)
    ? left
    : isLiteralOf(left, null)
      ? right
      : undefined;

  return checked?.type === AST_NODE_TYPES.Identifier ? checked.name : undefined;
};

/**
 * The name of `u` when `typeofCheck` is `typeof u === 'object'` and
 * `nullCheck` is `u !== null` for the same `u`.
 */
const pairIdentifierName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  typeofCheck: TSESTree.Expression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  nullCheck: TSESTree.Expression,
): string | undefined => {
  const identifierName = getTypeofObjectIdentifierName(
    skipTypeWrappers(typeofCheck),
  );

  return identifierName !== undefined &&
    identifierName ===
      getNonNullCheckIdentifierName(skipTypeWrappers(nullCheck))
    ? identifierName
    : undefined;
};

/**
 * Every non-overlapping pair in the `&&` chain `node` heads, left to right. The
 * two halves may come in either order, and the pair may have operands before
 * and after it: `a && u !== null && typeof u === 'object' && b`. They have to
 * be next to each other, so that the pair is one range of the source.
 */
const findNonNullObjectPairs = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.LogicalExpression,
): readonly NonNullObjectPair[] => {
  const operands = chainOperands(sourceCode, node);

  const pairsFrom = (index: number): readonly NonNullObjectPair[] => {
    const first = operands[index];

    const second = operands[index + 1];

    if (first === undefined || second === undefined) {
      return [];
    }

    const identifierName =
      pairIdentifierName(first, second) ?? pairIdentifierName(second, first);

    return identifierName === undefined
      ? pairsFrom(index + 1)
      : [
          {
            range: [
              getRangeWithParens(sourceCode, first)[0],
              getRangeWithParens(sourceCode, second)[1],
            ],
            identifierName,
          },
          ...pairsFrom(index + 2),
        ];
  };

  return pairsFrom(0);
};
