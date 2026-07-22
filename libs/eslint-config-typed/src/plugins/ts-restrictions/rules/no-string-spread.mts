import { ESLintUtils, type TSESLint } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'noStringSpread';

/**
 * Deferred (non-concrete) type flags whose actual members are only known once
 * the type is instantiated. They are reduced to their base constraint before
 * checking whether they are string-like.
 */
const DEFERRED_TYPE_FLAGS =
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

/**
 * Disallow spreading a `string` value with the spread operator `...`.
 *
 * ## Why
 *
 * Spreading a string iterates it into its individual characters, so
 * `[...someString]` (or `f(...someString)`) evaluates to a `string[]` — the
 * *exact same result type* as spreading an actual `string[]`. That makes an
 * accidental string spread silent: neither the reader nor the type checker can
 * tell `[...anArray]` from `[...aString]` by the result type alone, so a bug
 * where an array was expected but a `string` slipped in goes unnoticed.
 *
 * ## Why not simply "allow array / object types only"
 *
 * The naive framing — "only permit `...` on arrays or objects" — would also
 * reject perfectly idiomatic spreads of other iterables (`Set`, `Map`,
 * `Map.prototype.keys()`, generators, `NodeList`, typed arrays, `arguments`,
 * …), which have no equivalent silent hazard. And TypeScript *already* rejects
 * spreading a non-iterable primitive such as `number` / `boolean` in an
 * iterable position. The only case TypeScript accepts yet is genuinely
 * error-prone is `string`, so that is exactly what this rule targets.
 *
 * If a character split is really intended, spell it out with
 * `Array.from(str)` (identical to the spread, code-point aware) or
 * `str.split('')`.
 */
export const noStringSpread: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow spreading a `string` (e.g. `[...str]`), which silently splits it into characters and yields a `string[]` indistinguishable from spreading an array',
    },
    schema: [],
    messages: {
      noStringSpread:
        'Spreading a `string` splits it into individual characters and yields a `string[]` indistinguishable from spreading an array, so accidental string spreads go unnoticed. Spread an array or object instead; if a character split is intended, make it explicit with `Array.from(str)`.',
    },
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    /**
     * Returns `true` if the given type could be spread as a string (it is
     * string-like, or a union / intersection with a string-like constituent).
     *
     * - `any` / `unknown` are treated conservatively as *not* string-like:
     *   they cannot be proven to be a string, and flagging them would fire on
     *   every untyped spread.
     * - Unions are flagged when *any* branch is string-like, because such a
     *   branch reintroduces the silent char-split hazard.
     * - Intersections are flagged when *any* constituent is string-like: a
     *   branded string (`string & Brand`) is still a `string` at runtime.
     * - A deferred type (type parameter, indexed access, conditional, …) is
     *   reduced to its base constraint; one with no resolvable constraint is
     *   left alone to avoid false positives on unconstrained generics.
     */
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    const isStringLikeType = (type: ts.Type): boolean => {
      if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
        return false;
      }

      if (type.isUnion() || type.isIntersection()) {
        return type.types.some(isStringLikeType);
      }

      if ((type.flags & DEFERRED_TYPE_FLAGS) !== 0) {
        const constraint = checker.getBaseConstraintOfType(type);

        return constraint !== undefined && isStringLikeType(constraint);
      }

      return (type.flags & ts.TypeFlags.StringLike) !== 0;
    };

    return {
      // `SpreadElement` covers every value-spread position: array literals
      // (`[...x]`), call / new arguments (`f(...x)`), and object literals
      // (`{...x}`). Destructuring rest (`[a, ...rest]`, `{ ...rest }`) is a
      // `RestElement` / `RestType` and is intentionally not matched.
      SpreadElement: (node) => {
        const argTsNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.argument,
        );

        if (!isStringLikeType(checker.getTypeAtLocation(argTsNode))) return;

        context.report({
          node,
          messageId: 'noStringSpread',
        });
      },
    };
  },
  defaultOptions: [],
} as const;
