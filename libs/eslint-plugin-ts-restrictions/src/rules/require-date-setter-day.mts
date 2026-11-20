import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { asNode, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { memberName, unwrapCallee } from './callee-path.mjs';

type Options = readonly [];

type MessageIds = 'missingDay' | 'missingMonthAndDay';

/**
 * Require the day in a call of `Date`'s `setMonth` / `setUTCMonth`, and the
 * month and day in a call of `setFullYear` / `setUTCFullYear`.
 *
 * ## Why
 *
 * A setter given fewer arguments keeps the date's day of the month, and a day
 * the target month does not have rolls into the next one: 31 January set to
 * February is 3 March, and 29 February set to 2027 is 1 March. Set the year,
 * month and day in one call, the day clamped to the target month. There is no
 * fix, since the clamping is the caller's.
 *
 * ## What it sees
 *
 * The callee is read through `as`, `satisfies`, `!`, `<T>`, parentheses and
 * `?.`, however many are stacked, and through a string-literal or
 * template-literal key (`d['setMonth']`). `Date.prototype.setMonth.call(d, m)`
 * and `.apply(d, [m])` are counted from their arguments after the first; an
 * `apply` whose array is not written as an array literal cannot be counted and
 * is left alone. A call with a spread argument may pass every argument and is
 * left alone too.
 *
 * The method has to be `Date`'s own, declared by the standard library, which a
 * subclass of `Date` inherits: another object with a `setMonth` method is not
 * reported.
 */
export const requireDateSetterDay: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require the day in `Date`'s `setMonth` and the month and day in `setFullYear`, without which a day the target month lacks rolls into the next month",
    },
    schema: [],
    messages: {
      missingDay:
        '`{{method}}` without the day keeps the day of the month, so 31 January set to February rolls into March. Pass the day too, clamped to the target month.',
      missingMonthAndDay:
        '`{{method}}` without the month and day keeps them, so 29 February set to another year rolls into March. Pass the month and day too, the day clamped to the target month.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    /**
     * Whether the member `name` of `object` is a method `Date` declares in the
     * standard library, for every type `object` may have.
     */
    const isDateMethod = (
      object: DeepReadonly<TSESTree.Node>,
      name: string,
    ): boolean => {
      const objectType = checker.getNonNullableType(
        parserServices.getTypeAtLocation(asNode(object)),
      );

      const declarations =
        checker.getPropertyOfType(checker.getApparentType(objectType), name)
          ?.declarations ?? [];

      return (
        Arr.isNonEmpty(declarations) &&
        declarations.every(
          (declaration) =>
            ts.isMethodSignature(declaration) &&
            ts.isInterfaceDeclaration(declaration.parent) &&
            declaration.parent.name.text === 'Date' &&
            parserServices.program.isSourceFileDefaultLibrary(
              declaration.getSourceFile(),
            ),
        )
      );
    };

    return {
      CallExpression: (node) => {
        const target = setterCallOf(node);

        if (target === undefined) {
          return;
        }

        const { setter, name, args } = target;

        const required = REQUIRED_ARGUMENTS.get(name);

        if (
          required === undefined ||
          args === undefined ||
          args.some(
            (argument) => argument?.type === AST_NODE_TYPES.SpreadElement,
          ) ||
          args.length >= required ||
          !isDateMethod(setter.object, name)
        ) {
          return;
        }

        context.report({
          node,
          messageId: required === 2 ? 'missingDay' : 'missingMonthAndDay',
          data: { method: name },
        });
      },
    };
  },
} as const;

/**
 * How many arguments each setter needs for the day to be set with it: the month
 * and day, or the year, month and day.
 */
const REQUIRED_ARGUMENTS: ReadonlyMap<string, number> = new Map<string, number>(
  [
    ['setMonth', 2],
    ['setUTCMonth', 2],
    ['setFullYear', 3],
    ['setUTCFullYear', 3],
  ],
);

/**
 * The setter `node` calls, its name, and the arguments it passes the setter —
 * directly (`d.setMonth(m)`) or through `.call(d, m)` / `.apply(d, [m])` — or
 * `undefined` arguments when `apply`'s array is not an array literal. Any
 * member name is returned; the caller looks it up.
 */
const setterCallOf = (
  node: DeepReadonly<TSESTree.CallExpression>,
):
  | Readonly<{
      setter: DeepReadonly<TSESTree.MemberExpression>;
      name: string;
      args:
        | readonly (DeepReadonly<TSESTree.CallExpressionArgument> | null)[]
        | undefined;
    }>
  | undefined => {
  const callee = unwrapCallee(node.callee);

  if (callee.type !== AST_NODE_TYPES.MemberExpression) {
    return undefined;
  }

  const calleeName = memberName(callee);

  if (calleeName === undefined) {
    return undefined;
  }

  if (calleeName !== 'call' && calleeName !== 'apply') {
    return { setter: callee, name: calleeName, args: node.arguments };
  }

  const setter = unwrapCallee(callee.object);

  const name =
    setter.type === AST_NODE_TYPES.MemberExpression
      ? memberName(setter)
      : undefined;

  const [thisArg, ...rest] = node.arguments;

  if (
    name === undefined ||
    setter.type !== AST_NODE_TYPES.MemberExpression ||
    thisArg?.type === AST_NODE_TYPES.SpreadElement
  ) {
    return undefined;
  }

  if (calleeName === 'call') {
    return { setter, name, args: rest };
  }

  const array = rest[0];

  const unwrappedArray =
    array === undefined || array.type === AST_NODE_TYPES.SpreadElement
      ? array
      : skipTypeWrappers(array);

  return {
    setter,
    name,
    args:
      unwrappedArray === undefined
        ? []
        : unwrappedArray.type === AST_NODE_TYPES.ArrayExpression
          ? unwrappedArray.elements
          : undefined,
  };
};
