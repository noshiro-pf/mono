import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { TS_FORTRESS_MODULE } from './constants.mjs';

type Options = readonly [
  Readonly<{
    threshold?: number;
    guards?: readonly string[];
  }>?,
];

type MessageIds = 'preferSchema';

/**
 * How many guards on one value it takes before the chain is reported.
 *
 * Chosen from the distribution in the repository this rule was written for —
 * 3420 files as they stood before it was applied to them, counting guards on
 * one value within a single `&&` chain, or a single `||` chain of negations:
 *
 * | guards | chains |
 * | -----: | -----: |
 * |      1 |    103 |
 * |      2 |     41 |
 * |      3 |     17 |
 * |      4 |      1 |
 * |      5 |      1 |
 * |     6+ |      0 |
 *
 * One and two are ordinary narrowing and reporting them would be noise; three
 * is still common enough to be a style rather than a smell. Four and five have
 * one chain each, and they differ in exactly the way the threshold has to: the
 * chain of four narrows a value that is *already typed*, which is the case this
 * rule is least interested in, while the chain of five narrows the result of a
 * `JSON.parse`, which is the case it exists for. So the default sits between
 * them, at the length of the chain that prompted the rule:
 * `isRecord(x) && hasKey(x, 'a') && isString(x.a) && hasKey(x, 'b') &&
 * isString(x.b)`.
 */
const DEFAULT_THRESHOLD = 5;

/**
 * Guards counted by default: the ts-data-forge narrowing helpers a hand-written
 * shape check is built from. `Arr.isArray` is counted under its member name, so
 * a namespace import spells it the same way.
 */
const DEFAULT_GUARDS: readonly string[] = [
  'hasKey',
  'isArray',
  'isBigint',
  'isBoolean',
  'isNonEmpty',
  'isNonNullish',
  'isNotNull',
  'isNotUndefined',
  'isNumber',
  'isPrimitive',
  'isRecord',
  'isString',
  'isSymbol',
] as const;

/**
 * Report a hand-written shape check — a chain of type guards on one value —
 * once it is long enough to be a schema, and point at ts-fortress.
 *
 * ## Why
 *
 * ```ts
 * isRecord(project) &&
 *   hasKey(project, 'name') &&
 *   isString(project.name) &&
 *   hasKey(project, 'path') &&
 *   isString(project.path);
 * ```
 *
 * The length is the least of it. What this expression cannot do is say what was
 * wrong: it returns `false`, and the caller that filters on it drops the value
 * silently, with nothing left of which field was missing or what type it turned
 * out to be. The shape is also declared and checked in the same breath, so it
 * cannot be named, reused, or read on its own.
 *
 * ```ts
 * const PROJECT = t.record({ name: t.string(), path: t.string() });
 *
 * const result = PROJECT.validate(value);
 * // Result.Err carries structured ValidationErrors, ready for
 * // validationErrorsToMessages
 * ```
 *
 * ## Why there is no fix
 *
 * Writing the schema is the work, and it is not mechanical: the chain says what
 * the value must have, never what it *is*, so an optional member, a union and a
 * member that is simply never checked are indistinguishable from the guards
 * alone. The message carries a skeleton to start from instead.
 *
 * ## What is counted
 *
 * Guards within one `&&` chain, or one `||` chain of negated guards — the
 * early-return spelling of the same check — grouped by the identifier their
 * first argument is rooted at, so that guards on two different values do not
 * add up. A whole function body is deliberately not the unit: the same value
 * checked once per field across a `fill`-style function is a series of
 * defaults, not a shape check, and counting those was measured to be almost all
 * of what a function-scoped count reports.
 */
export const preferSchemaOverGuardChain: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Report a chain of hand-written type guards narrowing one value, once it is long enough to be a schema, and point at \`${TS_FORTRESS_MODULE}\``,
    },
    schema: [
      {
        type: 'object',
        properties: {
          threshold: {
            type: 'integer',
            minimum: 2,
            description: [
              'How many guards on one value a single chain may contain before',
              `it is reported. Defaults to ${DEFAULT_THRESHOLD}.`,
            ].join(' '),
          },
          guards: {
            type: 'array',
            items: { type: 'string' },
            description: [
              'Names of the guard functions to count, replacing the default',
              'list. A member call is matched on its property name, so',
              '`Arr.isArray` is named `isArray`.',
            ].join(' '),
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      preferSchema: `\`{{name}}\` is narrowed by {{count}} hand-written guards in one expression. That is a shape declaration, so declare it: a \`${TS_FORTRESS_MODULE}\` type (\`t.record({ ... })\`) names it once, and \`validate\` returns what was different instead of \`false\`.`,
    },
  },

  create: (context) => {
    const threshold = context.options[0]?.threshold ?? DEFAULT_THRESHOLD;

    const guards = context.options[0]?.guards ?? DEFAULT_GUARDS;

    /** The root identifier of a guard call's first argument, if it has one. */
    const guardedName = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      operand: TSESTree.Node,
    ): string | undefined => {
      const call =
        operand.type === AST_NODE_TYPES.UnaryExpression &&
        operand.operator === '!'
          ? operand.argument
          : operand;

      if (call.type !== AST_NODE_TYPES.CallExpression) return undefined;

      const name =
        call.callee.type === AST_NODE_TYPES.Identifier
          ? call.callee.name
          : call.callee.type === AST_NODE_TYPES.MemberExpression &&
              !call.callee.computed &&
              call.callee.property.type === AST_NODE_TYPES.Identifier
            ? call.callee.property.name
            : undefined;

      if (name === undefined || !guards.includes(name)) return undefined;

      const [subject] = call.arguments;

      return subject === undefined ? undefined : rootIdentifierOf(subject);
    };

    return {
      LogicalExpression: (node) => {
        if (node.operator === '??') return;

        // Only the outermost node of a chain, so that `a && b && c` is judged
        // once as three operands rather than three times as nested pairs.
        if (
          node.parent.type === AST_NODE_TYPES.LogicalExpression &&
          node.parent.operator === node.operator
        ) {
          return;
        }

        const mut_counts = new Map<string, number>();

        for (const operand of operandsOf(node)) {
          const name = guardedName(operand);

          if (name === undefined) continue;

          mut_counts.set(name, (mut_counts.get(name) ?? 0) + 1);
        }

        for (const [name, count] of mut_counts) {
          if (count < threshold) continue;

          context.report({
            node,
            messageId: 'preferSchema',
            data: { name, count: count.toString() },
          });
        }
      },
    };
  },
  defaultOptions: [{}],
} as const;

/** The operands of a chain of one logical operator, flattened. */
const operandsOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.LogicalExpression,
): readonly TSESTree.Node[] =>
  [node.left, node.right].flatMap((side) =>
    side.type === AST_NODE_TYPES.LogicalExpression &&
    side.operator === node.operator
      ? operandsOf(side)
      : [side],
  );

/**
 * The identifier a member access chain starts from — `a` for `a.b.c` — so that
 * `hasKey(a, 'b')` and `isString(a.b)` count as guards on the same value.
 */
const rootIdentifierOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): string | undefined => {
  if (node.type === AST_NODE_TYPES.Identifier) return node.name;

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return rootIdentifierOf(node.object);
  }

  // `a?.b` and `a!.b` are the same root as `a.b`.
  if (
    node.type === AST_NODE_TYPES.ChainExpression ||
    node.type === AST_NODE_TYPES.TSNonNullExpression
  ) {
    return rootIdentifierOf(node.expression);
  }

  return undefined;
};
