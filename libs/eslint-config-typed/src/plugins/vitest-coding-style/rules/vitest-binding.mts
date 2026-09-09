import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
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
 */
export const getVitestReceiver = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  expectedName: 'assert' | 'expect',
): TSESTree.Identifier | undefined => {
  if (node.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const variable = ASTUtils.findVariable(sourceCode.getScope(node), node);

  const isVitestBinding =
    variable === null || Arr.isEmpty(variable.defs)
      ? node.name === expectedName
      : variable.defs.every((def) => isVitestImportOf(def, expectedName));

  return isVitestBinding ? node : undefined;
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
