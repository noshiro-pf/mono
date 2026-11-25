import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { asNode, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'unreturnedPromise';

/**
 * Report a promise a Cloud Functions handler starts and neither returns nor
 * awaits.
 *
 * ## Why
 *
 * Once a handler returns (or the promise it returned settles), the instance may
 * be throttled or reclaimed, so work it left running may never finish: a mail
 * not sent, a write not made. `no-floating-promises` accepts a statement ending
 * in `.catch` or discarded with `void`, which is exactly how such work is
 * usually left behind (`onUserDelete(db, user).catch(logger.error);`).
 *
 * ## What it sees
 *
 * A handler is a function passed to a function `firebase-functions` declares
 * (`https.onCall`, `pubsub.schedule(…).onRun`, `auth.user().onDelete`, the v2
 * triggers and the rest): inline, or by a name declared in the same file, read
 * through `as`, `satisfies`, `!`, `<T>` and parentheses. A handler built by a
 * helper is read too: the functions passed to the helper, and, for a helper
 * declared in the same file, the functions it returns. A handler declared in
 * another file is not read here.
 *
 * In the handler's body, outside the functions nested in it, every expression
 * statement whose value is a promise, or may be one, is reported, and so is one
 * that discards a promise with `void`. A promise returned, or awaited, is not.
 */
export const noUnreturnedPromiseInCloudFunction: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require a Cloud Functions handler to return or await every promise it starts, since the instance may be throttled or reclaimed once the handler returns',
    },
    schema: [],
    messages: {
      unreturnedPromise:
        'This promise is neither returned nor awaited by the Cloud Functions handler, so the instance may be throttled or reclaimed before it settles. Return it, or await it.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const sourceFile = parserServices.esTreeNodeToTSNodeMap.get(
      context.sourceCode.ast,
    );

    /** Whether some member of the expression's type has a callable `then`. */
    const isThenable = (node: DeepReadonly<TSESTree.Node>): boolean => {
      const type = parserServices.getTypeAtLocation(asNode(node));

      const parts = type.isUnion() ? type.types : [type];

      return parts.some((part) => {
        const then = checker.getPropertyOfType(part, 'then');

        return (
          then !== undefined &&
          Arr.isNonEmpty(
            checker
              .getTypeOfSymbolAtLocation(
                then,
                parserServices.esTreeNodeToTSNodeMap.get(asNode(node)),
              )
              .getCallSignatures(),
          )
        );
      });
    };

    /** Whether the function a call calls is one `firebase-functions` declares. */
    const callsFirebaseFunctions = (
      node: DeepReadonly<TSESTree.CallExpression>,
    ): boolean => {
      const tsCall = parserServices.esTreeNodeToTSNodeMap.get(asNode(node));

      if (!ts.isCallExpression(tsCall)) {
        return false;
      }

      const declaration = checker
        .getResolvedSignature(tsCall)
        ?.getDeclaration();

      return declaration !== undefined && isFirebaseFunctions(declaration);
    };

    /**
     * The functions of this file an argument stands for, as a handler: itself,
     * what a name declared here holds, and what a helper call is built from.
     */
    const handlersOf = (
      argument: DeepReadonly<TSESTree.Node>,
      seen: ReadonlySet<DeepReadonly<TSESTree.Node>>,
    ): readonly DeepReadonly<FunctionNode>[] => {
      const node = skipTypeWrappers(asNode(argument));

      if (seen.has(node)) {
        return [];
      }

      const next = new Set<DeepReadonly<TSESTree.Node>>([...seen, node]);

      if (isFunctionNode(node)) {
        return [node];
      }

      if (node.type === AST_NODE_TYPES.Identifier) {
        return declaredFunctionsOf(node).flatMap((fn) => handlersOf(fn, next));
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        return [
          ...node.arguments.flatMap((inner) => handlersOf(inner, next)),
          ...(node.callee.type === AST_NODE_TYPES.Identifier
            ? declaredFunctionsOf(node.callee).flatMap((helper) =>
                returnedValuesOf(helper).flatMap((value) =>
                  handlersOf(value, next),
                ),
              )
            : []),
        ];
      }

      return [];
    };

    /**
     * The node of this file a declaration is, if it has one: a declaration of
     * another file has none, nor has one of this file that the parser does not
     * map, such as a `catch` clause's variable or a parameter. The map's type
     * says it always has.
     */
    const esTreeNodeOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Declaration has no readonly form the compiler API accepts; read only.
      declaration: ts.Declaration,
    ): TSESTree.Node | undefined =>
      declaration.getSourceFile() === sourceFile
        ? parserServices.tsNodeToESTreeNodeMap.get(declaration)
        : undefined;

    /** The value a name declared in this file is initialized with. */
    const declaredFunctionsOf = (
      identifier: DeepReadonly<TSESTree.Identifier>,
    ): readonly DeepReadonly<TSESTree.Node>[] => {
      const symbol = checker.getSymbolAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(asNode(identifier)),
      );

      return (symbol?.declarations ?? []).flatMap(
        (declaration): readonly DeepReadonly<TSESTree.Node>[] => {
          const esNode = esTreeNodeOf(declaration);

          if (esNode?.type === AST_NODE_TYPES.FunctionDeclaration) {
            return [esNode];
          }

          return esNode?.type === AST_NODE_TYPES.VariableDeclarator &&
            esNode.init !== null
            ? [esNode.init]
            : [];
        },
      );
    };

    const reportUnreturned = (fn: DeepReadonly<FunctionNode>): void => {
      if (fn.body.type !== AST_NODE_TYPES.BlockStatement) {
        // An expression body is what the function returns.
        return;
      }

      for (const statement of statementsOf(fn.body)) {
        const expression = statement.expression;

        const discarded =
          expression.type === AST_NODE_TYPES.UnaryExpression &&
          expression.operator === 'void'
            ? expression.argument
            : expression;

        if (isThenable(discarded)) {
          context.report({
            node: asNode(expression),
            messageId: 'unreturnedPromise',
          });
        }
      }
    };

    const mut_checked = new Set<DeepReadonly<FunctionNode>>();

    return {
      CallExpression: (node) => {
        if (!callsFirebaseFunctions(node)) {
          return;
        }

        for (const argument of node.arguments) {
          for (const handler of handlersOf(
            argument,
            new Set<DeepReadonly<TSESTree.Node>>(),
          )) {
            if (mut_checked.has(handler)) {
              continue;
            }

            mut_checked.add(handler);

            reportUnreturned(handler);
          }
        }
      },
    };
  },
} as const;

