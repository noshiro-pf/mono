import * as path from 'node:path';
import { Arr, isBoolean, isRecord, isString, Result } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import type { DeepReadonly } from 'ts-type-forge';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { insertTexts } from '../utils/index.mjs';
import type { TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'enable-explicit-function-return-type';

/**
 * Writes the return type the compiler infers onto every function that
 * [`@typescript-eslint/explicit-function-return-type`](https://typescript-eslint.io/rules/explicit-function-return-type/)
 * reports, so that the rule can be turned on in an existing codebase.
 *
 * Which functions are annotated is decided by the rule's own logic, ported to
 * the TypeScript AST, and the options are the rule's, with its defaults: pass
 * the options the rule is configured with, and the functions annotated are the
 * ones it reports.
 *
 * The type is the one the checker infers, printed as a declaration file would
 * print it, with two differences that keep it readable:
 *
 * - A type from another module is imported with `import type` rather than
 *   written as `import("…").Name`.
 * - A type alias the checker does not remember is restored:
 *   `type Point = Readonly<{ x: number }>` names an instantiation of `Readonly`,
 *   which the checker prints as `Readonly<{ x: number }>`; the alias declared
 *   for it is printed instead. Only a non-generic alias declared outside
 *   `node_modules` is restored, and only when no other alias names the same
 *   type: in every file when its module exports it and is not a test, story or
 *   mock, and otherwise in its own file alone.
 *
 * A function is left as it is, for a human to annotate, when its type cannot be
 * written down faithfully: when it contains `any` (written or inferred, as an
 * unresolved import is), when it names a type that is neither in scope nor
 * importable, or when importing that type would collide with a name already in
 * scope. An inferred type predicate (`x is T`) is kept as one.
 *
 * Types from other modules resolve only when the source file belongs to a
 * project that can resolve them. {@link transformSourceCode} checks each file
 * on its own, where such a type is `any` and its function is left alone; run
 * the transformer through {@link createProjectTransformer} (the CLI's
 * `--project`) to annotate those too.
 *
 * @example
 *
 * ```ts
 * const before = dedent`
 *   export const double = (x: number) => x * 2;
 *
 *   export function isString(x: unknown) {
 *     return typeof x === 'string';
 *   }
 *
 *   export const handlers = [1, 2].map((x) => x + 1);
 * `;
 *
 * const after = transformSourceCode(before, false, [
 *   enableExplicitFunctionReturnTypeTransformer({ allowExpressions: true }),
 * ]);
 *
 * assert.strictEqual(
 *   after.trim(),
 *   dedent`
 *     export const double = (x: number): number => x * 2;
 *
 *     export function isString(x: unknown): x is string {
 *       return typeof x === 'string';
 *     }
 *
 *     export const handlers = [1, 2].map((x) => x + 1);
 *   `,
 * );
 * ```
 */
export const enableExplicitFunctionReturnTypeTransformer = (
  options?: EnableExplicitFunctionReturnTypeTransformerOptions,
): TsMorphTransformer => {
  const optionsInternal: RuleOptions = {
    allowExpressions: options?.allowExpressions ?? false,
    allowTypedFunctionExpressions:
      options?.allowTypedFunctionExpressions ?? true,
    allowHigherOrderFunctions: options?.allowHigherOrderFunctions ?? true,
    allowDirectConstAssertionInArrowFunctions:
      options?.allowDirectConstAssertionInArrowFunctions ?? true,
    allowConciseArrowFunctionExpressionsStartingWithVoid:
      options?.allowConciseArrowFunctionExpressionsStartingWithVoid ?? false,
    allowFunctionsWithoutTypeParameters:
      options?.allowFunctionsWithoutTypeParameters ?? false,
    allowedNames: options?.allowedNames ?? [],
    allowIIFEs: options?.allowIIFEs ?? false,
  } as const;

  const debugPrint: (...args: readonly unknown[]) => void =
    options?.debug === true ? console.debug : () => {};

  return {
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      if (isJavaScriptFile(sourceAst.getFilePath())) {
        return;
      }

      const collectTargets = (): readonly FunctionLike[] =>
        collectReportedFunctions(
          sourceAst.compilerNode,
          optionsInternal,
        ).filter((fn) => !isIgnoredByComment(sourceAst, fn));

      if (Arr.isEmpty(collectTargets())) {
        return;
      }

      // Collected again inside: changing the compiler options replaces the
      // compiler's source file, and a node of the old one is unknown to the new
      // checker.
      const annotations = withStrictNullChecks(sourceAst.getProject(), () =>
        inferAnnotations(sourceAst, collectTargets(), debugPrint),
      );

      if (Arr.isEmpty(annotations.edits)) {
        return;
      }

      // One text edit for the whole file: `insertText` forgets every descendant
      // node, so editing one function at a time would reparse the file once per
      // function.
      sourceAst.replaceText(
        [0, sourceAst.getEnd()],
        insertTexts(sourceAst.getFullText(), annotations.edits),
      );

      addTypeImports(sourceAst, annotations.imports);
    },
  };
};

export type EnableExplicitFunctionReturnTypeTransformerOptions = DeepReadonly<{
  /**
   * The rule's options, with the rule's defaults. See
   * https://typescript-eslint.io/rules/explicit-function-return-type/#options.
   */
  allowExpressions?: boolean;
  allowTypedFunctionExpressions?: boolean;
  allowHigherOrderFunctions?: boolean;
  allowDirectConstAssertionInArrowFunctions?: boolean;
  allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean;
  allowFunctionsWithoutTypeParameters?: boolean;
  allowedNames?: string[];
  allowIIFEs?: boolean;

  debug?: boolean;
}>;

