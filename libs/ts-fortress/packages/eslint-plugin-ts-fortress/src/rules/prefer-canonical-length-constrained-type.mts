import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  ARRAY_FN,
  BOUNDED_LENGTH_TUPLE_FN,
  FIXED_LENGTH_TUPLE_FN,
  MAX_LENGTH_TUPLE_FN,
  MIN_LENGTH_ARRAY_FN,
  MIN_LENGTH_TUPLE_FN,
  NON_EMPTY_ARRAY_FN,
  STRUCTURAL_PREFIX_CAP,
} from './constants.mjs';
import {
  buildCalleeResolver,
  buildImportsFix,
  getImportedLocalName,
  getTsFortressImports,
  hasForeignBinding,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useCanonicalType';

/** How one leading length argument of a combinator call must look. */
type BoundMatcher = number | 'anyLength' | 'sameAsFirst';

type Rewrite = Readonly<{
  /** The canonical ts-fortress combinator the call resolves to. */
  from: string;
  /** One matcher per leading length argument the call must have. */
  bounds: readonly BoundMatcher[];
  /** The combinator the call is rewritten to. */
  to: string;
  /** Indices into `bounds` of the length arguments the rewrite keeps, in order. */
  keep: readonly number[];
  /**
   * Whether an options object carrying `defaultValue` blocks the rewrite,
   * because the two combinators type that option differently.
   */
  blockedByDefaultValue: boolean;
}>;

/**
 * Combinator calls whose length arguments make them a longhand spelling of
 * another combinator.
 *
 * Every entry is **type-identical**, not merely assignable — the two calls
 * produce the very same `Type<T>`, verified against the ts-type-forge
 * definitions:
 *
 * | call                          | canonical form            | why |
 * | :---------------------------- | :------------------------ | :-- |
 * | `minLengthArray(1, x)`        | `nonEmptyArray(x)`        | `NonEmptyArray<A>` is defined as `MinLengthArray<1, A>` |
 * | `minLengthTuple(0, x)`        | `array(x)`                | `MinLengthTuple<0, A>` is `readonly A[]` — no constraint at all |
 * | `maxLengthTuple(0, x)`        | `fixedLengthTuple(0, x)`  | both are `readonly []` |
 * | `boundedLengthTuple(n, n, x)` | `fixedLengthTuple(n, x)`  | the union collapses to its single longest member |
 * | `boundedLengthTuple(0, n, x)` | `maxLengthTuple(n, x)`    | `MaxLengthTuple<N, A>` is defined as `BoundedLengthTuple<0, N, A>` |
 *
 * The rewrite also preserves `defaultValue` and every accepted/rejected value;
 * only the default `typeName` (and the `details.kind` of the length error it
 * reports) changes, to the one that names the constraint being checked.
 *
 * The `*Array` family has no analogous entries on purpose — see the README:
 * its length constraint lives in a brand, and `BoundedLengthArray<Min, Max, A>`
 * is an intersection of both bounds' brands, so neither
 * `boundedLengthArray(0, n, x)` → `maxLengthArray(n, x)` (which drops the
 * `MinLengthArray<0>` brand) nor `boundedLengthArray(n, n, x)` →
 * `fixedLengthArray(n, x)` (which adds an exact tuple for `n <= 10`) keeps the
 * type unchanged.
 */
const REWRITES = [
  {
    from: MIN_LENGTH_ARRAY_FN,
    bounds: [1],
    to: NON_EMPTY_ARRAY_FN,
    keep: [],
    blockedByDefaultValue: true,
  },
  {
    from: MIN_LENGTH_TUPLE_FN,
    bounds: [0],
    to: ARRAY_FN,
    keep: [],
    blockedByDefaultValue: false,
  },
  {
    from: MAX_LENGTH_TUPLE_FN,
    bounds: [0],
    to: FIXED_LENGTH_TUPLE_FN,
    keep: [0],
    blockedByDefaultValue: false,
  },
  // Listed before the `0, n` entry so that `boundedLengthTuple(0, 0, x)`
  // normalizes to `fixedLengthTuple(0, x)`, the more specific of the two.
  {
    from: BOUNDED_LENGTH_TUPLE_FN,
    bounds: ['anyLength', 'sameAsFirst'],
    to: FIXED_LENGTH_TUPLE_FN,
    keep: [0],
    blockedByDefaultValue: false,
  },
  {
    from: BOUNDED_LENGTH_TUPLE_FN,
    bounds: [0, 'anyLength'],
    to: MAX_LENGTH_TUPLE_FN,
    keep: [1],
    blockedByDefaultValue: false,
  },
] as const satisfies readonly Rewrite[];

export const preferCanonicalLengthConstrainedType: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Normalize a length-constrained ts-fortress array combinator whose bounds are degenerate (e.g. `minLengthArray(1, x)`, `boundedLengthTuple(n, n, x)`) to the combinator that names that constraint directly.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useCanonicalType:
        'Use `{{replacement}}(...)` instead of `{{original}}({{boundsText}}, ...)`: with these bounds both build exactly the same type, and `{{replacement}}` names the constraint directly (and reports it on validation failure).',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsFortressImports = getTsFortressImports(program);

    const resolveCallee = buildCalleeResolver(tsFortressImports);

    const mut_matches: {
      node: TSESTree.CallExpression;
      propertyNode: TSESTree.Node;
      isNamespace: boolean;
      rewrite: Rewrite;
      /** The name the rewritten call will use; `undefined` when unavailable. */
      localName: string | undefined;
      needsImport: boolean;
    }[] = [];

    return {
      CallExpression: (node) => {
        const resolved = resolveCallee(node.callee);

        if (resolved === undefined) return;

        const rewrite = REWRITES.find(
          (candidate) =>
            candidate.from === resolved.canonicalName &&
            matchesRewrite(node, candidate),
        );

        if (rewrite === undefined) return;

        // A namespace call (`t.maxLengthTuple(...)`) only swaps the property
        // name, so it never needs a binding of its own.
        if (resolved.isNamespace) {
          mut_matches.push({
            node,
            propertyNode: resolved.propertyNode,
            isNamespace: true,
            rewrite,
            localName: rewrite.to,
            needsImport: false,
          });

          return;
        }

        const importedLocalName = getImportedLocalName(
          tsFortressImports,
          rewrite.to,
        );

        const localName = importedLocalName ?? rewrite.to;

        mut_matches.push({
          node,
          propertyNode: resolved.propertyNode,
          isNamespace: false,
          rewrite,
          localName: hasForeignBinding(sourceCode, node, localName)
            ? undefined
            : localName,
          needsImport: importedLocalName === undefined,
        });
      },
      'Program:exit': () => {
        const reportable = mut_matches.filter(
          (match) => match.localName !== undefined,
        );

        const namesNeedingImport = Array.from(
          new Set(
            reportable
              .filter((match) => match.needsImport)
              .map((match) => match.rewrite.to),
          ),
        );

        // Every missing import rides on a single report; see `buildImportsFix`.
        const importFixIndex = reportable.findIndex(
          (match) => match.needsImport,
        );

        for (const [
          index,
          { node, propertyNode, rewrite, localName },
        ] of reportable.entries()) {
          if (localName === undefined) continue;

          context.report({
            node,
            messageId: 'useCanonicalType',
            data: {
              original: rewrite.from,
              replacement: localName,
              boundsText: boundsText(node, rewrite, sourceCode),
            },
            fix: (fixer) => [
              ...(index === importFixIndex
                ? buildImportsFix(fixer, program, namesNeedingImport)
                : []),
              fixer.replaceText(propertyNode, localName),
              ...dropBoundsFix(fixer, node, rewrite),
            ],
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether `node` is a `<combinator>(...bounds, elementType, options?)` call
 * whose bounds match `rewrite` exactly as written.
 */
const matchesRewrite = (
  node: TSESTree.CallExpression,
  rewrite: Rewrite,
): boolean => {
  const args = node.arguments;

  const boundCount = rewrite.bounds.length;

  if (
    args.length < boundCount + 1 ||
    args.length > boundCount + 2 ||
    // Explicit type arguments pin the bound independently of the literal, so
    // dropping or moving the literal could change the resulting type.
    node.typeArguments !== undefined ||
    args.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)
  ) {
    return false;
  }

  const bounds = args.slice(0, boundCount).map(getLengthLiteral);

  const [first] = bounds;

  const boundsMatch = rewrite.bounds.every((matcher, index) => {
    const value = bounds[index];

    if (value === undefined) return false;

    switch (matcher) {
      case 'anyLength':
        return value <= STRUCTURAL_PREFIX_CAP;

      case 'sameAsFirst':
        return value === first && value <= STRUCTURAL_PREFIX_CAP;

      default:
        return value === matcher;
    }
  });

  return (
    boundsMatch &&
    (!rewrite.blockedByDefaultValue ||
      !passesDefaultValue(args[boundCount + 1]))
  );
};

/** The bounds of the matched call, as written, for the report message. */
const boundsText = (
  node: TSESTree.CallExpression,
  rewrite: Rewrite,
  sourceCode: TSESLint.SourceCode,
): string =>
  node.arguments
    .slice(0, rewrite.bounds.length)
    .map((arg) => sourceCode.getText(arg))
    .join(', ');

/**
 * Removes the length arguments the rewrite drops. Each removal runs from the
 * dropped argument up to the start of the next one, so the comma, whitespace
 * and any comments in between go with it; the ranges never overlap.
 */
const dropBoundsFix = (
  fixer: TSESLint.RuleFixer,
  node: TSESTree.CallExpression,
  rewrite: Rewrite,
): readonly TSESLint.RuleFix[] =>
  rewrite.bounds.flatMap((_, index) => {
    if (rewrite.keep.includes(index)) return [];

    const dropped = node.arguments[index];

    const next = node.arguments[index + 1];

    return dropped === undefined || next === undefined
      ? []
      : [fixer.removeRange([dropped.range[0], next.range[0]])];
  });

/**
 * A non-negative integer literal's value, or `undefined` for anything else —
 * a computed bound cannot be matched against the rewrite table.
 */
const getLengthLiteral = (node: TSESTree.Node): number | undefined =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'number' &&
  Number.isSafeInteger(node.value) &&
  node.value >= 0
    ? node.value
    : undefined;

/**
 * Whether the options argument may carry a `defaultValue`. Anything that is not
 * a plain object literal of statically known keys counts, since its contents
 * cannot be ruled out.
 */
const passesDefaultValue = (node: TSESTree.Node | undefined): boolean =>
  node !== undefined &&
  (node.type !== AST_NODE_TYPES.ObjectExpression ||
    node.properties.some(
      (property) =>
        property.type !== AST_NODE_TYPES.Property ||
        property.computed ||
        property.key.type !== AST_NODE_TYPES.Identifier ||
        property.key.name === 'defaultValue',
    ));
