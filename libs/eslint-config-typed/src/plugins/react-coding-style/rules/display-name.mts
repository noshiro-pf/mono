import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { expectType } from 'ts-data-forge';
import { isReactApiCall } from './shared.mjs';

type Options = readonly [
  Readonly<{
    ignoreTranspilerName?: boolean;
  }>?,
];

type MessageIds = 'missingDisplayName';

/**
 * Rule to require displayName property for React components
 * This helps with debugging and component identification in React DevTools
 */
export const displayNameRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require displayName property for React components created with React.memo',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreTranspilerName: {
            type: 'boolean',
            description:
              'When true, ignores components that get displayName from variable name',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingDisplayName:
        'Component should have a displayName property for better debugging',
    },
  },
  create: (context) => {
    const options = context.options[0] ?? {};
    const ignoreTranspilerName = options.ignoreTranspilerName ?? false;

    const checkComponent = (
      node: DeepReadonly<TSESTree.VariableDeclarator>,
    ): void => {
      if (node.id.type !== AST_NODE_TYPES.Identifier) {
        return;
      }

      if (node.init?.type !== AST_NODE_TYPES.CallExpression) {
        return;
      }

      if (!isReactApiCall(context, node.init, 'memo')) {
        return;
      }

      const componentName = node.id.name;

      if (ignoreTranspilerName) {
        return;
      }

      const parent = node.parent;

      expectType<typeof parent.type, AST_NODE_TYPES.VariableDeclaration>('=');

      const grandParent = parent.parent;

      if (grandParent.type !== AST_NODE_TYPES.Program) {
        return;
      }

      const program = grandParent;
      const componentIndex = program.body.indexOf(parent);

      if (componentIndex === -1) {
        return;
      }

      const nextStatement = program.body[componentIndex + 1];

      const hasDisplayName =
        nextStatement !== undefined &&
        nextStatement.type === AST_NODE_TYPES.ExpressionStatement &&
        nextStatement.expression.type === AST_NODE_TYPES.AssignmentExpression &&
        nextStatement.expression.left.type ===
          AST_NODE_TYPES.MemberExpression &&
        nextStatement.expression.left.object.type ===
          AST_NODE_TYPES.Identifier &&
        nextStatement.expression.left.object.name === componentName &&
        nextStatement.expression.left.property.type ===
          AST_NODE_TYPES.Identifier &&
        nextStatement.expression.left.property.name === 'displayName';

      if (!hasDisplayName) {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: node.id as never,
          messageId: 'missingDisplayName',
        });
      }
    };

    return {
      VariableDeclarator: checkComponent,
    };
  },
  defaultOptions: [{ ignoreTranspilerName: false }],
};