const isFunctionNode = (
  node: DeepReadonly<TSESTree.Node>,
): node is DeepReadonly<FunctionNode> =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration;

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

const isFirebaseFunctionsSpecifier = (specifier: string): boolean =>
  specifier === 'firebase-functions' ||
  specifier.startsWith('firebase-functions/');

/**
 * Whether a declaration is `firebase-functions`'s: in a file of the package
 * under `node_modules`, or in an ambient `declare module 'firebase-functions…'`.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Declaration has no readonly form the compiler API accepts; read only.
const isFirebaseFunctions = (declaration: ts.Declaration): boolean => {
  const ambient = ts.findAncestor(
    declaration,
    (node) => ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name),
  );

  return ambient !== undefined && ts.isModuleDeclaration(ambient)
    ? isFirebaseFunctionsSpecifier(ambient.name.text)
    : /[\\/]node_modules[\\/]firebase-functions[\\/]/u.test(
        declaration.getSourceFile().fileName,
      );
};

/** Every statement of a block, at any depth, outside nested functions. */
const nestedStatementsOf = (
  node: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Statement>[] => {
  if (node.type === AST_NODE_TYPES.BlockStatement) {
    return node.body.flatMap((statement) =>
      Arr.toUnshifted(statement)(nestedStatementsOf(statement)),
    );
  }

  if (node.type === AST_NODE_TYPES.IfStatement) {
    return [
      node.consequent,
      ...nestedStatementsOf(node.consequent),
      ...(node.alternate === null
        ? []
        : Arr.toUnshifted(node.alternate)(nestedStatementsOf(node.alternate))),
    ];
  }

  if (node.type === AST_NODE_TYPES.TryStatement) {
    return [
      ...nestedStatementsOf(node.block),
      ...(node.handler === null ? [] : nestedStatementsOf(node.handler.body)),
      ...(node.finalizer === null ? [] : nestedStatementsOf(node.finalizer)),
    ];
  }

  if (node.type === AST_NODE_TYPES.SwitchStatement) {
    return node.cases.flatMap(({ consequent }) =>
      consequent.flatMap((statement) =>
        Arr.toUnshifted(statement)(nestedStatementsOf(statement)),
      ),
    );
  }

  return node.type === AST_NODE_TYPES.ForStatement ||
    node.type === AST_NODE_TYPES.ForInStatement ||
    node.type === AST_NODE_TYPES.ForOfStatement ||
    node.type === AST_NODE_TYPES.WhileStatement ||
    node.type === AST_NODE_TYPES.DoWhileStatement ||
    node.type === AST_NODE_TYPES.LabeledStatement
    ? Arr.toUnshifted(node.body)(nestedStatementsOf(node.body))
    : [];
};

const returnStatementsOf = (
  block: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.ReturnStatement>[] =>
  nestedStatementsOf(block).filter(
    (statement): statement is DeepReadonly<TSESTree.ReturnStatement> =>
      statement.type === AST_NODE_TYPES.ReturnStatement,
  );

/**
 * What a function returns that may itself be a function: the body of an arrow
 * with an expression body, and the argument of each `return` outside the
 * functions nested in it.
 */
const returnedValuesOf = (
  node: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Node>[] => {
  if (
    node.type !== AST_NODE_TYPES.ArrowFunctionExpression &&
    node.type !== AST_NODE_TYPES.FunctionExpression &&
    node.type !== AST_NODE_TYPES.FunctionDeclaration
  ) {
    return [];
  }

  if (node.body.type !== AST_NODE_TYPES.BlockStatement) {
    return [node.body];
  }

  const { body } = node;

  return Arr.generate(function* () {
    for (const { argument } of returnStatementsOf(body)) {
      if (argument !== null) {
        yield argument;
      }
    }
  });
};

/**
 * The expression statements of a block and the blocks in it, outside the
 * functions and classes nested in it.
 */
const statementsOf = (
  block: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.ExpressionStatement>[] =>
  nestedStatementsOf(block).filter(
    (statement): statement is DeepReadonly<TSESTree.ExpressionStatement> =>
      statement.type === AST_NODE_TYPES.ExpressionStatement,
  );
