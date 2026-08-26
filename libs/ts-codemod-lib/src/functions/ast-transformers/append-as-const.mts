import { Arr, ISet } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { type DeepReadonly } from 'ts-type-forge';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import { replaceNodeWithDebugPrint } from '../utils/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'append-as-const';

export const appendAsConstTransformer = (
  options?: AppendAsConstTransformerOptions,
): TsMorphTransformer => {
  const ignorePrefixes = ISet.create(
    options?.ignorePrefixes ?? ['mut_', '#mut_', '_mut_', 'draft'],
  );

  const optionsInternal: AppendAsConstTransformerOptionsInternal = {
    applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
    ignoredPrefixes: ignorePrefixes,
    removeAsConstForConstTypeParameters:
      options?.removeAsConstForConstTypeParameters ?? true,

    debugPrint: options?.debug === true ? console.debug : () => {},
    replaceNode:
      options?.debug === true
        ? replaceNodeWithDebugPrint
        : (node, newNodeText) => node.replaceWithText(newNodeText),
  } as const;

  return {
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      for (const node of sourceAst.getDescendantsOfKind(
        tsm.SyntaxKind.VariableDeclaration,
      )) {
        transformNode(
          node,
          {
            isUnderConstContext: false,
            isDirectUnderConstInitializer: false,
          },
          optionsInternal,
        );
      }

      if (optionsInternal.removeAsConstForConstTypeParameters) {
        removeAsConstInConstTypeParameterArgs(sourceAst, optionsInternal);
      }
    },
  };
};

export type AppendAsConstTransformerOptions = DeepReadonly<{
  /**
   * @default "avoidInFunctionArgs"
   */
  applyLevel?: 'all' | 'avoidInFunctionArgs';

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   *
   * @default ['mut_', '#mut_', '_mut_', 'draft']
   */
  ignorePrefixes?: string[];

  /**
   * Whether to remove redundant `as const` assertions from call arguments
   * whose corresponding parameter type is exactly a `const`-modified type
   * parameter.
   *
   * (e.g. `f([1, 2] as const)` becomes `f([1, 2])` for
   * `function f<const T>(x: T): T`, because the `const` type parameter
   * already makes TypeScript infer the argument as if it were annotated
   * with `as const`.)
   *
   * Only applies when the callee resolves to a single call signature within
   * the transformed file itself; imported callees are left as they are.
   *
   * @default true
   */
  removeAsConstForConstTypeParameters?: boolean;

  debug?: boolean;
}>;

type AppendAsConstTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidInFunctionArgs';
  ignoredPrefixes: ISet<string>;
  removeAsConstForConstTypeParameters: boolean;

  debugPrint: (...args: readonly unknown[]) => void;
  replaceNode: (node: tsm.Node, newNodeText: string) => void;
}>;

type AsConstContext = Readonly<{
  /**
   * Whether the current node is under an `as const` context.
   *
   * (e.g. `[1, 2, {x: 3}] as const`  --> `isUnderConstContext` is true for `[1, 2, {x: 3}]` and its children `{x: 3}`)
   */
  isUnderConstContext: boolean;

  /**
   * Whether the current node is directly under a `const` variable initializer.
   *
   * (e.g. `const foo = [1, 2, 3];`  --> `isDirectUnderConstInitializer` is true for `[1, 2, 3]`)
   */
  isDirectUnderConstInitializer: boolean;
}>;

