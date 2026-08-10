import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { getImportedLocalName, getTsDataForgeImport } from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useCanonicalCast';

/** How one leading length argument of a cast call must look. */
type BoundMatcher = number | 'anyLength' | 'sameAsFirst';

type CastRewrite = Readonly<{
  /** The `Arr` cast the call resolves to. */
  cast: string;
  /** One matcher per leading length argument the call must have. */
  bounds: readonly BoundMatcher[];
  /** The cast the call is rewritten to. */
  replacement: string;
  /** Indices into `bounds` of the length arguments the rewrite keeps, in order. */
  keep: readonly number[];
}>;

/**
 * `Arr.as*` casts whose length arguments make them a longhand spelling of
 * another cast.
 *
 * Unlike a `Type<T>` wrapper, a cast only ever *returns* the narrowed value, so
 * a rewrite that strengthens the result type stays safe — the result is
 * assignable everywhere the old one was:
 *
 * | call                                 | canonical form                  | relation |
 * | :----------------------------------- | :------------------------------ | :------- |
 * | `Arr.asMinLengthArray(1, xs)`        | `Arr.asNonEmptyArray(xs)`       | type-identical — `NonEmptyArray<A>` is defined as `MinLengthArray<1, A>` |
 * | `Arr.asFixedLengthArray(0, xs)`      | `Arr.asEmptyArray(xs)`          | type-identical — `asEmptyArray` is the length-0 specialization |
 * | `Arr.asBoundedLengthArray(n, n, xs)` | `Arr.asFixedLengthArray(n, xs)` | strengthens — `FixedLengthArray<N, E>` is `BoundedLengthArray<N, N, E>` intersected with the exact tuple for `N <= 10` |
 * | `Arr.asMaxLengthArray(0, xs)`        | `Arr.asEmptyArray(xs)`          | strengthens — an array of at most `0` elements is an array of exactly `0` |
 * | `Arr.asMinLengthTuple(1, xs)`        | `Arr.asNonEmptyTuple(xs)`       | type-identical — both are `MinLengthTuple<1, E>` |
 * | `Arr.asFixedLengthTuple(0, xs)`      | `Arr.asEmptyTuple(xs)`          | type-identical — both are `readonly []` |
 * | `Arr.asBoundedLengthTuple(n, n, xs)` | `Arr.asFixedLengthTuple(n, xs)` | type-identical — `BoundedLengthTuple<N, N, E>` *is* `FixedLengthTuple<N, E>` |
 * | `Arr.asMaxLengthTuple(0, xs)`        | `Arr.asEmptyTuple(xs)`          | type-identical — `MaxLengthTuple<0, E>` is `readonly []` |
 *
 * Each family is rewritten within its own lane — the branded `*Array` casts to
 * `asEmptyArray` / `asNonEmptyArray`, the structural `*Tuple` casts to
 * `asEmptyTuple` / `asNonEmptyTuple` — so a rewrite never moves a value across
 * the branded/structural divide, matching `prefer-canonical-length-guard`.
 *
 * `Arr.asBoundedLengthArray(0, n, xs)` → `Arr.asMaxLengthArray(n, xs)` is
 * deliberately absent: it would *drop* the `MinLengthArray<0, E>` brand, which
 * is a widening rather than a rename.
 *
 * Only the runtime `TypeError` message changes, to the one that names the
 * constraint actually being checked.
 */
const CAST_REWRITES = [
  {
    cast: 'asMinLengthArray',
    bounds: [1],
    replacement: 'asNonEmptyArray',
    keep: [],
  },
  {
    cast: 'asFixedLengthArray',
    bounds: [0],
    replacement: 'asEmptyArray',
    keep: [],
  },
  // Listed before the `anyLength, sameAsFirst` entry so that
  // `asBoundedLengthArray(0, 0, xs)` lands on `asEmptyArray` in one step.
  {
    cast: 'asBoundedLengthArray',
    bounds: [0, 0],
    replacement: 'asEmptyArray',
    keep: [],
  },
  {
    cast: 'asBoundedLengthArray',
    bounds: ['anyLength', 'sameAsFirst'],
    replacement: 'asFixedLengthArray',
    keep: [0],
  },
  {
    cast: 'asMaxLengthArray',
    bounds: [0],
    replacement: 'asEmptyArray',
    keep: [],
  },
  {
    cast: 'asMinLengthTuple',
    bounds: [1],
    replacement: 'asNonEmptyTuple',
    keep: [],
  },
  {
    cast: 'asFixedLengthTuple',
    bounds: [0],
    replacement: 'asEmptyTuple',
    keep: [],
  },
  {
    cast: 'asBoundedLengthTuple',
    bounds: [0, 0],
    replacement: 'asEmptyTuple',
    keep: [],
  },
  {
    cast: 'asBoundedLengthTuple',
    bounds: ['anyLength', 'sameAsFirst'],
    replacement: 'asFixedLengthTuple',
    keep: [0],
  },
  {
    cast: 'asMaxLengthTuple',
    bounds: [0],
    replacement: 'asEmptyTuple',
    keep: [],
  },
] as const satisfies readonly CastRewrite[];

