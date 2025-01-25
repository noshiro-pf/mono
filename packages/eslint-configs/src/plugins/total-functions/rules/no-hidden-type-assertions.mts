import {
  isTypeNeverType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import {
  isArrayTypeNode,
  isConditionalTypeNode,
  isFunctionTypeNode,
  isIndexedAccessTypeNode,
  isIntersectionTypeNode,
  isNamedTupleMember,
  isTupleTypeNode,
  isTypeLiteralNode,
  isTypeNode,
  isTypeOperatorNode,
  isTypeReferenceNode,
  isUnionTypeNode,
  type NodeArray,
  type ParameterDeclaration,
  SyntaxKind,
  type TypeElement,
  type TypeNode,
} from 'typescript';
import { createRule } from './common.mjs';

/** An ESLint rule to ban hidden type assertions. */

export const noHiddenTypeAssertions = createRule({
  name: 'no-hidden-type-assertions',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans hidden type assertions.',
    },
    messages: {
      errorStringGeneric:
        'Do not use hidden type assertions. Specify `unknown` or `never` instead of an arbitrary type argument.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    const explodeTypeNode = (
      type: TypeNode,
      depth: number,
    ): readonly TypeNode[] => {
      // TODO write a test that exercises this

      if (depth >= 100) {
        return [] as const;
      }

      const next = isTypeReferenceNode(type)
        ? (type.typeArguments ?? [])
        : isConditionalTypeNode(type)
          ? [type.checkType, type.trueType, type.falseType]
          : isIndexedAccessTypeNode(type)
            ? [type.objectType, type.indexType]
            : isFunctionTypeNode(type)
              ? [type.type, ...parametersToTypeNodes(type.parameters, depth)]
              : isTupleTypeNode(type)
                ? type.elements
                : isNamedTupleMember(type)
                  ? [type.type]
                  : isTypeLiteralNode(type)
                    ? type.members.flatMap((m) =>
                        hasTypeNode(m) ? [m.type] : [],
                      )
                    : isArrayTypeNode(type)
                      ? [type.elementType]
                      : isTypeOperatorNode(type)
                        ? [type.type]
                        : isUnionTypeNode(type)
                          ? type.types
                          : isIntersectionTypeNode(type)
                            ? type.types
                            : [];

      return [type, ...next.flatMap(explodeTypeNode)] as const;
    };

    const parametersToTypeNodes = (
      parameters: NodeArray<ParameterDeclaration>,
      depth: number,
    ): readonly TypeNode[] =>
      parameters
        .flatMap((parameter) =>
          parameter.type !== undefined ? [parameter.type] : [],
        )
        .flatMap((parameter) => explodeTypeNode(parameter, depth));

    return {
      CallExpression: (node) => {
        const tsExpressionNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const callSignature = checker.getResolvedSignature(tsExpressionNode);

        if (callSignature?.declaration === undefined) {
          return;
        }

        if (callSignature.declaration.kind === SyntaxKind.JSDocSignature) {
          // TODO support JSDoc
          return;
        }

        const typeParameters = callSignature.declaration.typeParameters;
        const parameters = parametersToTypeNodes(
          callSignature.declaration.parameters,
          0,
        );

        const returnType = callSignature.declaration.type;

        if (
          returnType === undefined ||
          typeParameters === undefined ||
          typeParameters.length === 0
        ) {
          return;
        }

        const returnTypes = explodeTypeNode(returnType, 0);

        // Of all the type parameters, these are the ones that are used in the
        // return type (alongside their positional index, which we use next to
        // look up corresponding type arguments)
        const typeParamsUsedInReturnType = typeParameters
          .map((typeParameter, index) => ({ typeParameter, index }))
          .filter((typeParameter) =>
            returnTypes.some(
              (retType) =>
                isTypeReferenceNode(retType) &&
                retType.typeName.kind === SyntaxKind.Identifier &&
                retType.typeName.text === typeParameter.typeParameter.name.text,
            ),
          );

        // Of all the type parameters that appear in the return type,
        // are they all set to `unknown` type arguments in this specific call?
        // If so, this is safe even if the function being called is a hidden type assertion.
        const allCorrespondingTypeArgumentsAreUnknownType =
          typeParamsUsedInReturnType.every(({ typeParameter, index }) => {
            const typeArgument = (tsExpressionNode.typeArguments ?? [])[index];
            const typeArgumentType =
              typeArgument !== undefined
                ? checker.getTypeAtLocation(typeArgument)
                : undefined;

            const typeParamDefaultType =
              typeParameter.default !== undefined
                ? checker.getTypeAtLocation(typeParameter.default)
                : undefined;

            const typeToCheck = typeArgumentType ?? typeParamDefaultType;

            return (
              typeToCheck !== undefined &&
              (isTypeUnknownType(typeToCheck) || isTypeNeverType(typeToCheck))
            );
          });

        if (allCorrespondingTypeArgumentsAreUnknownType) {
          return;
        }

        // Confirms that all the type parameters that appear in the return type ALSO
        // appear in at least one (value) parameter. If they do, this probably isn't
        // a hidden type assertion.
        const allTypeParamsUsedInReturnTypeAlsoAppearInValueParams =
          typeParamsUsedInReturnType
            .map(({ typeParameter }) => typeParameter)
            .every((typeParameter) =>
              parameters.some(
                (parameter) =>
                  isTypeReferenceNode(parameter) &&
                  parameter.typeName.kind === SyntaxKind.Identifier &&
                  typeParameter.name.text === parameter.typeName.text,
              ),
            );

        if (!allTypeParamsUsedInReturnTypeAlsoAppearInValueParams) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);
        }
      },
    };
  },
  defaultOptions: [],
} as const);

const hasTypeNode = (
  typeElement: TypeElement,
): typeElement is TypeElement & Readonly<{ type: TypeNode }> => {
  try {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const typeAttr = (typeElement as Partial<Readonly<{ type: TypeNode }>>)
      .type;
    return typeAttr !== undefined && isTypeNode(typeAttr);
  } catch {
    return false;
  }
};
