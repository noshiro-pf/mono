import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  getRangeWithParens,
  isTypeWrapper,
  skipTypeWrappers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
import { hasCommentWithin } from './comments.mjs';
import { SYNSTATE_MODULE } from './constants.mjs';
import { pipeCallOf } from './functions.mjs';
import { identityOf } from './no-identity-map.mjs';
import { constantBodyOf } from './prefer-map-to.mjs';
import { buildCalleeRewriter, isShadowedCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'preferDerive';

/**
 * `combine(parents).pipe(map(fn))` is two observables, and `combine` builds a
 * tuple on every update for `map` to take apart. `derive(parents, fn)` is one
 * observable that calls `fn` with the parents' values as arguments and stops a
 * result `Object.is` the one it holds, as `map` does; `map`'s `equals` becomes
 * `derive`'s.
 *
 * Every such `.pipe` with `map` as its one operator is reported, unless the
 * `map` is one `prefer-map-to` or `no-identity-map` reports (`map(() => c)`,
 * `map((xs) => xs)`). The fix is offered when the mapping function is an arrow
 * function whose one parameter is an array pattern (`([a, b]) =>`, which
 * becomes `(a, b) =>`) or a name (`(xs) =>`, which becomes `(...xs) =>`), with
 * no type annotation, default or `?`, and nothing else is written between the
 * calls: no type wrapper, no parentheses around `combine(...)` or its `.pipe`,
 * no type arguments, no comment.
 */
export const preferDerive: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `derive(parents, fn)` instead of `combine(parents).pipe(map(fn))`, which is two observables and builds a tuple on every update.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferDerive:
        '`combine(...).pipe(map(...))` is two observables and builds a tuple on every update. Use `derive(parents, (a, b) => ...)`, which is one observable and passes the values as arguments.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const imports = getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE);

    const resolveCallee = buildCalleeResolver(imports);

    const rewriteCallee = buildCalleeRewriter(sourceCode, imports, 'derive');

    /** `expression` as a call of synstate's export among `names`. */
    const synstateCallOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Node,
      names: readonly string[],
    ):
      | Readonly<{ call: TSESTree.CallExpression; resolved: ResolvedCallee }>
      | undefined => {
      const call = skipTypeWrappers(expression);

      if (call.type !== AST_NODE_TYPES.CallExpression) {
        return undefined;
      }

      const resolved = resolveCallee(call.callee);

      return resolved !== undefined &&
        names.includes(resolved.canonicalName) &&
        !isShadowedCallee(sourceCode, call.callee)
        ? { call, resolved }
        : undefined;
    };

    return {
      CallExpression: (node) => {
        const pipe = pipeCallOf(node);

        if (pipe === undefined) {
          return;
        }

        const combine = synstateCallOf(pipe.receiver, [
          'combine',
          'combineLatest',
        ]);

        const map = synstateCallOf(pipe.operator, ['map']);

        if (
          combine === undefined ||
          map === undefined ||
          !hasPlainArguments(combine.call, 1) ||
          !(hasPlainArguments(map.call, 1) || hasPlainArguments(map.call, 2)) ||
          isOtherRulesMap(sourceCode, map.call)
        ) {
          return;
        }

        const calleeRewrite = rewriteCallee(combine.call, combine.resolved);

        const edits =
          calleeRewrite === undefined
            ? undefined
            : rewriteOf(sourceCode, node, combine.call, map.call);

        context.report({
          node,
          messageId: 'preferDerive',
          fix:
            calleeRewrite === undefined || edits === undefined
              ? null
              : (fixer) => [
                  ...calleeRewrite(fixer),
                  ...edits.map(({ range, text }) =>
                    fixer.replaceTextRange(range, text),
                  ),
                ],
        });
      },
    };
  },
} as const;

type Edit = Readonly<{ range: TSESTree.Range; text: string }>;

/**
 * What rewrites the parameter of `fn` from the tuple `combine` emits to the
 * values `derive` passes: `[a, b]` to `a, b`, `xs` to `...xs`. `undefined` when
 * it cannot: a type annotation, a default, a `?`, a hole, type parameters, or
 * other than one parameter.
 */
const paramsEditOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: TSESTree.ArrowFunctionExpression,
): readonly Edit[] | undefined => {
  if (fn.async || fn.typeParameters !== undefined || fn.params.length > 1) {
    return undefined;
  }

  const [param] = fn.params;

  if (param === undefined) {
    return [];
  }

  // `(xs,) =>` would become `(...xs,) =>`, which does not parse.
  if (sourceCode.getTokenAfter(param)?.value === ',') {
    return undefined;
  }

  if (
    param.type === AST_NODE_TYPES.ArrayPattern &&
    param.typeAnnotation === undefined &&
    // `([a, b]?) =>`: the `?` is inside the range sliced below.
    !param.optional &&
    param.elements.every((element) => element !== null)
  ) {
    return [
      {
        range: param.range,
        text: sourceCode.text.slice(param.range[0] + 1, param.range[1] - 1),
      },
    ];
  }

  if (
    param.type === AST_NODE_TYPES.Identifier &&
    param.typeAnnotation === undefined &&
    // `(...xs?) =>` does not parse.
    !param.optional
  ) {
    // `xs => ...` has no parentheses, which a rest parameter needs.
    const parenthesized = sourceCode.getFirstToken(fn)?.value === '(';

    return [
      {
        range: param.range,
        text: parenthesized ? `...${param.name}` : `(...${param.name})`,
      },
    ];
  }

  return undefined;
};

/**
 * The edits, the callee aside, that turn `combine(parents).pipe(map(fn,
 * options))` into `derive(parents, fn', options)`, or `undefined` when the fix
 * is not offered (see {@link preferDerive}).
 */
const rewriteOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  combine: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  map: TSESTree.CallExpression,
): readonly Edit[] | undefined => {
  const callee = node.callee;

  const [parents] = combine.arguments;

  const [fn] = map.arguments;

  const last = map.arguments.at(-1);

  if (
    parents === undefined ||
    last === undefined ||
    node.arguments[0] !== map ||
    // `combine<OS>` would become `derive<OS>`, which takes two, and a type
    // argument of `pipe` or `map` would be dropped.
    combine.typeArguments !== undefined ||
    node.typeArguments !== undefined ||
    map.typeArguments !== undefined ||
    // A wrapper written for the type of `map` would go with it (one around
    // `combine` is `buildCalleeRewriter`'s to refuse).
    isTypeWrapper(map.callee) ||
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    callee.object !== combine ||
    fn?.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
    // Parentheses around `combine(...)` or `combine(...).pipe` would be left
    // unbalanced.
    getRangeWithParens(sourceCode, combine)[0] !== combine.range[0] ||
    getRangeWithParens(sourceCode, callee)[0] !== callee.range[0]
  ) {
    return undefined;
  }

  const params = paramsEditOf(sourceCode, fn);

  if (params === undefined) {
    return undefined;
  }

  // What lies between `parents` and `fn`, and after the last argument of `map`,
  // goes: `).pipe(map(` and `))`. A comment there would go with it.
  const between: TSESTree.Range = [
    getRangeWithParens(sourceCode, parents)[1],
    getRangeWithParens(sourceCode, fn)[0],
  ] as const;

  const after: TSESTree.Range = [
    getRangeWithParens(sourceCode, last)[1],
    node.range[1],
  ] as const;

  return hasCommentWithin(sourceCode, node, [between, after])
    ? undefined
    : [{ range: between, text: ', ' }, ...params, { range: after, text: ')' }];
};

/**
 * Whether `map` is one another rule reports: a `map` to a constant
 * (`prefer-map-to`), a value that never changes after its first emission, which
 * `derive(parents, () => c)` would hide, or an identity `map`
 * (`no-identity-map`), which would become `combine` written as
 * `derive(parents, (...xs) => xs)`.
 */
const isOtherRulesMap = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  map: TSESTree.CallExpression,
): boolean => {
  const [fn] = map.arguments;

  return (
    fn !== undefined &&
    map.arguments.length === 1 &&
    (constantBodyOf(sourceCode, fn) !== undefined ||
      identityOf(fn) !== undefined)
  );
};

/** Whether `call` has `count` arguments, none of them spread. */
const hasPlainArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  call: TSESTree.CallExpression,
  count: number,
): boolean =>
  call.arguments.length === count &&
  call.arguments.every(
    (argument) => argument.type !== AST_NODE_TYPES.SpreadElement,
  );