export const preferCanonicalLengthCast: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Normalize an `Arr` length cast whose bounds are degenerate (e.g. `Arr.asMinLengthArray(1, xs)`, `Arr.asFixedLengthTuple(0, xs)`) to the cast that names that constraint directly, staying within the branded `*Array` or structural `*Tuple` family.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useCanonicalCast:
        'Use `{{arrName}}.{{replacement}}(...)` instead of `{{arrName}}.{{cast}}({{boundsText}})`: with these bounds the result type is the same (or stricter), and `{{replacement}}` names the constraint directly.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const arrLocalName = getImportedLocalName(
      getTsDataForgeImport(sourceCode.ast),
      'Arr',
    );

    if (arrLocalName === undefined) return {};

    return {
      CallExpression: (node) => {
        const castName = getCastName(node, arrLocalName);

        if (castName === undefined) return;

        const rewrite = CAST_REWRITES.find(
          (candidate) =>
            candidate.cast === castName && matchesBounds(node, candidate),
        );

        if (rewrite === undefined) return;

        const boundsText = node.arguments
          .slice(0, rewrite.bounds.length)
          .map((arg) => sourceCode.getText(arg))
          .join(', ');

        context.report({
          node,
          messageId: 'useCanonicalCast',
          data: {
            arrName: arrLocalName,
            cast: castName,
            boundsText: [boundsText, '…'].join(', '),
            replacement: rewrite.replacement,
          },
          fix: (fixer) => [
            fixer.replaceText(
              node.callee,
              `${arrLocalName}.${rewrite.replacement}`,
            ),
            ...dropBoundsFix(fixer, node, rewrite),
          ],
        });
      },
    };
  },
  defaultOptions: [],
} as const;

/** The `Arr.<cast>` method name of `node`, or `undefined` for other calls. */
const getCastName = (
  // AST nodes hold mutable child arrays, so they are not deeply readonly.
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
 * Whether the call is `cast(...bounds, array)` with every bound written as the
 * exact numeric literal the rewrite requires.
 *
 * The arity check also excludes the curried form (`cast(...bounds)`):
 * `Arr.asNonEmptyArray` has no curried counterpart, and a curried
 * `asFixedLengthArray` would need the bound kept in a different position.
 */
const matchesBounds = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  rewrite: CastRewrite,
): boolean => {
  const args = node.arguments;

  const boundCount = rewrite.bounds.length;

  if (args.length !== boundCount + 1 || node.typeArguments !== undefined) {
    return false;
  }

  if (args.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)) {
    return false;
  }

  const bounds = args.slice(0, boundCount).map(getLengthLiteral);

  const [first] = bounds;

  return rewrite.bounds.every((matcher, index) => {
    const value = bounds[index];

    if (value === undefined) return false;

    switch (matcher) {
      case 'anyLength':
        return true;

      case 'sameAsFirst':
        return value === first;

      default:
        return value === matcher;
    }
  });
};

/**
 * Removes the length arguments the rewrite drops. Each removal runs from the
 * dropped argument up to the start of the next one, so the comma, whitespace
 * and any comments in between go with it; the ranges never overlap.
 */
const dropBoundsFix = (
  fixer: TSESLint.RuleFixer,
  // AST nodes hold mutable child arrays, so they are not deeply readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  rewrite: CastRewrite,
): readonly TSESLint.RuleFix[] =>
  rewrite.bounds.flatMap((_, index) => {
    if (rewrite.keep.includes(index)) return [];

    const dropped = node.arguments[index];

    const next = node.arguments[index + 1];

    return dropped === undefined || next === undefined
      ? []
      : [fixer.removeRange([dropped.range[0], next.range[0]])];
  });

/** A non-negative integer literal's value, or `undefined` for anything else. */
const getLengthLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): number | undefined =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'number' &&
  Number.isSafeInteger(node.value) &&
  node.value >= 0
    ? node.value
    : undefined;
