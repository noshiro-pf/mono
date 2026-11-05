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
import type { StrictPick } from 'ts-type-forge';
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
  type TypeChecker,
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
        'Do not use hidden type assertions. Set the type argument to `unknown` or `never` rather than to an arbitrary type, whether written or inferred from the context.',
    },
    schema: [],
    defaultOptions: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    /**
     * `getTypeArgumentsForResolvedSignature` is public from TypeScript 5.8; the
     * peer range reaches back to 5.0, where a call is judged by its written
     * type argument or the type parameter's default alone.
     */
    const checkerFrom58: Partial<
      StrictPick<TypeChecker, 'getTypeArgumentsForResolvedSignature'>
    > = checker;

    /**
     * The type a call sets the type parameter at `index` to by what it writes:
     * its type argument or, failing one, the parameter's default.
     */
    const writtenTypeArgumentOrDefault = (
      typeArguments: readonly TypeNode[] | undefined,
      index: number,
      typeParameter: TypeParameterDeclaration,
    ): Type | undefined => {
      const typeNode = typeArguments?.[index] ?? typeParameter.default;

      return typeNode === undefined
        ? undefined
        : checker.getTypeAtLocation(typeNode);
    };

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
     * The type parameters of `declaration` that its return type uses and no
     * (value) parameter does, with their positional index (to look up the
     * corresponding type arguments), or `undefined` when there are none. A call
     * that sets one of them to anything but `unknown` or `never` is a hidden
     * type assertion; a type parameter a value parameter uses is set by the
     * argument instead.
     */
    const hiddenTypeParamsOf = (
      declaration: SignatureDeclaration,
    ): HiddenTypeParams => {
      const { typeParameters, type: returnType } = declaration;

      if (
        returnType === undefined ||
        typeParameters === undefined ||
        typeParameters.length === 0
      ) {
        return undefined;
      }

      const hidden = typeParameters.flatMap((typeParameter, index) => {
        const symbol = checker.getSymbolAtLocation(typeParameter.name);

        return symbol !== undefined &&
          referencesTypeParameter(returnType, symbol) &&
          !declaration.parameters.some(
            (parameter) =>
              parameter.type !== undefined &&
              referencesTypeParameter(parameter.type, symbol),
          )
          ? [{ typeParameter, index }]
          : [];
      });

      return Arr.isNonEmpty(hidden) ? hidden : undefined;
    };

    const mut_analysisCache = new WeakMap<
      SignatureDeclaration,
      HiddenTypeParams
    >();

    /** {@link hiddenTypeParamsOf}, computed once per declaration. */
    const analyzeSignature = (
      declaration: SignatureDeclaration,
    ): HiddenTypeParams => {
      if (mut_analysisCache.has(declaration)) {
        return mut_analysisCache.get(declaration);
      }

      const analysis = hiddenTypeParamsOf(declaration);

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

        return analyzeSignature(declaration) !== undefined;
      });

    /**
     * Whether the callee is a cast (`as` or `<T>`) of a function whose
     * signature is a hidden type assertion: `(parse as () => Foo)()` picks
     * `Foo` for `parse`'s type parameter as surely as `parse<Foo>()` does, and
     * the cast is not reported by `no-unsafe-type-assertion`, since the generic
     * function is assignable to every instantiation of it. Every layer
     * under the outermost cast is asked, so that `parse as unknown as () =>
     * Foo` is seen too. A call whose result is `unknown` or `never` asserts
     * nothing; for a type guard or an assertion function, that is the type it
     * narrows to, and one asserting truthiness alone (`asserts x`) asserts no
     * type.
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

      const predicate = checker.getTypePredicateOfSignature(callSignature);

      const assertedType =
        predicate === undefined
          ? callSignature.getReturnType()
          : predicate.type;

      if (assertedType === undefined || isUnknownOrNever(assertedType)) {
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

        // Is a type parameter that only the return type uses set to anything
        // but `unknown` or `never` in this specific call? Both what the checker
        // resolved and what the call writes (its type argument or, failing one,
        // the default) are asked, and either being `unknown` or `never` will
        // do. A type argument neither written nor inferred resolves to its
        // default or constraint, or else to `unknown`, since a predicate
        // return infers nothing; one inferred from the contextual type is what
        // the call asserts, unless the default is `unknown` or `never`, as
        // before resolved type arguments were asked: a `never` default says the
        // type parameter is meant to go unused, as `E` in
        // `ok<S, E = never>(s: S): Ok<S> | Err<E>`.
        const resolvedTypeArguments =
          checkerFrom58.getTypeArgumentsForResolvedSignature?.(callSignature);

        const assertsSomething = analysis.some(({ index, typeParameter }) => {
          const resolved = resolvedTypeArguments?.[index];

          if (resolved !== undefined && isUnknownOrNever(resolved)) {
            return false;
          }

          const written = writtenTypeArgumentOrDefault(
            tsExpressionNode.typeArguments,
            index,
            typeParameter,
          );

          return written === undefined || !isUnknownOrNever(written);
        });

        if (assertsSomething) {
          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);
        }
      },
    };
  },
} as const);

type HiddenTypeParams =
  | readonly Readonly<{
      typeParameter: TypeParameterDeclaration;
      index: number;
    }>[]
  | undefined;

const isUnknownOrNever = (type: Type): boolean =>
  isTypeUnknownType(type) || isTypeNeverType(type);
