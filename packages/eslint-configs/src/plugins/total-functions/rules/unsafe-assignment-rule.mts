import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { getTypeImmutability, Immutability } from 'is-immutable-type';
import { type Type, type TypeChecker } from 'typescript';

export type MessageId = 'errorStringGeneric';

export const createNoUnsafeAssignmentRule =
  (
    isUnsafeAssignment: (
      checker: TypeChecker,
      destinationType: Type,
      sourceType: Type,
      sourceNode: TSESTree.Expression | undefined,
    ) => 'safe' | 'unsafe',
  ) =>
  (
    context: Readonly<TSESLint.RuleContext<MessageId, readonly unknown[]>>,
  ): TSESLint.RuleListener => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    // Special handling for array methods that return mutable arrays but that
    // we know are shallow copies and therefore safe to have their result
    // assigned to a readonly array.
    const isSafeAssignmentFromArrayMethod = (
      sourceExpression: TSESTree.Expression | undefined,
      destinationType: Type,
      sourceType: Type,
    ): 'safe' | 'unsafe' | 'unknown' => {
      const safeArrayMethods: readonly string[] = [
        'filter',
        'map',
        'concat',
        'flatMap',
        'flat',
        'slice',
      ] as const;

      // Arrays have number index types. This gives us access to the type within the array.
      const destinationIndexType = destinationType.getNumberIndexType();
      const sourceIndexType = sourceType.getNumberIndexType();

      return checker.isArrayType(destinationType) &&
        checker.isArrayType(sourceType) &&
        destinationIndexType !== undefined &&
        sourceIndexType !== undefined &&
        // and the assignment is from calling a member (obj.method(...))
        sourceExpression?.type === AST_NODE_TYPES.CallExpression &&
        sourceExpression.callee.type === AST_NODE_TYPES.MemberExpression &&
        // and the thing being called is an array
        // (so we can avoid permitting calls to array methods on other types)
        checker.isArrayType(
          checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(
              sourceExpression.callee.object,
            ),
          ),
        ) &&
        // and the method being called is an identifier that we can match on like "concat"
        sourceExpression.callee.property.type === AST_NODE_TYPES.Identifier &&
        // and it's not computed (obj["method"])
        // TODO: support computed properties like myArray["concat"]?
        !sourceExpression.callee.computed &&
        // and the method being called is one that we know is safe to assign to a readonly array
        safeArrayMethods.includes(sourceExpression.callee.property.name)
        ? // and the types within the source and destination array are themselves safe to assign
          // (avoid this issue: https://github.com/danielnixon/eslint-plugin-total-functions/issues/730)
          isUnsafeAssignment(
            checker,
            destinationIndexType,
            sourceIndexType,
            undefined,
          )
        : 'unknown';
    };

    return {
      VariableDeclaration: (node): void => {
        for (const declaration of node.declarations) {
          if (
            declaration.id.type === AST_NODE_TYPES.Identifier &&
            declaration.id.typeAnnotation === undefined
          ) {
            // If there is no type annotation then there's no risk of unsafe assignment.
            continue;
          }

          if (declaration.init === null) {
            // If there is no type annotation then there's no risk of unsafe assignment.
            continue;
          }

          const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(
            declaration.id,
          );
          const rightTsNode = parserServices.esTreeNodeToTSNodeMap.get(
            declaration.init,
          );

          const destinationType = checker.getTypeAtLocation(leftTsNode);
          const sourceType = checker.getTypeAtLocation(rightTsNode);

          const arrayMethodCallSafety = isSafeAssignmentFromArrayMethod(
            declaration.init,
            destinationType,
            sourceType,
          );

          if (arrayMethodCallSafety === 'safe') {
            continue;
          }

          if (
            arrayMethodCallSafety === 'unsafe' ||
            isUnsafeAssignment(
              checker,
              destinationType,
              sourceType,
              declaration.init,
            ) === 'unsafe'
          ) {
            context.report({
              node,
              messageId: 'errorStringGeneric',
              data: {
                sourceType: checker.typeToString(sourceType),
                destinationType: checker.typeToString(destinationType),
                sourceImmutability:
                  Immutability[getTypeImmutability(checker, sourceType)],
                destinationImmutability:
                  Immutability[getTypeImmutability(checker, destinationType)],
              },
            } as const);
          }
        }
      },

      AssignmentExpression: (node): void => {
        const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(node.left);
        const rightTsNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.right,
        );

        const destinationType = checker.getTypeAtLocation(leftTsNode);
        const sourceType = checker.getTypeAtLocation(rightTsNode);

        const arrayMethodCallSafety = isSafeAssignmentFromArrayMethod(
          node.right,
          destinationType,
          sourceType,
        );

        if (arrayMethodCallSafety === 'safe') {
          return;
        }

        if (
          arrayMethodCallSafety === 'unsafe' ||
          isUnsafeAssignment(
            checker,
            destinationType,
            sourceType,
            node.right,
          ) === 'unsafe'
        ) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
            data: {
              sourceType: checker.typeToString(sourceType),
              destinationType: checker.typeToString(destinationType),
              sourceImmutability:
                Immutability[getTypeImmutability(checker, sourceType)],
              destinationImmutability:
                Immutability[getTypeImmutability(checker, destinationType)],
            },
          } as const);
        }
      },

      ReturnStatement: (node): void => {
        if (node.argument === null) {
          return;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        if (tsNode.expression === undefined) {
          return;
        }

        const destinationType = checker.getContextualType(tsNode.expression);

        if (destinationType === undefined) {
          return;
        }

        const sourceType = checker.getTypeAtLocation(tsNode.expression);

        const arrayMethodCallSafety = isSafeAssignmentFromArrayMethod(
          node.argument,
          destinationType,
          sourceType,
        );

        if (arrayMethodCallSafety === 'safe') {
          return;
        }

        if (
          arrayMethodCallSafety === 'unsafe' ||
          isUnsafeAssignment(
            checker,
            destinationType,
            sourceType,
            node.argument,
          ) === 'unsafe'
        ) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
            data: {
              sourceType: checker.typeToString(sourceType),
              destinationType: checker.typeToString(destinationType),
              sourceImmutability:
                Immutability[getTypeImmutability(checker, sourceType)],
              destinationImmutability:
                Immutability[getTypeImmutability(checker, destinationType)],
            },
          } as const);
        }
      },
      // TODO fix this copypasta between YieldExpression and ReturnStatement

      YieldExpression: (node): void => {
        if (node.argument === null) {
          return;
        }

        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        if (tsNode.expression === undefined) {
          return;
        }

        const destinationType = checker.getContextualType(tsNode.expression);

        if (destinationType === undefined) {
          return;
        }

        const sourceType = checker.getTypeAtLocation(tsNode.expression);

        const arrayMethodCallSafety = isSafeAssignmentFromArrayMethod(
          node.argument,
          destinationType,
          sourceType,
        );

        if (arrayMethodCallSafety === 'safe') {
          return;
        }

        if (
          arrayMethodCallSafety === 'unsafe' ||
          isUnsafeAssignment(
            checker,
            destinationType,
            sourceType,
            node.argument,
          ) === 'unsafe'
        ) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
            data: {
              sourceType: checker.typeToString(sourceType),
              destinationType: checker.typeToString(destinationType),
              sourceImmutability:
                Immutability[getTypeImmutability(checker, sourceType)],
              destinationImmutability:
                Immutability[getTypeImmutability(checker, destinationType)],
            },
          } as const);
        }
      },

      ArrowFunctionExpression: (node): void => {
        if (node.returnType === undefined) {
          return;
        }

        const destinationNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.returnType.typeAnnotation,
        );
        const destinationType = checker.getTypeAtLocation(destinationNode);
        const sourceNode = parserServices.esTreeNodeToTSNodeMap.get(node.body);
        const sourceType = checker.getTypeAtLocation(sourceNode);

        // the BlockStatement case should be handled by the ReturnStatement branch.
        const arrayMethodCallSafety =
          node.body.type !== AST_NODE_TYPES.BlockStatement
            ? isSafeAssignmentFromArrayMethod(
                node.body,
                destinationType,
                sourceType,
              )
            : 'unknown';

        if (arrayMethodCallSafety === 'safe') {
          return;
        }

        if (
          arrayMethodCallSafety === 'unsafe' ||
          isUnsafeAssignment(
            checker,
            destinationType,
            sourceType,
            node.body.type !== AST_NODE_TYPES.BlockStatement
              ? node.body
              : undefined,
          ) === 'unsafe'
        ) {
          context.report({
            node: node.body,
            messageId: 'errorStringGeneric',
            data: {
              sourceType: checker.typeToString(sourceType),
              destinationType: checker.typeToString(destinationType),
              sourceImmutability:
                Immutability[getTypeImmutability(checker, sourceType)],
              destinationImmutability:
                Immutability[getTypeImmutability(checker, destinationType)],
            },
          } as const);
        }
      },

      CallExpression: (node): void => {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        for (const [i, tsArgument] of tsNode.arguments.entries()) {
          const sourceType = checker.getTypeAtLocation(tsArgument);
          const destinationType = checker.getContextualType(tsArgument);

          if (destinationType === undefined) {
            continue;
          }

          // TODO handle spread elements
          const rawArgument = node.arguments[i];
          const argument =
            rawArgument?.type === AST_NODE_TYPES.SpreadElement
              ? undefined
              : rawArgument;

          const arrayMethodCallSafety =
            argument === undefined
              ? 'unknown'
              : isSafeAssignmentFromArrayMethod(
                  argument,
                  destinationType,
                  sourceType,
                );

          if (arrayMethodCallSafety === 'safe') {
            continue;
          }

          if (
            arrayMethodCallSafety === 'unsafe' ||
            isUnsafeAssignment(
              checker,
              destinationType,
              sourceType,
              argument,
            ) === 'unsafe'
          ) {
            context.report({
              node: node.arguments[i] ?? node,
              messageId: 'errorStringGeneric',
              data: {
                sourceType: checker.typeToString(sourceType),
                destinationType: checker.typeToString(destinationType),
                sourceImmutability:
                  Immutability[getTypeImmutability(checker, sourceType)],
                destinationImmutability:
                  Immutability[getTypeImmutability(checker, destinationType)],
              },
            } as const);
          }
        }
      },
    };
  };
