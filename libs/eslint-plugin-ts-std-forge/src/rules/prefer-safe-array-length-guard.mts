import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  bindValueImports,
  getArgumentText,
  hasForeignBinding,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
} from 'eslint-rule-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

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
        'Replace `{{original}}` with `{{safeArray}}.isEmpty({{arrayName}})` from ts-std-forge: the comparison narrows nothing, the guard narrows to `readonly []`.',
      useIsNonEmpty:
        'Replace `{{original}}` with `{{safeArray}}.isNonEmpty({{arrayName}})` from ts-std-forge: the comparison narrows nothing, so `{{arrayName}}[0]` stays `| undefined`.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    /**
     * Whether `expression` is an array or tuple. Without type information the
     * answer is no: `.length` is also a string's, a function's and a
     * `TypedArray`'s, and none of those can be handed to the guard. It has to
     * be one at every layer of type wrappers: a string cast to an array is
     * still a string, and the fix, which keeps the wrapper, hands the guard the
     * type the outermost layer states.
     */
    const isArrayLike = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Expression,
    ): boolean =>
      typeHoldsAtEveryLayer(
        sourceCode,
        expression,
        (type, checker) =>
          checker.isArrayType(type) || checker.isTupleType(type),
      );

    const mut_nodesToFix: {
      node: TSESTree.BinaryExpression;
      arrayExpression: TSESTree.Expression;
      guard: Guard;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        const matched = matchLengthComparison(node);

        if (matched === undefined) {
          return;
        }

        if (!isArrayLike(matched.arrayExpression)) {
          return;
        }

        mut_nodesToFix.push({ node, ...matched });
      },
      'Program:exit': () => {
        if (mut_nodesToFix.length === 0) {
          return;
        }

        const binding = bindValueImports(sourceCode, TS_STD_FORGE_MODULE, [
          'SafeArray',
        ]);

        const localName = binding?.localNames[0];

        // Every fix brings `SafeArray` into scope itself, so that one applied
        // alone (an editor's quick fix) is complete.
        for (const { node, arrayExpression, guard } of mut_nodesToFix) {
          const arrayText = getArgumentText(sourceCode, arrayExpression);

          const writable =
            binding !== undefined &&
            localName !== undefined &&
            !hasForeignBinding(
              sourceCode,
              node,
              localName,
              TS_STD_FORGE_MODULE,
            );

          context.report({
            node,
            messageId: MESSAGE_IDS[guard],
            data: {
              original: sourceCode.getText(node),
              arrayName: arrayText,
              // The name the fix writes; with no fix, the export's own.
              safeArray: writable ? localName : 'SafeArray',
            },
            fix: writable
              ? (fixer) => [
                  ...binding.edits(fixer),
                  fixer.replaceText(
                    node,
                    `${localName}.${guard}(${arrayText})`,
                  ),
                ]
              : null,
          });
        }
      },
    };
  },
} as const;

const isLengthAccess = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  !node.computed &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'length';

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
  // Both operands are read through their type wrappers, which change neither
  // the length nor the bound: `(xs.length as number) > (0 as const)`.
  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  const lengthOnLeft = isLengthAccess(left);

  const lengthSide = lengthOnLeft ? left : right;

  const boundSide = lengthOnLeft ? right : left;

  if (!isLengthAccess(lengthSide)) {
    return undefined;
  }

  // `xs.length === ys.length` has `.length` on both sides and no literal bound,
  // so the bound check below rejects it.
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
