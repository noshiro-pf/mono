import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers, typeHoldsAtSomeLayer } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'emptyRejectionHandler';

/**
 * Disallow an empty rejection handler, `p.catch(() => {})` or
 * `p.then(f, () => {})`, which drops a rejection without a trace.
 *
 * `@typescript-eslint/no-floating-promises` takes such a promise as handled, so
 * a failure behind it leaves no log at all. The handler is reported when its
 * body is an empty block, a comment in it included (the comment belongs on a
 * disable directive), as an arrow function or a `function` expression, with or
 * without parameters, through `as`, `satisfies`, `!`, `<T>` and parentheses,
 * and only on a receiver that is thenable at some layer of type wrappers: a
 * cast does not make a promise anything else.
 *
 * `() => undefined` is not reported: it is the spelling of a rejection read as
 * absent on purpose, which the message names.
 */
export const noEmptyRejectionHandler: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow an empty rejection handler (`p.catch(() => {})`), which drops a rejection without a trace while `no-floating-promises` takes it as handled',
      },
      schema: [],
      messages: {
        emptyRejectionHandler:
          'An empty rejection handler drops the rejection without a trace. Handle or log it, or write `() => undefined` where dropping it is meant.',
      },
      defaultOptions: [],
    },

    create: (context) => ({
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const method = methodNameOf(callee);

        const handler =
          method === 'catch'
            ? node.arguments[0]
            : method === 'then'
              ? node.arguments[1]
              : undefined;

        if (
          handler === undefined ||
          handler.type === AST_NODE_TYPES.SpreadElement ||
          !isEmptyFunction(skipTypeWrappers(handler)) ||
          !typeHoldsAtSomeLayer(context.sourceCode, callee.object, isThenable)
        ) {
          return;
        }

        context.report({ node: handler, messageId: 'emptyRejectionHandler' });
      },
    }),
  } as const;

/** The name of the method `member` reads, a non-computed key or a string one. */
const methodNameOf = (
  member: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined =>
  !member.computed && member.property.type === AST_NODE_TYPES.Identifier
    ? member.property.name
    : member.computed &&
        member.property.type === AST_NODE_TYPES.Literal &&
        typeof member.property.value === 'string'
      ? member.property.value
      : undefined;

/** An arrow function or a `function` expression whose body is an empty block. */
const isEmptyFunction = (node: DeepReadonly<TSESTree.Node>): boolean =>
  (node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionExpression) &&
  node.body.type === AST_NODE_TYPES.BlockStatement &&
  Arr.isEmpty(node.body.body);

/**
 * Whether `type`, or a member of it as a union, has a callable `then`: a value
 * that may be a promise.
 */
const isThenable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a checker type
  type: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the checker
  checker: ts.TypeChecker,
): boolean => {
  if (type.isUnion()) {
    return type.types.some((member) => isThenable(member, checker));
  }

  const then = type.getProperty('then');

  return (
    then !== undefined &&
    Arr.isNonEmpty(
      checker
        .getNonNullableType(checker.getTypeOfSymbol(then))
        .getCallSignatures(),
    )
  );
};
