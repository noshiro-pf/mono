import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export type ProbeContext = Readonly<
  TSESLint.RuleContext<'result', readonly []>
>;

/**
 * A rule that reports every `probe(<argument>)` call in the code under test,
 * with `read(context, argument)` as the message. A test asserts on that
 * message, which is how a helper that needs a rule context — the source code,
 * the scope manager, a fixer — is run on real parser output. `fix`, when
 * given, is offered as the report's fix.
 */
export const probeRule = (
  read: (context: ProbeContext, argument: TSESTree.Expression) => string,
  fix?: (
    context: ProbeContext,
    fixer: TSESLint.RuleFixer,
  ) => readonly TSESLint.RuleFix[],
): TSESLint.RuleModule<'result'> =>
  ({
    meta: {
      type: 'problem',
      messages: { result: '{{result}}' },
      schema: [],
      ...(fix === undefined ? {} : { fixable: 'code' }),
      defaultOptions: [],
    },
    create: (context) => ({
      CallExpression: (node) => {
        const [argument] = node.arguments;

        if (
          argument === undefined ||
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.callee.name !== 'probe' ||
          argument.type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'result',
          data: { result: read(context, argument) },
          ...(fix === undefined ? {} : { fix: (fixer) => fix(context, fixer) }),
        });
      },
    }),
  }) as const;

/** `node`'s text in the code under test. */
export const textOf = (
  context: ProbeContext,
  node: Readonly<{ range: TSESTree.Range }>,
): string => context.sourceCode.text.slice(node.range[0], node.range[1]);
