import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { hasForeignBinding } from '../bindings.mjs';
import { bindValueImports } from '../imports.mjs';
import { getArgumentText } from '../parentheses.mjs';
import {
  isIdentifierNamed,
  skipTypeWrappers,
  typeHoldsAtEveryLayer,
} from '../type-wrappers.mjs';

/** What {@link createPreferSafeParseInt} and its float twin are told. */
export type SafeParseRuleConfig = Readonly<{
  /** The module that exports `namespace` and `Result`. */
  moduleName: string;

  /** The exported namespace the parse function is reached through. */
  namespace: string;

  /**
   * The member of `namespace` that parses a `string` into a
   * `Result<number, …>`.
   */
  method: string;
}>;

/**
 * Builds a rule that reports the base-10 forms of `parseInt` and
 * `Number.parseInt` — `parseInt(x)` and `parseInt(x, 10)` — and suggests
 * `Result.unwrapOkOr(<namespace>.<method>(x), Number.NaN)` instead. A
 * suggestion, not an autofix: the replacement reads some strings differently.
 *
 * A call that passes another radix is left alone: the replacement takes none,
 * so it would mean something the replacement cannot say.
 */
export const createPreferSafeParseInt = (
  config: SafeParseRuleConfig,
): TSESLint.RuleModule<
  'useSafeParseInt' | 'replaceWithSafeParse',
  readonly []
> =>
  createSafeParseRule(config, 'useSafeParseInt', {
    messages: { useSafeParseInt: messageText(config) },
    description: `Replace \`parseInt(x)\` or \`Number.parseInt(x, 10)\` with \`Result.unwrapOkOr(${config.namespace}.${config.method}(x), Number.NaN)\` from ${config.moduleName}.`,
    isTarget: (callee, args) => {
      if (
        !isGlobalCall(callee, 'parseInt') &&
        !isNumberMethod(callee, 'parseInt')
      ) {
        return false;
      }

      // Only base 10: accept a missing radix or an explicit literal `10`, read
      // through its type wrappers, which leave the value as it is.
      const radix =
        args[1] === undefined ? undefined : skipTypeWrappers(args[1]);

      return (
        radix === undefined ||
        (radix.type === AST_NODE_TYPES.Literal && radix.value === 10)
      );
    },
  });

/**
 * Builds a rule that reports `parseFloat(x)`, `Number.parseFloat(x)` and
 * `Number(x)`, and suggests
 * `Result.unwrapOkOr(<namespace>.<method>(x), Number.NaN)` instead, as a
 * suggestion for the same reason.
 *
 * Like every rewrite here, `Number(x)` is only flagged when `x` is purely a
 * `string`, which leaves `Number(someBoolean)` and `Number(someNumber)` alone.
 */
export const createPreferSafeParseFloat = (
  config: SafeParseRuleConfig,
): TSESLint.RuleModule<
  'useSafeParseFloat' | 'replaceWithSafeParse',
  readonly []
> =>
  createSafeParseRule(config, 'useSafeParseFloat', {
    messages: { useSafeParseFloat: messageText(config) },
    description: `Replace \`parseFloat(x)\`, \`Number.parseFloat(x)\`, or \`Number(x)\` (when x is a string) with \`Result.unwrapOkOr(${config.namespace}.${config.method}(x), Number.NaN)\` from ${config.moduleName}.`,
    // `Number(...)` is matched only as a call; `new Number(...)` is a
    // `NewExpression`, which this rule never visits.
    isTarget: (callee) =>
      isGlobalCall(callee, 'parseFloat') ||
      isNumberMethod(callee, 'parseFloat') ||
      isGlobalCall(callee, 'Number'),
  });

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether every constituent of `type` is string-like, i.e. the type is
 * assignable to the parse function's `string` parameter. A union such as
 * `string | undefined` is rejected so the suggestion never produces a type error.
 */
const isStringType = (type: ts.Type): boolean => {
  const parts = type.isUnion() ? type.types : ([type] as const);

  return (
    parts.length > 0 &&
    parts.every((t) => (t.flags & ts.TypeFlags.StringLike) !== 0)
  );
};