const booleanOptionNames = [
  'allowExpressions',
  'allowTypedFunctionExpressions',
  'allowHigherOrderFunctions',
  'allowDirectConstAssertionInArrowFunctions',
  'allowConciseArrowFunctionExpressionsStartingWithVoid',
  'allowFunctionsWithoutTypeParameters',
  'allowIIFEs',
  'debug',
] as const satisfies readonly (keyof EnableExplicitFunctionReturnTypeTransformerOptions)[];

/**
 * Reads {@link EnableExplicitFunctionReturnTypeTransformerOptions} from a value
 * of unknown shape, such as parsed JSON — which is how the rule's options,
 * copied from an ESLint configuration, reach the CLI. An unknown key is an
 * error rather than ignored, so that a misspelled option is not silently the
 * default.
 */
export const parseEnableExplicitFunctionReturnTypeTransformerOptions = (
  value: unknown,
): Result<EnableExplicitFunctionReturnTypeTransformerOptions, string> => {
  if (!isRecord(value)) {
    return Result.err('The options must be an object.');
  }

  let mut_options: EnableExplicitFunctionReturnTypeTransformerOptions = {};

  for (const [key, optionValue] of Object.entries(value)) {
    const booleanOptionName = booleanOptionNames.find((name) => name === key);

    if (booleanOptionName !== undefined) {
      if (!isBoolean(optionValue)) {
        return Result.err(`\`${key}\` must be a boolean.`);
      }

      mut_options = { ...mut_options, [booleanOptionName]: optionValue };
    } else if (key === 'allowedNames') {
      if (!Arr.isArray(optionValue) || !optionValue.every(isString)) {
        return Result.err('`allowedNames` must be an array of strings.');
      }

      mut_options = { ...mut_options, allowedNames: optionValue };
    } else {
      return Result.err(`Unknown option \`${key}\`.`);
    }
  }

  return Result.ok(mut_options);
};

type RuleOptions = DeepReadonly<{
  allowExpressions: boolean;
  allowTypedFunctionExpressions: boolean;
  allowHigherOrderFunctions: boolean;
  allowDirectConstAssertionInArrowFunctions: boolean;
  allowConciseArrowFunctionExpressionsStartingWithVoid: boolean;
  allowFunctionsWithoutTypeParameters: boolean;
  allowedNames: string[];
  allowIIFEs: boolean;
}>;

const ts = tsm.ts;

/**
 * Runs `fn` with `strictNullChecks` on when the project does not say either
 * way, as the in-memory project of {@link transformSourceCode} does not:
 * inferred without it, `string | undefined` would be written as `string`. A
 * project that turns it off explicitly is inferred as it compiles.
 */
const withStrictNullChecks = <T,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  project: tsm.Project,
  fn: () => T,
): T => {
  const originalOptions = project.getCompilerOptions();

  if (
    originalOptions.strictNullChecks !== undefined ||
    originalOptions.strict !== undefined
  ) {
    return fn();
  }

  try {
    project.compilerOptions.set({ strictNullChecks: true });

    return fn();
  } finally {
    // `set` merges, so the option has to be named to be taken back out.
    project.compilerOptions.set({
      ...originalOptions,
      strictNullChecks: originalOptions.strictNullChecks,
    });
  }
};

const isJavaScriptFile = (filePath: string): boolean =>
  /\.[cm]?jsx?$/u.test(filePath);

const isIgnoredByComment = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
): boolean => {
  const node = sourceAst.getDescendantAtStartWithWidth(
    fn.getStart(sourceAst.compilerNode),
    fn.getWidth(sourceAst.compilerNode),
  );

  if (node === undefined) {
    return false;
  }

  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    return true;
  }

  // A function is rarely the first thing on its own line, so the comment that
  // covers it is the one above the statement or member it appears in.
  const statement = node.getFirstAncestor(
    (ancestor) =>
      tsm.Node.isStatement(ancestor) ||
      ts.isClassElement(ancestor.compilerNode),
  );

  return (
    statement !== undefined &&
    hasDisableNextLineComment(statement, TRANSFORMER_NAME)
  );
};

// ---------------------------------------------------------------------------
// Which functions the rule reports
// ---------------------------------------------------------------------------

/**
 * The function nodes the rule visits, in TypeScript's AST. In ESTree a method,
 * an accessor and a constructor are each a `FunctionExpression` held by a
 * `MethodDefinition` (in a class) or a `Property` (in an object literal);
 * TypeScript has one node for both.
 */
type FunctionLike =
  | tsm.ts.ArrowFunction
  | tsm.ts.ConstructorDeclaration
  | tsm.ts.FunctionDeclaration
  | tsm.ts.FunctionExpression
  | tsm.ts.GetAccessorDeclaration
  | tsm.ts.MethodDeclaration
  | tsm.ts.SetAccessorDeclaration;

const isFunctionLike = (node: tsm.ts.Node): node is FunctionLike =>
  ts.isArrowFunction(node) ||
  ts.isConstructorDeclaration(node) ||
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isGetAccessorDeclaration(node) ||
  ts.isMethodDeclaration(node) ||
  ts.isSetAccessorDeclaration(node);

/** ESTree's `ASTUtils.isFunction`: what a `return` must hand back to make a higher-order function. */
const isEsFunction = (node: tsm.ts.Node): boolean =>
  ts.isArrowFunction(node) ||
  ts.isFunctionExpression(node) ||
  ts.isFunctionDeclaration(node);

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const skipParentheses = (node: tsm.ts.Expression): tsm.ts.Expression =>
  ts.isParenthesizedExpression(node) ? skipParentheses(node.expression) : node;

const parentSkippingParentheses = (node: tsm.ts.Node): tsm.ts.Node =>
  ts.isParenthesizedExpression(node.parent)
    ? parentSkippingParentheses(node.parent)
    : node.parent;

