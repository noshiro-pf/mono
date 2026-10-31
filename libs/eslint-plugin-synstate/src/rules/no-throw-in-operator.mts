import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';
import {
  enclosingFunctionOf,
  isPipeArgument,
  localFunctionOf,
  type FunctionNode,
} from './functions.mjs';
import { isShadowedCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'throwInOperator' | 'throwThroughCall';

/**
 * A synstate operator calls its functions while an update propagates, and
 * nothing in synstate catches what they throw: the exception stops the update
 * where it is and reaches whoever wrote to the source. The nodes the update
 * already reached hold the new value and the rest keep the old one, until the
 * next update. A pure function that returns a `Result` keeps the failure a
 * value, which the graph carries on like any other.
 *
 * Reported: a `throw` directly in a function passed to a synstate operator
 * called in `.pipe(…)` — as an argument, or as a property of an options object
 * (`map(f, { equals })`) — unless a `try` with a `catch` in the same
 * function encloses it. A function passed by name counts when this file
 * defines it, and so does a function of this file the callback calls, at any
 * depth, reported at the call. A throw in a function the callback only defines,
 * or in an `async` function, does not run in the update and is not reported. A
 * call that throws without a `throw` of this file is not seen.
 *
 * The cost is one look at each call and each `throw`; nothing is followed
 * unless the file has a `throw`.
 */
export const noThrowInOperator: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `throw` in a function passed to a synstate operator, which stops the update midway; return a `Result` instead.',
    },
    schema: [],
    messages: {
      throwInOperator:
        'This throws in a function a synstate operator calls while an update propagates. The exception stops the update midway: the nodes it already reached hold the new value, the rest keep the old one, and the error reaches whoever wrote to the source. Make the function pure and return a `Result` (`Result.err(...)`) instead, and handle the error downstream (`mapResultOk`, `unwrapResultOk`, `filter(Result.isOk)`).',
      throwThroughCall:
        'This calls `{{name}}`, which throws, in a function a synstate operator calls while an update propagates. The exception stops the update midway: the nodes it already reached hold the new value, the rest keep the old one, and the error reaches whoever wrote to the source. Make `{{name}}` return a `Result` (`Result.err(...)`) instead, and handle the error downstream (`mapResultOk`, `unwrapResultOk`, `filter(Result.isOk)`).',
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

    // What the traversal sees is only collected; it is read at the end, and
    // only in a file that has a `throw`, which most do not.

    const mut_throwStatements: TSESTree.ThrowStatement[] = [];

    const mut_namedCalls: TSESTree.CallExpression[] = [];

    const mut_operatorCalls: TSESTree.CallExpression[] = [];

    return {
      ThrowStatement: (node) => {
        mut_throwStatements.push(node);
      },

      CallExpression: (node) => {
        if (skipTypeWrappers(node.callee).type === AST_NODE_TYPES.Identifier) {
          mut_namedCalls.push(node);
        }

        if (resolveCallee(node.callee) !== undefined) {
          mut_operatorCalls.push(node);
        }
      },

      'Program:exit': () => {
        if (mut_throwStatements.length === 0) {
          return;
        }

        /** The `throw`s each function makes, outside nested functions and `try`. */
        const throwsIn = groupByEscapingFunction(mut_throwStatements);

        /** The calls by name each function makes, outside nested functions and `try`. */
        const callsIn = groupByEscapingFunction(mut_namedCalls);

        /** Whether a function of this file throws, itself or through a call. */
        const mut_throws = new Map<FunctionNode, boolean>();

        const calleeFunctionOf = (
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          call: TSESTree.CallExpression,
        ): FunctionNode | undefined => localFunctionOf(sourceCode, call.callee);

        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        const throws = (fn: FunctionNode): boolean => {
          const known = mut_throws.get(fn);

          if (known !== undefined) {
            return known;
          }

          // A recursive call adds nothing to what the function does.
          mut_throws.set(fn, false);

          const result =
            runsWhenCalled(fn) &&
            (throwsIn.has(fn) ||
              (callsIn.get(fn) ?? []).some((call) => {
                const callee = calleeFunctionOf(call);

                return callee !== undefined && throws(callee);
              }));

          mut_throws.set(fn, result);

          return result;
        };

        /** The functions synstate operators call while an update propagates. */
        const callbacks = new Set(
          mut_operatorCalls
            .filter(
              (call) =>
                !isShadowedCallee(sourceCode, call.callee) &&
                isPipeArgument(call),
            )
            .flatMap((call) => call.arguments.flatMap(functionValuesOf))
            .flatMap((expression) => {
              const callback = localFunctionOf(sourceCode, expression);

              return callback === undefined ? [] : [callback];
            }),
        );

        for (const callback of callbacks) {
          if (!runsWhenCalled(callback)) {
            continue;
          }

          for (const node of throwsIn.get(callback) ?? []) {
            context.report({ node, messageId: 'throwInOperator' });
          }

          for (const call of callsIn.get(callback) ?? []) {
            const callee = calleeFunctionOf(call);

            if (callee === undefined || !throws(callee)) {
              continue;
            }

            // Only a call by name is recorded.
            const name = skipTypeWrappers(call.callee);

            context.report({
              node: call,
              messageId: 'throwThroughCall',
              data: {
                name: sourceCode.getText(name),
              },
            });
          }
        }
      },
    };
  },
} as const;

/**
 * Whether the body of `fn` runs when it is called. An `async` function's
 * `throw` rejects the promise it returns, and a generator's waits for the first
 * `next()`.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const runsWhenCalled = (fn: FunctionNode): boolean =>
  !fn.async && !fn.generator;

/**
 * The function whose caller `node` throws to, or a call made in it can throw
 * to: the function enclosing it, unless a `try` with a `catch` of that
 * function encloses `node` first. `undefined` at the top level.
 */
const escapingFunctionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): FunctionNode | undefined => {
  const fn = enclosingFunctionOf(node);

  if (fn === undefined) {
    return undefined;
  }

  let mut_child: TSESTree.Node = node;

  while (mut_child.parent !== undefined && mut_child.parent !== fn) {
    const parent: TSESTree.Node = mut_child.parent;

    if (
      parent.type === AST_NODE_TYPES.TryStatement &&
      parent.block === mut_child &&
      parent.handler !== null
    ) {
      return undefined;
    }

    mut_child = parent;
  }

  return fn;
};

/**
 * The expressions in an argument of an operator that may be functions it calls:
 * the argument, or each property of an options object (`map(f, { equals })`).
 */
const functionValuesOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  argument: TSESTree.CallExpressionArgument,
): readonly TSESTree.Node[] => {
  const unwrapped = skipTypeWrappers(argument);

  return unwrapped.type === AST_NODE_TYPES.ObjectExpression
    ? unwrapped.properties.flatMap((property) =>
        property.type === AST_NODE_TYPES.Property ? [property.value] : [],
      )
    : [argument];
};

/** `nodes` by {@link escapingFunctionOf}, leaving out those it has none for. */
const groupByEscapingFunction = <N extends TSESTree.Node>(
  nodes: readonly N[],
): ReadonlyMap<FunctionNode, readonly N[]> => {
  const mut_groups = new Map<FunctionNode, N[]>();

  for (const node of nodes) {
    const fn = escapingFunctionOf(node);

    if (fn === undefined) {
      continue;
    }

    const mut_group = mut_groups.get(fn);

    if (mut_group === undefined) {
      mut_groups.set(fn, [node]);
    } else {
      mut_group.push(node);
    }
  }

  return mut_groups;
};
