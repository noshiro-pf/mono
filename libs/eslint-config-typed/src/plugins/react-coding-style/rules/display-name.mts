import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { isReactApiCall } from './shared.mjs';

type Options = readonly [
  Readonly<{
    ignoreName?: string | readonly string[];
  }>?,
];

type MessageIds = 'missingDisplayName' | 'mismatchedDisplayName';

/**
 * Rule to require displayName property for React components
 * This helps with debugging and component identification in React DevTools
 */
export const displayNameRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require React.memo components to define displayName matching the component name',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreName: {
            description:
              'Component names allowed to have displayName different from the variable name.',
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: { type: 'string' },
                minItems: 0,
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingDisplayName:
        'Component should have a displayName property for better debugging',
      mismatchedDisplayName:
        'displayName should match the component name "{{componentName}}"',
    },
  },
  create: (context) => {
    const options = context.options[0] ?? {};

    const ignoreNameSet = normalizeNames(options.ignoreName);

    const shouldIgnoreMismatch = (componentName: string): boolean =>
      ignoreNameSet.has(componentName);

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

      const assignment = getDisplayNameAssignment(node);

      if (assignment === undefined) {
        context.report({
          node: castDeepMutable(node),
          messageId: 'missingDisplayName',
        });

        return;
      }

      if (!isComponentDisplayNameAssignment(assignment, componentName)) {
        context.report({
          node: castDeepMutable(node),
          messageId: 'missingDisplayName',
        });

        return;
      }

      const displayName = extractDisplayName(assignment.right);

      if (displayName === undefined) {
        context.report({
          node: assignment.right,
          messageId: 'mismatchedDisplayName',
          data: { componentName },
        });

        return;
      }

      if (shouldIgnoreMismatch(componentName)) {
        return;
      }

      if (displayName !== componentName) {
        context.report({
          node: assignment.right,
          messageId: 'mismatchedDisplayName',
          data: { componentName },
        });
      }
    };

    return {
      VariableDeclarator: checkComponent,
    };
  },
  defaultOptions: [{ ignoreName: [] }],
};

const normalizeNames = (
  names: string | readonly string[] | undefined,
): ReadonlySet<string> => {
  if (names === undefined) {
    return new Set();
  }

  if (typeof names === 'string') {
    return new Set([names]);
  }

  return new Set(names);
};

const getDisplayNameAssignment = (
  node: DeepReadonly<TSESTree.VariableDeclarator>,
): DeepReadonly<TSESTree.AssignmentExpression> | undefined => {
  let mut_current = node.parent as DeepReadonly<TSESTree.Node> | undefined;

  let mut_statement: DeepReadonly<TSESTree.Statement> | undefined = undefined;

  while (mut_current !== undefined) {
    if (
      mut_current.type === AST_NODE_TYPES.VariableDeclaration ||
      mut_current.type === AST_NODE_TYPES.ExportNamedDeclaration
    ) {
      mut_statement = mut_current as DeepReadonly<TSESTree.Statement>;
    }

    if (mut_current.type === AST_NODE_TYPES.Program) {
      break;
    }

    mut_current = mut_current.parent;
  }

  if (mut_current === undefined || mut_statement === undefined) {
    return undefined;
  }

  const program = mut_current;

  const componentIndex = program.body.indexOf(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    mut_statement as TSESTree.Statement,
  );

  if (componentIndex === -1) {
    return undefined;
  }

  const nextStatement = program.body[componentIndex + 1];

  if (nextStatement === undefined) {
    return undefined;
  }

  if (nextStatement.type !== AST_NODE_TYPES.ExpressionStatement) {
    return undefined;
  }

  if (nextStatement.expression.type !== AST_NODE_TYPES.AssignmentExpression) {
    return undefined;
  }

  return nextStatement.expression;
};

const isComponentDisplayNameAssignment = (
  assignment: DeepReadonly<TSESTree.AssignmentExpression>,
  componentName: string,
): assignment is TSESTree.AssignmentExpression => {
  if (assignment.left.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  if (assignment.left.object.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  if (assignment.left.object.name !== componentName) {
    return false;
  }

  return (
    assignment.left.property.type === AST_NODE_TYPES.Identifier &&
    assignment.left.property.name === 'displayName'
  );
};

const extractDisplayName = (
  expression: DeepReadonly<TSESTree.Expression>,
): string | undefined => {
  if (
    expression.type === AST_NODE_TYPES.Literal &&
    typeof expression.value === 'string'
  ) {
    return expression.value;
  }

  if (
    expression.type === AST_NODE_TYPES.TemplateLiteral &&
    expression.expressions.length === 0 &&
    expression.quasis.length === 1
  ) {
    return expression.quasis[0]?.value.cooked ?? undefined;
  }

  return undefined;
};