const esParentOfExpression = (expression: tsm.ts.Node): EsParent => {
  const parent = parentSkippingParentheses(expression);

  if (
    ts.isPropertyAssignment(parent) &&
    ts.isObjectLiteralExpression(parent.parent)
  ) {
    return {
      kind: 'Property',
      objectLiteral: parent.parent,
      keyName: ts.isIdentifier(parent.name) ? parent.name.text : undefined,
    };
  }

  return { kind: 'Node', node: parent };
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const esParentOf = (fn: FunctionLike): EsParent => {
  if (
    ts.isMethodDeclaration(fn) ||
    ts.isGetAccessorDeclaration(fn) ||
    ts.isSetAccessorDeclaration(fn)
  ) {
    return ts.isObjectLiteralExpression(fn.parent)
      ? {
          kind: 'Property',
          objectLiteral: fn.parent,
          keyName: ts.isIdentifier(fn.name) ? fn.name.text : undefined,
        }
      : { kind: 'MethodDefinition' };
  }

  return esParentOfExpression(fn);
};

const functionNameForAllowedNames = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  esParent: EsParent,
): string | undefined => {
  if (ts.isFunctionDeclaration(fn)) {
    return fn.name?.text;
  }

  if (ts.isFunctionExpression(fn) && fn.name !== undefined) {
    return fn.name.text;
  }

  switch (esParent.kind) {
    case 'MethodDefinition':
      return (ts.isMethodDeclaration(fn) || ts.isGetAccessorDeclaration(fn)) &&
        ts.isIdentifier(fn.name)
        ? fn.name.text
        : undefined;

    case 'Property':
      return esParent.keyName;

    case 'Node': {
      const { node } = esParent;

      if (ts.isVariableDeclaration(node)) {
        return ts.isIdentifier(node.name) ? node.name.text : undefined;
      }

      if (ts.isPropertyDeclaration(node)) {
        return ts.isIdentifier(node.name) ? node.name.text : undefined;
      }

      return undefined;
    }
  }
};

/** `isAllowedFunction`: `allowFunctionsWithoutTypeParameters`, `allowIIFEs` and `allowedNames`. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isAllowedFunction = (fn: FunctionLike, options: RuleOptions): boolean => {
  if (
    options.allowFunctionsWithoutTypeParameters &&
    (fn.typeParameters === undefined || fn.typeParameters.length === 0)
  ) {
    return true;
  }

  const esParent = esParentOf(fn);

  // The rule's `isIIFE` is any call parent, an argument included.
  if (
    options.allowIIFEs &&
    esParent.kind === 'Node' &&
    ts.isCallExpression(esParent.node)
  ) {
    return true;
  }

  if (Arr.isEmpty(options.allowedNames)) {
    return false;
  }

  const name = functionNameForAllowedNames(fn, esParent);

  return name !== undefined && options.allowedNames.includes(name);
};

/** The `return` statements that belong to `fn` itself, not to a function nested in it. */
const returnStatementsOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
): readonly tsm.ts.ReturnStatement[] => {
  const mut_returns: tsm.ts.ReturnStatement[] = [];

  const visit = (node: tsm.ts.Node): void => {
    if (ts.isReturnStatement(node)) {
      mut_returns.push(node);
    }

    // Class bodies count as well: ESTree's function stack holds only functions,
    // and a class's methods are functions of their own.
    if (!isFunctionLike(node)) {
      ts.forEachChild(node, visit);
    }
  };

  if (fn.body !== undefined) {
    ts.forEachChild(fn.body, visit);
  }

  return mut_returns;
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const doesImmediatelyReturnFunctionExpression = (fn: FunctionLike): boolean => {
  if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) {
    return isEsFunction(skipParentheses(fn.body));
  }

  const returns = returnStatementsOf(fn);

  return (
    Arr.isNonEmpty(returns) &&
    returns.every(
      (statement) =>
        statement.expression !== undefined &&
        isEsFunction(skipParentheses(statement.expression)),
    )
  );
};

/** `isValidFunctionReturnType`: higher-order functions and an existing return type. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isValidReturnType = (fn: FunctionLike, options: RuleOptions): boolean =>
  options.allowHigherOrderFunctions &&
  doesImmediatelyReturnFunctionExpression(fn);

/**
 * The parent ESTree would give `fn`. ESTree has no parenthesized expressions,
 * and gives a method or accessor the `MethodDefinition` / `Property` that holds
 * it as its parent.
 */
type EsParent = Readonly<
  | { kind: 'MethodDefinition' }
  | {
      kind: 'Property';
      objectLiteral: tsm.ts.ObjectLiteralExpression;
      /** ESTree's `property.key`, when it is a non-computed identifier. */
      keyName: string | undefined;
    }
  | { kind: 'Node'; node: tsm.ts.Node }
>;

const isEsVariableDeclarator = (node: tsm.ts.Node): boolean =>
  ts.isVariableDeclaration(node);

const isEsPropertyDefinition = (node: tsm.ts.Node): boolean =>
  ts.isPropertyDeclaration(node);

const isEsExportDefaultDeclaration = (node: tsm.ts.Node): boolean =>
  ts.isExportAssignment(node) && node.isExportEquals !== true;

/** ESTree's `isTypeAssertion`: `x as T` and `<T>x`, not `satisfies`. */
const isEsTypeAssertion = (node: tsm.ts.Node): boolean =>
  ts.isAsExpression(node) || ts.isTypeAssertionExpression(node);

const skipParenthesesAndSatisfies = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.ts.Expression,
): tsm.ts.Expression =>
  ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node)
    ? skipParenthesesAndSatisfies(node.expression)
    : node;

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isConstAssertion = (node: tsm.ts.Expression): boolean =>
  (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) &&
  ts.isTypeReferenceNode(node.type) &&
  ts.isIdentifier(node.type.typeName) &&
  node.type.typeName.text === 'const';

