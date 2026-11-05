import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createGetLayerTypes,
  isRuntimeBound,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type * as ts from 'typescript';

type Options = readonly [
  Readonly<{
    functions?: readonly string[];
  }>?,
];

type MessageIds = 'dateOnlyString';

/**
 * Disallow passing a date-only string to `new Date` or `Date.parse`.
 *
 * ## Why
 *
 * ECMAScript reads the ISO date-only forms — `YYYY`, `YYYY-MM` and
 * `YYYY-MM-DD`, the year also as a sign and six digits — as midnight **UTC**,
 * while the same string with a time (`YYYY-MM-DDTHH:mm`) is local time. Read
 * back with the local getters (`getDate`, `getMonth`, …), the date-only form is
 * therefore the day before wherever the offset is negative, and code or a test
 * written east of UTC passes there and fails west of it. Build the date from
 * its numbers, or write the time and zone (`T00:00:00Z`) when UTC is meant.
 *
 * Only the ISO forms are reported: `'2026/11/03'`, `'+2026-11-03'` or `'20261'`
 * are not ISO, and V8 reads them as local time.
 *
 * ## What it sees
 *
 * The first argument is judged by its type: a string literal type that is a
 * date alone, or a union, an intersection (a branded literal) or a type
 * parameter's constraint with one. So a literal written at the call is seen,
 * and so is a `const` holding one or a row of an `as const` table; a `string`
 * is not, whatever it holds at run time. It is reported when any layer of its
 * `as` / `satisfies` / `!` / `<T>` wrappers has such a type, since a widening
 * cast does not change the string, and when a branch of a `?:`, `??` or `||`, or
 * the right of `&&`, does, since `x ?? '2026-11-03'` is a `string` once `x` is.
 *
 * The callee is read through those wrappers and through `?.`, and a computed
 * member with a static key (`Date['parse']`) is the same member. A `Date`
 * declared in the file is not the global and is left alone. The constructor is
 * matched by name, so `const D = Date` or a subclass of `Date` is not seen
 * unless `functions` names it.
 *
 * ## Options
 *
 * `functions` names further callees, called or constructed, that hand their
 * first argument to `new Date`, as a dotted path (`'DateUtils.from'`). They are
 * matched by the names written at the call, so an import renamed at the call
 * site is not seen.
 */
