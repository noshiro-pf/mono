import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  bindValueImportsAt,
  getArgumentText,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';

/**
 * A Vitest binding a call is made on, and how the file reaches it.
 */
export type VitestReceiver = Readonly<{
  /**
   * The identifier the call is made on. A fixer can reuse its text: rewriting
   * `a.ok(x)` to `assert.isTrue(x)` would name a binding the file may not have.
   */
  identifier: TSESTree.Identifier;
  /**
   * - `'global'`: Vitest's injected global, under its own name.
   * - `'import'`: an `import` from `'vitest'`.
   * - `'destructured'`: a property destructured from the first parameter of a
   *   Vitest test's callback (its context), or from the in-source handle
   *   (`import`'s `meta` property's `vitest`).
   */
  reachedBy: 'destructured' | 'global' | 'import';
}>;

/**
 * The Vitest binding a `<receiver>.<method>(...)` call is made on, when that
 * receiver is the binding originally exported as `expectedName` — otherwise
 * `undefined`.
 *
 * The rules in this directory cannot be scoped by file name: `includeSource`
 * puts in-source tests — the ones guarded by `import.meta`'s `vitest` property
 * — in ordinary `src/**` modules, so `eslintConfigForVitest()` is applied to
 * every file. (That property is spelled out here rather than written as one
 * token because Vitest looks for the token in a file's text: a comment
 * containing it makes the file an in-source test file, which then fails for
 * having no tests.) Matching on the identifier's spelling alone therefore
 * rewrites `assert(x)` from `node:assert` — whose fix output, `assert.isTrue`,
 * does not exist there — and misses `import { assert as a } from 'vitest'`,
 * which is the same function under another name.
 *
 * Resolving the binding settles both:
 *
 * - Unresolved, or resolved to a variable with no definition — Vitest's
 *   injected global, reached under its own name. A global declared through
 *   ESLint's `globals` config is the case with no definition.
 * - An `import` from `'vitest'` — the same value, reached explicitly. The
 *   export it was taken from is what has to match, so an alias counts.
 * - A property destructured, under that name, from the context a Vitest test
 *   passes its callback (`test.concurrent('x', ({ expect }) => …)`; the context
 *   has `expect` and no `assert`), or from the in-source handle
 *   (`const { expect } = <the handle>`). The test is Vitest's own `test` or
 *   `it`, resolved the same way, with modifiers such as `.concurrent`; a test
 *   made by `test.extend` in another module is not followed.
 * - Anything else — another module's export, a local, another parameter. Not
 *   ours.
 *
 * `node` is read through the type wrappers around it, so
 * `(assert as typeof assert).ok(x)` and `assert!.ok(x)` are Vitest's `assert`
 * too. The identifier returned is then the one inside the wrappers, and is not
 * `node`: a fixer that replaces it must leave the wrappers around it.
 */
export const getVitestReceiver = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  expectedName: 'assert' | 'expect',
): VitestReceiver | undefined =>
  resolveVitestBinding(sourceCode, node, expectedName);

/**
 * The value and the optional message of a Vitest `expect(X)` or
 * `expect(X, message)` call, or `undefined` for a call a rule cannot carry over
 * to `assert`: no argument, a spread argument, or more than two.
 */
export const getExpectOperands = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expectCall: TSESTree.CallExpression,
): ExpectOperands | undefined => {
  const [actual, message, ...rest] = expectCall.arguments;

  return actual === undefined ||
    actual.type === AST_NODE_TYPES.SpreadElement ||
    message?.type === AST_NODE_TYPES.SpreadElement ||
    !Arr.isEmpty(rest)
    ? undefined
    : { actual, message };
};

/** What {@link getExpectOperands} returns. */
export type ExpectOperands = Readonly<{
  actual: TSESTree.Expression;
  message: TSESTree.Expression | undefined;
}>;

/**
 * The text of `expect(X)`'s or `expect(X, message)`'s operands as the arguments
 * of an `assert.*` call: `X`, then the message when there is one.
 */
export const getExpectOperandsText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  operands: ExpectOperands,
): string =>
  [operands.actual, operands.message]
    .filter((operand) => operand !== undefined)
    .map((operand) => getArgumentText(sourceCode, operand))
    .join(', ');

