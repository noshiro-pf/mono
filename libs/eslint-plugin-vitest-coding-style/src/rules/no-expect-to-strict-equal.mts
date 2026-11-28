import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  isCallee,
  mayHaveEffect,
  outermostTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import {
  createVitestAssertFixer,
  getExpectOperands,
  getVitestReceiver,
} from './vitest-binding.mjs';

type MessageIds = 'useAssert' | 'useAssertMovingMessage';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

/**
 * The trade-off, measured in `assert-vs-expect-strict-equality.test.mts`:
 *
 * - `assert.deepStrictEqual: <T>(actual: T, expected: T) => void` binds both
 *   arguments to one type parameter, so a mismatched pair fails to compile.
 *   `toStrictEqual: <E>(expected: E) => void` leaves `E` unconstrained and
 *   type-checks nothing at all — a misspelled key in the expected object is a
 *   run-time failure there and a compile-time one here.
 * - In exchange, `toStrictEqual` compares prototypes and Vitest's
 *   `assert.deepStrictEqual` does not. The latter is Chai's `deepEqual` — the
 *   same function object, not merely an equivalent one — and not Node.js's
 *   `node:assert` function of that name, which does compare prototypes. A test
 *   that has to pin a class rather than a shape needs `assert.instanceOf`
 *   alongside the structural comparison.
 *
 * The compile-time check is preferred because it is the one that cannot be
 * recovered by adding a second assertion.
 *
 * The calls and the `expect` function are read through `as`, `satisfies`, `!`
 * and `<T>` (`expect(X)!.toStrictEqual(Y)`); `X` and `Y` keep theirs. `expect`
 * is Vitest's only (`getVitestReceiver`), and the fix names Vitest's `assert`
 * only (`createVitestAssertFixer`).
 *
 * A comparison that refers to Vitest's `expect`, or reads a member named
 * `expect` (such as a fixture's `c.expect`), on either side other than by
 * calling it is left alone: that is how an asymmetric matcher
 * (`expect.any(Date)`, `expect.objectContaining(…)`) gets into a value, and only
 * `toStrictEqual` understands one, so the comparison has no `assert` form. A
 * matcher held in a variable declared outside the comparison is not seen. The
 * check errs toward leaving a comparison alone: a missed rewrite costs nothing
 * a failing test does.
 *
 * `expect(X, message)` is reported too, and its message becomes the third
 * argument, `assert.deepStrictEqual(X, Y, message)`. That moves its evaluation
 * from before `Y` to after it, so the fix is written only when the order cannot
 * matter: either side is a literal, or neither has a side effect
 * (`mayHaveEffect`). Otherwise it is reported as `useAssertMovingMessage`, with
 * no fix.
 */
export const noExpectToStrictEqualRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `expect(X).toStrictEqual(Y)` (and `expect(X, message)`) in favor of `assert.deepStrictEqual(X, Y)` (`assert.deepStrictEqual(X, Y, message)`), which constrains X and Y to a single type at compile time (`toStrictEqual` type-checks neither); note that it compares structure only, so pin a prototype with `assert.instanceOf`. A comparison against an asymmetric matcher (`expect.any(…)`) stays on `toStrictEqual`.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useAssert:
        "Use Vitest's `assert.deepStrictEqual(X, Y)` instead of `expect(X).toStrictEqual(Y)` (`assert.deepStrictEqual(X, Y, message)` for `expect(X, message)`).",
      useAssertMovingMessage:
        "Use Vitest's `assert.deepStrictEqual(X, Y, message)` instead of `expect(X, message).toStrictEqual(Y)`. Not fixed automatically: the message would then be evaluated after `Y`, and one of them may have an effect.",
    },
    defaultOptions: [],
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    const vitestAssertFix = createVitestAssertFixer(sourceCode);

    return {
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        if (node.optional || !isToStrictEqualMember(callee)) {
          return;
        }

        const expectCall = skipTypeWrappers(callee.object);

        if (expectCall.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const expectReceiver = getVitestReceiver(
          sourceCode,
          expectCall.callee,
          'expect',
        );

        if (expectReceiver === undefined) {
          return;
        }

        const operands = getExpectOperands(expectCall);

        if (
          operands === undefined ||
          !Arr.isFixedLengthArray(1, node.arguments) ||
          node.arguments[0].type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        const { actual: actualArgument, message: messageArgument } = operands;

        const expectedArgument = node.arguments[0];

        // An asymmetric matcher (`expect.any(Date)`, `expect.arrayContaining`,
        // …), on either side, is understood by `toStrictEqual` alone: Vitest's
        // `assert.deepStrictEqual` compares it as the plain object it is, and
        // it is typed `any`, so the rewrite would type-check and fail.
        if (
          holdsVitestMatcher(sourceCode, expectedArgument) ||
          holdsVitestMatcher(sourceCode, actualArgument)
        ) {
          return;
        }

        const actualText = getArgumentText(sourceCode, actualArgument);

        const expectedText = getArgumentText(sourceCode, expectedArgument);

        const typeArgumentText = getTypeArgumentText(node, sourceCode);

        const expectedWithCast =
          typeArgumentText === undefined
            ? expectedText
            : `(${expectedText}) as ${typeArgumentText}`;

        // `expect(X, message)` keeps its message as the third argument of
        // `assert.deepStrictEqual`, which evaluates it after `Y` rather than
        // before: fixed only when that order cannot matter.
        const isReorderSafe =
          messageArgument === undefined ||
          isStaticLiteral(messageArgument) ||
          isStaticLiteral(expectedArgument) ||
          (!mayHaveEffect(messageArgument, sourceCode) &&
            !mayHaveEffect(expectedArgument, sourceCode));

        const argumentsText = [
          actualText,
          expectedWithCast,
          ...(messageArgument === undefined
            ? []
            : [getArgumentText(sourceCode, messageArgument)]),
        ].join(', ');

        context.report({
          node,
          messageId: isReorderSafe ? 'useAssert' : 'useAssertMovingMessage',
          fix: isReorderSafe
            ? vitestAssertFix(
                node,
                expectReceiver,
                (assertName) =>
                  `${assertName}.deepStrictEqual(${argumentsText})`,
              )
            : null,
        });
      },
    };
  },
} as const;

