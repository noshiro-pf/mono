import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { getImportedLocalName, getTsDataForgeImport } from './import-utils.mjs';
import { preferArrIsBoundedLengthArray } from './prefer-arr-is-bounded-length-array.mjs';
import { preferArrIsFixedLengthArray } from './prefer-arr-is-fixed-length-array.mjs';
import { preferArrIsMaxLengthArray } from './prefer-arr-is-max-length-array.mjs';
import { preferArrIsMinLengthArray } from './prefer-arr-is-min-length-array.mjs';
import { preferArrIsNonEmpty } from './prefer-arr-is-non-empty.mjs';

type Options = readonly [];

type MessageIds =
  | 'useCanonicalGuard'
  | 'useIsBoundedLengthArray'
  | 'useIsFixedLengthArray'
  | 'useIsMaxLengthArray'
  | 'useIsMinLengthArray'
  | 'useIsNonEmpty';

/**
 * The `xs.length <op> n` → `Arr.is*` rules folded into this one.
 *
 * Their implementations are reused as-is rather than rewritten: this rule
 * merges their visitors, so every case they already cover (type-aware array
 * checks, `Arr` import insertion, the `&&`-bounded-range special case) keeps
 * behaving exactly as before, and their co-located tests keep exercising them
 * directly.
 */
const COMPARISON_RULES = [
  preferArrIsNonEmpty,
  preferArrIsMinLengthArray,
  preferArrIsMaxLengthArray,
  preferArrIsBoundedLengthArray,
  preferArrIsFixedLengthArray,
] as const;

const MESSAGES = {
  useCanonicalGuard:
    'Replace `{{arrName}}.{{guard}}({{boundsText}})` with `{{arrName}}.{{replacement}}(...)`: the bound makes the two guards equivalent.',
  useIsNonEmpty: preferArrIsNonEmpty.meta.messages.useIsNonEmpty,
  useIsMinLengthArray:
    preferArrIsMinLengthArray.meta.messages.useIsMinLengthArray,
  useIsMaxLengthArray:
    preferArrIsMaxLengthArray.meta.messages.useIsMaxLengthArray,
  useIsBoundedLengthArray:
    preferArrIsBoundedLengthArray.meta.messages.useIsBoundedLengthArray,
  useIsFixedLengthArray:
    preferArrIsFixedLengthArray.meta.messages.useIsFixedLengthArray,
} as const satisfies Record<MessageIds, string>;

/**
 * Length guards whose bound makes them redundant with `Arr.isEmpty` /
 * `Arr.isNonEmpty`, keyed by guard name.
 *
 * `isEmpty` narrows to `FixedLengthArray<0, E> & Xs` and `isNonEmpty` to
 * `MinLengthArray<1, E> & Xs`, so:
 *
 * - The `*Array` entries are **type-identical** — `isFixedLengthArray(xs, 0)`
 *   and `isMinLengthArray(xs, 1)` produce exactly those types.
 * - The `*Tuple` entries **narrow**: they resolve to the structural
 *   `readonly []` / `readonly [E, ...E[]]`, and the canonical guards add the
 *   brand on top. The result stays assignable everywhere the old type was, so
 *   the rewrite is safe, but it is a strengthening rather than a pure rename.
 */
const GUARD_REWRITES = [
  { guard: 'isFixedLengthArray', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isFixedLengthTuple', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isMaxLengthTuple', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isMaxLengthArray', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isBoundedLengthTuple', bounds: [0, 0], replacement: 'isEmpty' },
  { guard: 'isBoundedLengthArray', bounds: [0, 0], replacement: 'isEmpty' },
  { guard: 'isMinLengthArray', bounds: [1], replacement: 'isNonEmpty' },
  { guard: 'isMinLengthTuple', bounds: [1], replacement: 'isNonEmpty' },
] as const satisfies readonly Readonly<{
  guard: string;
  bounds: readonly number[];
  replacement: string;
}>[];

export const preferCanonicalLengthGuard: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Normalize array-length checks to their canonical `Arr` guard: `xs.length <op> n` becomes the matching `Arr.is*` guard, and degenerate guards (e.g. `Arr.isFixedLengthTuple(xs, 0)`) become `Arr.isEmpty` / `Arr.isNonEmpty`.',
    },
    fixable: 'code',
    schema: [],
    messages: MESSAGES,
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const arrLocalName = getImportedLocalName(
      getTsDataForgeImport(sourceCode.ast),
      'Arr',
    );

    const comparisonVisitors = COMPARISON_RULES.map((rule) =>
      rule.create(context),
    );

    if (arrLocalName === undefined) return mergeVisitors(comparisonVisitors);

    return mergeVisitors([
      ...comparisonVisitors,
      {
        CallExpression: (node) => {
          const guardName = getGuardName(node, arrLocalName);

          if (guardName === undefined) return;

          const rewrite = GUARD_REWRITES.find(
            (entry) => entry.guard === guardName,
          );

          if (rewrite === undefined || !matchesBounds(node, rewrite.bounds)) {
            return;
          }

          const [array] = node.arguments;

          if (array === undefined) return;

          const arrayText = sourceCode.getText(array);

          context.report({
            node,
            messageId: 'useCanonicalGuard',
            data: {
              arrName: arrLocalName,
              guard: guardName,
              boundsText: ['…', ...rewrite.bounds.map(String)].join(', '),
              replacement: rewrite.replacement,
            },
            fix: (fixer) =>
              fixer.replaceText(
                node,
                `${arrLocalName}.${rewrite.replacement}(${arrayText})`,
              ),
          });
        },
      },
    ]);
  },
  defaultOptions: [],
} as const;

/**
 * Combines several rule listeners into one, calling every handler registered
 * for a given selector in order.
 */
const mergeVisitors = (
  // `RuleListener` holds mutable AST handler signatures, so it is not deeply
  // readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  visitors: readonly TSESLint.RuleListener[],
): TSESLint.RuleListener => {
  const mut_merged: Record<string, ((node: never) => void)[]> = {};

  for (const visitor of visitors) {
    for (const [selector, handler] of Object.entries(visitor)) {
      if (typeof handler !== 'function') continue;

      const mut_handlers = mut_merged[selector] ?? [];

      mut_handlers.push(handler);

      mut_merged[selector] = mut_handlers;
    }
  }

  return Object.fromEntries(
    Object.entries(mut_merged).map(([selector, handlers]) => [
      selector,
      (node: never) => {
        for (const handler of handlers) {
          handler(node);
        }
      },
    ]),
  );
};

/** The `Arr.<guard>` method name of `node`, or `undefined` for other calls. */
const getGuardName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  arrLocalName: string,
): string | undefined => {
  const { callee } = node;

  return callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.object.type === AST_NODE_TYPES.Identifier &&
    callee.object.name === arrLocalName &&
    callee.property.type === AST_NODE_TYPES.Identifier
    ? callee.property.name
    : undefined;
};

/**
 * Whether the call is `guard(array, ...bounds)` with every bound written as the
 * exact numeric literal the rewrite requires.
 */
const matchesBounds = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  bounds: readonly number[],
): boolean => {
  const args = node.arguments;

  if (args.length !== bounds.length + 1 || node.typeArguments !== undefined) {
    return false;
  }

  return args.every(
    (arg, index) =>
      arg.type !== AST_NODE_TYPES.SpreadElement &&
      (index === 0 ||
        (arg.type === AST_NODE_TYPES.Literal &&
          arg.value === bounds[index - 1])),
  );
};
