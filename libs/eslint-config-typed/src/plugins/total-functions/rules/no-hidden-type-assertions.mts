import {
  isTypeNeverType,
  isTypeReferenceType,
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
  isArrowFunction,
  isCallSignatureDeclaration,
  isConstructorTypeNode,
  isFunctionExpression,
  isFunctionTypeNode,
  isIdentifier,
  isMappedTypeNode,
  isMethodSignature,
  isParameter,
  isSpreadElement,
  isTypeParameterDeclaration,
  isTypeReferenceNode,
  SyntaxKind,
  TypeFlags,
  type Expression,
  type Node,
  type Signature,
  type SignatureDeclaration,
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
     * Where `node` or a node under it is a type reference resolving to
     * `typeParameter`: `'direct'` somewhere an argument's type is read,
     * `'callbackParameter'` only among the parameters of a function type (a
     * callback's), which an argument supplies only when it writes their types,
     * and `'none'` nowhere. Comparing symbols rather than names keeps a type
     * parameter of an inner function type, or an `infer` type, that shadows it
     * from counting as a use; the name is compared first only to spare the
     * checker. The type parameters of an inner signature or `infer` type are
     * not entered: `<U extends T>(u: U) => U` hands back the `U` its caller
     * passes, not a `T`. That misses `<U extends T>() => U`, whose `U` falls
     * back to `T`. A mapped type's is entered, since `{ [K in keyof T]: … }`
     * reads `T`. With `skipNoInfer`, the argument of `NoInfer<…>`, which infers
     * nothing, is not entered either. Unbounded: a type annotation is a finite
     * syntax tree, and recursion is only as deep as it is nested.
     */
    const useOfTypeParameter = (
      node: Node,
      typeParameter: TsSymbol,
      skipNoInfer: boolean,
    ): TypeParameterUse => {
      if (isTypeParameterDeclaration(node) && !isMappedTypeNode(node.parent)) {
        return 'none';
      }

      if (isTypeReferenceNode(node) && isIdentifier(node.typeName)) {
        if (
          node.typeName.text === typeParameter.name &&
          checker.getSymbolAtLocation(node.typeName) === typeParameter
        ) {
          return 'direct';
        }

        if (skipNoInfer && isNoInfer(node.typeName)) {
          return 'none';
        }
      }

      const inCallbackParameter =
        isParameter(node) &&
        (isFunctionTypeNode(node.parent) ||
          isConstructorTypeNode(node.parent) ||
          isMethodSignature(node.parent) ||
          isCallSignatureDeclaration(node.parent));

      let mut_use: TypeParameterUse = 'none';

      forEachChild(node, (child) => {
        const use = useOfTypeParameter(child, typeParameter, skipNoInfer);

        if (use === 'direct' && !inCallbackParameter) {
          mut_use = 'direct';

          return true;
        }

        if (use !== 'none') {
          mut_use = 'callbackParameter';
        }

        return undefined;
      });

      return mut_use;
    };

    /** Whether `name` is the standard library's `NoInfer`. */
    const isNoInfer = (name: Node): boolean =>
      isIdentifier(name) &&
      name.text === 'NoInfer' &&
      (checker
        .getSymbolAtLocation(name)
        ?.declarations?.every((declaration) =>
          parserServices.program.isSourceFileDefaultLibrary(
            declaration.getSourceFile(),
          ),
        ) ??
        false);

    /**
     * The type parameters of `declaration` that its return type uses, with
     * their positional index (to look up the corresponding type arguments) and
     * the value parameters an argument could set them through, or `undefined`
     * when there are none. One no value parameter mentions (outside `NoInfer`)
     * is hidden in every call; one whose parameters a call gives no argument is
     * hidden in that call ({@link isSuppliedBy}). A call that sets a hidden one
     * to anything but `unknown` or `never` is a hidden type assertion.
     */
    const returnTypeParamsOf = (
      declaration: SignatureDeclaration,
    ): ReturnTypeParams => {
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

        if (
          symbol === undefined ||
          useOfTypeParameter(returnType, symbol, false) === 'none'
        ) {
          return [];
        }

        const suppliers = declaration.parameters.flatMap(
          (parameter, parameterIndex) => {
            const use =
              parameter.type === undefined
                ? 'none'
                : useOfTypeParameter(parameter.type, symbol, true);

            return use === 'none'
              ? []
              : [
                  {
                    parameterIndex,
                    isRest: parameter.dotDotDotToken !== undefined,
                    viaCallbackParameter: use === 'callbackParameter',
                  },
                ];
          },
        );

        return [{ typeParameter, index, suppliers }];
      });

      return Arr.isNonEmpty(used) ? used : undefined;
    };

    /**
     * Whether the type parameter `typeParameter` of `declaration` may be left
     * to its `never` default, the type argument the context infers
     * notwithstanding: the declared return type is a union with a member the
     * type parameter is not in, so the value may be that member, as `ok(1)` of
     * `ok<S, E = never>(s: S): { ok: S } | { err: E }` is `{ ok: number }`.
     * A return type that is the type parameter alone, as in
     * `parse<T = never>(): T`, claims the type from the context.
     */
    const isNeverDefaultLeftOut = (
      declaration: SignatureDeclaration,
      typeParameter: TypeParameterDeclaration,
    ): boolean => {
      if (
        typeParameter.default === undefined ||
        !isTypeNeverType(checker.getTypeAtLocation(typeParameter.default))
      ) {
        return false;
      }

      const parameterType = checker.getTypeAtLocation(typeParameter);

      const returnType = checker
        .getSignatureFromDeclaration(declaration)
        ?.getReturnType();

      return (
        returnType?.isUnion() === true &&
        returnType.types.some(
          (member) => !mentionsType(member, parameterType, declaration, 0),
        )
      );
    };

    /**
     * Whether `type` is `target` or has it among its union or intersection
     * members, type arguments or property types. Past a few levels of nesting
     * it is taken to, so that a deep member does not let a default pass.
     */
    const mentionsType = (
      type: Type,
      target: Type,
      location: Node,
      depth: number,
    ): boolean => {
      if (type === target || depth > maxMentionDepth) {
        return true;
      }

      if (type.isUnionOrIntersection()) {
        return type.types.some((member) =>
          mentionsType(member, target, location, depth + 1),
        );
      }

      const typeArguments = [
        ...(type.aliasTypeArguments ?? []),
        ...(isTypeReferenceType(type)
          ? checker.getTypeArguments(type)
          : ([] as const)),
      ] as const;

      return (
        typeArguments.some((argument) =>
          mentionsType(argument, target, location, depth + 1),
        ) ||
        ((type.flags & TypeFlags.Object) !== 0 &&
          checker
            .getPropertiesOfType(type)
            .some((property) =>
              mentionsType(
                checker.getTypeOfSymbolAtLocation(property, location),
                target,
                location,
                depth + 1,
              ),
            ))
      );
    };

    const mut_analysisCache = new WeakMap<
      SignatureDeclaration,
      ReturnTypeParams
    >();

    /** {@link returnTypeParamsOf}, computed once per declaration. */
    const analyzeSignature = (
      declaration: SignatureDeclaration,
    ): ReturnTypeParams => {
      if (mut_analysisCache.has(declaration)) {
        return mut_analysisCache.get(declaration);
      }

      const analysis = returnTypeParamsOf(declaration);

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

        return (
          analyzeSignature(declaration)?.some(({ suppliers }) =>
            Arr.isEmpty(suppliers),
          ) === true
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

        const { declaration } = callSignature;

        const analysis = analyzeSignature(declaration);

        if (analysis === undefined) {
          return;
        }

        // Is a type parameter no argument sets — one only the return type uses,
        // or, where the checker's resolved type arguments are at hand, one
        // whose value parameters this call gives nothing to infer it from — set
        // to anything but `unknown` or `never` in this call?
        //
        // With resolved type arguments, the resolved one decides: a type
        // argument neither written nor inferred resolves to its default or
        // constraint, or else to `unknown`, since a predicate return infers
        // nothing; one inferred from the contextual type is what the call
        // asserts, whatever the default. A `never` default the call does not
        // overwrite passes where the value may be a union member without the
        // type parameter ({@link isNeverDefaultLeftOut}).
        //
        // Without them (TypeScript before 5.8), what the call writes decides:
        // its type argument or, failing one, the default.
        const resolvedTypeArguments =
          checkerFrom58.getTypeArgumentsForResolvedSignature?.(callSignature);

        const callArguments = tsExpressionNode.arguments;

        const assertsSomething = analysis.some(
          ({ index, typeParameter, suppliers }) => {
            if (resolvedTypeArguments === undefined) {
              if (Arr.isNonEmpty(suppliers)) {
                return false;
              }

              const written = writtenTypeArgumentOrDefault(
                tsExpressionNode.typeArguments,
                index,
                typeParameter,
              );

              return written === undefined || !isUnknownOrNever(written);
            }

            if (
              suppliers.some((supplier) =>
                isSuppliedBy(callArguments, supplier),
              )
            ) {
              return false;
            }

            const resolved = resolvedTypeArguments[index];

            return (
              resolved !== undefined &&
              !isUnknownOrNever(resolved) &&
              !(
                tsExpressionNode.typeArguments?.[index] === undefined &&
                isNeverDefaultLeftOut(declaration, typeParameter)
              )
            );
          },
        );

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

/** Where a type parameter is mentioned: see `useOfTypeParameter`. */
type TypeParameterUse = 'callbackParameter' | 'direct' | 'none';

/** A value parameter an argument could set a type parameter through. */
type Supplier = Readonly<{
  parameterIndex: number;
  isRest: boolean;
  /** Mentioned only among the parameters of a callback type. */
  viaCallbackParameter: boolean;
}>;

type ReturnTypeParams =
  | readonly Readonly<{
      typeParameter: TypeParameterDeclaration;
      index: number;
      suppliers: readonly Supplier[];
    }>[]
  | undefined;

/** How deep `mentionsType` looks before taking a type to mention its target. */
const maxMentionDepth = 4;

const isUnknownOrNever = (type: Type): boolean =>
  isTypeUnknownType(type) || isTypeNeverType(type);

/**
 * Whether the arguments of a call give `supplier` something to infer its type
 * parameter from: an argument at its position (any at or after it for a rest
 * parameter, or a spread before it, whose length is unknown), and, where the
 * type parameter sits only among a callback's parameters, not a lambda leaving
 * one of its own parameters' types to the context. A lambda declaring none
 * counts as supplying it: `chainFirstIOK<string, boolean>(() => …)` of fp-ts
 * shape writes its type arguments and ignores what the callback is given.
 */
const isSuppliedBy = (
  callArguments: readonly Expression[],
  supplier: Supplier,
): boolean => {
  const spreadIndex = callArguments.findIndex(isSpreadElement);

  if (spreadIndex !== -1 && spreadIndex <= supplier.parameterIndex) {
    return true;
  }

  const given = supplier.isRest
    ? callArguments.slice(supplier.parameterIndex)
    : callArguments.slice(supplier.parameterIndex, supplier.parameterIndex + 1);

  return given.some(
    (argument) =>
      !supplier.viaCallbackParameter ||
      !(
        (isArrowFunction(argument) || isFunctionExpression(argument)) &&
        argument.parameters.some((parameter) => parameter.type === undefined)
      ),
  );
};
