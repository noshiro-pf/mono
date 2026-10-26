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
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';
import { isShadowedCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'redundantSkipIfNoChange';

/**
 * `map` passes on a result only when it is not `Object.is` the one it holds,
 * so a `skipIfNoChange()` piped straight after it compares what `map` has
 * already compared, and costs one more observable for nothing.
 *
 * Only `skipIfNoChange()` with no comparison or with `Object.is` (or its alias
 * `distinctUntilChanged`) is reported, piped directly onto `x.pipe(map(f))`
 * where that `map` is given no `equals`. A `map` with `equals` may pass equal
 * results on, and a comparison of its own may stop more than `Object.is`.
 */
export const noRedundantSkipIfNoChange: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `skipIfNoChange()` directly after `map`, which already stops a result equal to the one it holds.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      redundantSkipIfNoChange:
        '`map` already stops a result equal (`Object.is`) to the one it holds, so this `skipIfNoChange()` compares again for nothing. Remove it.',
    },
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

        const mapCall = skipTypeWrappers(inner.operator);

        if (!callsSynstate(mapCall, ['map']) || mapCall.arguments.length > 1) {
          return;
        }

        // What goes is everything after the mapped observable, type wrappers
        // and parentheses around it kept: `.pipe(skipIfNoChange())`.
        const removed = [
          getRangeWithParens(sourceCode, pipe.receiver)[1],
          node.range[1],
        ] as const;

        const hasComment = sourceCode
          .getAllComments()
          .some(
            (comment) =>
              removed[0] <= comment.range[0] && comment.range[1] <= removed[1],
          );

        context.report({
          node: skip,
          messageId: 'redundantSkipIfNoChange',
          fix: hasComment ? null : (fixer) => fixer.removeRange(removed),
        });
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * `node` as `receiver.pipe(operator)`, or `undefined` when it is not a `.pipe`
 * call with one argument.
 */
const pipeCallOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
):
  | Readonly<{
      receiver: TSESTree.Expression;
      operator: TSESTree.Expression;
    }>
  | undefined => {
  if (
    node.type !== AST_NODE_TYPES.CallExpression ||
    node.arguments.length !== 1
  ) {
    return undefined;
  }

  const [operator] = node.arguments;

  if (
    operator === undefined ||
    operator.type === AST_NODE_TYPES.SpreadElement
  ) {
    return undefined;
  }

  const callee = skipTypeWrappers(node.callee);

  return callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    isIdentifierNamed(callee.property, 'pipe')
    ? { receiver: callee.object, operator }
    : undefined;
};

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