/**
 * `isTypedParent`. `callee` is the function itself, or `undefined` when the
 * parent is that of an object literal — in which case, as in the rule, any call
 * holding it counts as typed.
 */
const isTypedParent = (
  parent: tsm.ts.Node,
  callee: tsm.ts.Node | undefined,
): boolean =>
  isEsTypeAssertion(parent) ||
  // `isVariableDeclaratorWithTypeAnnotation`
  (ts.isVariableDeclaration(parent) && parent.type !== undefined) ||
  // `isDefaultFunctionParameterWithTypeAnnotation`
  (ts.isParameter(parent) &&
    parent.type !== undefined &&
    parent.initializer !== undefined) ||
  // `isPropertyDefinitionWithTypeAnnotation`
  (ts.isPropertyDeclaration(parent) && parent.type !== undefined) ||
  // `isFunctionArgument`
  (ts.isCallExpression(parent) &&
    (callee === undefined || skipParentheses(parent.expression) !== callee)) ||
  // `isTypedJSX`
  ts.isJsxExpression(parent) ||
  ts.isJsxSpreadAttribute(parent);

/** `isPropertyOfObjectWithType`, given the object literal holding the property. */
const isPropertyOfObjectWithType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  objectLiteral: tsm.ts.ObjectLiteralExpression,
): boolean => {
  const esParent = esParentOfExpression(objectLiteral);

  switch (esParent.kind) {
    case 'MethodDefinition':
      return false;

    case 'Property':
      return isPropertyOfObjectWithType(esParent.objectLiteral);

    case 'Node':
      return isTypedParent(esParent.node, undefined);
  }
};

/** `isTypedFunctionExpression` */
const isTypedFunctionExpression = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  esParent: EsParent,
  options: RuleOptions,
): boolean => {
  if (!options.allowTypedFunctionExpressions) {
    return false;
  }

  switch (esParent.kind) {
    case 'MethodDefinition':
      return false;

    case 'Property':
      return isPropertyOfObjectWithType(esParent.objectLiteral);

    case 'Node':
      return (
        isTypedParent(esParent.node, fn) ||
        // `isConstructorArgument`
        ts.isNewExpression(esParent.node)
      );
  }
};

/** `isValidFunctionExpressionReturnType` */
const isValidFunctionExpressionReturnType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  options: RuleOptions,
): boolean => {
  const esParent = esParentOf(fn);

  if (isTypedFunctionExpression(fn, esParent, options)) {
    return true;
  }

  if (
    options.allowExpressions &&
    !(
      esParent.kind === 'MethodDefinition' ||
      (esParent.kind === 'Node' &&
        (isEsVariableDeclarator(esParent.node) ||
          isEsExportDefaultDeclaration(esParent.node) ||
          isEsPropertyDefinition(esParent.node)))
    )
  ) {
    return true;
  }

  if (
    !options.allowDirectConstAssertionInArrowFunctions ||
    !ts.isArrowFunction(fn) ||
    ts.isBlock(fn.body)
  ) {
    return false;
  }

  return isConstAssertion(skipParenthesesAndSatisfies(fn.body));
};

/** The loop of `ancestorHasReturnType`, from `node` up. */
const isTypedBySelfOrAncestor = (node: tsm.ts.Node): boolean => {
  if (isFunctionLike(node) && node.type !== undefined) {
    return true;
  }

  // `const x: Foo = () => {};` — a typed variable or class property is taken to
  // type the function.
  if (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) {
    return node.type !== undefined;
  }

  return (
    !ts.isExpressionStatement(node) &&
    !ts.isSourceFile(node) &&
    isTypedBySelfOrAncestor(node.parent)
  );
};