const createSafeParseRule = <MessageId extends string>(
  { moduleName, namespace, method }: SafeParseRuleConfig,
  messageId: MessageId,
  {
    messages,
    description,
    isTarget,
  }: Readonly<{
    messages: ReadonlyRecord<MessageId, string>;

    description: string;

    /**
     * Whether the call, its callee read through its type wrappers, is one to
     * report.
     */
    isTarget: (
      callee: TSESTree.Expression,
      args: readonly TSESTree.CallExpressionArgument[],
    ) => boolean;
  }>,
): TSESLint.RuleModule<MessageId | 'replaceWithSafeParse', readonly []> => {
  // Sorted, as an import sorter would write them.
  const requiredImports = [namespace, 'Result'].toSorted();

  return {
    meta: {
      type: 'suggestion',
      docs: { description },
      hasSuggestions: true,
      schema: [],
      messages: {
        ...messages,
        replaceWithSafeParse: `Replace with \`Result.unwrapOkOr(${namespace}.${method}({{argName}}), Number.NaN)\`.`,
      },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const mut_reports: {
        node: TSESTree.CallExpression;
        argExpression: TSESTree.Expression;
      }[] = [];

      return {
        CallExpression: (node) => {
          if (!isTarget(skipTypeWrappers(node.callee), node.arguments)) {
            return;
          }

          const firstArg = node.arguments[0];

          // A spread argument (`parseInt(...rest)`) cannot be rewritten safely.
          if (
            firstArg === undefined ||
            firstArg.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          // The argument must be purely `string` at every layer of type
          // wrappers: the value's own type is what the original sees at run
          // time (`parseInt(1e21 as unknown as string)` is 1, the rewrite 1e21;
          // `Number(true as unknown as string)` is 1, the rewrite NaN), and the
          // type a wrapper states is what the suggestion, which keeps the
          // wrapper, hands the parse function's `string` parameter. Without
          // type information, skip.
          if (!typeHoldsAtEveryLayer(sourceCode, firstArg, isStringType)) {
            return;
          }

          mut_reports.push({ node, argExpression: firstArg });
        },
        'Program:exit': () => {
          const binding = bindValueImports(
            sourceCode,
            moduleName,
            requiredImports,
          );

          const localNameOf = (name: string): string | undefined =>
            binding?.localNames[requiredImports.indexOf(name)];

          const namespaceName = localNameOf(namespace);

          const resultName = localNameOf('Result');

          // A suggestion, never an autofix: the replacement parses some
          // strings differently (`parseInt('1e3')` is 1, the rewrite 1000;
          // `parseFloat('12px')` is 12, the rewrite NaN; `Number('')` is 0, the
          // rewrite NaN), so applying it is a person's decision. Each one
          // brings its names into scope itself, so that it is complete alone.
          for (const { node, argExpression } of mut_reports) {
            const argText = getArgumentText(sourceCode, argExpression);

            const data = {
              original: sourceCode.getText(node),
              argName: argText,
            } as const;

            context.report({
              node,
              messageId,
              data,
              suggest:
                binding === undefined ||
                namespaceName === undefined ||
                resultName === undefined ||
                [namespaceName, resultName].some((name) =>
                  hasForeignBinding(sourceCode, node, name, moduleName),
                )
                  ? []
                  : [
                      {
                        messageId: 'replaceWithSafeParse',
                        data,
                        fix: (fixer) => [
                          ...binding.edits(fixer),
                          fixer.replaceText(
                            node,
                            `${resultName}.unwrapOkOr(${namespaceName}.${method}(${argText}), Number.NaN)`,
                          ),
                        ],
                      },
                    ],
            });
          }
        },
      };
    },
  } as const;
};

const messageText = ({
  moduleName,
  namespace,
  method,
}: SafeParseRuleConfig): string =>
  `Replace \`{{original}}\` with \`Result.unwrapOkOr(${namespace}.${method}({{argName}}), Number.NaN)\` from ${moduleName}. It parses some strings differently from the call it replaces, so check the input before applying it.` as const;

/** Whether `callee` is the global function `name`, as in `parseInt(...)`. */
const isGlobalCall = (callee: TSESTree.Expression, name: string): boolean =>
  callee.type === AST_NODE_TYPES.Identifier && callee.name === name;

/**
 * Whether `callee` is `Number.<name>`, the `Number` read through its type
 * wrappers.
 */
const isNumberMethod = (callee: TSESTree.Expression, name: string): boolean =>
  callee.type === AST_NODE_TYPES.MemberExpression &&
  !callee.computed &&
  isIdentifierNamed(callee.object, 'Number') &&
  callee.property.type === AST_NODE_TYPES.Identifier &&
  callee.property.name === name;
