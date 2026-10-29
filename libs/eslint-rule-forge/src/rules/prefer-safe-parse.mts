import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  buildNamedImportFix,
  getImportDeclarations,
  getNamedImports,
} from '../imports.mjs';
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
 * Builds a rule that replaces the base-10 forms of `parseInt` and
 * `Number.parseInt` — `parseInt(x)` and `parseInt(x, 10)` — with
 * `Result.unwrapOkOr(<namespace>.<method>(x), Number.NaN)`.
 *
 * A call that passes another radix is left alone: the replacement takes none,
 * so it would mean something the replacement cannot say.
 */
export const createPreferSafeParseInt = (
  config: SafeParseRuleConfig,
): TSESLint.RuleModule<'useSafeParseInt', readonly []> =>
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

      // Only base 10: accept a missing radix or an explicit literal `10`,
      // read through its type wrappers, which leave the value as it is.
      const radix =
        args[1] === undefined ? undefined : skipTypeWrappers(args[1]);

      return (
        radix === undefined ||
        (radix.type === AST_NODE_TYPES.Literal && radix.value === 10)
      );
    },
  });

/**
 * Builds a rule that replaces `parseFloat(x)`, `Number.parseFloat(x)` and
 * `Number(x)` with `Result.unwrapOkOr(<namespace>.<method>(x), Number.NaN)`.
 *
 * Like every rewrite here, `Number(x)` is only flagged when `x` is purely a
 * `string`, which leaves `Number(someBoolean)` and `Number(someNumber)` alone.
 */
export const createPreferSafeParseFloat = (
  config: SafeParseRuleConfig,
): TSESLint.RuleModule<'useSafeParseFloat', readonly []> =>
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
     * rewrite.
     */
    isTarget: (
      callee: TSESTree.Expression,
      args: readonly TSESTree.CallExpressionArgument[],
    ) => boolean;
  }>,
): TSESLint.RuleModule<MessageId, readonly []> => {
  const parseFunction = `${namespace}.${method}` as const;

  // Sorted, as an import sorter would write them.
  const requiredImports = [namespace, 'Result'].toSorted();

  return {
    meta: {
      type: 'suggestion',
      docs: { description },
      fixable: 'code',
      schema: [],
      messages,
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const moduleImports = getImportDeclarations(program, moduleName);

      const mut_nodesToFix: {
        node: TSESTree.CallExpression;
        argExpression: TSESTree.Expression;
      }[] = [];

      return {
        CallExpression: (node) => {
          if (!isTarget(skipTypeWrappers(node.callee), node.arguments)) {
            return;
          }

          const firstArg = node.arguments[0];

          // A spread argument (`parseInt(...rest)`) cannot be rewritten
          // safely.
          if (
            firstArg === undefined ||
            firstArg.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          // The argument must be purely `string` at every layer of type
          // wrappers: the value's own type is what the original sees at run
          // time (`parseInt(1e21 as unknown as string)` is 1, the rewrite
          // 1e21; `Number(true as unknown as string)` is 1, the rewrite NaN),
          // and the type a wrapper states is what the fix, which keeps the
          // wrapper, hands the parse function's `string` parameter. Without
          // type information, skip.
          if (!typeHoldsAtEveryLayer(sourceCode, firstArg, isStringType)) {
            return;
          }

          mut_nodesToFix.push({ node, argExpression: firstArg });
        },
        'Program:exit': () => {
          const namedImports = getNamedImports(moduleImports);

          const missingImports = requiredImports.filter(
            (name) => !namedImports.includes(name),
          );

          // The import fix lives on the first report only:
          // `insertTextBefore(program, …)` produces overlapping ranges
          // otherwise and only one of them would survive a pass.
          for (const [
            index,
            { node, argExpression },
          ] of mut_nodesToFix.entries()) {
            const argText = getArgumentText(sourceCode, argExpression);

            context.report({
              node,
              messageId,
              data: {
                original: sourceCode.getText(node),
                argName: argText,
              },
              fix: (fixer) => {
                const core =
                  `Result.unwrapOkOr(${parseFunction}(${argText}), Number.NaN)` as const;

                const importFixes =
                  index === 0 && missingImports.length > 0
                    ? buildNamedImportFix(
                        fixer,
                        program,
                        moduleName,
                        missingImports,
                      )
                    : ([] as const);

                return [...importFixes, fixer.replaceText(node, core)];
              },
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
  `Replace \`{{original}}\` with \`Result.unwrapOkOr(${namespace}.${method}({{argName}}), Number.NaN)\` from ${moduleName}.` as const;

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

/**
 * Whether every constituent of `type` is string-like, i.e. the type is
 * assignable to the parse function's `string` parameter. A union such as
 * `string | undefined` is rejected so the autofix never produces a type error.
 */
const isStringType = (type: ts.Type): boolean => {
  const parts = type.isUnion() ? type.types : ([type] as const);

  return (
    parts.length > 0 &&
    parts.every((t) => (t.flags & ts.TypeFlags.StringLike) !== 0)
  );
};
