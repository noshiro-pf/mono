import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { isSameReference } from './reference-utils.mjs';

type Options = readonly [];

type MessageIds = 'preferOptionalChain';

/**
 * Replace a ternary that yields `undefined` for a nullish value and an access
 * on it otherwise by the optional chain it spells out:
 *
 * | written                              | fixed to  |
 * | :----------------------------------- | :-------- |
 * | `x == null ? undefined : x.b`        | `x?.b`    |
 * | `x != null ? x.b : undefined`        | `x?.b`    |
 * | `x === undefined ? undefined : x[0]` | `x?.[0]`  |
 * | `x == null ? undefined : x.m(1)`     | `x?.m(1)` |
 *
 * The check has to catch every nullish value, or the chain would short-circuit
 * where the ternary did not. `== null` / `== undefined` always do, and so does
 * `x === null || x === undefined`. A single strict check does when the type of
 * `x` rules the other value out: `x === undefined` for `B | undefined`, not
 * for `B | null | undefined`. `any`, `unknown` and an unconstrained type
 * parameter rule nothing out.
 *
 * The other branch must be `undefined` itself — `x == null ? null : x.b`
 * yields `null`, which `x?.b` would not — and the access must start from the
 * checked value, so that it is the one link the `?.` goes on.
 *
 * Left alone where the chain would behave differently: as a callee or a tag,
 * `(x?.f)()` calls `f` with `x` as `this` where the ternary passes none, and
 * `delete (x?.b)` deletes where `delete (…)` of a ternary does not. The
 * parentheses around a ternary that is one step of a longer chain stay, so
 * `(x == null ? undefined : x.b).c` becomes `(x?.b).c` and still throws when
 * `x` is nullish.
 *
 * The ternary reads the checked value twice and the chain once; a getter on
 * the way is therefore called one time fewer.
 */
export const preferOptionalChainOverTernary: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace a ternary that yields `undefined` for a nullish value and an access on it otherwise by an optional chain (`x == null ? undefined : x.b` → `x?.b`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferOptionalChain: 'Write this ternary as `{{replacement}}`.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = ESLintUtils.getParserServices(context);

    const checker = services.program.getTypeChecker();

    const compilerOptions = services.program.getCompilerOptions();

    // Without `strictNullChecks` a type never says it excludes `null` or
    // `undefined`, so only the loose checks can be trusted.
    const strictNullChecks =
      compilerOptions.strictNullChecks ?? compilerOptions.strict ?? false;

    /** Whether the type of `node` may hold a value with one of `flags`. */
    const mayHold = (
      node: DeepReadonly<TSESTree.Node>,
      flags: ts.TypeFlags,
    ): boolean =>
      !strictNullChecks ||
      typeMayHold(
        checker.getTypeAtLocation(
          services.esTreeNodeToTSNodeMap.get(asNode(node)),
        ),
        flags,
        checker,
      );

    /**
     * What `test` checks: the value, and whether the test is true exactly
     * when that value is nullish (`false`: exactly when it is not).
     */
    const nullishCheckOf = (
      test: DeepReadonly<TSESTree.Expression>,
    ): NullishCheck | undefined => {
      if (test.type === AST_NODE_TYPES.LogicalExpression) {
        return strictPairCheckOf(test);
      }

      const comparison = nullComparisonOf(test);

      if (comparison === undefined) {
        return undefined;
      }

      const { value, against, operator } = comparison;

      const nullishWhenTrue = operator === '==' || operator === '===';

      if (operator === '==' || operator === '!=') {
        return { value, nullishWhenTrue };
      }

      // A strict check against one nullish value catches both only when the
      // type cannot hold the other.
      const other =
        against === 'null'
          ? ts.TypeFlags.Undefined | ts.TypeFlags.Void
          : ts.TypeFlags.Null;

      return mayHold(value, other) ? undefined : { value, nullishWhenTrue };
    };

    const replacementOf = (
      node: DeepReadonly<TSESTree.ConditionalExpression>,
    ): string | undefined => {
      const check = nullishCheckOf(node.test);

      if (check === undefined) {
        return undefined;
      }

      const [nullishBranch, accessBranch] = check.nullishWhenTrue
        ? [node.consequent, node.alternate]
        : [node.alternate, node.consequent];

      if (!isUndefined(nullishBranch)) {
        return undefined;
      }

      const firstLink = firstLinkFrom(accessBranch, check.value);

      if (firstLink === undefined) {
        return undefined;
      }

      const [start, end] = accessBranch.range;

      if (firstLink.optional) {
        return sourceCode.text.slice(start, end);
      }

      const checked =
        firstLink.type === AST_NODE_TYPES.MemberExpression
          ? firstLink.object
          : firstLink.callee;

      // The punctuator right after the checked value (past any parentheses
      // around it): `.` becomes `?.`, and `[` / `(` / `<` get `?.` in front.
      const next = sourceCode.getTokenAfter(
        asNode(checked),
        (token) => !ASTUtils.isClosingParenToken(token),
      );

      if (next === null) {
        return undefined;
      }

      const [nextStart, nextEnd] = next.range;

      return next.value === '.'
        ? `${sourceCode.text.slice(start, nextStart)}?.${sourceCode.text.slice(nextEnd, end)}`
        : `${sourceCode.text.slice(start, nextStart)}?.${sourceCode.text.slice(nextStart, end)}`;
    };

    return {
      ConditionalExpression: (node) => {
        if (changesMeaningAsChain(node)) {
          return;
        }

        const replacement = replacementOf(node);

        if (replacement === undefined) {
          return;
        }

        const hasComments = Arr.isNonEmpty(sourceCode.getCommentsInside(node));

        context.report({
          node,
          messageId: 'preferOptionalChain',
          data: { replacement },
          fix: hasComments
            ? null
            : (fixer) => fixer.replaceText(node, replacement),
        });
      },
    };
  },
  defaultOptions: [],
} as const;

