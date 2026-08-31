import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds =
  | 'preferNullishCoalescing'
  | 'preferNullishCoalescingAssignment'
  | 'removeUnnecessaryLogicalOr';

/**
 * The falsy values other than `null` / `undefined` that a type may hold at
 * runtime. `NaN` is deliberately absent: no expression written on the
 * right-hand side can compare equal to it (`NaN !== NaN`), so a type that may
 * hold `NaN` (i.e. the non-literal `number` type) can never be rewritten
 * safely; such types are summarized as `'unsafe'` instead.
 */
type FalsyValueTag = 'emptyString' | 'false' | 'zero' | 'zeroBigInt';

/**
 * What the analysis knows about a type:
 *
 * - `falsyValues` — which falsy non-nullish values the type may hold.
 * - `nullable` — whether the type may be `null` / `undefined`.
 *
 * `'unsafe'` means the type may hold falsy values the analysis cannot
 * enumerate (`any`, `unknown`, non-literal `number` because of `NaN`, the
 * member-less `{}` type, …), so no replacement should be attempted.
 */
type TypeSummary = Readonly<{
  falsyValues: ReadonlySet<FalsyValueTag>;
  nullable: boolean;
}>;

/**
 * Replacing `a || b` with `a ?? b` changes the result only when `a` is falsy
 * but not nullish: `||` then yields `b` while `??` yields `a`. The rewrite is
 * therefore behavior-preserving exactly when the type of `a` proves that this
 * case either cannot happen or cannot be observed:
 *
 * - The type of `a` has no falsy value other than `null` / `undefined` (an
 *   object type, `1 | 2 | undefined`, `'a' | 'b' | null`, …). Any right-hand
 *   side is then fine — it is even evaluated under exactly the same
 *   conditions as before.
 * - The type of `a` has exactly one possible falsy non-nullish value (`""`
 *   for strings, `false` for booleans, `0n` for `bigint`, a literal `0`), and
 *   the right-hand side is a side-effect-free expression of exactly that
 *   literal type. When `a` holds that value, `||` returns the right-hand side
 *   and `??` returns `a` — the same value either way.
 *
 * When the same falsy-case condition holds but the left-hand side can *never*
 * be nullish, `??` would never take its right-hand side at all, so instead of
 * rewriting the operator the rule removes the redundant `|| <fallback>`
 * entirely: `<string> || ''` → `<string>`, `<1 | 2> || 3` → `<1 | 2>`. In the
 * no-falsy-value case the right-hand side was never evaluated (so even one
 * with side effects may be dropped); in the singleton-match case it was
 * evaluated
 * but is side-effect-free and equal to the left-hand side.
 *
 * `x ||= y` is handled the same way, except that when the falsy case is
 * reachable (the singleton-match case) the target must be a plain identifier:
 * on a property, `||=` performs an assignment where `??=` performs none, which
 * is observable through setters, `Proxy` traps, or a frozen receiver. A
 * never-nullish `||=` target is left alone — the equivalent cleanup would be
 * deleting the whole statement, which is out of this rule's scope.
 *
 * Known deliberate imprecisions, matching what `===` (SameValueZero) can
 * observe and what typescript-eslint's own type-aware rules assume:
 *
 * - `-0` and `0` are treated as the same value (`x || 0` → `x ?? 0` preserves
 *   `-0` instead of normalizing it to `0`, distinguishable only via
 *   `Object.is` or division).
 * - An object type with at least one member is treated as never falsy, even
 *   though a falsy primitive can inhabit one structurally (`const x: { length:
 *   number } = ''`). The member-less `{}` type, which accepts every non-nullish
 *   primitive, is treated as unsafe.
 */
