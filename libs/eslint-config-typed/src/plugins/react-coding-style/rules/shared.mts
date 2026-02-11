import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

const isReactMemberExpression = (
  node: DeepReadonly<TSESTree.MemberExpression>,
  propertyName: string,
): boolean =>
  node.object.type === AST_NODE_TYPES.Identifier &&
  node.object.name === 'React' &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === propertyName &&
  !node.computed;

/**
 * Check if the given identifier is imported from "react"
 */
const isImportedFromReact = (
  context: DeepReadonly<TSESLint.RuleContext<string, unknown[]>>,
  identifierName: string,
): boolean => {
  const sourceCode = context.sourceCode;

  // Get the global scope to search for imports
  const globalScope = sourceCode.scopeManager?.globalScope ?? undefined;

  if (globalScope === undefined) {
    // If no scope manager, assume it's React (for backward compatibility)
    return true;
  }

  // Search through all scopes for the variable
  const scopes = [globalScope, ...globalScope.childScopes] as const;

  const variables = scopes
    .map((scope) => scope.set.get(identifierName))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  if (variables.length === 0) {
    // If variable is not found in any scope, assume it's a global (React)
    // This handles cases where React is used without explicit import
    return true;
  }

  // Check if any variable is imported from 'react'
  for (const variable of variables) {
    for (const def of variable.defs) {
      // Type narrowing: def.type is a string literal type, not enum
      if (
        Object.hasOwn(def, 'type') &&
        typeof def.type === 'string' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        def.type === 'ImportBinding'
      ) {
        const importDeclaration = def.parent;

        if (
          importDeclaration.type === AST_NODE_TYPES.ImportDeclaration &&
          importDeclaration.source.value === 'react'
        ) {
          return true;
        }

        // Found an import, but not from 'react'
        return false;
      }
    }
  }

  // Variable was found but not as an import, it's a local definition
  return false;
};

/**
 * Check if the given CallExpression is a React API call.
 * Supports both namespace imports (React.memo) and named imports (memo).
 * Verifies that the identifier is actually imported from "react".
 */
export const isReactApiCall = (
  context: DeepReadonly<TSESLint.RuleContext<string, unknown[]>>,
  node: DeepReadonly<TSESTree.CallExpression>,
  apiName: string,
): boolean => {
  // Check for named import: memo(...)
  if (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === apiName
  ) {
    return isImportedFromReact(context, apiName);
  }

  // Check for namespace import: React.memo(...)
  if (
    node.callee.type === AST_NODE_TYPES.MemberExpression &&
    isReactMemberExpression(node.callee, apiName)
  ) {
    return isImportedFromReact(context, 'React');
  }

  return false;
};

export const getReactMemoArrowFunction = (
  node: DeepReadonly<TSESTree.CallExpression>,
): DeepReadonly<TSESTree.ArrowFunctionExpression> | undefined => {
  const [firstArgument] = node.arguments;

  if (firstArgument === undefined) {
    return undefined;
  }

  if (firstArgument.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
    return undefined;
  }

  return firstArgument;
};
