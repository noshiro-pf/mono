import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper } from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { castNode, isReactApiCall } from './shared.mjs';

type MessageIds = 'disallowUseMemoTypeAnnotation';

export const useMemoHooksStyleRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Restricts React.useMemo hook usage patterns for consistent styles.',
    },
    schema: [],
    messages: {
      disallowUseMemoTypeAnnotation:
        'The variable type T should be annotated as `React.useMemo<T>` or `const v: T = React.useMemo(...)`.',
    },
    defaultOptions: [],
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (!isReactApiCall(context, node, 'useMemo')) {
        return;
      }

      // `!` and `satisfies` leave the type to `useMemo`; an `as` over them, as
      // in `React.useMemo(...)! as T`, does not.
      const { parent } = skipNonAssertingParents(node);

      if (
        (parent?.type === AST_NODE_TYPES.TSAsExpression ||
          parent?.type === AST_NODE_TYPES.TSTypeAssertion) &&
        !isConstAssertion(parent.typeAnnotation)
      ) {
        context.report({
          node: castNode(parent),
          messageId: 'disallowUseMemoTypeAnnotation',
        });
      }

      const [firstArg] = node.arguments;

      if (
        firstArg !== undefined &&
        firstArg.type !== AST_NODE_TYPES.SpreadElement
      ) {
        checkFactory(context, firstArg);
      }
    },
  }),
} as const;

const isConstAssertion = (
  node: DeepReadonly<TSESTree.Node> | undefined,
): node is TSESTree.TSTypeReference => {
  if (node === undefined) {
    return false;
  }

  return (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'const'
  );
};

/**
 * The arguments of the `return` statements in `statement`, through every nested
 * statement but not into a nested function or class, which return for
 * themselves.
 */
const returnedValues = (
  statement: DeepReadonly<TSESTree.Statement>,
): readonly DeepReadonly<TSESTree.Expression>[] => {
  if (statement.type === AST_NODE_TYPES.ReturnStatement) {
    return statement.argument === null ? [] : [statement.argument];
  }

  if (statement.type === AST_NODE_TYPES.BlockStatement) {
    return statement.body.flatMap(returnedValues);
  }

  if (statement.type === AST_NODE_TYPES.IfStatement) {
    return [
      ...returnedValues(statement.consequent),
      ...(statement.alternate === null
        ? []
        : returnedValues(statement.alternate)),
    ];
  }

  if (
    statement.type === AST_NODE_TYPES.ForStatement ||
    statement.type === AST_NODE_TYPES.ForInStatement ||
    statement.type === AST_NODE_TYPES.ForOfStatement ||
    statement.type === AST_NODE_TYPES.WhileStatement ||
    statement.type === AST_NODE_TYPES.DoWhileStatement ||
    statement.type === AST_NODE_TYPES.LabeledStatement ||
    statement.type === AST_NODE_TYPES.WithStatement
  ) {
    return returnedValues(statement.body);
  }

  if (statement.type === AST_NODE_TYPES.SwitchStatement) {
    return statement.cases.flatMap(({ consequent }) =>
      consequent.flatMap(returnedValues),
    );
  }

  if (statement.type === AST_NODE_TYPES.TryStatement) {
    return [
      ...returnedValues(statement.block),
      ...(statement.handler === null
        ? []
        : returnedValues(statement.handler.body)),
      ...(statement.finalizer === null
        ? []
        : returnedValues(statement.finalizer)),
    ];
  }

  // Any other statement, including one a newer parser adds, returns nothing
  // from this function.
  return [];
};

/**
 * Reports an assertion that decides the type of a value the factory returns:
 * on the value itself, under `!`, `satisfies` or `await`, on a branch of `? :`,
 * of `||` / `??` or the right side of `&&`, or the last expression of a
 * sequence. One inside the value is left alone: under an operator, in a call or
 * as an assignment's right side (`!(x as boolean)`, `f(x as T)`,
 * `ref.current = x as T`) `useMemo<T>` could not replace it, and in a literal's
 * member or a returned function's body the rule cannot tell a cast `useMemo<T>`
 * could replace from one it could not (`[] as number[]` against
 * `e.target as HTMLInputElement`).
 */
const checkReturnedValue = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  node: DeepReadonly<TSESTree.Expression>,
): void => {
  if (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion
  ) {
    if (!isConstAssertion(node.typeAnnotation)) {
      context.report({
        node: castNode(node),
        messageId: 'disallowUseMemoTypeAnnotation',
      });
    }

    return;
  }

  if (isTypeWrapper(node)) {
    checkReturnedValue(context, node.expression);

    return;
  }

  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    checkReturnedValue(context, node.consequent);

    checkReturnedValue(context, node.alternate);

    return;
  }

  // `a && b`'s left side is a condition, as `? :`'s test is.
  if (node.type === AST_NODE_TYPES.LogicalExpression) {
    if (node.operator !== '&&') {
      checkReturnedValue(context, node.left);
    }

    checkReturnedValue(context, node.right);

    return;
  }

  if (node.type === AST_NODE_TYPES.AwaitExpression) {
    checkReturnedValue(context, node.argument);

    return;
  }

  if (node.type === AST_NODE_TYPES.SequenceExpression) {
    const last = node.expressions.at(-1);

    if (last !== undefined) {
      checkReturnedValue(context, last);
    }
  }
};

/**
 * Reports the type annotations of `useMemo`'s factory, an arrow or a
 * `function`: an `as` around it (`(() => x) as () => T`), its return type and
 * the assertions on the values it returns (see `checkReturnedValue`). The
 * factory is found through type wrappers, so `satisfies` around it is looked
 * through rather than hiding what it wraps.
 */
const checkFactory = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  node: DeepReadonly<TSESTree.Expression>,
): void => {
  if (
    (node.type === AST_NODE_TYPES.TSAsExpression ||
      node.type === AST_NODE_TYPES.TSTypeAssertion) &&
    !isConstAssertion(node.typeAnnotation)
  ) {
    context.report({
      node: castNode(node),
      messageId: 'disallowUseMemoTypeAnnotation',
    });
  }

  if (isTypeWrapper(node)) {
    checkFactory(context, node.expression);

    return;
  }

  if (
    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionExpression
  ) {
    const { returnType, body } = node;

    if (returnType !== undefined) {
      context.report({
        node: castNode(returnType),
        messageId: 'disallowUseMemoTypeAnnotation',
      });
    }

    // A generator's value is the generator object, which its `return`s do not
    // decide.
    const values =
      body.type !== AST_NODE_TYPES.BlockStatement
        ? ([body] as const)
        : node.generator
          ? ([] as const)
          : returnedValues(body);

    for (const value of values) {
      checkReturnedValue(context, value);
    }
  }
};

/**
 * The outermost of the `!` and `satisfies` expressions directly around `node`,
 * or `node` itself when there is none.
 */
const skipNonAssertingParents = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const { parent } = node;

  return (parent?.type === AST_NODE_TYPES.TSNonNullExpression ||
    parent?.type === AST_NODE_TYPES.TSSatisfiesExpression) &&
    parent.expression === node
    ? skipNonAssertingParents(parent)
    : node;
};