/** `ancestorHasReturnType` */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const ancestorHasReturnType = (fn: FunctionLike): boolean => {
  const esParent = esParentOf(fn);

  // The rule starts from `property.value` — the function itself — when the
  // function is the value of a property.
  const start: tsm.ts.Node | undefined =
    esParent.kind === 'Property'
      ? fn
      : esParent.kind === 'Node'
        ? esParent.node
        : undefined;

  if (start === undefined) {
    return false;
  }

  const isReturnStatement = ts.isReturnStatement(start);

  const isBodylessArrow = ts.isArrowFunction(start) && !ts.isBlock(start.body);

  return (
    (isReturnStatement || isBodylessArrow) && isTypedBySelfOrAncestor(start)
  );
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isReported = (fn: FunctionLike, options: RuleOptions): boolean => {
  // Overload signatures, `declare`d and abstract members have no body, and the
  // rule visits none of them.
  if (fn.body === undefined || fn.type !== undefined) {
    return false;
  }

  // ESTree's `isConstructor` / `isSetter`, which make any of them valid.
  if (ts.isConstructorDeclaration(fn) || ts.isSetAccessorDeclaration(fn)) {
    return false;
  }

  if (ts.isFunctionDeclaration(fn)) {
    return !isAllowedFunction(fn, options) && !isValidReturnType(fn, options);
  }

  // `exitFunctionExpression`
  if (
    options.allowConciseArrowFunctionExpressionsStartingWithVoid &&
    ts.isArrowFunction(fn) &&
    !ts.isBlock(fn.body) &&
    ts.isVoidExpression(skipParentheses(fn.body))
  ) {
    return false;
  }

  if (isAllowedFunction(fn, options)) {
    return false;
  }

  if (
    options.allowTypedFunctionExpressions &&
    (isValidFunctionExpressionReturnType(fn, options) ||
      ancestorHasReturnType(fn))
  ) {
    return false;
  }

  return !isValidReturnType(fn, options);
};

const collectReportedFunctions = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  options: RuleOptions,
): readonly FunctionLike[] => {
  const mut_reported: FunctionLike[] = [];

  const visit = (node: tsm.ts.Node): void => {
    if (isFunctionLike(node) && isReported(node, options)) {
      mut_reported.push(node);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_reported;
};

// ---------------------------------------------------------------------------
// Restoring type aliases the checker does not remember
// ---------------------------------------------------------------------------

/**
 * A module nothing else should import a type from: a test, a story, a mock, or
 * anything under a directory of them.
 */
const isTestOrStoryFile = (
  fileName: string,
  currentDirectory: string,
): boolean => {
  // Relative to the project, so that a project inside a directory named `test`
  // or `mocks` is not taken for one.
  const relative = path.posix.relative(currentDirectory, fileName);

  return (
    /(?:^|\/)(?:__tests__|__mocks__|tests?|mocks?)\//u.test(relative) ||
    /\.(?:test|spec|stories|mock)\.[cm]?tsx?$/u.test(relative)
  );
};

/** The symbols `sourceFile` exports, however it exports them. */
const exportedSymbolsOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
): ReadonlySet<tsm.ts.Symbol> => {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

  if (moduleSymbol === undefined) {
    return new Set<tsm.ts.Symbol>();
  }

  return new Set(
    checker
      .getExportsOfModule(moduleSymbol)
      .map((exported) =>
        (exported.flags & ts.SymbolFlags.Alias) === 0
          ? exported
          : checker.getAliasedSymbol(exported),
      ),
  );
};

type LostAlias = Readonly<{ type: tsm.ts.Type; symbol: tsm.ts.Symbol }>;

/**
 * The non-generic aliases `sourceFile` declares for an instantiation of a
 * generic alias, which the checker prints as that instantiation, with
 * `isExported` telling whether each is exported.
 */
const lostAliasesOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
): readonly (LostAlias & Readonly<{ isExported: boolean }>)[] => {
  const exported = exportedSymbolsOf(sourceFile, checker);

  return sourceFile.statements.flatMap((statement) => {
    if (
      !ts.isTypeAliasDeclaration(statement) ||
      statement.typeParameters !== undefined
    ) {
      return [];
    }

    const symbol = checker.getSymbolAtLocation(statement.name);

    if (symbol === undefined) {
      return [];
    }

    const type = checker.getDeclaredTypeOfSymbol(symbol);

    return type.aliasSymbol === undefined ||
      type.aliasSymbol === symbol ||
      type.aliasTypeArguments === undefined
      ? []
      : [
          {
            type,
            symbol,
            isExported:
              exported.has(symbol) ||
              exported.has(checker.getExportSymbolOfSymbol(symbol)),
          },
        ];
  });
};

/**
 * The aliases among `aliases` that are the only one naming their type: of two
 * naming the same type, neither is the right one to print.
 */
const uniqueAliases = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  aliases: readonly LostAlias[],
): readonly LostAlias[] =>
  aliases.filter(({ type }) =>
    Arr.isFixedLengthArray(
      1,
      aliases.filter((other) => other.type === type),
    ),
  );

/**
 * The checker reads a type's alias from these two fields, which its public type
 * declares `readonly`.
 */
const setAlias = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: tsm.ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: tsm.ts.Symbol | undefined,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  aliasTypeArguments?: readonly tsm.ts.Type[],
): void => {
  const mut_type: {
    aliasSymbol?: tsm.ts.Symbol | undefined;
    aliasTypeArguments?: readonly tsm.ts.Type[] | undefined;
  } = type;

  mut_type.aliasSymbol = symbol;

  mut_type.aliasTypeArguments = aliasTypeArguments;
};

/**
 * `type Point = Readonly<{ x: number }>` declares no type of its own: it names
 * an instantiation of `Readonly`, and that instantiation keeps `Readonly` as
 * its alias. The checker therefore prints every `Point` it infers as
 * `Readonly<{ x: number }>`, which in a codebase that writes all its object
 * types that way would make every annotation a copy of a declaration.
 *
 * This gives such a type the alias declared for it, on the checker of `program`
 * — which is this codemod's own and is thrown away with the program once the
 * file is edited. Only a non-generic alias declared outside `node_modules` is
 * restored, only when it is the only alias naming its type, and here only when
 * its module exports it and is not a test, story or mock; the others are
 * restored by `withOwnTypeAliases` while their own file is transformed. The
 * checker still prints the type structurally wherever the alias is not visible.
 */
const restoreLostTypeAliases = (
  program: tsm.ts.Program,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
): void => {
  if (checkersWithRestoredAliases.has(checker)) {
    return;
  }

  checkersWithRestoredAliases.add(checker);

  // Every alias of the program is read, not only those of the files a
  // transformed file depends on: whether an alias is the only one naming its
  // type is a question about all of them. An alias another module cannot
  // import is restored only while its own file is transformed
  // (`withOwnTypeAliases`): restored for good, it would make every other file
  // print its type structurally instead of as the instantiation it is.
  const exportedAliases = program
    .getSourceFiles()
    .filter(
      (sourceFile) =>
        !sourceFile.isDeclarationFile &&
        !sourceFile.fileName.includes('/node_modules/') &&
        !isTestOrStoryFile(sourceFile.fileName, program.getCurrentDirectory()),
    )
    .flatMap((sourceFile) =>
      lostAliasesOf(sourceFile, checker).filter(({ isExported }) => isExported),
    );

  for (const { type, symbol } of uniqueAliases(exportedAliases)) {
    setAlias(type, symbol);
  }
};

const checkersWithRestoredAliases = new WeakSet<tsm.ts.TypeChecker>();

/**
 * Runs `fn` with the aliases `sourceFile` declares that are not restored for
 * good — those it does not export, and every one of a test, story or mock —
 * restored, and takes them back afterwards: `sourceFile` can print them, other
 * files should not. A type an exported alias already names keeps that one.
 */
