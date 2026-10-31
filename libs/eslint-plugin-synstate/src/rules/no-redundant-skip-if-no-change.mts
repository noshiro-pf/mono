import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  getRangeWithParens,
  isIdentifierNamed,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { hasCommentWithin } from './comments.mjs';
import { SYNSTATE_MODULE } from './constants.mjs';
import { pipeCallOf } from './functions.mjs';
import { isShadowedCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'redundantSkipIfNoChange';

/**
 * `map` passes on a result only when it is not `Object.is` the one it holds, so
 * a `skipIfNoChange()` piped straight after it compares what `map` has already
 * compared, and costs one more observable for nothing. The same holds after the
 * operators synstate builds on `map` (`pluck`, `unwrapResultOk`, …) and after a
 * `skipIfNoChange()` that compares with `Object.is` itself: of the values it
 * passes on, none is `Object.is` the one before.
 *
 * Only `skipIfNoChange()` with no comparison or with `Object.is` (or its alias
 * `distinctUntilChanged`) is reported, piped directly onto `x.pipe(op)` where
 * `op` is one of those: a `map` given no `equals`, an operator built on `map`,
 * or `skipIfNoChange` comparing with `Object.is`. A `map` with `equals` may
 * pass equal results on, a comparison of its own may stop more than
 * `Object.is`, and `mapTo` emits on every source value.
 */
export const noRedundantSkipIfNoChange: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `skipIfNoChange()` directly after `map`, an operator built on it, or another `skipIfNoChange()`, which already stop a value equal to the one before.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      redundantSkipIfNoChange:
        '`{{operator}}` already stops a value equal (`Object.is`) to the one before it, so this `skipIfNoChange()` compares again for nothing. Remove it.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const resolveCallee = buildCalleeResolver(
      getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE),
    );

    /** Whether `expression` calls synstate's export `name`. */
    const callsSynstate = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Node,
      names: readonly string[],
    ): expression is TSESTree.CallExpression => {
      const unwrapped = skipTypeWrappers(expression);

      if (unwrapped.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      const canonicalName = resolveCallee(unwrapped.callee)?.canonicalName;

      return (
        canonicalName !== undefined &&
        names.includes(canonicalName) &&
        !isShadowedCallee(sourceCode, unwrapped.callee)
      );
    };

    return {
      CallExpression: (node) => {
        const pipe = pipeCallOf(node);

        if (pipe === undefined) {
          return;
        }

        const skip = skipTypeWrappers(pipe.operator);

        if (
          !callsSynstate(skip, ['skipIfNoChange', 'distinctUntilChanged']) ||
          !comparesWithObjectIs(skip.arguments)
        ) {
          return;
        }

        const inner = pipeCallOf(skipTypeWrappers(pipe.receiver));

        if (inner === undefined) {
          return;
        }

        const upstream = skipTypeWrappers(inner.operator);

        if (
          !callsSynstate(upstream, [
            'map',
            ...builtOnMap,
            'skipIfNoChange',
            'distinctUntilChanged',
          ])
        ) {
          return;
        }

        const operator = resolveCallee(upstream.callee)?.canonicalName;

        if (
          operator === undefined ||
          (operator === 'map' && upstream.arguments.length > 1) ||
          ((operator === 'skipIfNoChange' ||
            operator === 'distinctUntilChanged') &&
            !comparesWithObjectIs(upstream.arguments))
        ) {
          return;
        }

        // What goes is everything after the mapped observable, type wrappers
        // and parentheses around it kept: `.pipe(skipIfNoChange())`.
        const removed = [
          getRangeWithParens(sourceCode, pipe.receiver)[1],
          node.range[1],
        ] as const;

        // A wrapper or parentheses around `x.pipe` would lose their closing
        // half with it.
        const fixable =
          !isTypeWrapper(node.callee) &&
          getRangeWithParens(sourceCode, node.callee)[0] ===
            node.callee.range[0] &&
          !hasCommentWithin(sourceCode, node, [removed]);

        context.report({
          node: skip,
          messageId: 'redundantSkipIfNoChange',
          data: { operator },
          fix: fixable ? (fixer) => fixer.removeRange(removed) : null,
        });
      },
    };
  },
} as const;

/**
 * The operators synstate builds on `map` with no `equals`, which therefore stop
 * a result `Object.is` the one they hold.
 */
const builtOnMap = [
  'pluck',
  'getKey',
  'mapOptional',
  'mapResultOk',
  'mapResultErr',
  'unwrapOptional',
  'unwrapResultOk',
  'unwrapResultErr',
] as const;

/** Whether `skipIfNoChange(...)` compares with `Object.is`: given nothing, or `Object.is`. */
const comparesWithObjectIs = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  args: readonly TSESTree.CallExpressionArgument[],
): boolean => {
  const [comparison, ...rest] = args;

  if (comparison === undefined) {
    return true;
  }

  if (rest.length > 0 || comparison.type === AST_NODE_TYPES.SpreadElement) {
    return false;
  }

  const unwrapped = skipTypeWrappers(comparison);

  return (
    unwrapped.type === AST_NODE_TYPES.MemberExpression &&
    !unwrapped.computed &&
    isIdentifierNamed(unwrapped.object, 'Object') &&
    isIdentifierNamed(unwrapped.property, 'is')
  );
};