export const preferNullishCoalescingWhenSafe: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce `??` over `||` (and `??=` over `||=`) for defaulting when the operand types prove the replacement cannot change the behavior (e.g. `<string | undefined> || ""`), and remove `|| <fallback>` entirely when a never-nullish left-hand side makes it redundant (e.g. `<string> || ""`)',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferNullishCoalescing:
        'Replace `||` with `??`. With these operand types the two operators always produce the same result, and `??` makes it explicit that only `null` / `undefined` are defaulted.',
      preferNullishCoalescingAssignment:
        'Replace `||=` with `??=`. With these operand types the two operators always behave the same, and `??=` makes it explicit that only `null` / `undefined` are defaulted.',
      removeUnnecessaryLogicalOr:
        'This `|| …` is unnecessary: the left-hand side can never be nullish, and any falsy value it can hold equals the right-hand side value, so the expression always evaluates to the left-hand side. Remove the `|| …`.',
    },
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const compilerOptions = parserServices.program.getCompilerOptions();

    // Without `strictNullChecks`, `null` / `undefined` are erased from the
    // type system, so the analysis below cannot tell whether the left-hand
    // side is nullable. Disable the rule entirely (matching typescript-eslint's
    // type-aware nullish rules).
    const strictNullChecks =
      compilerOptions.strictNullChecks ?? compilerOptions.strict ?? false;

    if (!strictNullChecks) return {};

    const checker = parserServices.program.getTypeChecker();

    /** Summarizes the possible falsy values of an expression's type. */
    const summarizeExpressionType = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Expression,
    ): TypeSummary | 'unsafe' =>
      summarizeType(
        checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node),
        ),
      );

    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    const summarizeType = (type: ts.Type): TypeSummary | 'unsafe' => {
      const { flags } = type;

      if ((flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
        return 'unsafe';
      }

      // `boolean` is itself the union `true | false`, so it is decomposed
      // here as well.
      if (type.isUnion()) {
        return combineUnionSummaries(type.types.map(summarizeType));
      }

      // A deferred type (type parameter, indexed access, conditional, …) is
      // reduced to its base constraint; one with no resolvable constraint
      // could be instantiated with anything, so it is unsafe.
      if ((flags & DEFERRED_TYPE_FLAGS) !== 0) {
        const constraint = checker.getBaseConstraintOfType(type);

        return constraint === undefined ? 'unsafe' : summarizeType(constraint);
      }

      if ((flags & NULLISH_TYPE_FLAGS) !== 0) return NULLABLE_SUMMARY;

      if ((flags & ts.TypeFlags.Never) !== 0) return NEVER_FALSY_SUMMARY;

      // Literal types (each is falsy only when it is the falsy literal of its
      // primitive kind). Enum literal types carry the same literal flags and
      // are covered here as well.
      if (type.isStringLiteral()) {
        return type.value === ''
          ? SINGLE_FALSY_SUMMARY.emptyString
          : NEVER_FALSY_SUMMARY;
      }

      if (type.isNumberLiteral()) {
        return type.value === 0
          ? SINGLE_FALSY_SUMMARY.zero
          : NEVER_FALSY_SUMMARY;
      }

      if ((flags & ts.TypeFlags.BooleanLiteral) !== 0) {
        return checker.typeToString(type) === 'false'
          ? SINGLE_FALSY_SUMMARY.false
          : NEVER_FALSY_SUMMARY;
      }

      if ((flags & ts.TypeFlags.BigIntLiteral) !== 0) {
        return checker.typeToString(type) === '0n'
          ? SINGLE_FALSY_SUMMARY.zeroBigInt
          : NEVER_FALSY_SUMMARY;
      }

      // Non-literal primitives. Every string-like type can be falsy only as
      // `''` (a template literal type that can never be empty is
      // over-approximated, which is merely conservative). `number` is unsafe
      // because of `NaN` (and `-0`), which no right-hand side can match.
      if (
        (flags &
          (ts.TypeFlags.String |
            ts.TypeFlags.TemplateLiteral |
            ts.TypeFlags.StringMapping)) !==
        0
      ) {
        return SINGLE_FALSY_SUMMARY.emptyString;
      }

      if ((flags & ts.TypeFlags.Number) !== 0) return 'unsafe';

      if ((flags & ts.TypeFlags.Boolean) !== 0) {
        return SINGLE_FALSY_SUMMARY.false;
      }

      if ((flags & ts.TypeFlags.BigInt) !== 0) {
        return SINGLE_FALSY_SUMMARY.zeroBigInt;
      }

      // Symbols and the `object` type are always truthy.
      if (
        (flags &
          (ts.TypeFlags.ESSymbol |
            ts.TypeFlags.UniqueESSymbol |
            ts.TypeFlags.NonPrimitive)) !==
        0
      ) {
        return NEVER_FALSY_SUMMARY;
      }

      if (type.isIntersection()) return summarizeIntersection(type);

      if ((flags & ts.TypeFlags.Object) !== 0) {
        return summarizeObjectLikeType(type);
      }

      // Anything unrecognized (non-union `enum`, `keyof`, …) is unsafe.
      return 'unsafe';
    };

    /**
     * A runtime value of an intersection inhabits every member, so any single
     * member's summary is a sound over-approximation; the intersection of the
     * known members' summaries is used. Only primitive-like members are
     * consulted: a branded primitive such as `number & { brand: 'Int' }` holds
     * plain numbers at runtime, so its phantom object member must not be taken
     * as evidence of truthiness.
     */
    const summarizeIntersection = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      type: ts.IntersectionType,
    ): TypeSummary | 'unsafe' => {
      const primitiveMembers = type.types.filter(
        (member) => (member.flags & PRIMITIVE_LIKE_TYPE_FLAGS) !== 0,
      );

      if (Arr.isEmpty(primitiveMembers)) return summarizeObjectLikeType(type);

      const knownSummaries = primitiveMembers
        .map(summarizeType)
        .filter((summary): summary is TypeSummary => summary !== 'unsafe');

      if (Arr.isEmpty(knownSummaries)) return 'unsafe';

      return knownSummaries.reduce<TypeSummary>(
        (intersection, summary) => ({
          falsyValues: intersectSets(
            intersection.falsyValues,
            summary.falsyValues,
          ),
          nullable: intersection.nullable && summary.nullable,
        }),
        UNIVERSAL_SUMMARY,
      );
    };

    /**
     * An object type with at least one member (property, signature or index)
     * is treated as never falsy. The member-less `{}` (and `Object`) accepts
     * every non-nullish value including falsy primitives, so it is unsafe.
     */
    const summarizeObjectLikeType = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      type: ts.Type,
    ): TypeSummary | 'unsafe' =>
      Arr.isNonEmpty(checker.getPropertiesOfType(type)) ||
      Arr.isNonEmpty(
        checker.getSignaturesOfType(type, ts.SignatureKind.Call),
      ) ||
      Arr.isNonEmpty(
        checker.getSignaturesOfType(type, ts.SignatureKind.Construct),
      ) ||
      Arr.isNonEmpty(checker.getIndexInfosOfType(type))
        ? NEVER_FALSY_SUMMARY
        : 'unsafe';

    /**
     * Returns `true` if the right-hand side is a side-effect-free expression
     * whose type is exactly the falsy literal identified by `tag`. Side-effect
     * freedom matters because `??` skips evaluating the right-hand side in the
     * left-is-falsy-non-nullish case where `||` evaluates it.
     */
    const rhsIsMatchingFalsyLiteral = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      right: TSESTree.Expression,
      tag: FalsyValueTag,
    ): boolean => {
      if (!isSideEffectFreeSimpleExpression(right)) return false;

      const rightType = checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(right),
      );

      if (rightType.isUnion()) return false;

      switch (tag) {
        case 'emptyString':
          return rightType.isStringLiteral() && rightType.value === '';

        case 'zero':
          return rightType.isNumberLiteral() && rightType.value === 0;

        case 'false':
          return (
            (rightType.flags & ts.TypeFlags.BooleanLiteral) !== 0 &&
            checker.typeToString(rightType) === 'false'
          );

        case 'zeroBigInt':
          return (
            (rightType.flags & ts.TypeFlags.BigIntLiteral) !== 0 &&
            checker.typeToString(rightType) === '0n'
          );
      }
    };

    /**
     * Decides whether the falsy non-nullish case of the left-hand side is
     * harmless (see the rule-level doc comment for the proof): it either
     * cannot happen at all, or it yields exactly the right-hand side value
     * with no skippable side effect. This is the shared precondition of both
     * rewrites — `||` → `??` on a nullable left-hand side, and removing
     * `|| <fallback>` on a never-nullish one.
     */
    const falsyCaseIsHarmless = (
      summary: TypeSummary,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      right: TSESTree.Expression,
    ): boolean => {
      if (summary.falsyValues.size === 0) return true;

      if (summary.falsyValues.size > 1) return false;

      const [tag] = summary.falsyValues;

      return tag !== undefined && rhsIsMatchingFalsyLiteral(right, tag);
    };

    return {
      LogicalExpression: (node) => {
        if (node.operator !== '||') return;

        const summary = summarizeExpressionType(node.left);

        if (summary === 'unsafe') return;

        if (!falsyCaseIsHarmless(summary, node.right)) return;

        if (!summary.nullable) {
          // A never-nullish left-hand side makes the whole `|| <fallback>`
          // redundant: `??` would never take its right-hand side, so the
          // expression is just the left-hand side — remove the tail instead
          // of rewriting the operator. (In the singleton-match case the old
          // code did evaluate the side-effect-free right-hand side and
          // returned that equal value; in the no-falsy-value case it never
          // evaluated it at all, so any right-hand side may be dropped.)
          context.report({
            node,
            messageId: 'removeUnnecessaryLogicalOr',
            fix: (fixer) => {
              const operatorToken = context.sourceCode.getFirstTokenBetween(
                node.left,
                node.right,
                (token) => token.value === '||',
              );

              if (operatorToken === null) return null;

              const tokenBeforeOperator =
                context.sourceCode.getTokenBefore(operatorToken);

              if (tokenBeforeOperator === null) return null;

              // Remove from the end of the left operand's last token (its
              // closing parenthesis included, so `(a, b) || ''` keeps its
              // parentheses) to the end of the whole expression.
              return fixer.removeRange([
                tokenBeforeOperator.range[1],
                node.range[1],
              ]);
            },
          });

          return;
        }

        // `??` cannot be mixed with `&&` / `||` without parentheses, so an
        // unparenthesized `||` directly inside another logical expression
        // (e.g. the inner `a || b` of `a || b || c`) cannot be rewritten in
        // place. The outer expression is still handled, parenthesizing this
        // one as its operand. (The removal branch above has no such
        // constraint: dropping `|| <fallback>` is valid in any context.)
        const { parent } = node;

        if (
          parent.type === AST_NODE_TYPES.LogicalExpression &&
          (parent.operator === '&&' || parent.operator === '||') &&
          !ASTUtils.isParenthesized(node, context.sourceCode)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'preferNullishCoalescing',
          fix: (fixer) => {
            const operatorToken = context.sourceCode.getFirstTokenBetween(
              node.left,
              node.right,
              (token) => token.value === '||',
            );

            if (operatorToken === null) return null;

            const mut_fixes: TSESLint.RuleFix[] = [
              fixer.replaceText(operatorToken, '??'),
            ];

            // An unparenthesized `&&` / `||` operand would become a syntax
            // error next to `??` (e.g. `a && b || c` → `(a && b) ?? c`).
            for (const child of [node.left, node.right]) {
              if (
                child.type === AST_NODE_TYPES.LogicalExpression &&
                (child.operator === '&&' || child.operator === '||') &&
                !ASTUtils.isParenthesized(child, context.sourceCode)
              ) {
                mut_fixes.push(
                  fixer.insertTextBefore(child, '('),
                  fixer.insertTextAfter(child, ')'),
                );
              }
            }

            return mut_fixes;
          },
        });
      },

      AssignmentExpression: (node) => {
        if (node.operator !== '||=') return;

        const summary = summarizeExpressionType(node.left);

        if (summary === 'unsafe') return;

        // Only a nullable target is rewritten. On a never-nullish one the
        // equivalent cleanup would be deleting the whole statement, which is
        // out of this rule's scope.
        if (!summary.nullable) return;

        if (!falsyCaseIsHarmless(summary, node.right)) return;

        // When the falsy non-nullish case is reachable (the singleton-match
        // case), `||=` assigns where `??=` does not. On a property that
        // difference is observable (setters, `Proxy` traps, frozen objects),
        // so only plain identifier targets are rewritten there.
        if (
          summary.falsyValues.size > 0 &&
          node.left.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'preferNullishCoalescingAssignment',
          fix: (fixer) => {
            const operatorToken = context.sourceCode.getFirstTokenBetween(
              node.left,
              node.right,
              (token) => token.value === '||=',
            );

            if (operatorToken === null) return null;

            return fixer.replaceText(operatorToken, '??=');
          },
        });
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * Deferred (non-concrete) type flags whose actual members are only known once
 * the type is instantiated. They are reduced to their base constraint before
 * being summarized.
 */