const withOwnTypeAliases = <T,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
  fn: () => T,
): T => {
  // Those restored for good are no longer lost, and are not among these.
  const ownAliases = uniqueAliases(lostAliasesOf(sourceFile, checker));

  const previous = ownAliases.map(({ type }) => ({
    type,
    aliasSymbol: type.aliasSymbol,
    aliasTypeArguments: type.aliasTypeArguments,
  }));

  for (const { type, symbol } of ownAliases) {
    setAlias(type, symbol);
  }

  try {
    return fn();
  } finally {
    for (const { type, aliasSymbol, aliasTypeArguments } of previous) {
      setAlias(type, aliasSymbol, aliasTypeArguments);
    }
  }
};

// ---------------------------------------------------------------------------
// What to write
// ---------------------------------------------------------------------------

type TextEdit = Readonly<{ position: number; text: string }>;

type TypeImport = Readonly<{ name: string; moduleSpecifier: string }>;

type Annotations = Readonly<{
  edits: readonly TextEdit[];
  imports: readonly TypeImport[];
}>;

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const describe = (fn: FunctionLike, sourceFile: tsm.ts.SourceFile): string => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    fn.getStart(sourceFile),
  );

  return `${sourceFile.fileName}:${line + 1}:${character + 1}`;
};

/**
 * The return type of `fn` as a type node, or its type predicate when it has
 * one: annotating `x is T` as `boolean` would take the narrowing away.
 */
const returnTypeNodeOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
): tsm.ts.TypeNode | undefined => {
  const signature = checker.getSignatureFromDeclaration(fn);

  if (signature === undefined) {
    return undefined;
  }

  const predicate = checker.getTypePredicateOfSignature(signature);

  if (predicate?.type !== undefined) {
    const typeNode = checker.typeToTypeNode(
      predicate.type,
      fn,
      nodeBuilderFlags,
    );

    if (typeNode === undefined) {
      return undefined;
    }

    const isAssertion =
      predicate.kind === ts.TypePredicateKind.AssertsIdentifier ||
      predicate.kind === ts.TypePredicateKind.AssertsThis;

    return ts.factory.createTypePredicateNode(
      isAssertion
        ? ts.factory.createToken(ts.SyntaxKind.AssertsKeyword)
        : undefined,
      predicate.kind === ts.TypePredicateKind.This ||
        predicate.kind === ts.TypePredicateKind.AssertsThis
        ? ts.factory.createThisTypeNode()
        : predicate.parameterName,
      typeNode,
    );
  }

  return checker.typeToTypeNode(
    checker.getReturnTypeOfSignature(signature),
    fn,
    nodeBuilderFlags,
  );
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const leftmostIdentifier = (name: tsm.ts.EntityName): tsm.ts.Identifier =>
  ts.isIdentifier(name) ? name : leftmostIdentifier(name.left);

/**
 * A specifier the checker writes when it cannot do better — an absolute path,
 * or a path into `node_modules` that is not a package's entry point — would not
 * survive being committed.
 */
const isImportableModuleSpecifier = (moduleSpecifier: string): boolean =>
  !moduleSpecifier.startsWith('/') &&
  !/^[A-Za-z]:[\\/]/u.test(moduleSpecifier) &&
  !moduleSpecifier.includes('node_modules');

/**
 * Replaces each `import("…").Name` in `typeNode` with `Name`, collecting the
 * `import type` declarations that makes necessary. Reports a failure for what
 * cannot be written faithfully: `any`, and an import that is not of a named
 * export of a module this file can name.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const rewriteImportTypes = (typeNode: tsm.ts.TypeNode): RewrittenTypeNode => {
  const mut_freeNames = new Set<string>();

  const mut_boundNames = new Set<string>();

  const mut_imports: TypeImport[] = [];

  let mut_failure: string | undefined = undefined;

  const transformer: tsm.ts.TransformerFactory<tsm.ts.TypeNode> =
    (context) => (root) => {
      const visit = (node: tsm.ts.Node): tsm.ts.Node => {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
          mut_failure ??= 'the type contains `any`';

          return node;
        }

        if (ts.isImportTypeNode(node)) {
          const moduleSpecifier =
            ts.isLiteralTypeNode(node.argument) &&
            ts.isStringLiteral(node.argument.literal)
              ? node.argument.literal.text
              : undefined;

          const name =
            node.qualifier === undefined
              ? undefined
              : leftmostIdentifier(node.qualifier).text;

          if (
            name === undefined ||
            name === 'default' ||
            moduleSpecifier === undefined ||
            node.qualifier === undefined ||
            !isImportableModuleSpecifier(moduleSpecifier)
          ) {
            mut_failure ??= `the type refers to \`${moduleSpecifier ?? 'a module'}\` in a way that cannot be imported`;

            return node;
          }

          mut_imports.push({ name, moduleSpecifier });

          const typeArguments = node.typeArguments?.map((argument) =>
            ts.visitNode(argument, visit, ts.isTypeNode),
          );

          return node.isTypeOf
            ? ts.factory.createTypeQueryNode(node.qualifier, typeArguments)
            : ts.factory.createTypeReferenceNode(node.qualifier, typeArguments);
        }

        // `x?: T | undefined` says nothing `x?: T` does not, whatever the
        // compiler options: an optional parameter always accepts `undefined`.
        if (
          ts.isParameter(node) &&
          node.questionToken !== undefined &&
          node.type !== undefined &&
          ts.isUnionTypeNode(node.type)
        ) {
          const withoutUndefined = node.type.types.filter(
            (member) => member.kind !== ts.SyntaxKind.UndefinedKeyword,
          );

          const [onlyMember] = withoutUndefined;

          const type =
            onlyMember === undefined
              ? node.type
              : Arr.isFixedLengthArray(1, withoutUndefined)
                ? onlyMember
                : ts.factory.createUnionTypeNode(withoutUndefined);

          return ts.visitEachChild(
            ts.factory.updateParameterDeclaration(
              node,
              node.modifiers,
              node.dotDotDotToken,
              node.name,
              node.questionToken,
              type,
              node.initializer,
            ),
            visit,
            context,
          );
        }

        if (ts.isTypeParameterDeclaration(node)) {
          mut_boundNames.add(node.name.text);
        } else if (ts.isTypeReferenceNode(node)) {
          mut_freeNames.add(leftmostIdentifier(node.typeName).text);
        } else if (ts.isTypeQueryNode(node)) {
          mut_freeNames.add(leftmostIdentifier(node.exprName).text);
        }

        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(root, visit, ts.isTypeNode);
    };

  const result = ts.transform(typeNode, [transformer]);

  const [transformed] = result.transformed;

  result.dispose();

  return {
    node: transformed ?? typeNode,
    imports: mut_imports,
    // A name the type binds itself — the type parameter of a generic function
    // type, the key of a mapped type, an `infer` — needs nothing in scope. A
    // name bound anywhere in the type is taken as bound throughout it, which at
    // worst skips the check for a same-named type parameter of the function.
    freeNames: new Set(
      Array.from(mut_freeNames).filter((name) => !mut_boundNames.has(name)),
    ),
    failure: mut_failure,
  };
};

/** Every identifier written in `sourceFile`, cached per parse. */
const identifierNamesOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
): ReadonlySet<string> => {
  const cached = identifierNamesCache.get(sourceFile);

  if (cached !== undefined) {
    return cached;
  }

  const mut_names = new Set<string>();

  const visit = (node: tsm.ts.Node): void => {
    if (ts.isIdentifier(node)) {
      mut_names.add(node.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  identifierNamesCache.set(sourceFile, mut_names);

  return mut_names;
};

/**
 * Whether importing `name` may shadow `symbol`: it is declared in no file but
 * another one (a global, such as the `JSX` namespace `@types/react` 18 still
 * declares), and this file never mentions `name`, so nothing it already says
 * changes meaning.
 */
const isShadowableGlobal = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: tsm.ts.Symbol,
  name: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
): boolean => {
  const sourceFile = fn.getSourceFile();

  const declarations = symbol.getDeclarations() ?? [];

  return (
    Arr.isNonEmpty(declarations) &&
    declarations.every(
      (declaration) => declaration.getSourceFile() !== sourceFile,
    ) &&
    !identifierNamesOf(sourceFile).has(name)
  );
};

/**
 * Whether `symbol` is declared nowhere but inside the body of `fn`, where
 * `resolveName` finds it from `fn` although the return type cannot see it.
 */
const isDeclaredInBodyOnly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: tsm.ts.Symbol,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
): boolean => {
  const { body } = fn;

  const declarations = symbol.getDeclarations() ?? [];

  return (
    body !== undefined &&
    Arr.isNonEmpty(declarations) &&
    declarations.every(
      (declaration) =>
        declaration.getSourceFile() === fn.getSourceFile() &&
        declaration.pos >= body.pos &&
        declaration.end <= body.end,
    )
  );
};

/**
 * Why importing the names an annotation needs would change what a name means,
 * if it would:
 *
 * - A name already in scope at `fn` is one the checker chose not to use, so it
 *   names something else — unless it is a global this file never mentions
 *   ({@link isShadowableGlobal}).
 * - A name the annotations of this file refer to as in scope cannot also be
 *   imported: `MouseEvent<HTMLElement, MouseEvent>` from React names the
 *   global `MouseEvent` inside, which an import of React's would replace.
 * - Two modules cannot both provide one name to a file.
 */
const findImportConflict = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  { imports, freeNames }: RewrittenTypeNode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
  plannedImports: ReadonlyMap<string, string>,
  plannedFreeNames: ReadonlySet<string>,
): string | undefined => {
  for (const name of freeNames) {
    const planned = plannedImports.get(name);

    if (planned !== undefined) {
      return `\`${name}\` is both imported from \`${planned}\` and meant as the \`${name}\` already in scope`;
    }

    // The checker writes the bare name of a type it can neither see nor import,
    // such as a class another module does not export, or a type declared in the
    // function's own body, which the return type cannot see.
    const symbol = checker.resolveName(
      name,
      fn,
      ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Value,
      false,
    );

    if (symbol === undefined || isDeclaredInBodyOnly(symbol, fn)) {
      return `\`${name}\` is not in scope here, and cannot be imported`;
    }
  }

  const mut_seen = new Map<string, string>();

  for (const { name, moduleSpecifier } of imports) {
    if (freeNames.has(name) || plannedFreeNames.has(name)) {
      return `\`${name}\` is both imported from \`${moduleSpecifier}\` and meant as the \`${name}\` already in scope`;
    }

    const planned = plannedImports.get(name) ?? mut_seen.get(name);

    if (planned !== undefined) {
      if (planned !== moduleSpecifier) {
        return `\`${name}\` would be imported from both \`${planned}\` and \`${moduleSpecifier}\``;
      }

      continue;
    }

    const inScope = checker.resolveName(
      name,
      fn,
      ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace,
      false,
    );

    if (inScope !== undefined && !isShadowableGlobal(inScope, name, fn)) {
      return `importing \`${name}\` from \`${moduleSpecifier}\` would shadow the \`${name}\` already in scope`;
    }

    mut_seen.set(name, moduleSpecifier);
  }

  return undefined;
};

/**
 * Where `: T` goes: after the parameter list's closing parenthesis. An arrow
 * function whose single parameter has none gets them, since `x: T => …` is not
 * an annotated arrow function.
 */