const transformNode = (
  node: tsm.Node,
  context: AsConstContext,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  if (node.wasForgotten()) {
    return;
  }

  options.debugPrint(node.getKindName(), node.getText(), { context });

  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    options.debugPrint('skipped by disable-next-line comment');

    return;
  }

  if (
    options.applyLevel === 'avoidInFunctionArgs' &&
    tsm.Node.isCallExpression(node)
  ) {
    return;
  }

  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    // check for ignorePrefix
    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      options.debugPrint('skipped variable declaration by ignorePrefixes');

      return;
    }

    const variableStatement = node.getVariableStatement();

    if (
      variableStatement !== undefined &&
      hasDisableNextLineComment(variableStatement, TRANSFORMER_NAME)
    ) {
      return;
    }

    const initializer = node.getInitializer();

    if (initializer === undefined) {
      return;
    }

    const declarationKindKeywords = node
      .getVariableStatement()
      ?.getDeclarationKindKeywords()
      .map((k) => k.getText());

    if (
      declarationKindKeywords !== undefined &&
      Arr.isFixedLengthArray(1, declarationKindKeywords)
    ) {
      transformNode(
        initializer,
        {
          isDirectUnderConstInitializer: declarationKindKeywords[0] === 'const',
          isUnderConstContext: false,
        },
        options,
      );

      return;
    }

    // const [a, b] = ...;
    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // const { x, y } = ...;
    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip already type asserted nodes
  if (tsm.Node.isAsExpression(node) && !isAsConstNode(node)) {
    return;
  }

  // pass by ([(X)] -> X)
  if (tsm.Node.isParenthesizedExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  // pass by ([X satisfies ...] -> X)
  if (tsm.Node.isSatisfiesExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  // pass by property initializer ([key: value] -> value)
  if (tsm.Node.isPropertyAssignment(node)) {
    const initializer = node.getInitializer();

    if (initializer !== undefined) {
      transformNode(initializer, context, options);
    }

    return;
  }

  // pass by arrow function body ([() => X] -> X)
  if (tsm.Node.isArrowFunction(node)) {
    const body = node.getBody();

    transformNode(body, context, options);

    return;
  }

  // pass by spread element ([...X] -> X)
  if (tsm.Node.isSpreadElement(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  if (
    node.isKind(tsm.SyntaxKind.NoSubstitutionTemplateLiteral) || // `abc`
    node.isKind(tsm.SyntaxKind.NumericLiteral) || // 123
    node.isKind(tsm.SyntaxKind.BigIntLiteral) || // 123n
    node.isKind(tsm.SyntaxKind.StringLiteral) || // 'abc'
    node.isKind(tsm.SyntaxKind.TrueKeyword) || // true
    node.isKind(tsm.SyntaxKind.FalseKeyword) // false
  ) {
    if (
      !context.isDirectUnderConstInitializer &&
      !context.isUnderConstContext
    ) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (node.isKind(tsm.SyntaxKind.TemplateExpression)) {
    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (tsm.Node.isArrayLiteralExpression(node)) {
    for (const el of node.getElements()) {
      transformNode(
        el,
        {
          isUnderConstContext: true, // [...] as const
          isDirectUnderConstInitializer: false,
        },
        options,
      );
    }

    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (tsm.Node.isObjectLiteralExpression(node)) {
    for (const el of node.getProperties()) {
      transformNode(
        el,
        {
          isUnderConstContext: true, // {...} as const
          isDirectUnderConstInitializer: false,
        },
        options,
      );
    }

    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  // `as const` node
  if (isAsConstNode(node)) {
    if (context.isDirectUnderConstInitializer) {
      // In const variable declarations, remove `as const` first and then re-append it later if needed

      transformNode(
        node.getExpression(),
        {
          isUnderConstContext: false,
          isDirectUnderConstInitializer: true,
        },
        options,
      );

      options.replaceNode(
        node,
        // The expression may be marked "as const"
        node.getExpression().getText(),
      ); // remove `as const`

      return;
    }

    if (context.isUnderConstContext) {
      transformNode(
        node.getExpression(),
        {
          isUnderConstContext: true,
          isDirectUnderConstInitializer: false,
        },
        options,
      );

      options.replaceNode(
        node,
        // The expression may be marked "as const"
        node.getExpression().getText(),
      ); // remove `as const`

      return;
    }

    transformNode(
      node.getExpression(),
      {
        isUnderConstContext: true,
        isDirectUnderConstInitializer: false,
      },
      options,
    );

    return;
  }

  if (tsm.Node.isConditionalExpression(node)) {
    // For conditional expressions, traverse both branches in a non-const context
    transformNode(
      node.getWhenTrue(),
      {
        isDirectUnderConstInitializer: context.isDirectUnderConstInitializer,
        isUnderConstContext: false,
      },
      options,
    );

    transformNode(
      node.getWhenFalse(),
      {
        isDirectUnderConstInitializer: context.isDirectUnderConstInitializer,
        isUnderConstContext: false,
      },
      options,
    );

    // return;
  }
};

/**
 * Removes redundant `as const` assertions from call arguments whose
 * corresponding parameter type is exactly a `const`-modified type parameter
 * (e.g. `f([1, 2] as const)` for `function f<const T>(x: T): T`).
 *
 * A `const` type parameter makes TypeScript treat every inference candidate
 * as if it were annotated with `as const`, so when the parameter type is the
 * bare type parameter itself, removing the assertion cannot change the
 * inferred type. Conservative bail-outs (the `as const` is kept) when:
 *
 * - the callee does not resolve to exactly one call signature (unresolved
 *   imports resolve to none, since each file is transformed in an isolated
 *   single-file project; overloaded functions resolve to several),
 * - the call has explicit type arguments (inference is not involved),
 * - the argument is a spread argument or follows one (its parameter position
 *   is not statically known),
 * - the parameter type is not the bare type parameter (e.g. `readonly T[]`).
 */
const removeAsConstInConstTypeParameterArgs = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  // Reversed so that calls nested inside another call's arguments are
  // processed before the outer call replaces (and thereby forgets) them.
  for (const call of sourceAst
    .getDescendantsOfKind(tsm.SyntaxKind.CallExpression)
    .toReversed()) {
    if (call.wasForgotten()) {
      continue;
    }

    const args = call.getArguments();

    // Cheap syntactic pre-check before touching the type checker
    if (!args.some(isAsConstNode)) {
      continue;
    }

    if (hasDisableNextLineComment(call, TRANSFORMER_NAME)) {
      continue;
    }

    const variableStatement = call.getFirstAncestorByKind(
      tsm.SyntaxKind.VariableStatement,
    );

    if (
      variableStatement !== undefined &&
      hasDisableNextLineComment(variableStatement, TRANSFORMER_NAME)
    ) {
      continue;
    }

    // With explicit type arguments no inference happens, so the `as const`
    // may be load-bearing for assignability.
    if (!Arr.isEmpty(call.getTypeArguments())) {
      continue;
    }

    const callTarget = resolveSingleSignatureCallTarget(call);

    if (callTarget === undefined) {
      continue;
    }

    removeAsConstArgsOfCall(args, callTarget, options);
  }
};

const removeAsConstArgsOfCall = (
  args: readonly tsm.Node[],
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callTarget: ResolvedCallTarget,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  // Argument positions at or after a spread argument cannot be mapped to a
  // parameter statically.
  const firstSpreadIndex = args.findIndex((a) =>
    a.isKind(tsm.SyntaxKind.SpreadElement),
  );

  const mappableArgCount =
    firstSpreadIndex === -1 ? args.length : firstSpreadIndex;

  for (const [argumentIndex, argument] of args.entries()) {
    if (argumentIndex >= mappableArgCount) {
      return;
    }

    if (argument.wasForgotten() || !isAsConstNode(argument)) {
      continue;
    }

    if (hasDisableNextLineComment(argument, TRANSFORMER_NAME)) {
      continue;
    }

    const parameter = getMatchedParameter(callTarget.parameters, argumentIndex);

    if (
      parameter === undefined ||
      !isBareConstTypeParameterReference(
        parameter,
        callTarget.constTypeParameterNames,
      )
    ) {
      continue;
    }

    options.debugPrint(
      'removing redundant as const in const type parameter argument',
      argument.getText(),
    );

    options.replaceNode(argument, argument.getExpression().getText());
  }
};

type ResolvedCallTarget = Readonly<{
  parameters: readonly tsm.ParameterDeclaration[];
  constTypeParameterNames: ISet<string>;
}>;

/**
 * Resolves the callee of a call expression to the declaration of its single
 * call signature, and collects the names of that declaration's
 * `const`-modified type parameters.
 *
 * Returns `undefined` when the callee does not resolve to exactly one call
 * signature, the resolved declaration has no parameters or type parameters,
 * or none of the type parameters carry the `const` modifier.
 */
const resolveSingleSignatureCallTarget = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  call: tsm.CallExpression,
): ResolvedCallTarget | undefined => {
  // 0 signatures: the callee is unresolved (e.g. imported, since each file
  // is transformed in an isolated single-file project).
  // 2+ signatures: overloads, where removing `as const` could change which
  // overload is selected.
  if (
    !Arr.isFixedLengthArray(
      1,
      call.getExpression().getType().getCallSignatures(),
    )
  ) {
    return undefined;
  }

  const declaration = call
    .getProject()
    .getTypeChecker()
    .getResolvedSignature(call)
    ?.getDeclaration();

  if (
    declaration === undefined ||
    !tsm.Node.isParametered(declaration) ||
    !tsm.Node.isTypeParametered(declaration)
  ) {
    return undefined;
  }

  // Only type parameters declared on the call's own signature are inferred
  // at the call site; a `const` type parameter of an enclosing declaration
  // (e.g. a generic class containing this method) is already fixed there.
  const constTypeParameterNames = ISet.create(
    declaration
      .getTypeParameters()
      .filter((tp) => tp.hasModifier(tsm.SyntaxKind.ConstKeyword))
      .map((tp) => tp.getName()),
  );

  if (constTypeParameterNames.size === 0) {
    return undefined;
  }

  return {
    parameters: declaration.getParameters(),
    constTypeParameterNames,
  } as const;
};

const getMatchedParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  parameters: readonly tsm.ParameterDeclaration[],
  argumentIndex: number,
): tsm.ParameterDeclaration | undefined => {
  if (argumentIndex < parameters.length) {
    return parameters[argumentIndex];
  }

  const lastParameter = parameters.at(-1);

  return lastParameter?.isRestParameter() === true ? lastParameter : undefined;
};

/**
 * Whether the parameter's declared type is exactly a bare reference to one of
 * the given `const`-modified type parameters (i.e. `x: T`, not `x: readonly
 * T[]` or `x: Wrapper<T>` — there the argument expression's own type is still
 * observable, so the `as const` is kept).
 */
const isBareConstTypeParameterReference = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  parameter: tsm.ParameterDeclaration,
  constTypeParameterNames: ISet<string>,
): boolean => {
  const typeNode = parameter.getTypeNode();

  if (typeNode === undefined) {
    return false;
  }

  if (!typeNode.isKind(tsm.SyntaxKind.TypeReference)) {
    return false;
  }

  const typeName = typeNode.getTypeName();

  return (
    typeName.isKind(tsm.SyntaxKind.Identifier) &&
    Arr.isEmpty(typeNode.getTypeArguments()) &&
    constTypeParameterNames.has(typeName.getText())
  );
};
