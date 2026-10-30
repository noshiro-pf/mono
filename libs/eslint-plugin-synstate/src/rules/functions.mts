import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  isIdentifierNamed,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';

export type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

export const isFunctionNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is FunctionNode =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.FunctionExpression;

export const enclosingFunctionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): FunctionNode | undefined => {
  // The program's `parent` is `null` at run time, whatever its type says.
  if (node.type === AST_NODE_TYPES.Program) {
    return undefined;
  }

  const parent = node.parent;

  return isFunctionNode(parent) ? parent : enclosingFunctionOf(parent);
};

/**
 * The function of this file that `expression` is or names: a function
 * expression, a function declaration, or a `const` bound to a function
 * expression, so that the name stays the function it was given.
 */
export const localFunctionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Node,
): FunctionNode | undefined => {
  const node = skipTypeWrappers(expression);

  if (isFunctionNode(node)) {
    return node;
  }

  if (node.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const variable = ASTUtils.findVariable(sourceCode.getScope(node), node.name);

  const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;

  if (def?.type === TSESLint.Scope.DefinitionType.FunctionName) {
    return def.node.type === AST_NODE_TYPES.FunctionDeclaration
      ? def.node
      : undefined;
  }

  if (
    def?.type !== TSESLint.Scope.DefinitionType.Variable ||
    def.parent.kind !== 'const' ||
    def.node.id !== def.name ||
    def.node.init === null
  ) {
    return undefined;
  }

  const init = skipTypeWrappers(def.node.init);

  return isFunctionNode(init) ? init : undefined;
};

/**
 * The call that `node` is an argument of, through the type wrappers around
 * `node`, or `undefined`.
 */
export const callTakingAsArgument = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.CallExpression | undefined => {
  const parent = node.parent;

  if (parent === undefined) {
    return undefined;
  }

  if (isTypeWrapper(parent)) {
    return callTakingAsArgument(parent);
  }

  // A function or a call under a call is its callee or one of its arguments.
  return parent.type === AST_NODE_TYPES.CallExpression && parent.callee !== node
    ? parent
    : undefined;
};

/** Whether `call` is an argument of `.pipe(…)`, through type wrappers. */
export const isPipeArgument = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  call: TSESTree.CallExpression,
): boolean => {
  const pipe = callTakingAsArgument(call);

  if (pipe === undefined) {
    return false;
  }

  const pipeCallee = skipTypeWrappers(pipe.callee);

  return (
    pipeCallee.type === AST_NODE_TYPES.MemberExpression &&
    isPropertyNamed(pipeCallee, 'pipe')
  );
};

/**
 * `node` as `receiver.pipe(operator)`, or `undefined` when it is not a `.pipe`
 * call with one argument.
 */
export const pipeCallOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
):
  | Readonly<{
      receiver: TSESTree.Expression;
      operator: TSESTree.Expression;
    }>
  | undefined => {
  if (
    node.type !== AST_NODE_TYPES.CallExpression ||
    node.arguments.length !== 1
  ) {
    return undefined;
  }

  const [operator] = node.arguments;

  if (
    operator === undefined ||
    operator.type === AST_NODE_TYPES.SpreadElement
  ) {
    return undefined;
  }

  const callee = skipTypeWrappers(node.callee);

  return callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    isIdentifierNamed(callee.property, 'pipe')
    ? { receiver: callee.object, operator }
    : undefined;
};

/** `x.name` or `x['name']`. */
export const isPropertyNamed = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  member: TSESTree.MemberExpression,
  name: string,
): boolean =>
  member.computed
    ? member.property.type === AST_NODE_TYPES.Literal &&
      member.property.value === name
    : member.property.type === AST_NODE_TYPES.Identifier &&
      member.property.name === name;