/**
 * For one file, a function that gives the fix for a rule rewriting the Vitest
 * `expect(…)` call `node` into a call on Vitest's `assert` — `replacement`
 * builds the new text from the name `assert` is reached by — or `null` when no
 * name can be written safely, in which case the rule reports without a fix. A
 * bare `assert.` would name `node:assert`'s, which has no `isTrue` and whose
 * `deepStrictEqual` compares prototypes, or a binding the file does not have.
 *
 * `expectReceiver` is what `getVitestReceiver` returned for the `expect` of
 * `node`.
 *
 * - `expect` destructured from a test's context or the in-source handle: no
 *   fix. The context has no `assert`; a global `assert` is not shown to exist
 *   by such an `expect`, and an in-source test reaches Vitest only through the
 *   handle, so an `import` added to its module would load Vitest in
 *   production.
 * - `expect` the global, and no value named `assert` declared where
 *   `node` is (a type of that name does not count): Vitest's globals are on,
 *   and `assert` is one of them.
 * - Otherwise `assert` is bound as `bindValueImportsAt` binds an export of
 *   `'vitest'`: by its local name when imported (`import { assert as a }`),
 *   through a namespace import, or else added to an import from `'vitest'`;
 *   no fix when `assert` is bound to anything else at `node` (`node:assert`,
 *   a local, a parameter). Fixes that add the import overlap, so `--fix`
 *   applies one per pass.
 *
 * `bindValueImportsAt` is set up on the first report that needs it and shared
 * by the rest of the file's.
 */
export const createVitestAssertFixer = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): ((
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expectReceiver: VitestReceiver,
  replacement: (assertName: string) => string,
) => TSESLint.ReportFixFunction | null) => {
  let mut_bindingAt: ReturnType<typeof bindValueImportsAt> | undefined =
    undefined;

  return (node, expectReceiver, replacement) => {
    if (expectReceiver.reachedBy === 'destructured') {
      return null;
    }

    if (
      expectReceiver.reachedBy === 'global' &&
      !isValueBound(sourceCode.getScope(node), 'assert')
    ) {
      return (fixer) => fixer.replaceText(node, replacement('assert'));
    }

    mut_bindingAt ??= bindValueImportsAt(sourceCode, 'vitest', ['assert']);

    const binding = mut_bindingAt(node);

    const localName = binding?.localNames[0];

    return binding === undefined || localName === undefined
      ? null
      : (fixer) =>
          Arr.toPushed(
            binding.edits(fixer),
            fixer.replaceText(node, replacement(localName)),
          );
  };
};

/**
 * Whether `name`, read as a value in `scope`, meets a binding the file
 * declares. A type alias, interface or type parameter does not shadow a value,
 * so `type assert = …` leaves the global `assert` reachable.
 */
const isValueBound = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  scope: TSESLint.Scope.Scope | null,
  name: string,
): boolean => {
  if (scope === null) {
    return false;
  }

  const variable = scope.set.get(name);

  return (
    variable?.defs.some(
      (def) => def.type !== TSESLint.Scope.DefinitionType.Type,
    ) === true || isValueBound(scope.upper, name)
  );
};

/** The Vitest exports a binding is resolved to. */
type VitestExportName = 'assert' | 'expect' | 'it' | 'test';

const isVitestImportOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
  expectedName: VitestExportName,
): boolean =>
  def.type === TSESLint.Scope.DefinitionType.ImportBinding &&
  def.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  def.parent.source.value === 'vitest' &&
  def.node.type === AST_NODE_TYPES.ImportSpecifier &&
  def.node.imported.type === AST_NODE_TYPES.Identifier &&
  def.node.imported.name === expectedName;

