import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isRuntimeBound } from '../bindings.mjs';
import { bindValueImportsAt, type EquivalentModule } from '../imports.mjs';
import { getRangeWithParens, parenthesesDepth } from '../parentheses.mjs';
import { skipTypeWrappers } from '../type-wrappers.mjs';

/**
 * Builds a rule that replaces `typeof u === 'object' && u !== null`, in either
 * order and anywhere in an `&&` chain, with `isNonNullObject(u)` imported from
 * `moduleName`.
 *
 * `typeof u` is the one read of an undeclared name that does not throw, and in
 * `typeof u === 'object' && u !== null` the `u !== null` never runs then, while
 * `isNonNullObject(u)` reads `u` unconditionally. So that order, on a name the
 * file does not create at runtime — a global or a `declare`d name, as in
 * `typeof window === 'object' && window !== null` probing for a browser — is
 * left alone. With `u !== null` first the original reads `u` unconditionally
 * too, and is replaced whatever `u` is.
 */
export const createPreferIsNonNullObject = ({
  moduleName,
  equivalentModules = [],
}: Readonly<{
  /** The module that exports `isNonNullObject`. */
  moduleName: string;
  /**
   * Modules that export some of its exports as the same declarations; an
   * import of one of them from there is reused rather than refused.
   */
  equivalentModules?: readonly EquivalentModule[];
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
        useIsNonNullObject: `Replace the object/null check with \`{{isNonNullObject}}()\` from ${moduleName}.`,
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
            ...findNonNullObjectPairs(sourceCode, node)
              .filter(
                ({ identifierName, nullCheckFirst }) =>
                  nullCheckFirst ||
                  isRuntimeBound(sourceCode, node, identifierName),
              )
              .map((pair) => ({
                ...pair,
                chain: node,
              })),
          );
        },
        'Program:exit': () => {
          if (mut_pairsToFix.length === 0) {
            return;
          }

          const bindingAt = bindValueImportsAt(
            sourceCode,
            moduleName,
            ['isNonNullObject'],
            equivalentModules,
          );

          // Every fix brings `isNonNullObject` into scope itself, so that one
          // applied alone (an editor's quick fix) is complete.
          for (const { range, identifierName, chain } of mut_pairsToFix) {
            const binding = bindingAt(chain);

            const localName = binding?.localNames[0];

            const loc = {
              start: sourceCode.getLocFromIndex(range[0]),
              end: sourceCode.getLocFromIndex(range[1]),
            } as const;

            context.report({
              loc,
              messageId: 'useIsNonNullObject',
              data: {
                // The name the fix writes; with no fix, the export's own.
                isNonNullObject: localName ?? 'isNonNullObject',
              },
              fix:
                binding === undefined || localName === undefined
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
 * included), the name of `u`, and whether `u !== null` comes first.
 */
type NonNullObjectPair = Readonly<{
  range: TSESTree.Range;
  identifierName: string;
  nullCheckFirst: boolean;
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
 * The operands of the `&&` chain `node`, left to right. A parenthesized `&&` is
 * one operand: its halves cannot be replaced without its parentheses.
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
 * `undefined`, which `typeof u === 'object'` has already excluded, so it is the
 * same check here.
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
 * The name of `u` when `typeofCheck` is `typeof u === 'object'` and `nullCheck`
 * is `u !== null` for the same `u`.
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

    const typeofFirstName = pairIdentifierName(first, second);

    const identifierName = typeofFirstName ?? pairIdentifierName(second, first);

    return identifierName === undefined
      ? pairsFrom(index + 1)
      : [
          {
            range: [
              getRangeWithParens(sourceCode, first)[0],
              getRangeWithParens(sourceCode, second)[1],
            ],
            identifierName,
            nullCheckFirst: typeofFirstName === undefined,
          },
          ...pairsFrom(index + 2),
        ];
  };

  return pairsFrom(0);
};
