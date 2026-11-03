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
  forEachChild,
  isIdentifier,
  isMappedTypeNode,
  isTypeParameterDeclaration,
  isTypeReferenceNode,
  type Node,
  type Signature,
  type SignatureDeclaration,
  SyntaxKind,
  type Symbol as TsSymbol,
  type Type,
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

    /**
     * Whether `node` or a node under it is a type reference resolving to
     * `typeParameter`. Comparing symbols rather than names keeps a type
     * parameter of an inner function type, or an `infer` type, that shadows it
     * from counting as a use; the name is compared first only to spare the
     * checker. The type parameters of an inner signature or `infer` type are
     * not entered: `<U extends T>(u: U) => U` hands back the `U` its caller
     * passes, not a `T`. That misses `<U extends T>() => U`, whose `U` falls
     * back to `T`. A mapped type's is entered, since `{ [K in keyof T]: … }`
     * reads `T`. Unbounded: a type annotation is a finite syntax tree, and
     * recursion is only as deep as it is nested.
     */
    const referencesTypeParameter = (
      node: Node,
      typeParameter: TsSymbol,
    ): boolean =>
      (!isTypeParameterDeclaration(node) || isMappedTypeNode(node.parent)) &&
      ((isTypeReferenceNode(node) &&
        isIdentifier(node.typeName) &&
        node.typeName.text === typeParameter.name &&
        checker.getSymbolAtLocation(node.typeName) === typeParameter) ||
        (forEachChild(
          node,
          (child) => referencesTypeParameter(child, typeParameter) || undefined,
        ) ??
          false));

    /**
     * The type parameters of `declaration` that its return type uses, with
     * their positional index (to look up the corresponding type arguments), or
     * `undefined` when its return type uses none of them.
     */
    const typeParamsUsedInReturnTypeOf = (
      declaration: SignatureDeclaration,
    ):
      | readonly Readonly<{
          typeParameter: TypeParameterDeclaration;
          symbol: TsSymbol;
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

      const used = typeParameters.flatMap((typeParameter, index) => {
        const symbol = checker.getSymbolAtLocation(typeParameter.name);

        return symbol !== undefined &&
          referencesTypeParameter(returnType, symbol)
          ? [{ typeParameter, symbol, index }]
          : [];
      });

      return Arr.isNonEmpty(used) ? used : undefined;
    };

    /**
     * Whether every type parameter of `declaration` that its return type uses
     * also appears in at least one (value) parameter. If so, the function
     * probably isn't a hidden type assertion.
     */
    const returnTypeParamsAppearInValueParams = (
      declaration: SignatureDeclaration,
      typeParamsUsedInReturnType: readonly Readonly<{ symbol: TsSymbol }>[],
    ): boolean =>
      typeParamsUsedInReturnType.every(({ symbol }) =>
        declaration.parameters.some(
          (parameter) =>
            parameter.type !== undefined &&
            referencesTypeParameter(parameter.type, symbol),
        ),
      );

    const mut_analysisCache = new WeakMap<
      SignatureDeclaration,
      SignatureAnalysis
    >();

    /**
     * What a call of `declaration` needs to know of it, computed once per
     * declaration: the type parameters its return type uses (`undefined` as for
     * {@link typeParamsUsedInReturnTypeOf}), and whether each of them appears
     * in a value parameter too.
     */
    const analyzeSignature = (
      declaration: SignatureDeclaration,
    ): SignatureAnalysis => {
      if (mut_analysisCache.has(declaration)) {
        return mut_analysisCache.get(declaration);
      }

      const typeParamsUsedInReturnType =
        typeParamsUsedInReturnTypeOf(declaration);

      const analysis: SignatureAnalysis =
        typeParamsUsedInReturnType === undefined
          ? undefined
          : ({
              typeParamsUsedInReturnType,
              appearInValueParams: returnTypeParamsAppearInValueParams(
                declaration,
                typeParamsUsedInReturnType,
              ),
            } as const);

      mut_analysisCache.set(declaration, analysis);

      return analysis;
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

        const analysis = analyzeSignature(declaration);

        return analysis !== undefined && !analysis.appearInValueParams;
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

        const analysis = analyzeSignature(callSignature.declaration);

        if (analysis === undefined) {
          return;
        }

        // Of all the type parameters that appear in the return type, is each
        // set to `unknown` or `never` in this specific call, by its type
        // argument or, failing one, its default? If so, this is safe even if
        // the function being called is a hidden type assertion.
        const allCorrespondingTypeArgumentsAreUnknownType =
          analysis.typeParamsUsedInReturnType.every(
            ({ index, typeParameter }) => {
              const typeArgument = (tsExpressionNode.typeArguments ?? [])[
                index
              ];

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
            },
          );

        if (allCorrespondingTypeArgumentsAreUnknownType) {
          return;
        }

        if (!analysis.appearInValueParams) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);
        }
      },
    };
  },
} as const);

type SignatureAnalysis =
  | Readonly<{
      typeParamsUsedInReturnType: readonly Readonly<{
        typeParameter: TypeParameterDeclaration;
        symbol: TsSymbol;
        index: number;
      }>[];
      appearInValueParams: boolean;
    }>
  | undefined;