/** `getVitestReceiver` for any of {@link VitestExportName}. */
const resolveVitestBinding = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  expectedName: VitestExportName,
): VitestReceiver | undefined => {
  const receiver = skipTypeWrappers(node);

  if (receiver.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const variable = ASTUtils.findVariable(
    sourceCode.getScope(receiver),
    receiver,
  );

  if (variable === null || Arr.isEmpty(variable.defs)) {
    return receiver.name === expectedName
      ? { identifier: receiver, reachedBy: 'global' }
      : undefined;
  }

  if (variable.defs.every((def) => isVitestImportOf(def, expectedName))) {
    return { identifier: receiver, reachedBy: 'import' };
  }

  if (
    variable.defs.every((def) =>
      isDestructuredVitestBinding(sourceCode, def, expectedName),
    )
  ) {
    return { identifier: receiver, reachedBy: 'destructured' };
  }

  return undefined;
};

const isThisParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  param: TSESTree.Parameter,
): boolean => param.type === AST_NODE_TYPES.Identifier && param.name === 'this';

/** A function written where an argument can be: not a declaration. */
const isCallbackFunction = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionExpression;

/**
 * Whether `node` is the in-source handle: the `vitest` property of `import`'s
 * `meta`. (Spelled out, not written as one token: see
 * {@link getVitestReceiver}.)
 */
const isInSourceHandle = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  !node.computed &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'vitest' &&
  node.object.type === AST_NODE_TYPES.MetaProperty &&
  node.object.meta.name === 'import' &&
  node.object.property.name === 'meta';

/**
 * Whether `def` takes the property `expectedName`, under that key, out of a
 * test's context (`expect` only) or out of the in-source handle.
 */
const isDestructuredVitestBinding = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
  expectedName: VitestExportName,
): boolean => {
  const property = def.name.parent;

  // `{ expect }` or `{ expect: e }`, not `{ expect = fallback }` or a deeper
  // pattern.
  if (
    property.type !== AST_NODE_TYPES.Property ||
    property.value !== def.name ||
    property.computed ||
    property.key.type !== AST_NODE_TYPES.Identifier ||
    property.key.name !== expectedName ||
    property.parent.type !== AST_NODE_TYPES.ObjectPattern
  ) {
    return false;
  }

  const pattern = property.parent;

  if (def.type === TSESLint.Scope.DefinitionType.Parameter) {
    return (
      expectedName === 'expect' &&
      isCallbackFunction(def.node) &&
      // A TypeScript `this` parameter comes before it.
      def.node.params.find((param) => !isThisParameter(param)) === pattern &&
      isVitestTestCallback(sourceCode, def.node)
    );
  }

  return (
    def.type === TSESLint.Scope.DefinitionType.Variable &&
    def.node.id === pattern &&
    def.node.init !== null &&
    isInSourceHandle(skipTypeWrappers(def.node.init))
  );
};

/**
 * The modifiers of a Vitest test whose callback still takes the context first.
 * `each` and `for` are not among them: their callback takes the case first.
 */
const testModifiers: ReadonlySet<string> = new Set<string>([
  'concurrent',
  'fails',
  'only',
  'sequential',
  'skip',
  'todo',
]);

/**
 * Whether `fn` is passed, after the test's name, to a call of Vitest's own
 * `test` or `it`, reached directly or through {@link testModifiers}. `fn` may
 * be passed inside type wrappers (`(({ expect }) => …) satisfies F`).
 */
const isVitestTestCallback = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fn: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
): boolean => {
  let mut_argument: TSESTree.Expression = fn;

  while (isTypeWrapper(mut_argument.parent)) {
    mut_argument = mut_argument.parent;
  }

  const call = mut_argument.parent;

  if (
    call.type !== AST_NODE_TYPES.CallExpression ||
    call.arguments.indexOf(mut_argument) < 1
  ) {
    return false;
  }

  let mut_callee = skipTypeWrappers(call.callee);

  while (mut_callee.type === AST_NODE_TYPES.MemberExpression) {
    if (
      mut_callee.computed ||
      mut_callee.property.type !== AST_NODE_TYPES.Identifier ||
      !testModifiers.has(mut_callee.property.name)
    ) {
      return false;
    }

    mut_callee = skipTypeWrappers(mut_callee.object);
  }

  return (
    resolveVitestBinding(sourceCode, mut_callee, 'test') !== undefined ||
    resolveVitestBinding(sourceCode, mut_callee, 'it') !== undefined
  );
};
