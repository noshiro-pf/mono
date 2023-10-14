import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import type { TSESTree } from '@typescript-eslint/types';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import type { __String } from 'typescript';
import { isTypeReadonly } from '../utils/isTypeReadonly';

type Options = readonly [
  Readonly<{
    checkParameterProperties?: boolean;
    ignoreInferredTypes?: boolean;
    allow?: readonly __String[];
  }>,
];

type MessageIds = 'shouldBeReadonly';

const createRule = ESLintUtils.RuleCreator(
  () =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v4.24.0/packages/eslint-plugin/docs/rules/prefer-readonly-parameter-types.md`
);

export const preferReadonlyParameterTypesRuleName =
  'prefer-readonly-parameter-types';

export const preferReadonlyParameterTypesRule = createRule<Options, MessageIds>(
  {
    name: preferReadonlyParameterTypesRuleName,
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Requires that function parameters are typed as readonly to prevent accidental mutation of inputs',
        category: 'Possible Errors',
        recommended: false,
        requiresTypeChecking: true,
      },
      schema: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            checkParameterProperties: {
              type: 'boolean',
            },
            ignoreInferredTypes: {
              type: 'boolean',
            },
            allow: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      ],
      messages: {
        shouldBeReadonly: 'Parameter should be a read only type.',
      },
    },
    defaultOptions: [
      {
        checkParameterProperties: true,
        ignoreInferredTypes: false,
        allow: [],
      },
    ],
    create(context, options) {
      const [{ checkParameterProperties, ignoreInferredTypes, allow }] =
        options;
      const { esTreeNodeToTSNodeMap, program } =
        ESLintUtils.getParserServices(context);
      const checker = program.getTypeChecker();

      return {
        [[
          AST_NODE_TYPES.ArrowFunctionExpression,
          AST_NODE_TYPES.FunctionDeclaration,
          AST_NODE_TYPES.FunctionExpression,
          AST_NODE_TYPES.TSCallSignatureDeclaration,
          AST_NODE_TYPES.TSConstructSignatureDeclaration,
          AST_NODE_TYPES.TSDeclareFunction,
          AST_NODE_TYPES.TSEmptyBodyFunctionExpression,
          AST_NODE_TYPES.TSFunctionType,
          AST_NODE_TYPES.TSMethodSignature,
        ].join(', ')](
          node:
            | TSESTree.ArrowFunctionExpression
            | TSESTree.FunctionDeclaration
            | TSESTree.FunctionExpression
            | TSESTree.TSCallSignatureDeclaration
            | TSESTree.TSConstructSignatureDeclaration
            | TSESTree.TSDeclareFunction
            | TSESTree.TSEmptyBodyFunctionExpression
            | TSESTree.TSFunctionType
            | TSESTree.TSMethodSignature
        ): void {
          for (const param of node.params) {
            if (
              checkParameterProperties === false &&
              param.type === AST_NODE_TYPES.TSParameterProperty
            ) {
              continue;
            }

            const actualParam =
              param.type === AST_NODE_TYPES.TSParameterProperty
                ? param.parameter
                : param;

            if (
              ignoreInferredTypes === true &&
              actualParam.typeAnnotation == null
            ) {
              continue;
            }

            const tsNode = esTreeNodeToTSNodeMap.get(actualParam);
            const type = checker.getTypeAtLocation(tsNode);
            const isReadOnly = isTypeReadonly(checker, type);

            if (isReadOnly) {
              continue;
            }

            if (allow !== undefined) {
              if (
                type.symbol !== undefined &&
                allow.includes(type.symbol.escapedName)
              ) {
                continue;
              }
              if (
                type.aliasSymbol !== undefined &&
                allow.includes(type.aliasSymbol.escapedName)
              ) {
                continue;
              }
            }

            context.report({
              node: actualParam,
              messageId: 'shouldBeReadonly',
            });
          }
        },
      };
    },
  }
);

export default preferReadonlyParameterTypesRule;