type NullishCheck = Readonly<{
  value: DeepReadonly<TSESTree.Expression>;
  nullishWhenTrue: boolean;
}>;

type NullComparison = Readonly<{
  value: DeepReadonly<TSESTree.Expression>;
  against: 'null' | 'undefined';
  operator: '==' | '!=' | '===' | '!==';
}>;

const TYPE_WRAPPERS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
]);

/** `x == null`, `undefined !== x` and the like, whichever side `x` is on. */
const nullComparisonOf = (
  node: DeepReadonly<TSESTree.Node>,
): NullComparison | undefined => {
  if (
    node.type !== AST_NODE_TYPES.BinaryExpression ||
    !isEqualityOperator(node.operator) ||
    node.left.type === AST_NODE_TYPES.PrivateIdentifier
  ) {
    return undefined;
  }

  const leftKind = nullishKindOf(node.left);

  const rightKind = nullishKindOf(node.right);

  return leftKind !== undefined && rightKind === undefined
    ? { value: node.right, against: leftKind, operator: node.operator }
    : leftKind === undefined && rightKind !== undefined
      ? { value: node.left, against: rightKind, operator: node.operator }
      : undefined;
};

/** `x === null || x === undefined`, or `x !== null && x !== undefined`. */
const strictPairCheckOf = (
  test: DeepReadonly<TSESTree.LogicalExpression>,
): NullishCheck | undefined => {
  const left = nullComparisonOf(test.left);

  const right = nullComparisonOf(test.right);

  if (
    left === undefined ||
    right === undefined ||
    left.against === right.against ||
    !isSameReference(left.value, right.value)
  ) {
    return undefined;
  }

  const operators = new Set([left.operator, right.operator]);

  return test.operator === '||' && operators.size === 1 && operators.has('===')
    ? { value: left.value, nullishWhenTrue: true }
    : test.operator === '&&' && operators.size === 1 && operators.has('!==')
      ? { value: left.value, nullishWhenTrue: false }
      : undefined;
};

/**
 * The link of `branch` that accesses `value` directly — `x.b` in `x.b.c(1)`,
 * `x(1)` in `x(1).d` — or `undefined` when the chain does not start from it.
 */
const firstLinkFrom = (
  branch: DeepReadonly<TSESTree.Expression>,
  value: DeepReadonly<TSESTree.Expression>,
):
  | DeepReadonly<TSESTree.CallExpression | TSESTree.MemberExpression>
  | undefined => {
  const link =
    branch.type === AST_NODE_TYPES.ChainExpression ? branch.expression : branch;

  if (link.type === AST_NODE_TYPES.MemberExpression) {
    return isSameReference(link.object, value)
      ? link
      : firstLinkFrom(link.object, value);
  }

  if (link.type === AST_NODE_TYPES.CallExpression) {
    return isSameReference(link.callee, value)
      ? link
      : firstLinkFrom(link.callee, value);
  }

  return link.type === AST_NODE_TYPES.TSNonNullExpression
    ? firstLinkFrom(link.expression, value)
    : undefined;
};

/**
 * Whether the ternary sits where an optional chain means something else: as
 * a callee or a tag (the chain passes `this`), or under `delete`.
 */
const changesMeaningAsChain = (
  node: DeepReadonly<TSESTree.ConditionalExpression>,
): boolean => {
  const outer = outermostWrapperOf(node);

  const { parent } = outer;

  return (
    (parent?.type === AST_NODE_TYPES.CallExpression &&
      parent.callee === outer) ||
    (parent?.type === AST_NODE_TYPES.TaggedTemplateExpression &&
      parent.tag === outer) ||
    (parent?.type === AST_NODE_TYPES.UnaryExpression &&
      parent.operator === 'delete')
  );
};

/** `node`, or the outermost `!` / `as` / `satisfies` wrapped around it. */
const outermostWrapperOf = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const { parent } = node;

  return parent !== undefined &&
    isTypeWrapper(parent) &&
    parent.expression === node
    ? outermostWrapperOf(parent)
    : node;
};

const isTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<
  | TSESTree.TSAsExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSTypeAssertion
> => TYPE_WRAPPERS.has(node.type);

const typeMayHold = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  flags: ts.TypeFlags,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
): boolean => {
  if ((type.flags & (flags | ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
    return true;
  }

  if (type.isUnion()) {
    return type.types.some((member) => typeMayHold(member, flags, checker));
  }

  if (type.isIntersection()) {
    return type.types.every((member) => typeMayHold(member, flags, checker));
  }

  if ((type.flags & ts.TypeFlags.Instantiable) !== 0) {
    const constraint = checker.getBaseConstraintOfType(type);

    return (
      constraint === undefined ||
      constraint === type ||
      typeMayHold(constraint, flags, checker)
    );
  }

  return false;
};

const nullishKindOf = (
  node: DeepReadonly<TSESTree.Node>,
): 'null' | 'undefined' | undefined =>
  node.type === AST_NODE_TYPES.Literal && node.raw === 'null'
    ? 'null'
    : isUndefined(node)
      ? 'undefined'
      : undefined;

const isUndefined = (node: DeepReadonly<TSESTree.Node>): boolean =>
  node.type === AST_NODE_TYPES.Identifier && node.name === 'undefined';

const isEqualityOperator = (
  operator: string,
): operator is NullComparison['operator'] =>
  operator === '==' ||
  operator === '!=' ||
  operator === '===' ||
  operator === '!==';

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
