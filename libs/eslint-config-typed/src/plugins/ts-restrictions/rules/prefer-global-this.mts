import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { Rule } from 'eslint';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { isTypeWrapper } from 'eslint-rule-forge';
import { hasKey, isRecord } from 'ts-data-forge';
import type * as ts from 'typescript';

type Options = readonly [];

/** The message id `unicorn/prefer-global-this` reports with. */
type MessageIds = 'prefer-global-this/error';

const upstream = eslintPluginUnicorn.rules?.['prefer-global-this'];

/**
 * `unicorn/prefer-global-this`, except where `globalThis` cannot stand in for
 * `window` / `self` / `global`.
 *
 * ## Why
 *
 * The upstream rule rewrites `window.X` to `globalThis.X` on the premise that
 * the two are the same object, which they are at run time. To the type checker
 * they are not always: `window` is `Window & typeof globalThis`, and only a
 * global declared with `var` (or `function`) is a property of
 * `typeof globalThis`. The strict standard library declares most globals with
 * `const` so that assigning to one is an error, and keeps `var` only for the
 * names a window and a worker share; so under it `globalThis.history` and
 * `globalThis.document` do not type-check, while `window.history` does. The
 * upstream rule would demand the former, and `no-restricted-globals` forbids
 * the bare `history` — every spelling was an error.
 *
 * This rule runs the upstream rule unchanged and drops a report only when the
 * `window` / `self` / `global` it names is used to reach members that
 * `typeof globalThis` lacks: `window.history`, or `const { history } = window`
 * when any destructured name is missing. Everything else — the upstream
 * exemptions (`typeof window`, `window.top`, …), its messages and its fix —
 * is the upstream rule's. With the stock library every window member is on
 * `typeof globalThis`, so the rule then reports exactly what upstream does.
 *
 * The object is read through `as` / `satisfies` / `!` / `<T>`:
 * `(window as Window).history` reaches `history` all the same.
 */
export const preferGlobalThis: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Prefer `globalThis` over `window`, `self` and `global` (`unicorn/prefer-global-this`), except for members `typeof globalThis` lacks — under the strict standard library, a window's own globals such as `history`",
    },
    fixable: 'code',
    schema: [],
    messages: {
      'prefer-global-this/error': 'Prefer `{{replacement}}` over `{{value}}`.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    if (upstream === undefined) {
      throw new Error(
        '`eslint-plugin-unicorn` no longer has `prefer-global-this`.',
      );
    }

    const services = ESLintUtils.getParserServices(context);

    const isOnlyReachingWindowMembers = (descriptor: unknown): boolean => {
      // The upstream rule reports the `window` / `self` / `global` identifier
      // itself; it is found again in this file's tree by where it starts.
      const start = reportedStart(descriptor);

      if (start === undefined) {
        return false;
      }

      const identifier = context.sourceCode.getNodeByRangeIndex(
        context.sourceCode.getIndexFromLoc(start),
      );

      if (identifier?.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const names = reachedMemberNames(identifier);

      if (names === undefined) {
        return false;
      }

      const globalThisType = typeofGlobalThisPart(
        services.getTypeAtLocation(identifier),
      );

      return (
        globalThisType !== undefined &&
        names.some((name) => globalThisType.getProperty(name) === undefined)
      );
    };

    const report = (descriptor: unknown): void => {
      if (isOnlyReachingWindowMembers(descriptor)) {
        return;
      }

      // The descriptor is the upstream rule's, unchanged, and goes to the
      // `report` it was written for; `Reflect.apply` passes it on without
      // restating it in typescript-eslint's types.
      Reflect.apply(context.report, context, [descriptor]);
    };

    // ESLint freezes the rule context, so `report` can be replaced only on an
    // object that inherits everything else from it — the same `Object.create`
    // ESLint builds the context with. The cast is the boundary between
    // typescript-eslint's and ESLint's types for that one object.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const upstreamContext = Object.create(context, {
      report: { value: report },
    }) as Rule.RuleContext;

    return upstream.create(upstreamContext);
  },
} as const;

/**
 * Where the node a report descriptor names starts. The descriptor comes from
 * the upstream rule, so it is read as data rather than through ESLint's types.
 */
const reportedStart = (
  descriptor: unknown,
): Readonly<{ line: number; column: number }> | undefined => {
  if (!isRecord(descriptor) || !hasKey(descriptor, 'node')) {
    return undefined;
  }

  const { node } = descriptor;

  if (!isRecord(node) || !hasKey(node, 'loc')) {
    return undefined;
  }

  const { loc } = node;

  if (!isRecord(loc) || !hasKey(loc, 'start')) {
    return undefined;
  }

  const { start } = loc;

  if (
    !isRecord(start) ||
    !hasKey(start, 'line') ||
    !hasKey(start, 'column') ||
    typeof start.line !== 'number' ||
    typeof start.column !== 'number'
  ) {
    return undefined;
  }

  return { line: start.line, column: start.column };
};

/** `node`, or the outermost type wrapper whose value is `node`. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const outermostTypeWrapper = (node: TSESTree.Node): TSESTree.Node => {
  const { parent } = node;

  return parent !== undefined &&
    isTypeWrapper(parent) &&
    parent.expression === node
    ? outermostTypeWrapper(parent)
    : node;
};

/** The name a member key spells out, if it is static. */
const staticKeyName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  key: TSESTree.Node,
  computed: boolean,
): string | undefined =>
  !computed && key.type === AST_NODE_TYPES.Identifier
    ? key.name
    : key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string'
      ? key.value
      : undefined;

/**
 * The members of `window` / `self` / `global` that this use of it reaches, or
 * `undefined` when the use is not a member access or a destructuring whose
 * names are all static.
 */
const reachedMemberNames = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  identifier: TSESTree.Identifier,
): readonly string[] | undefined => {
  const object = outermostTypeWrapper(identifier);

  const { parent } = object;

  if (
    parent?.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === object
  ) {
    const name = staticKeyName(parent.property, parent.computed);

    return name === undefined ? undefined : [name];
  }

  if (
    parent?.type === AST_NODE_TYPES.VariableDeclarator &&
    parent.init === object &&
    parent.id.type === AST_NODE_TYPES.ObjectPattern
  ) {
    const names = parent.id.properties.map((property) =>
      property.type === AST_NODE_TYPES.Property
        ? staticKeyName(property.key, property.computed)
        : undefined,
    );

    return names.every((name) => name !== undefined) ? names : undefined;
  }

  return undefined;
};

/**
 * The `typeof globalThis` part of the type of `window` / `self`
 * (`Window & typeof globalThis`) or `global` (`typeof globalThis`).
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const typeofGlobalThisPart = (type: ts.Type): ts.Type | undefined =>
  (type.isIntersection() ? type.types : [type]).find(
    (part) => part.getSymbol()?.getName() === 'globalThis',
  );
