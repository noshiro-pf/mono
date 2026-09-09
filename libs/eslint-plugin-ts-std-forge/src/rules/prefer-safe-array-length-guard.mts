import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  buildImportFixes,
  getNamedImports,
  getTsStdForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useIsEmpty' | 'useIsNonEmpty';

type Guard = 'isEmpty' | 'isNonEmpty';

/**
 * The length comparisons that say "empty" or "non-empty" and nothing more,
 * written with `.length` on the left. A comparison with the operands the other
 * way round is normalized by flipping the operator before this is consulted.
 *
 * Only these two questions are here because only these two guards exist:
 * ts-data-forge answers `xs.length >= n` for an arbitrary `n` with
 * `Arr.isMinLengthArray` and the rest of the branded length family, which
 * ts-std-forge deliberately has no counterpart for (D-26 / D-39).
 */
const COMPARISONS = [
  { operator: '===', bound: 0, guard: 'isEmpty' },
  { operator: '!==', bound: 0, guard: 'isNonEmpty' },
  { operator: '>', bound: 0, guard: 'isNonEmpty' },
  { operator: '>=', bound: 1, guard: 'isNonEmpty' },
] as const satisfies readonly Readonly<{
  operator: string;
  bound: number;
  guard: Guard;
}>[];

/** The operator that means the same thing with the operands swapped. */
const FLIPPED: ReadonlyRecord<string, string> = {
  '===': '===',
  '!==': '!==',
  '>': '<',
  '<': '>',
  '>=': '<=',
  '<=': '>=',
} as const;

const MESSAGE_IDS: ReadonlyRecord<Guard, MessageIds> = {
  isEmpty: 'useIsEmpty',
  isNonEmpty: 'useIsNonEmpty',
} as const;

export const preferSafeArrayLengthGuard: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace an emptiness check on an array (`xs.length === 0`, `xs.length > 0`, `xs.length >= 1`, `xs.length !== 0`) with `SafeArray.isEmpty(xs)` / `SafeArray.isNonEmpty(xs)` from ts-std-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsEmpty:
        'Replace `{{original}}` with `SafeArray.isEmpty({{arrayName}})` from ts-std-forge: the comparison narrows nothing, the guard narrows to `readonly []`.',
      useIsNonEmpty:
        'Replace `{{original}}` with `SafeArray.isNonEmpty({{arrayName}})` from ts-std-forge: the comparison narrows nothing, so `{{arrayName}}[0]` stays `| undefined`.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsStdForgeImport = getTsStdForgeImport(program);

    const services = sourceCode.parserServices;

    const checker = services?.program?.getTypeChecker();

    /**
     * Whether `expression` is an array or tuple. Without type information the
     * answer is no: `.length` is also a string's, a function's and a
     * `TypedArray`'s, and none of those can be handed to the guard.
     */
    const isArrayLike = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Expression,
    ): boolean => {
      if (checker === undefined) return false;

      const tsNode = services?.esTreeNodeToTSNodeMap?.get(expression);

      if (tsNode === undefined) return false;

      const type = checker.getTypeAtLocation(tsNode);

      return checker.isArrayType(type) || checker.isTupleType(type);
    };

    const mut_nodesToFix: {
      node: TSESTree.BinaryExpression;
      arrayExpression: TSESTree.Expression;
      guard: Guard;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        const matched = matchLengthComparison(node);

        if (matched === undefined) return;

        if (!isArrayLike(matched.arrayExpression)) return;

        mut_nodesToFix.push({ node, ...matched });
      },
      'Program:exit': () => {
        const hasSafeArrayImport =
          getNamedImports(tsStdForgeImport).includes('SafeArray');

        // The import fix lives on the first report only:
        // `insertTextBefore(program, …)` produces overlapping ranges
        // otherwise and only one of them would survive a pass. A first report
        // silenced by an `eslint-disable` comment therefore takes the import
        // with it.
        for (const [
          index,
          { node, arrayExpression, guard },
        ] of mut_nodesToFix.entries()) {
          const arrayText = sourceCode.getText(arrayExpression);

          context.report({
            node,
            messageId: MESSAGE_IDS[guard],
            data: {
              original: sourceCode.getText(node),
              arrayName: arrayText,
            },
            fix: (fixer) => {
              const replacement = `SafeArray.${guard}(${arrayText})`;

              const importFixes =
                index === 0 && !hasSafeArrayImport
                  ? buildImportFixes(fixer, program, ['SafeArray'])
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * Parses `<array>.length <op> <literal>` (in either operand order) into the
 * array expression and the guard that replaces it, or `undefined` for anything
 * else.
 */
const matchLengthComparison = (
  // Deeply readonly here would make `lengthSide.object` a `DeepReadonly<...>`,
  // which then needs an assertion to go back into the report queue.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.BinaryExpression,
):
  | Readonly<{ arrayExpression: TSESTree.Expression; guard: Guard }>
  | undefined => {
  const { left, right } = node;

  if (left.type === AST_NODE_TYPES.PrivateIdentifier) return undefined;

  const lengthOnLeft = isLengthAccess(left);

  const lengthSide = lengthOnLeft ? left : right;

  const boundSide = lengthOnLeft ? right : left;

  if (!isLengthAccess(lengthSide)) return undefined;

  // `xs.length === ys.length` has `.length` on both sides and no literal
  // bound, so the bound check below rejects it.
  if (
    boundSide.type !== AST_NODE_TYPES.Literal ||
    typeof boundSide.value !== 'number'
  ) {
    return undefined;
  }

  const operator = lengthOnLeft ? node.operator : FLIPPED[node.operator];

  const matched = COMPARISONS.find(
    (entry) => entry.operator === operator && entry.bound === boundSide.value,
  );

  return matched === undefined
    ? undefined
    : { arrayExpression: lengthSide.object, guard: matched.guard };
};

const isLengthAccess = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  !node.computed &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'length';
