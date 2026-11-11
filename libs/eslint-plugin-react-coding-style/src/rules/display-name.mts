import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { siblingOf, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { castNode, isReactApiCall } from './shared.mjs';

type Options = readonly [
  Readonly<{
    ignoreName?: string | readonly string[];
  }>?,
];

type MessageIds = 'missingDisplayName' | 'mismatchedDisplayName';

/**
 * Rule to require displayName property for React components
 * This helps with debugging and component identification in React DevTools
 *
 * Type wrappers (`as`, `satisfies`, `!`, `<T>`) are looked through on the memo
 * call, on the `C.displayName = ...` statement, on the component in
 * `C.displayName` and on the assigned name.
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
    defaultOptions: [{ ignoreName: [] }],
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

      const init = node.init === null ? undefined : skipTypeWrappers(node.init);

      if (init?.type !== AST_NODE_TYPES.CallExpression) {
        return;
      }

      if (!isReactApiCall(context, init, 'memo')) {
        return;
      }

      const componentName = node.id.name;

      const assignment = getDisplayNameAssignment(node);

      if (assignment === undefined) {
        context.report({
          node: castNode(node),
          messageId: 'missingDisplayName',
        });

        return;
      }

      if (!isComponentDisplayNameAssignment(assignment, componentName)) {
        context.report({
          node: castNode(node),
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
} as const;

const normalizeNames = (
  names: string | undefined | readonly string[],
): ReadonlySet<string> =>
  names === undefined
    ? new Set<string>()
    : typeof names === 'string'
      ? new Set<string>([names])
      : new Set(names);

/**
 * The assignment in the statement right after the one declaring `node`, in the
 * same statement list: the program's, a block's, a class static block's, a
 * namespace's or a `case`'s. For a component declared inside a function, the
 * statement after the enclosing one does not count.
 */
const getDisplayNameAssignment = (
  node: DeepReadonly<TSESTree.VariableDeclarator>,
): DeepReadonly<TSESTree.AssignmentExpression> | undefined => {
  const nextStatement = siblingOf(node.parent, 1);

  if (nextStatement?.type !== AST_NODE_TYPES.ExpressionStatement) {
    return undefined;
  }

  // `(C.displayName = 'C') satisfies string;` assigns it all the same.
  const expression = skipTypeWrappers(nextStatement.expression);

  return expression.type === AST_NODE_TYPES.AssignmentExpression
    ? expression
    : undefined;
};

const isComponentDisplayNameAssignment = (
  assignment: DeepReadonly<TSESTree.AssignmentExpression>,
  componentName: string,
): assignment is TSESTree.AssignmentExpression => {
  const left = skipTypeWrappers(assignment.left);

  if (left.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const object = skipTypeWrappers(left.object);

  if (object.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  if (object.name !== componentName) {
    return false;
  }

  return (
    left.property.type === AST_NODE_TYPES.Identifier &&
    left.property.name === 'displayName'
  );
};

const extractDisplayName = (
  wrappedExpression: DeepReadonly<TSESTree.Expression>,
): string | undefined => {
  // `'C' as const` and `'C' satisfies string` name the component `C` too.
  const expression = skipTypeWrappers(wrappedExpression);

  if (
    expression.type === AST_NODE_TYPES.Literal &&
    typeof expression.value === 'string'
  ) {
    return expression.value;
  }

  if (
    expression.type === AST_NODE_TYPES.TemplateLiteral &&
    Arr.isEmpty(expression.expressions) &&
    Arr.isFixedLengthArray(1, expression.quasis)
  ) {
    return expression.quasis[0].value.cooked ?? undefined;
  }

  return undefined;
};
