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
 * Length guards whose bound makes them redundant with a named degenerate
 * guard, keyed by guard name.
 *
 * Every entry stays inside its own family rather than crossing the
 * branded/structural divide:
 *
 * - the branded `*Array` guards go to `isEmpty` / `isNonEmpty`, which narrow to
 *   `FixedLengthArray<0, E> & Xs` / `MinLengthArray<1, E> & Xs`;
 * - the structural `*Tuple` guards go to `isEmptyTuple` / `isNonEmptyTuple`,
 *   which narrow to `readonly []` / `MinLengthTuple<1, E>`.
 *
 * Most entries are then **type-identical** — `isFixedLengthArray(0, xs)` and
 * `isMinLengthArray(1, xs)` produce exactly what `isEmpty` / `isNonEmpty`
 * narrow to, and `FixedLengthTuple<0, E>`, `MaxLengthTuple<0, E>` and
 * `BoundedLengthTuple<0, 0, E>` are all `readonly []`. Two *strengthen*:
 * `MaxLengthArray<0, E>` and `BoundedLengthArray<0, 0, E>` do not include the
 * `readonly []` structural part that `FixedLengthArray<0, E>` intersects on, so
 * rewriting them to `isEmpty` adds it. That is sound for a guard — the narrowed
 * type only flows outwards, and the stronger type is assignable everywhere the
 * old one was — and it stays within the branded family.
 *
 * Sending a `*Tuple` guard to the branded `isEmpty` would also be sound, but it
 * would silently change which family the value belongs to, which is why each
 * family keeps its own lane.
 */
const GUARD_REWRITES = [
  { guard: 'isFixedLengthArray', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isMaxLengthArray', bounds: [0], replacement: 'isEmpty' },
  { guard: 'isBoundedLengthArray', bounds: [0, 0], replacement: 'isEmpty' },
  { guard: 'isMinLengthArray', bounds: [1], replacement: 'isNonEmpty' },
  { guard: 'isFixedLengthTuple', bounds: [0], replacement: 'isEmptyTuple' },
  { guard: 'isMaxLengthTuple', bounds: [0], replacement: 'isEmptyTuple' },
  {
    guard: 'isBoundedLengthTuple',
    bounds: [0, 0],
    replacement: 'isEmptyTuple',
  },
  { guard: 'isMinLengthTuple', bounds: [1], replacement: 'isNonEmptyTuple' },
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
        'Normalize array-length checks to their canonical `Arr` guard: `xs.length <op> n` becomes the matching `Arr.is*` guard, and a degenerate guard becomes the named one for its family (`Arr.isFixedLengthArray(0, xs)` → `Arr.isEmpty`, `Arr.isFixedLengthTuple(0, xs)` → `Arr.isEmptyTuple`).',
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

          // The array is the last argument; the bounds precede it.
          const array = node.arguments[rewrite.bounds.length];

          if (array === undefined) return;

          const arrayText = sourceCode.getText(array);

          context.report({
            node,
            messageId: 'useCanonicalGuard',
            data: {
              arrName: arrLocalName,
              guard: guardName,
              boundsText: [...rewrite.bounds.map(String), '…'].join(', '),
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
 * Whether the call is `guard(...bounds, array)` with every bound written as the
 * exact numeric literal the rewrite requires.
 *
 * The arity check also excludes the curried form (`guard(...bounds)`): the
 * degenerate guards take only the array, so there is nothing to rewrite it to.
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
      (index === bounds.length ||
        (arg.type === AST_NODE_TYPES.Literal && arg.value === bounds[index])),
  );
};