const DEFERRED_TYPE_FLAGS =
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

const NULLISH_TYPE_FLAGS =
  ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void;

/** The type flags of members that constrain an intersection's runtime values. */
const PRIMITIVE_LIKE_TYPE_FLAGS =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.ESSymbolLike;

const EMPTY_FALSY_SET: ReadonlySet<FalsyValueTag> = new Set();

const NEVER_FALSY_SUMMARY: TypeSummary = {
  falsyValues: EMPTY_FALSY_SET,
  nullable: false,
} as const;

const NULLABLE_SUMMARY: TypeSummary = {
  falsyValues: EMPTY_FALSY_SET,
  nullable: true,
} as const;

/** The no-information summary — the identity element for intersection. */
const UNIVERSAL_SUMMARY: TypeSummary = {
  falsyValues: new Set<FalsyValueTag>([
    'emptyString',
    'false',
    'zero',
    'zeroBigInt',
  ]),
  nullable: true,
} as const;

const SINGLE_FALSY_SUMMARY: ReadonlyRecord<FalsyValueTag, TypeSummary> = {
  emptyString: {
    falsyValues: new Set<FalsyValueTag>(['emptyString']),
    nullable: false,
  },
  false: { falsyValues: new Set<FalsyValueTag>(['false']), nullable: false },
  zero: { falsyValues: new Set<FalsyValueTag>(['zero']), nullable: false },
  zeroBigInt: {
    falsyValues: new Set<FalsyValueTag>(['zeroBigInt']),
    nullable: false,
  },
} as const;

const combineUnionSummaries = (
  summaries: readonly (TypeSummary | 'unsafe')[],
): TypeSummary | 'unsafe' =>
  summaries.includes('unsafe')
    ? 'unsafe'
    : ({
        falsyValues: new Set(
          summaries.flatMap((summary) =>
            summary === 'unsafe' ? [] : Array.from(summary.falsyValues),
          ),
        ),
        nullable: summaries.some(
          (summary) => summary !== 'unsafe' && summary.nullable,
        ),
      } as const);

const intersectSets = (
  a: ReadonlySet<FalsyValueTag>,
  b: ReadonlySet<FalsyValueTag>,
): ReadonlySet<FalsyValueTag> =>
  new Set(Array.from(a).filter((tag) => b.has(tag)));

const isSideEffectFreeSimpleExpression = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): boolean =>
  node.type === AST_NODE_TYPES.Literal ||
  node.type === AST_NODE_TYPES.Identifier ||
  (node.type === AST_NODE_TYPES.TemplateLiteral &&
    Arr.isEmpty(node.expressions));
