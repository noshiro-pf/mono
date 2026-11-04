import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  bindValueImportsAt,
  isLocallyBound,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';

/**
 * The identifier a `<receiver>.<method>(...)` call is made on, when that
 * receiver is the Vitest binding originally exported as `expectedName` —
 * otherwise `undefined`.
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
 * - Anything else — another module's export, a local, a parameter. Not ours.
 *
 * The identifier is returned rather than a boolean so that a fixer can reuse
 * its text: rewriting `a.ok(x)` to `assert.isTrue(x)` would name a binding the
 * file may not have.
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
): TSESTree.Identifier | undefined => {
  const receiver = skipTypeWrappers(node);

  if (receiver.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const variable = ASTUtils.findVariable(
    sourceCode.getScope(receiver),
    receiver,
  );

  const isVitestBinding =
    variable === null || Arr.isEmpty(variable.defs)
      ? receiver.name === expectedName
      : variable.defs.every((def) => isVitestImportOf(def, expectedName));

  return isVitestBinding ? receiver : undefined;
};

/**
 * For one file, a function that gives the fix for a rule rewriting the Vitest
 * `expect(…)` call `node` into a call on Vitest's `assert` — `replacement`
 * builds the new text from the name `assert` is reached by — or `null` when no
 * name can be written safely, in which case the rule reports without a fix. A
 * bare `assert.` would name `node:assert`'s, which has no `isTrue` and whose
 * `deepStrictEqual` compares prototypes, or a binding the file does not have.
 *
 * `expectReceiver` is the `expect` identifier `getVitestReceiver` returned for
 * `node`.
 *
 * - `expect` unbound in the file, and no value named `assert` declared where
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
  expectReceiver: TSESTree.Identifier,
  replacement: (assertName: string) => string,
) => TSESLint.ReportFixFunction | null) => {
  let mut_bindingAt: ReturnType<typeof bindValueImportsAt> | undefined =
    undefined;

  return (node, expectReceiver, replacement) => {
    if (
      !isLocallyBound(sourceCode, expectReceiver, expectReceiver.name) &&
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

const isVitestImportOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
  expectedName: 'assert' | 'expect',
): boolean =>
  def.type === TSESLint.Scope.DefinitionType.ImportBinding &&
  def.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  def.parent.source.value === 'vitest' &&
  def.node.type === AST_NODE_TYPES.ImportSpecifier &&
  def.node.imported.type === AST_NODE_TYPES.Identifier &&
  def.node.imported.name === expectedName;
