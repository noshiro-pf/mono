import { Arr, ISet, isRecord } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import type { DeepReadonly } from 'ts-type-forge';
import {
  DEFAULT_MUTABLE_PREFIXES,
  DEFAULT_MUTABLE_TYPE_PREFIXES,
} from '../constants/index.mjs';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import {
  replaceNodeWithDebugPrint,
  replaceNodeWithText,
} from '../utils/index.mjs';
import type { TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'append-as-const';

export const appendAsConstTransformer = (
  options?: AppendAsConstTransformerOptions,
): TsMorphTransformer => {
  // Removed in 4.0.0; a caller without types would otherwise lose it silently.
  const untypedOptions: unknown = options;

  if (
    isRecord(untypedOptions) &&
    untypedOptions['ignorePrefixes'] !== undefined
  ) {
    throw new Error(
      `The "ignorePrefixes" option of ${TRANSFORMER_NAME} was renamed to "mutableVariablePrefixes".`,
    );
  }

  const optionsInternal: AppendAsConstTransformerOptionsInternal = {
    applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
    mutableVariablePrefixes: ISet.create(
      options?.mutableVariablePrefixes ?? DEFAULT_MUTABLE_PREFIXES,
    ),
    mutableTypePrefixes: ISet.create(
      options?.mutableTypePrefixes ?? DEFAULT_MUTABLE_TYPE_PREFIXES,
    ),
    removeAsConstForConstTypeParameters:
      options?.removeAsConstForConstTypeParameters ?? true,

    debugPrint: options?.debug === true ? console.debug : () => {},
    replaceNode:
      options?.debug === true
        ? replaceNodeWithDebugPrint
        : (node, newNodeText) => replaceNodeWithText(node, newNodeText),
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
   * Prefixes of the names of variables that are left mutable: their
   * initializers get no `as const`, nor does a value annotated with their type
   * (`typeof mut_x`).
   *
   * @default ['mut_']
   */
  mutableVariablePrefixes?: string[];

  /**
   * Prefixes of the names of mutable types (see `convert-to-readonly`): a
   * variable whose type annotation names such a type, an expression that
   * `satisfies` one and an arrow function body returning one get no
   * `as const`, which would make them unassignable to it.
   *
   * @default ['Mutable', 'mut_']
   */
  mutableTypePrefixes?: string[];

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
  mutableVariablePrefixes: ISet<string>;
  mutableTypePrefixes: ISet<string>;
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

    // check for mutableVariablePrefixes
    if (options.mutableVariablePrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      options.debugPrint(
        'skipped variable declaration by mutableVariablePrefixes',
      );

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

    // Example: const foo: MutableFoo = { a: [] }; -> remains as is, because
    // `as const` would make the initializer unassignable to `MutableFoo`
    const typeNode = node.getTypeNode();

    if (refersToMutableType(typeNode, options)) {
      options.debugPrint(
        'skipped variable declaration annotated with a mutable type',
      );

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
    // TODO: Support mutableVariablePrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // const { x, y } = ...;
    // TODO: Support mutableVariablePrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip already type asserted nodes
  if (
    (tsm.Node.isAsExpression(node) || tsm.Node.isTypeAssertion(node)) &&
    !isConstAssertionNode(node)
  ) {
    return;
  }

  // pass by ([(X)] -> X)
  if (tsm.Node.isParenthesizedExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  // pass by ([X satisfies ...] -> X)
  if (tsm.Node.isSatisfiesExpression(node)) {
    // Example: { a: [] } satisfies MutableFoo -> remains as is, because
    // `as const` would make it fail to satisfy `MutableFoo`
    if (refersToMutableType(node.getTypeNode(), options)) {
      options.debugPrint('skipped satisfies expression with a mutable type');

      return;
    }

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
    // Example: (): MutableFoo => ({ a: [] }) -> remains as is, because
    // `as const` would make the body unassignable to `MutableFoo`
    if (refersToMutableType(node.getReturnTypeNode(), options)) {
      options.debugPrint('skipped arrow function with a mutable return type');

      return;
    }

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

  // `<const>x` is handled as the `x as const` it means. Appending `as const`
  // to `x` in place would read as `(<const>x) as const`, and every position
  // that reaches here already takes an `as` expression.
  if (tsm.Node.isTypeAssertion(node) && isConstAssertionNode(node)) {
    const asConstText = `${node.getExpression().getText()} as const` as const;

    options.debugPrint(`${node.getText()} -> ${asConstText}`);

    transformNode(replaceNodeWithText(node, asConstText), context, options);

    return;
  }

  // `as const` node
  if (isConstAssertionNode(node)) {
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

  if (!tsm.Node.isConditionalExpression(node)) {
    return;
  }

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
    if (
      args.every(
        (arg) => !isConstAssertionNode(skipParenthesizedExpressions(arg)),
      )
    ) {
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

    if (argument.wasForgotten()) {
      continue;
    }

    // `f(([1] as const))` is the same argument as `f([1] as const)`.
    const asConst = skipParenthesizedExpressions(argument);

    if (!isConstAssertionNode(asConst)) {
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

    // The parentheses go with it: an argument needs none of its own.
    options.replaceNode(argument, asConst.getExpression().getText());
  }
};

/**
 * `x as const`, or `<const>x`, the angle-bracket spelling TypeScript treats
 * identically (outside `.tsx`, where it does not parse).
 */
const isConstAssertionNode = (
  node: tsm.Node,
): node is tsm.AsExpression | tsm.TypeAssertion => {
  if (isAsConstNode(node)) {
    return true;
  }

  if (!tsm.Node.isTypeAssertion(node)) {
    return false;
  }

  const typeNode = node.getTypeNode();

  return (
    typeNode !== undefined &&
    typeNode.isKind(tsm.SyntaxKind.TypeReference) &&
    typeNode.getTypeName().getText() === 'const' &&
    Arr.isEmpty(typeNode.getTypeArguments())
  );
};

/** `node` with the parentheses written around it taken off. */
const skipParenthesizedExpressions = (node: tsm.Node): tsm.Node =>
  tsm.Node.isParenthesizedExpression(node)
    ? skipParenthesizedExpressions(node.getExpression())
    : node;

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
  // The callee's type is read as the call sees it, after any `as`,
  // `satisfies` or `!` around it: that is the signature the argument is
  // inferred against, and an `as const` has no run-time effect for an inner
  // layer to contradict.
  //
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

/** `ns.MutableFoo` -> `MutableFoo` */
const lastNameOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  entityName: tsm.EntityName,
): string =>
  (tsm.Node.isQualifiedName(entityName)
    ? entityName.getRight()
    : entityName
  ).getText();

/** `mut_x.items` -> `mut_x` */
const firstNameOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  entityName: tsm.EntityName,
): string =>
  tsm.Node.isQualifiedName(entityName)
    ? firstNameOf(entityName.getLeft())
    : entityName.getText();

const startsWithAny = (prefixes: ISet<string>, name: string): boolean =>
  prefixes.some((p) => name.startsWith(p));

/**
 * The name a `typeof` starts from: a variable (`mut_x`) or a class, which
 * `convert-to-readonly` leaves mutable by its type prefix (`MutableStore`).
 */
const isMutableValueName = (
  name: string,
  options: AppendAsConstTransformerOptionsInternal,
): boolean =>
  startsWithAny(options.mutableVariablePrefixes, name) ||
  startsWithAny(options.mutableTypePrefixes, name);

/**
 * Whether `typeNode` names a type of a `mutableTypePrefixes` prefix anywhere
 * in it (`MutableFoo`, `ns.MutableFoo[]`, `import('./m').MutableFoo | X`), or
 * the type of a variable of a `mutableVariablePrefixes` prefix or a class of
 * a `mutableTypePrefixes` one (`typeof mut_x`, `typeof MutableStore`). It reads names only, so an alias of another name for such
 * a type is missed.
 */
const refersToMutableType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  typeNode: tsm.TypeNode | undefined,
  options: AppendAsConstTransformerOptionsInternal,
): boolean => {
  if (typeNode === undefined) {
    return false;
  }

  const refers = (n: tsm.Node): boolean => {
    if (n.isKind(tsm.SyntaxKind.TypeReference)) {
      return startsWithAny(
        options.mutableTypePrefixes,
        lastNameOf(n.getTypeName()),
      );
    }

    if (n.isKind(tsm.SyntaxKind.ImportType)) {
      const qualifier = n.getQualifier();

      return (
        qualifier !== undefined &&
        // typeof import('./m').mut_x names a value
        (n.compilerNode.isTypeOf
          ? isMutableValueName(firstNameOf(qualifier), options)
          : startsWithAny(options.mutableTypePrefixes, lastNameOf(qualifier)))
      );
    }

    // typeof mut_x, typeof mut_x.items, typeof MutableClass
    return (
      n.isKind(tsm.SyntaxKind.TypeQuery) &&
      isMutableValueName(firstNameOf(n.getExprName()), options)
    );
  };

  return refers(typeNode) || typeNode.getFirstDescendant(refers) !== undefined;
};
