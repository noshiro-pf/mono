import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import {
  isTypeAssignableToString,
  isTypeFlagSet,
  unionTypeParts,
} from 'tsutils';
import { TypeFlags } from 'typescript';
import { createRule } from './common.mjs';

/** An ESLint rule to ban partial String.prototype.normalize(). */

export const noPartialStringNormalize = createRule({
  name: 'no-partial-string-normalize',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans partial String.prototype.normalize()',
    },
    messages: {
      errorStringGeneric:
        'String.prototype.normalize() is partial. Wrap it in a wrapper that catches the error and returns undefined.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression: (node) => {
        // We only care if this call is a member expression.

        if (node.callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const objectType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.callee.object),
        );

        // We only care if this call is on a string object.

        if (!isTypeAssignableToString(checker, objectType)) {
          return;
        }

        // Detect this form:
        // "".normalize("")
        //
        // Or this form:
        // ""["normalize"]("")
        //
        // Or this form:
        // const n = "normalize" as const;
        // const foo = ""[n]("");
        //
        // Or this form:
        // const n: "normalize" | "includes" = ...;
        // const foo = ""[n]("");
        const isNormalize =
          (node.callee.property.type === AST_NODE_TYPES.Literal &&
            node.callee.computed &&
            node.callee.property.value === 'normalize') ||
          (node.callee.property.type === AST_NODE_TYPES.Identifier &&
            !node.callee.computed &&
            node.callee.property.name === 'normalize') ||
          (node.callee.property.type === AST_NODE_TYPES.Identifier &&
            node.callee.computed &&
            unionTypeParts(
              checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(node.callee.property),
              ),
            ).some(
              (type) => type.isStringLiteral() && type.value === 'normalize',
            ));

        // We only care if this call is to the normalize method.

        if (!isNormalize) {
          return;
        }

        if (node.arguments.length > 1) {
          // This is a compiler error so don't bother flagging it.
          return;
        }

        const argument = node.arguments[0];

        if (argument === undefined) {
          // We only care if the caller provides an argument.
          // Zero arguments (`"".normalize()`) is always safe.
          return;
        }

        const safeValues = new Set(['NFC', 'NFD', 'NFKC', 'NFKD']);

        if (
          argument.type === AST_NODE_TYPES.Literal &&
          typeof argument.value === 'string' &&
          safeValues.has(argument.value)
        ) {
          // TODO errorStringWillDefinitelyThrow
          // These four values are all safe.
          return;
        }

        if (
          argument.type === AST_NODE_TYPES.Identifier &&
          unionTypeParts(
            checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(argument),
            ),
          ).every(
            (type) =>
              (type.isStringLiteral() && safeValues.has(type.value)) ||
              isTypeFlagSet(type, TypeFlags.Undefined),
          )
        ) {
          return;
        }

        // Anything else risks throwing an error so flag it.

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
  defaultOptions: [],
} as const);
