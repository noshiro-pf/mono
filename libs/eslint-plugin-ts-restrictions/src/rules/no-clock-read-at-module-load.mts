import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  asNode,
  isRuntimeBound,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { memberName, namePath, unwrapCallee } from './callee-path.mjs';

type Options = readonly [
  Readonly<{
    functions?: readonly string[];
  }>?,
];

type MessageIds = 'clockReadAtModuleLoad';

/**
 * Disallow reading the clock when a module loads.
 *
 * ## Why
 *
 * A value computed at module load is computed once, and kept as long as the
 * module is: a page left open past midnight, or a server instance that lives for
 * days, keeps offering the day it loaded. Read the clock where the value is
 * used, in a function.
 *
 * ## What it sees
 *
 * `Date.now()` and `new Date` with no argument, of the global `Date` (also as
 * `globalThis.Date`), and the further callees named in `functions`, when the
 * call runs as the module is evaluated: outside every function body, or inside
 * one invoked where it is written (`(() => …)()`), or in a `static` field or
 * block of a class that is itself evaluated then. A default parameter, a method
 * and an instance field run later, on a call or a construction.
 *
 * The callee is read through `as` / `satisfies` / `!` / `<T>`, `?.` and
 * string-keyed computed members. It is matched by the name written at the call,
 * so a clock read behind a function that is called at load (`const d =
 * makeDefault()`) is not seen, nor is `const D = Date`; name such a function in
 * `functions` when it reads the clock itself.
 *
 * ## Options
 *
 * `functions` names further callees that read the clock, called or constructed,
 * as dotted paths (`'DateUtils.today'`).
 */
export const noClockReadAtModuleLoad: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow reading the clock (`Date.now()`, `new Date()`) when a module loads, which keeps that moment for as long as the module lives',
      },
      schema: [
        {
          type: 'object',
          properties: {
            functions: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Further callees that read the clock, called or constructed, as dotted paths such as `DateUtils.today`.',
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        clockReadAtModuleLoad:
          '`{{callee}}` here runs once, when the module loads, and keeps that moment for as long as the module lives. Read the clock where the value is used, in a function.',
      },
      defaultOptions: [{}],
    },

    create: (context) => {
      const functions: ReadonlySet<string> = new Set(
        context.options[0]?.functions,
      );

      /** Whether `node` names the global `Date`, as `Date` or `globalThis.Date`. */
      const isGlobalDate = (node: DeepReadonly<TSESTree.Node>): boolean => {
        const path = namePath(node);

        const root =
          path === 'Date'
            ? 'Date'
            : path === 'globalThis.Date'
              ? 'globalThis'
              : undefined;

        return (
          root !== undefined &&
          !isRuntimeBound(context.sourceCode, asNode(node), root)
        );
      };

      /** The name `node` is reported under, or `undefined` if it reads no clock. */
      const clockCallee = (
        node: DeepReadonly<TSESTree.CallExpression | TSESTree.NewExpression>,
      ): string | undefined => {
        const callee = unwrapCallee(node.callee);

        if (node.type === AST_NODE_TYPES.NewExpression) {
          if (Arr.isEmpty(node.arguments) && isGlobalDate(callee)) {
            return 'new Date';
          }
        } else if (
          callee.type === AST_NODE_TYPES.MemberExpression &&
          memberName(callee) === 'now' &&
          isGlobalDate(callee.object)
        ) {
          return 'Date.now';
        }

        const path = namePath(callee);

        return path !== undefined && functions.has(path) ? path : undefined;
      };

      const check = (
        node: DeepReadonly<TSESTree.CallExpression | TSESTree.NewExpression>,
      ): void => {
        // The name first: the walk up is paid only by a clock read.
        const callee = clockCallee(node);

        if (callee === undefined || !runsAtModuleLoad(node)) {
          return;
        }

        context.report({
          node: asNode(node),
          messageId: 'clockReadAtModuleLoad',
          data: { callee },
        });
      };

      return {
        NewExpression: check,
        CallExpression: check,
      };
    },
  } as const;

/** The outermost of the type wrappers around `node`, or `node` itself. */
const outsideTypeWrappers = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> =>
  node.parent !== undefined && isTypeWrapper(node.parent)
    ? outsideTypeWrappers(node.parent)
    : node;

/**
 * Whether the function `node` is called or constructed by the expression it is
 * written in, through type wrappers: `(() => …)()`, `new (function () {})()`.
 */
const isInvokedWhereWritten = (
  node: DeepReadonly<
    TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
  >,
): boolean => {
  const invoker = outsideTypeWrappers(node).parent;

  return (
    invoker !== undefined &&
    (invoker.type === AST_NODE_TYPES.CallExpression ||
      invoker.type === AST_NODE_TYPES.NewExpression) &&
    skipTypeWrappers(invoker.callee) === node
  );
};

/**
 * Whether `node` is evaluated as its module is: no function body lies between
 * it and the program, but one invoked where it is written, and a class field or
 * block on the way is `static`.
 */
const runsAtModuleLoad = (node: DeepReadonly<TSESTree.Node>): boolean => {
  // The program's `parent` is `null` at run time, whatever its type says.
  if (node.type === AST_NODE_TYPES.Program) {
    return true;
  }

  const { parent } = node;

  if (parent.type === AST_NODE_TYPES.FunctionDeclaration) {
    return false;
  }

  // Its parameters and body run when it is called.
  if (
    parent.type === AST_NODE_TYPES.FunctionExpression ||
    parent.type === AST_NODE_TYPES.ArrowFunctionExpression
  ) {
    return isInvokedWhereWritten(parent) && runsAtModuleLoad(parent);
  }

  // An instance field's value is computed on each construction; a static one's,
  // and a computed key, when the class is.
  if (
    parent.type === AST_NODE_TYPES.PropertyDefinition ||
    parent.type === AST_NODE_TYPES.AccessorProperty
  ) {
    return (parent.value !== node || parent.static) && runsAtModuleLoad(parent);
  }

  return runsAtModuleLoad(parent);
};
