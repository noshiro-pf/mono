import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { bindValueImportsAt, type EquivalentModule } from '../imports.mjs';
import { getArgumentText } from '../parentheses.mjs';
import { skipTypeWrappers, typeHoldsAtEveryLayer } from '../type-wrappers.mjs';
import { builtBy } from './rule-factory.mjs';

/**
 * Builds a rule that replaces a comparison of an array's length that says
 * "empty" or "non-empty" and nothing more ({@link matchEmptinessComparison})
 * with `<namespace>.isEmpty(xs)` / `<namespace>.isNonEmpty(xs)` imported from
 * `moduleName`. The comparison narrows nothing; the guard narrows the array.
 *
 * Only an array or a tuple is reported, at every layer of type wrappers: a
 * string, a function and a `TypedArray` have a `length` too, and a cast does
 * not make a string an array. Without type information nothing is.
 */
export const createPreferEmptinessGuard = (
  config: Readonly<{
    /** The module that exports `namespace`. */
    moduleName: string;

    /** The exported namespace whose `isEmpty` and `isNonEmpty` are written. */
    namespace: string;

    /**
     * Modules that export some of the module's exports as the same
     * declarations; an import of one of them from there is reused rather than
     * refused.
     */
    equivalentModules?: readonly EquivalentModule[];

    /**
     * A comparison another rule of the plugin rewrites as part of something
     * larger, such as `xs.length >= 1 && xs.length <= 3` read as one range, and
     * this one leaves alone.
     */
    isHandledElsewhere?: (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.BinaryExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      sourceCode: TSESLint.SourceCode,
    ) => boolean;
  }>,
): TSESLint.RuleModule<EmptinessGuardMessageId, readonly []> => {
  const {
    moduleName,
    namespace,
    equivalentModules = [],
    isHandledElsewhere,
  } = config;

  return builtBy(createPreferEmptinessGuard, {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace an emptiness check on an array (\`xs.length === 0\`, \`xs.length <= 0\`, \`xs.length < 1\`; \`xs.length !== 0\`, \`xs.length > 0\`, \`xs.length >= 1\`) with \`${namespace}.isEmpty(xs)\` / \`${namespace}.isNonEmpty(xs)\` from ${moduleName}.`,
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsEmpty: `Replace \`{{original}}\` with \`{{namespace}}.isEmpty({{arrayName}})\` from ${moduleName}: the comparison narrows nothing, the guard narrows the array to an empty one.`,
        useIsNonEmpty: `Replace \`{{original}}\` with \`{{namespace}}.isNonEmpty({{arrayName}})\` from ${moduleName}: the comparison narrows nothing, so \`{{arrayName}}[0]\` stays \`| undefined\`.`,
      },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const mut_nodesToFix: (EmptinessComparison &
        Readonly<{ node: TSESTree.BinaryExpression }>)[] = [];

      return {
        BinaryExpression: (node) => {
          const matched = matchEmptinessComparison(node);

          if (
            matched === undefined ||
            !isArrayOrTuple(sourceCode, matched.arrayExpression) ||
            isHandledElsewhere?.(node, sourceCode) === true
          ) {
            return;
          }

          mut_nodesToFix.push({ node, ...matched });
        },
        'Program:exit': () => {
          if (mut_nodesToFix.length === 0) {
            return;
          }

          const bindingAt = bindValueImportsAt(
            sourceCode,
            moduleName,
            [namespace],
            equivalentModules,
          );

          // Every fix brings the namespace into scope itself, so that one
          // applied alone (an editor's quick fix) is complete.
          for (const { node, arrayExpression, guard } of mut_nodesToFix) {
            const binding = bindingAt(node);

            const localName = binding?.localNames[0];

            const arrayText = getArgumentText(sourceCode, arrayExpression);

            context.report({
              node,
              messageId: MESSAGE_IDS[guard],
              data: {
                original: sourceCode.getText(node),
                arrayName: arrayText,
                // The name the fix writes; with no fix, the export's own.
                namespace: localName ?? namespace,
              },
              fix:
                binding === undefined || localName === undefined
                  ? null
                  : (fixer) => [
                      ...binding.edits(fixer),
                      fixer.replaceText(
                        node,
                        `${localName}.${guard}(${arrayText})`,
                      ),
                    ],
            });
          }
        },
      };
    },
  });
};

/**
 * `<array>.length <op> <literal>`, in either operand order and read through
 * type wrappers (`(xs.length as number) > (0 as const)`), when it asks whether
 * the array is empty and nothing more: the array expression and the guard that
 * answers it, or `undefined` for anything else. A plugin whose other rules
 * rewrite length comparisons in general leaves these to
 * {@link createPreferEmptinessGuard}. Whether the array is one is not checked
 * here.
 */
export const matchEmptinessComparison = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.BinaryExpression,
): EmptinessComparison | undefined => {
  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  const lengthOnLeft = isLengthAccess(left);

  const lengthSide = lengthOnLeft ? left : right;

  const boundSide = lengthOnLeft ? right : left;

  // `xs.length === ys.length` has `.length` on both sides and no literal bound,
  // so the bound check below rejects it.
  if (
    !isLengthAccess(lengthSide) ||
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

/** What {@link matchEmptinessComparison} finds. */
export type EmptinessComparison = Readonly<{
  arrayExpression: TSESTree.Expression;
  guard: 'isEmpty' | 'isNonEmpty';
}>;

export type EmptinessGuardMessageId = 'useIsEmpty' | 'useIsNonEmpty';

/**
 * The comparisons, with `.length` on the left, that say "empty" or "non-empty"
 * and nothing more. A comparison written the other way round is flipped first.
 */
const COMPARISONS = [
  { operator: '===', bound: 0, guard: 'isEmpty' },
  { operator: '<=', bound: 0, guard: 'isEmpty' },
  { operator: '<', bound: 1, guard: 'isEmpty' },
  { operator: '!==', bound: 0, guard: 'isNonEmpty' },
  { operator: '>', bound: 0, guard: 'isNonEmpty' },
  { operator: '>=', bound: 1, guard: 'isNonEmpty' },
] as const satisfies readonly Readonly<{
  operator: string;
  bound: number;
  guard: EmptinessComparison['guard'];
}>[];

/** The operator that means the same with the operands swapped. */
const FLIPPED: ReadonlyRecord<string, string> = {
  '===': '===',
  '!==': '!==',
  '>': '<',
  '<': '>',
  '>=': '<=',
  '<=': '>=',
} as const;

const MESSAGE_IDS: ReadonlyRecord<
  EmptinessComparison['guard'],
  EmptinessGuardMessageId
> = {
  isEmpty: 'useIsEmpty',
  isNonEmpty: 'useIsNonEmpty',
} as const;

const isLengthAccess = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  !node.computed &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'length';

const isArrayOrTuple = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean =>
  typeHoldsAtEveryLayer(
    sourceCode,
    expression,
    (type, checker) => checker.isArrayType(type) || checker.isTupleType(type),
  );