export const noDateOnlyStringToDate: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow a date-only string (`YYYY-MM-DD`) read by `new Date` or `Date.parse`, which take it as midnight UTC rather than local midnight',
      },
      schema: [
        {
          type: 'object',
          properties: {
            functions: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Further callees, called or constructed, as dotted paths such as `DateUtils.from`, that pass their first argument to `new Date`.',
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        dateOnlyString:
          'A date-only string is midnight UTC to `{{callee}}`, the day before in local time west of UTC. Build the date from its numbers, or write the time and zone (`T00:00:00Z`) if UTC is meant.',
      },
      defaultOptions: [{}],
    },

    create: (context) => {
      const functions: ReadonlySet<string> = new Set(
        context.options[0]?.functions,
      );

      const services = ESLintUtils.getParserServices(context);

      const checker = services.program.getTypeChecker();

      const getLayerTypes = createGetLayerTypes(services);

      /**
       * Whether `type` is, or has as a member, a string literal type that is a
       * date alone: through unions, intersections (a branded literal) and the
       * constraint of a type parameter.
       */
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a checker's type, which it hands out mutable
      const isDateOnlyType = (type: ts.Type): boolean => {
        if (type.isStringLiteral()) {
          return dateOnlyPattern.test(type.value);
        }

        if (type.isUnionOrIntersection()) {
          return type.types.some(isDateOnlyType);
        }

        const constraint = type.isTypeParameter()
          ? checker.getBaseConstraintOfType(type)
          : undefined;

        return constraint !== undefined && isDateOnlyType(constraint);
      };

      /**
       * Whether `callee` is the global `Date` or `globalThis.Date`: not a
       * binding the file declares.
       */
      const isGlobalDate = (callee: DeepReadonly<TSESTree.Node>): boolean => {
        const path = namePath(callee);

        const root =
          path === 'Date'
            ? 'Date'
            : path === 'globalThis.Date'
              ? 'globalThis'
              : undefined;

        return (
          root !== undefined &&
          !isRuntimeBound(context.sourceCode, asNode(callee), root)
        );
      };

      /** The name `callee` is reported under, or `undefined` if not checked. */
      const checkedCallee = (
        callee: DeepReadonly<TSESTree.Expression>,
        isNew: boolean,
      ): string | undefined => {
        if (isNew && isGlobalDate(callee)) {
          return 'Date';
        }

        const unwrapped = skipTypeWrappers(callee);

        // `(Date?.parse)` is `Date.parse` wherever it is not `undefined`.
        const value =
          unwrapped.type === AST_NODE_TYPES.ChainExpression
            ? skipTypeWrappers(unwrapped.expression)
            : unwrapped;

        if (
          !isNew &&
          value.type === AST_NODE_TYPES.MemberExpression &&
          memberName(value) === 'parse' &&
          isGlobalDate(value.object)
        ) {
          return 'Date.parse';
        }

        const path = namePath(value);

        return path !== undefined && functions.has(path) ? path : undefined;
      };

      /**
       * Whether `node`'s type, at any layer of its type wrappers, is or has a
       * date-only string literal type, or a branch of a `?:`, `??` or `||` or
       * the right of `&&` there is — what the expression may evaluate to:
       * `x ?? '2026-11-03'` is a `string` once `x` is one, though the fallback
       * is still a date alone. (`a && b` is `a` only when `a` is falsy, which a
       * date-only string never is.)
       */
      const isDateOnlyString = (node: DeepReadonly<TSESTree.Node>): boolean => {
        if (getLayerTypes(node).some(isDateOnlyType)) {
          return true;
        }

        const value = skipTypeWrappers(node);

        if (value.type === AST_NODE_TYPES.ConditionalExpression) {
          return (
            isDateOnlyString(value.consequent) ||
            isDateOnlyString(value.alternate)
          );
        }

        return (
          value.type === AST_NODE_TYPES.LogicalExpression &&
          ((value.operator !== '&&' && isDateOnlyString(value.left)) ||
            isDateOnlyString(value.right))
        );
      };

      const check = (
        node: DeepReadonly<TSESTree.CallExpression | TSESTree.NewExpression>,
      ): void => {
        const callee = checkedCallee(
          node.callee,
          node.type === AST_NODE_TYPES.NewExpression,
        );

        const first = node.arguments[0];

        if (
          callee === undefined ||
          first === undefined ||
          !isDateOnlyString(first)
        ) {
          return;
        }

        context.report({
          node: asNode(first),
          messageId: 'dateOnlyString',
          data: { callee },
        });
      };

      return {
        NewExpression: check,
        CallExpression: check,
      };
    },
  } as const;

/**
 * An ISO date-only string: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, the year four
 * digits or a sign and six.
 */
const dateOnlyPattern = /^(?:\d{4}|[+-]\d{6})(?:|-\d{2}|-\d{2}-\d{2})$/u;

/** The value of a string literal or a template literal with no substitution. */
const staticString = (
  node: DeepReadonly<TSESTree.Node>,
): string | undefined => {
  const value = skipTypeWrappers(node);

  if (value.type === AST_NODE_TYPES.Literal) {
    return typeof value.value === 'string' ? value.value : undefined;
  }

  return value.type === AST_NODE_TYPES.TemplateLiteral &&
    Arr.isEmpty(value.expressions)
    ? (value.quasis[0]?.value.cooked ?? undefined)
    : undefined;
};

/**
 * The name of the member `node` reads: `a.b`, `a['b']` and ``a[`b`]`` are `b`.
 */
const memberName = (
  node: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined =>
  !node.computed && node.property.type === AST_NODE_TYPES.Identifier
    ? node.property.name
    : node.computed
      ? staticString(node.property)
      : undefined;

/**
 * `node` as a dotted path of names (`globalThis.Date`, `DateUtils.from`), read
 * through type wrappers and string-keyed computed members, or `undefined` for
 * anything else.
 */
const namePath = (node: DeepReadonly<TSESTree.Node>): string | undefined => {
  const unwrapped = skipTypeWrappers(node);

  // `(globalThis?.Date)` is `globalThis.Date` wherever it is not `undefined`.
  const value =
    unwrapped.type === AST_NODE_TYPES.ChainExpression
      ? skipTypeWrappers(unwrapped.expression)
      : unwrapped;

  if (value.type === AST_NODE_TYPES.Identifier) {
    return value.name;
  }

  if (value.type !== AST_NODE_TYPES.MemberExpression) {
    return undefined;
  }

  const object = namePath(value.object);

  const name = memberName(value);

  return object === undefined || name === undefined
    ? undefined
    : `${object}.${name}`;
};

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the same node, its readonly view
  node as T;
