import {
  isTypeNeverType,
  isTypeUnknownType,
} from '@typescript-eslint/type-utils';
import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { typeWrapperLayers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
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
  type Signature,
  type SignatureDeclaration,
  SyntaxKind,
  type Type,
  type TypeElement,
  type TypeNode,
  type TypeParameterDeclaration,
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
    defaultOptions: [],
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
          ? ([type.checkType, type.trueType, type.falseType] as const)
          : isIndexedAccessTypeNode(type)
            ? ([type.objectType, type.indexType] as const)
            : isFunctionTypeNode(type)
              ? Arr.toUnshifted(type.type)(
                  parametersToTypeNodes(type.parameters, depth),
                )
              : isTupleTypeNode(type)
                ? type.elements
                : isNamedTupleMember(type)
                  ? ([type.type] as const)
                  : isTypeLiteralNode(type)
                    ? type.members.flatMap((m) =>
                        hasTypeNode(m) ? [m.type] : [],
                      )
                    : isArrayTypeNode(type)
                      ? ([type.elementType] as const)
                      : isTypeOperatorNode(type)
                        ? ([type.type] as const)
                        : isUnionTypeNode(type) || isIntersectionTypeNode(type)
                          ? type.types
                          : ([] as const);

      return Arr.toUnshifted(type)(next.flatMap(explodeTypeNode));
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

    /**
     * The type parameters of `declaration` that its return type uses, with
     * their positional index (to look up the corresponding type arguments), or
     * `undefined` when it declares no type parameters or no return type.
     */
    const typeParamsUsedInReturnTypeOf = (
      declaration: SignatureDeclaration,
    ):
      | readonly Readonly<{
          typeParameter: TypeParameterDeclaration;
          index: number;
        }>[]
      | undefined => {
      const { typeParameters, type: returnType } = declaration;

      if (
        returnType === undefined ||
        typeParameters === undefined ||
        typeParameters.length === 0
      ) {
        return undefined;
      }

      const returnTypes = explodeTypeNode(returnType, 0);

      return typeParameters
        .map((typeParameter, index) => ({ typeParameter, index }))
        .filter((typeParameter) =>
          returnTypes.some(
            (retType) =>
              isTypeReferenceNode(retType) &&
              retType.typeName.kind === SyntaxKind.Identifier &&
              retType.typeName.text === typeParameter.typeParameter.name.text,
          ),
        );
    };

    /**
     * Whether every type parameter of `declaration` that its return type uses
     * also appears in at least one (value) parameter. If so, the function
     * probably isn't a hidden type assertion.
     */
    const returnTypeParamsAppearInValueParams = (
      declaration: SignatureDeclaration,
      typeParamsUsedInReturnType: readonly Readonly<{
        typeParameter: TypeParameterDeclaration;
      }>[],
    ): boolean => {
      const parameters = parametersToTypeNodes(declaration.parameters, 0);

      return typeParamsUsedInReturnType
        .map(({ typeParameter }) => typeParameter)
        .every((typeParameter) =>
          parameters.some(
            (parameter) =>
              isTypeReferenceNode(parameter) &&
              parameter.typeName.kind === SyntaxKind.Identifier &&
              typeParameter.name.text === parameter.typeName.text,
          ),
        );
    };

    /**
     * Whether a call signature of `type` is a hidden type assertion: generic in
     * a type parameter that only its return type uses.
     */
    const hasHiddenTypeAssertionSignature = (type: Type): boolean =>
      type.getCallSignatures().some((signature) => {
        const { declaration } = signature;

        if (
          declaration === undefined ||
          declaration.kind === SyntaxKind.JSDocSignature
        ) {
          return false;
        }

        const typeParamsUsedInReturnType =
          typeParamsUsedInReturnTypeOf(declaration);

        return (
          typeParamsUsedInReturnType !== undefined &&
          !returnTypeParamsAppearInValueParams(
            declaration,
            typeParamsUsedInReturnType,
          )
        );
      });

    /**
     * Whether the callee is a cast (`as` or `<T>`) of a function whose
     * signature is a hidden type assertion: `(parse as () => Foo)()` picks
     * `Foo` for `parse`'s type parameter as surely as `parse<Foo>()` does, and
     * the cast is not reported by `no-unsafe-type-assertion`, since the generic
     * function is assignable to every instantiation of it. Every layer
     * under the outermost cast is asked, so that `parse as unknown as () =>
     * Foo` is seen too. A call whose result is `unknown` or `never` asserts
     * nothing.
     */
    const isCallThroughCastOfHiddenTypeAssertion = (
      node: TSESTree.CallExpression,
      callSignature: Signature,
    ): boolean => {
      const layers = typeWrapperLayers(node.callee);

      const castIndex = layers.findIndex(
        (layer) =>
          layer.type === AST_NODE_TYPES.TSAsExpression ||
          layer.type === AST_NODE_TYPES.TSTypeAssertion,
      );

      if (castIndex === -1) {
        return false;
      }

      const returnType = callSignature.getReturnType();

      if (isTypeUnknownType(returnType) || isTypeNeverType(returnType)) {
        return false;
      }

      return layers
        .slice(castIndex + 1)
        .some((layer) =>
          hasHiddenTypeAssertionSignature(
            checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(layer),
            ),
          ),
        );
    };

    return {
      CallExpression: (node) => {
        const tsExpressionNode = parserServices.esTreeNodeToTSNodeMap.get(node);

        const callSignature = checker.getResolvedSignature(tsExpressionNode);

        if (callSignature === undefined) {
          return;
        }

        if (isCallThroughCastOfHiddenTypeAssertion(node, callSignature)) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);

          return;
        }

        if (callSignature.declaration === undefined) {
          return;
        }

        if (callSignature.declaration.kind === SyntaxKind.JSDocSignature) {
          // TODO support JSDoc
          return;
        }

        const typeParamsUsedInReturnType = typeParamsUsedInReturnTypeOf(
          callSignature.declaration,
        );

        if (typeParamsUsedInReturnType === undefined) {
          return;
        }

        // Of all the type parameters that appear in the return type, are they
        // all set to `unknown` type arguments in this specific call?
        // If so, this is safe even if the function being called is a hidden type assertion.
        const allCorrespondingTypeArgumentsAreUnknownType =
          typeParamsUsedInReturnType.every(({ index, typeParameter }) => {
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

        if (
          !returnTypeParamsAppearInValueParams(
            callSignature.declaration,
            typeParamsUsedInReturnType,
          )
        ) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);
        }
      },
    };
  },
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