/** `scope` and every scope nested in it. */
const scopesWithin = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  scope: TSESLint.Scope.Scope,
): readonly TSESLint.Scope.Scope[] =>
  Arr.toUnshifted(scope)(scope.childScopes.flatMap(scopesWithin));

/**
 * Whether `node` reads a member named `expect` other than to call it
 * (`v.expect.any(Date)`, `ctx.expect!.any(Date)`, `v['expect']`, `` v[`expect`] ``,
 * `withTimestamps(ctx.expect)`): a matcher reached through a namespace import,
 * a test context that is not destructured or `import.meta.vitest`, whose
 * binding (`v`, `ctx`, `import.meta`) no reference resolves to Vitest's
 * `expect`. Read by spelling, so a fixture's `c.expect.output` is counted too:
 * a comparison left on `toStrictEqual` costs a missed rewrite, a matcher
 * rewritten to `assert.deepStrictEqual` costs a failing test.
 */
const holdsExpectMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  sourceCode
    .getTokens(node)
    .filter(
      (token) =>
        (token.type === AST_TOKEN_TYPES.Identifier &&
          token.value === 'expect') ||
        ((token.type === AST_TOKEN_TYPES.String ||
          token.type === AST_TOKEN_TYPES.Template) &&
          token.value.slice(1, -1) === 'expect'),
    )
    .some((token) => {
      const atToken = sourceCode.getNodeByRangeIndex(token.range[0]);

      // A template key's token is that of its one element.
      const key =
        atToken?.type === AST_NODE_TYPES.TemplateElement
          ? atToken.parent
          : atToken;

      // A computed key may be wrapped: `v['expect' as const]`.
      const wrappedKey = key === null ? undefined : outermostTypeWrapper(key);

      const member = wrappedKey?.parent;

      return (
        member?.type === AST_NODE_TYPES.MemberExpression &&
        member.property === wrappedKey &&
        !isCallee(member)
      );
    });

/** Whether `node` is inside a `typeof` in a type: it reads no value. */
const isInTypeQuery = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  node.type !== AST_NODE_TYPES.Program &&
  (node.parent.type === AST_NODE_TYPES.TSTypeQuery ||
    isInTypeQuery(node.parent));

/**
 * Whether `node` refers to Vitest's `expect` other than by calling it: a member
 * of it (`expect.any(Date)`, `expect!.not.objectContaining(…)`, through type
 * wrappers) or `expect` handed on as a value (`withTimestamps(expect)`), which
 * is how an asymmetric matcher gets into a value, or a member named `expect`
 * read other than to call it ({@link holdsExpectMember}). A call `expect(…)`, a
 * property key spelled `expect`, a binding that shadows it and a mention in a
 * type (`typeof expect`) are not counted. A member that is no matcher
 * (`expect.getState()`) is counted too, which leaves such a comparison on
 * `toStrictEqual` rather than telling the APIs apart.
 */
const holdsVitestMatcher = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  // From the scope around `node`: one `node` itself opens (a class expression)
  // records its decorators' references in the scope outside it.
  holdsExpectMember(sourceCode, node) ||
  scopesWithin(sourceCode.getScope(node.parent ?? node)).some((scope) =>
    scope.references.some(
      (reference) =>
        reference.isValueReference &&
        reference.identifier.type === AST_NODE_TYPES.Identifier &&
        !isInTypeQuery(reference.identifier) &&
        node.range[0] <= reference.identifier.range[0] &&
        reference.identifier.range[1] <= node.range[1] &&
        !isCallee(reference.identifier) &&
        getVitestReceiver(sourceCode, reference.identifier, 'expect') !==
          undefined,
    ),
  );

/**
 * Whether `node`, through type wrappers, is a literal or a template literal
 * with no substitution: evaluating it reads and runs nothing, so its place in
 * the evaluation order cannot matter.
 */
const isStaticLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const unwrapped = skipTypeWrappers(node);

  return (
    unwrapped.type === AST_NODE_TYPES.Literal ||
    (unwrapped.type === AST_NODE_TYPES.TemplateLiteral &&
      Arr.isEmpty(unwrapped.expressions))
  );
};

/** Whether `callee`, with its type wrappers taken off, is `<x>.toStrictEqual`. */
const isToStrictEqualMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): callee is TSESTree.MemberExpression =>
  callee.type === AST_NODE_TYPES.MemberExpression &&
  !callee.optional &&
  !callee.computed &&
  callee.property.type === AST_NODE_TYPES.Identifier &&
  callee.property.name === 'toStrictEqual';

const getModernTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeArguments')
    ? node.typeArguments
    : undefined;

const getLegacyTypeParameters = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeParameters')
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (node as CallExpressionWithLegacyTypeParameters).typeParameters
    : undefined;

const getTypeArgumentText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): string | undefined => {
  const typeArguments =
    getModernTypeArguments(node) ?? getLegacyTypeParameters(node);

  if (typeArguments === undefined) {
    return undefined;
  }

  const rawText = sourceCode.getText(typeArguments).trim();

  if (rawText.length < 2) {
    return undefined;
  }

  const withoutAngles = rawText
    .replace(/^\s*</u, '')
    .replace(/>\s*$/u, '')
    .trim();

  return withoutAngles.length === 0 ? undefined : withoutAngles;
};
