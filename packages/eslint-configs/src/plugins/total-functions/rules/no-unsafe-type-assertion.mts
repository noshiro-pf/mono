import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import { isTypeFlagSet } from 'tsutils';
import type ts from 'typescript';
import { TypeFlags } from 'typescript';
import { createRule } from './common.mjs';

/** An ESLint rule to ban unsafe type assertions. */

export const noUnsafeTypeAssertion = createRule({
  name: 'no-unsafe-type-assertion',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans unsafe type assertions.',
    },
    messages: {
      errorStringGeneric: 'This type assertion is not type-safe.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const isUnsafe = (
      rawDestinationType: ts.Type,
      rawSourceType: ts.Type,
    ): boolean => {
      if (
        isTypeFlagSet(rawSourceType, TypeFlags.Any) ||
        isTypeFlagSet(rawSourceType, TypeFlags.Unknown)
      ) {
        // Asserting any or unknown to anything else is always unsafe.
        return true;
      }

      return !checker.isTypeAssignableTo(rawSourceType, rawDestinationType);
    };

    const reportUnsafe = (
      node: TSESTree.TSTypeAssertion | TSESTree.TSAsExpression,
    ): void => {
      // The right hand side of the "as".
      const destinationNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const rawDestinationType = checker.getTypeAtLocation(destinationNode);

      // The left hand side of the "as".
      const sourceNode = destinationNode.expression;
      const rawSourceType = checker.getTypeAtLocation(sourceNode);

      if (isUnsafe(rawDestinationType, rawSourceType)) {
        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      }
    };

    return {
      TSTypeAssertion: reportUnsafe,
      TSAsExpression: reportUnsafe,
    };
  },
  defaultOptions: [],
} as const);
