import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

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
 * The outermost type wrapper whose value is `node`'s, or `node` itself when its
 * parent is not one: from the arrow function in
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

export type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export const isFunctionNode = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<FunctionNode> =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.FunctionExpression;

/**
 * `['Math', 'max']` for `Math.max`, `['useValue']` for `useValue`, through type
 * wrappers; `undefined` for a callee that is not a dotted name.
 */
export const calleePath = (
  node: DeepReadonly<TSESTree.Node>,
): readonly string[] | undefined => {
  const callee = skipTypeWrappers(node);

  if (callee.type === AST_NODE_TYPES.Identifier) {
    return [callee.name];
  }

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.property.type === AST_NODE_TYPES.Identifier
  ) {
    const objectPath = calleePath(callee.object);

    return objectPath === undefined
      ? undefined
      : Arr.toPushed(objectPath, callee.property.name);
  }

  return undefined;
};

/**
 * The name the given expression is bound to, when it is bound to one, through
 * type wrappers: `function Foo() {}` and `const Foo = (() => <div />) satisfies
 * React.FC;` bind `Foo`.
 */
export const getBoundIdentifier = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Identifier> | undefined => {
  if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
    return node.id ?? undefined;
  }

  const wrapped = climbTypeWrappers(node);

  const parent =
    wrapped.type === AST_NODE_TYPES.Program ? undefined : wrapped.parent;

  return parent?.type === AST_NODE_TYPES.VariableDeclarator &&
    parent.init === wrapped &&
    parent.id.type === AST_NODE_TYPES.Identifier
    ? parent.id
    : undefined;
};

const componentNamePattern = /^[A-Z]/u;

/** A capitalized name, which JSX reads as a component. */
export const isComponentName = (name: string): boolean =>
  componentNamePattern.test(name);

const hookNamePattern = /^use(?:[A-Z0-9]|$)/u;

/** `use`, or `use` followed by a capital letter or a digit. */
export const isHookName = (name: string): boolean => hookNamePattern.test(name);

/**
 * Whether `fn` is a function component: the first argument of `React.memo` or
 * `React.forwardRef`, the first function argument of a call whose callee's last
 * name is in `componentWrappers` (`memoNamed('Foo', (props) => …)`), or a function
 * bound to a capitalized name that draws JSX somewhere in its body
 * (`containsJsx`; a capitalized function without JSX is an ordinary helper).
 */
export const isComponentFunction = (
  context: DeepReadonly<TSESLint.RuleContext<string, unknown[]>>,
  fn: DeepReadonly<FunctionNode>,
  options: Readonly<{
    containsJsx: boolean;
    componentWrappers: ReadonlySet<string>;
  }>,
): boolean => {
  const boundName = getBoundIdentifier(fn)?.name;

  if (boundName !== undefined) {
    return isComponentName(boundName) && options.containsJsx;
  }

  const wrapped = climbTypeWrappers(fn);

  const parent =
    wrapped.type === AST_NODE_TYPES.Program ? undefined : wrapped.parent;

  if (
    parent?.type !== AST_NODE_TYPES.CallExpression ||
    parent.callee === wrapped
  ) {
    return false;
  }

  if (
    isReactApiCall(context, parent, 'memo') ||
    isReactApiCall(context, parent, 'forwardRef')
  ) {
    return parent.arguments[0] === wrapped;
  }

  const calleeName = calleePath(parent.callee)?.at(-1);

  // The component is the wrapper's first function argument:
  // `memoNamed('Foo', (props) => …)`, not a comparator after it.
  return (
    calleeName !== undefined &&
    options.componentWrappers.has(calleeName) &&
    parent.arguments.find(
      (arg) =>
        arg.type !== AST_NODE_TYPES.SpreadElement &&
        isFunctionNode(skipTypeWrappers(arg)),
    ) === wrapped
  );
};

/**
 * Adds every function that encloses `node` to `mut_functions`: called on each
 * JSX node and `React.createElement` call, it leaves there the functions that
 * contain JSX somewhere in their body, complete by the time each function is
 * exited.
 */
export const markFunctionsContainingJsx = (
  mut_functions: Set<DeepReadonly<FunctionNode>>,
  node: DeepReadonly<TSESTree.Node>,
): void => {
  let mut_current: DeepReadonly<TSESTree.Node> = node;

  // `Program` has no parent; the type says `undefined`, ESLint gives `null`.
  while (mut_current.type !== AST_NODE_TYPES.Program) {
    mut_current = mut_current.parent;

    if (!isFunctionNode(mut_current)) {
      continue;
    }

    // Its enclosing functions were marked when it was.
    if (mut_functions.has(mut_current)) {
      return;
    }

    mut_functions.add(mut_current);
  }
};

/** Whether `fn` is a custom hook: a function bound to a `use…` name. */
export const isHookFunction = (fn: DeepReadonly<FunctionNode>): boolean => {
  const boundName = getBoundIdentifier(fn)?.name;

  return boundName !== undefined && isHookName(boundName);
};

/**
 * Visitors that call `onJsx` with every JSX element, JSX fragment and
 * `React.createElement` call: what the rules here count as drawing JSX.
 */
export const jsxNodeVisitors = (
  context: DeepReadonly<TSESLint.RuleContext<string, unknown[]>>,
  onJsx: (node: DeepReadonly<TSESTree.Node>) => void,
): TSESLint.RuleListener =>
  ({
    JSXElement: onJsx,
    JSXFragment: onJsx,
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (isReactApiCall(context, node, 'createElement')) {
        onJsx(node);
      }
    },
  }) as const;

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
