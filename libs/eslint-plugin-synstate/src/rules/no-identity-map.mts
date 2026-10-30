import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  getRangeWithParens,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { hasCommentWithin } from './comments.mjs';
import { SYNSTATE_MODULE } from './constants.mjs';
import { buildCalleeRewriter, isShadowedCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'identityMap';

/**
 * `map` passes on a result only when it is not `Object.is` the one it holds,
 * so `map((x) => x)` changes no value and only stops a repeated one: it is
 * `skipIfNoChange()` under a name that says it does nothing. The rule
 * rewrites it to `skipIfNoChange()`, which keeps what it does and says so.
 *
 * Reported: `map` given one function, not `async`, that returns its one
 * parameter — an arrow, or a function whose body is that `return`. A `map`
 * given `equals` is left alone, since its author has said how results
 * compare. Type syntax in the call — an annotated parameter or return type,
 * type arguments, `as`, `satisfies` or `!` around the function or the
 * result — may be what the `map` is written for, so such a call is reported
 * without a fix.
 */
export const noIdentityMap: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `skipIfNoChange()` instead of `map((x) => x)`, which changes no value and only stops a repeated one.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      identityMap:
        '`map((x) => x)` changes no value; it only stops a value `Object.is` the one before, which is what `skipIfNoChange()` says. Use `skipIfNoChange()`, or remove the operator when nothing needs stopping.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const imports = getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE);

    if (imports.length === 0) {
      return {};
    }

    const resolveCallee = buildCalleeResolver(imports);

    const rewriteCallee = buildCalleeRewriter(
      sourceCode,
      imports,
      'skipIfNoChange',
    );

    return {
      CallExpression: (node) => {
        const resolved = resolveCallee(node.callee);

        if (
          resolved?.canonicalName !== 'map' ||
          node.arguments.length !== 1 ||
          isShadowedCallee(sourceCode, node.callee)
        ) {
          return;
        }

        const [argument] = node.arguments;

        if (argument === undefined) {
          return;
        }

        const identity = identityOf(argument);

        if (identity === undefined) {
          return;
        }

        // What follows the callee becomes `()`; a comment there would go with
        // it. One around the callee is `buildCalleeRewriter`'s to refuse.
        const replaced = [
          getRangeWithParens(sourceCode, node.callee)[1],
          node.range[1],
        ] as const;

        const fixable =
          !identity.hasTypeSyntax &&
          node.typeArguments === undefined &&
          !node.optional &&
          !hasCommentWithin(sourceCode, node, [replaced]);

        const calleeRewrite = fixable
          ? rewriteCallee(node, resolved)
          : undefined;

        context.report({
          node,
          messageId: 'identityMap',
          fix:
            calleeRewrite === undefined
              ? null
              : (fixer) => [
                  ...calleeRewrite(fixer),
                  fixer.replaceTextRange(replaced, '()'),
                ],
        });
      },
    };
  },
} as const;

/**
 * Whether `argument`, read through its type wrappers, is a function that
 * returns its one parameter, and whether type syntax is written anywhere on
 * the way: around the function or the result, or on the parameter or the
 * return type. `undefined` when it is not such a function. `prefer-derive`
 * reads it too, to leave such a `map` to this rule.
 */
export const identityOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  argument: TSESTree.CallExpressionArgument,
): Readonly<{ hasTypeSyntax: boolean }> | undefined => {
  const fn = skipTypeWrappers(argument);

  if (
    (fn.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
      fn.type !== AST_NODE_TYPES.FunctionExpression) ||
    fn.async ||
    fn.generator
  ) {
    return undefined;
  }

  const [param, ...rest] = fn.params;

  if (
    param?.type !== AST_NODE_TYPES.Identifier ||
    rest.length > 0 ||
    // `function (this: T, x)` passes `x` second.
    param.name === 'this'
  ) {
    return undefined;
  }

  const result = returnedExpressionOf(fn.body);

  if (result === undefined) {
    return undefined;
  }

  const unwrapped = skipTypeWrappers(result);

  return unwrapped.type === AST_NODE_TYPES.Identifier &&
    unwrapped.name === param.name
    ? {
        hasTypeSyntax:
          fn !== argument ||
          unwrapped !== result ||
          param.typeAnnotation !== undefined ||
          fn.returnType !== undefined,
      }
    : undefined;
};

/** The expression `body` returns, when that is all it does. */
const returnedExpressionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  body: TSESTree.BlockStatement | TSESTree.Expression,
): TSESTree.Expression | undefined => {
  if (body.type !== AST_NODE_TYPES.BlockStatement) {
    return body;
  }

  const [statement, ...rest] = body.body;

  return statement?.type === AST_NODE_TYPES.ReturnStatement &&
    rest.length === 0 &&
    statement.argument !== null
    ? statement.argument
    : undefined;
};