const annotationEdits = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: FunctionLike,
  typeText: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
): readonly TextEdit[] => {
  const closeParen = fn
    .getChildren(sourceFile)
    .find((child) => child.kind === ts.SyntaxKind.CloseParenToken);

  if (closeParen !== undefined) {
    return [{ position: closeParen.getEnd(), text: `: ${typeText}` }];
  }

  const [parameter] = fn.parameters;

  if (parameter === undefined) {
    return [];
  }

  return [
    { position: parameter.getStart(sourceFile), text: '(' },
    { position: parameter.getEnd(), text: `): ${typeText}` },
  ];
};

const inferAnnotationsWith = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: tsm.ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  targets: readonly FunctionLike[],
  debugPrint: (...args: readonly unknown[]) => void,
): Annotations => {
  const printer = ts.createPrinter({ removeComments: true });

  const mut_edits: TextEdit[] = [];

  /** Name to module specifier, of every name this file is going to import. */
  const mut_imports = new Map<string, string>();

  /** Every name the annotations planned so far refer to as in scope. */
  const mut_freeNames = new Set<string>();

  for (const fn of targets) {
    const result = returnTypeNodeOf(fn, checker);

    if (result === undefined) {
      debugPrint(
        `${describe(fn, sourceFile)}: no return type could be inferred`,
      );

      continue;
    }

    const rewritten = rewriteImportTypes(result);

    const conflict =
      rewritten.failure ??
      findImportConflict(rewritten, fn, checker, mut_imports, mut_freeNames);

    if (conflict !== undefined) {
      debugPrint(`${describe(fn, sourceFile)}: ${conflict}`);

      continue;
    }

    for (const { name, moduleSpecifier } of rewritten.imports) {
      mut_imports.set(name, moduleSpecifier);
    }

    for (const name of rewritten.freeNames) {
      mut_freeNames.add(name);
    }

    const typeText = printer.printNode(
      ts.EmitHint.Unspecified,
      rewritten.node,
      sourceFile,
    );

    debugPrint(`${describe(fn, sourceFile)}: ${typeText}`);

    mut_edits.push(...annotationEdits(fn, typeText, sourceFile));
  }

  return {
    edits: mut_edits,
    imports: Array.from(mut_imports, ([name, moduleSpecifier]) => ({
      name,
      moduleSpecifier,
    })),
  };
};

const inferAnnotations = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  targets: readonly FunctionLike[],
  debugPrint: (...args: readonly unknown[]) => void,
): Annotations => {
  const program = sourceAst.getProject().getProgram().compilerObject;

  const checker = program.getTypeChecker();

  restoreLostTypeAliases(program, checker);

  const sourceFile = sourceAst.compilerNode;

  return withOwnTypeAliases(sourceFile, checker, () =>
    inferAnnotationsWith(sourceFile, checker, targets, debugPrint),
  );
};

/**
 * `NoTruncation` and nothing else: without `IgnoreErrors`, the checker gives up
 * (returns `undefined`) on a type it cannot name from the function, instead of
 * writing something that does not compile.
 */
const nodeBuilderFlags = ts.NodeBuilderFlags.NoTruncation;

type RewrittenTypeNode = Readonly<{
  node: tsm.ts.TypeNode;
  imports: readonly TypeImport[];
  /**
   * The names the type refers to as they are in scope, such as the global
   * `MouseEvent` in React's `MouseEvent<HTMLElement, MouseEvent>`. An import of
   * one of them would change what it means.
   */
  freeNames: ReadonlySet<string>;
  /** Why the type cannot be written as it is, if it cannot. */
  failure: string | undefined;
}>;

const identifierNamesCache = new WeakMap<
  tsm.ts.SourceFile,
  ReadonlySet<string>
>();

const addTypeImportsByModule = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  namesBySpecifier: ReadonlyMap<string, readonly TypeImport[]>,
): void => {
  for (const [moduleSpecifier, entries] of namesBySpecifier) {
    const names = entries.map(({ name }) => name).toSorted();

    const fromModule = sourceAst
      .getImportDeclarations()
      .filter(
        (declaration) =>
          declaration.getNamespaceImport() === undefined &&
          declaration.getModuleSpecifierValue() === moduleSpecifier,
      );

    const typeOnly = fromModule.find((declaration) => declaration.isTypeOnly());

    // A file that imports types inline (`import { f, type T }`) would have a
    // separate `import type` from the same module reported as a duplicate.
    const withInlineTypes = fromModule.find(
      (declaration) =>
        !declaration.isTypeOnly() &&
        declaration
          .getNamedImports()
          .some((specifier) => specifier.isTypeOnly()),
    );

    if (typeOnly !== undefined) {
      typeOnly.addNamedImports(names);
    } else if (withInlineTypes !== undefined) {
      withInlineTypes.addNamedImports(
        names.map((name) => ({ name, isTypeOnly: true })),
      );
    } else {
      sourceAst.addImportDeclaration({
        isTypeOnly: true,
        moduleSpecifier,
        namedImports: names,
      });
    }
  }
};

/**
 * Adds `import type { Name } from '…'`, to the file's existing type-only
 * import from that module when it has one.
 */
const addTypeImports = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceAst: tsm.SourceFile,
  imports: readonly TypeImport[],
): void => {
  const namesBySpecifier = Map.groupBy(
    imports,
    ({ moduleSpecifier }) => moduleSpecifier,
  );

  const project = sourceAst.getProject();

  const originalQuoteKind = project.manipulationSettings.getQuoteKind();

  // Written the way the file's existing imports are.
  const firstSpecifier = sourceAst
    .getImportDeclarations()
    .at(0)
    ?.getModuleSpecifier()
    .getText();

  if (firstSpecifier !== undefined) {
    project.manipulationSettings.set({
      quoteKind: firstSpecifier.startsWith("'")
        ? tsm.QuoteKind.Single
        : tsm.QuoteKind.Double,
    });
  }

  try {
    addTypeImportsByModule(sourceAst, namesBySpecifier);
  } finally {
    project.manipulationSettings.set({ quoteKind: originalQuoteKind });
  }
};
