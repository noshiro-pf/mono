import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getImportDeclarations,
  getNamedImports,
  getRangeWithParens,
  parenthesesDepth,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'useIsNonNullObject';

export const preferIsNonNullObject: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `typeof u === "object" && u !== null`, in either order and anywhere in an `&&` chain, with `isNonNullObject(u)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsNonNullObject:
        'Replace the object/null check with `isNonNullObject()` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImports = getImportDeclarations(
      program,
      TS_DATA_FORGE_MODULE,
    );

    const mut_pairsToFix: NonNullObjectPair[] = [];

    return {
      LogicalExpression: (node) => {
        // A chain is read once, from its outermost `&&`.
        if (node.operator !== '&&' || isChainOperand(sourceCode, node)) {
          return;
        }

        mut_pairsToFix.push(...findNonNullObjectPairs(sourceCode, node));
      },
      'Program:exit': () => {
        const hasIsNonNullObjectImport =
          getNamedImports(tsDataForgeImports).includes('isNonNullObject');

        // The import fix lives on the first report only:
        // `insertTextBefore(program, …)` produces overlapping ranges
        // otherwise and only one of them would survive a pass. A first report
        // silenced by an `eslint-disable` comment therefore takes the import
        // with it.
        for (const [
          index,
          { range, identifierName },
        ] of mut_pairsToFix.entries()) {
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(range[0]),
              end: sourceCode.getLocFromIndex(range[1]),
            },
            messageId: 'useIsNonNullObject',
            fix: (fixer) => {
              const replacement = `isNonNullObject(${identifierName})`;

              const importFixes =
                index === 0 && !hasIsNonNullObjectImport
                  ? buildNamedImportFix(fixer, program, TS_DATA_FORGE_MODULE, [
                      'isNonNullObject',
                    ])
                  : [];

              return [
                ...importFixes,
                fixer.replaceTextRange(range, replacement),
              ];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

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

const isLiteralOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  value: string | null,
): boolean => node.type === AST_NODE_TYPES.Literal && node.value === value;
