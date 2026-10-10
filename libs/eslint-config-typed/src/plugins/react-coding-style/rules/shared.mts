import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper, skipTypeWrappers } from '../../ast-utils/index.mjs';

/**
 * Converts a `DeepReadonly` AST node back to the plain node type expected by
 * `context.report`.
 *
 * `castDeepMutable` maps `DeepReadonly<TSESTree.Node>` structurally, which
 * produces a type that no longer matches the nominal `TSESTree.Node` union and
 * makes the compiler bail out with "excessive stack depth" on large node
 * unions. Casting back to the original node type keeps the comparison cheap.
 */
export const castNode = <N extends TSESTree.Node>(node: DeepReadonly<N>): N =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as N;

const isReactMemberExpression = (
  node: DeepReadonly<TSESTree.MemberExpression>,
  propertyName: string,
): boolean => {
  const object = skipTypeWrappers(node.object);

  return (
    object.type === AST_NODE_TYPES.Identifier &&
    object.name === 'React' &&
    node.property.type === AST_NODE_TYPES.Identifier &&
    node.property.name === propertyName &&
    !node.computed
  );
};

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
  const scopes = Arr.toUnshifted(globalScope)(globalScope.childScopes);

  const variables = scopes
    .map((scope) => scope.set.get(identifierName))
    .filter((v): v is NonNullable<typeof v> => v !== undefined);

  if (Arr.isEmpty(variables)) {
    // If variable is not found in any scope, assume it's a global (React)
    // This handles cases where React is used without explicit import
    return true;
  }

  // Check if any variable is imported from 'react'
  for (const variable of variables) {
    for (const def of variable.defs) {
      // Type narrowing: def.type is a string literal type, not enum
      if (
        isRecord(def) &&
        hasKey(def, 'type') &&
        typeof def.type === 'string' &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        def.type === 'ImportBinding'
      ) {
        const importDeclaration = def.parent;

        // False when an import was found, but not from 'react'
        return (
          importDeclaration.type === AST_NODE_TYPES.ImportDeclaration &&
          importDeclaration.source.value === 'react'
        );
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
 * Type wrappers around the callee and around `React` are looked through:
 * `(React.memo as typeof React.memo)(...)` and `React.memo!(...)` are memo
 * calls.
 */
export const isReactApiCall = (
  context: DeepReadonly<TSESLint.RuleContext<string, unknown[]>>,
  node: DeepReadonly<TSESTree.CallExpression>,
  apiName: string,
): boolean => {
  const callee = skipTypeWrappers(node.callee);

  // Check for named import: memo(...)
  if (callee.type === AST_NODE_TYPES.Identifier && callee.name === apiName) {
    return isImportedFromReact(context, apiName);
  }

  // Check for namespace import: React.memo(...)
  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isReactMemberExpression(callee, apiName)
  ) {
    return isImportedFromReact(context, 'React');
  }

  return false;
};

/**
 * The arrow function passed to `React.memo` as its first argument, type
 * wrappers around it taken off:
 * `React.memo(((props) => …) satisfies React.FC<Props>)` passes one.
 */
export const getReactMemoArrowFunction = (
  node: DeepReadonly<TSESTree.CallExpression>,
): DeepReadonly<TSESTree.ArrowFunctionExpression> | undefined => {
  const [firstArgument] = node.arguments;

  if (
    firstArgument === undefined ||
    firstArgument.type === AST_NODE_TYPES.SpreadElement
  ) {
    return undefined;
  }

  const argument = skipTypeWrappers(firstArgument);

  return argument.type !== AST_NODE_TYPES.ArrowFunctionExpression
    ? undefined
    : argument;
};

/**
 * The outermost type wrapper whose value is `node`'s, or `node` itself when
 * its parent is not one: from the arrow function in
 * `((props) => <div />) satisfies React.FC as React.FC`, the `as` expression.
 * A rule that asks where a value ends up (a variable's initializer, a call's
 * argument) asks it of the node this returns.
 */
export const climbTypeWrappers = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const { parent } = node;

  return parent !== undefined &&
    isTypeWrapper(parent) &&
    parent.expression === node
    ? climbTypeWrappers(parent)
    : node;
};
