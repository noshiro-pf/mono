import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getRangeWithParens,
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
import { hasCommentWithin } from './comments.mjs';
import { SYNSTATE_MODULE } from './constants.mjs';

/**
 * Whether the identifier that decides what `callee` calls — the callee, or
 * the namespace object — is bound by something other than the synstate
 * import where it is read.
 */
export const isShadowedCallee = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(callee);

  const bound =
    unwrapped.type === AST_NODE_TYPES.MemberExpression
      ? skipTypeWrappers(unwrapped.object)
      : unwrapped;

  return (
    bound.type !== AST_NODE_TYPES.Identifier ||
    hasForeignBinding(sourceCode, bound, bound.name, SYNSTATE_MODULE)
  );
};

/**
 * Builds the fix that rewrites the callee of a call to call synstate's export
 * `exportName` instead — the property, for a namespace import — given the
 * file's synstate imports. For a call and what its callee resolves to, it
 * returns the edits, or `undefined` when they cannot be made: the callee is in
 * a type wrapper written for the type of the export it calls, a comment inside
 * the parentheses around a named callee would go with it, the name would be
 * something that is not synstate's at the call, or no value import can take
 * the name (see {@link importedBindingOf}).
 *
 * Each fix brings the export into scope itself rather than leaving that to
 * another report's: an editor applies one fix at a time, and a fix that loses
 * a conflict with another rule's in the same pass is dropped. Fixes that all
 * add the name overlap, so `--fix` applies one per pass, and the rest in the
 * next, by when the file imports it.
 */
export const buildCalleeRewriter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  imports: readonly TSESTree.ImportDeclaration[],
  exportName: string,
): ((
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  resolved: ResolvedCallee,
) => CalleeRewrite | undefined) => {
  const binding = importedBindingOf(sourceCode, imports, exportName);

  return (node, resolved) => {
    if (isTypeWrapper(node.callee)) {
      return undefined;
    }

    if (resolved.isNamespace) {
      return (fixer) => [fixer.replaceText(resolved.propertyNode, exportName)];
    }

    const calleeRange = getRangeWithParens(sourceCode, node.callee);

    if (
      binding === undefined ||
      hasCommentWithin(sourceCode, node, [calleeRange]) ||
      hasForeignBinding(sourceCode, node, binding.localName, SYNSTATE_MODULE)
    ) {
      return undefined;
    }

    return (fixer) => [
      ...binding.edits(fixer),
      fixer.replaceTextRange(calleeRange, binding.localName),
    ];
  };
};

/** The edits {@link buildCalleeRewriter} makes for one call. */
export type CalleeRewrite = (
  fixer: TSESLint.RuleFixer,
) => readonly TSESLint.RuleFix[];

/**
 * Whether neither `specifier` nor its declaration says `type`. ESLint's default
 * parser, which reads `.js` files, leaves `importKind` out altogether.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isValueImport = ({
  declaration,
  specifier,
}: Readonly<{
  declaration: TSESTree.ImportDeclaration;
  specifier: TSESTree.ImportSpecifier;
}>): boolean =>
  declaration.importKind !== 'type' && specifier.importKind !== 'type';

/** The exported name `specifier` imports: `x` for `import { x as y }`. */
const importedNameOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  specifier: TSESTree.ImportSpecifier,
): string =>
  specifier.imported.type === AST_NODE_TYPES.Identifier
    ? specifier.imported.name
    : specifier.imported.value;

/**
 * The name synstate's export `exportName` is bound to as a value once `edits`
 * are made, or `undefined` when no edit can bind it.
 *
 * - Imported as a value: that local name, and no edit.
 * - Imported by `import { type x }`: the edit drops `type`, keeping a comment
 *   after it.
 * - Not imported as a value: the edit adds it to the first synstate import
 *   with a named value specifier, which a file calling a named import has.
 *   Adding it there rather than in a new declaration keeps
 *   `import-x/no-duplicates` satisfied and a leading directive first. Not
 *   when a synstate import already binds the name to something else
 *   (`import type { x }`, `import { y as x }`), where it would be a duplicate.
 */
const importedBindingOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  imports: readonly TSESTree.ImportDeclaration[],
  exportName: string,
):
  | Readonly<{
      localName: string;
      edits: CalleeRewrite;
    }>
  | undefined => {
  const named = imports.flatMap((declaration) =>
    declaration.specifiers.flatMap((specifier) =>
      specifier.type === AST_NODE_TYPES.ImportSpecifier
        ? [{ declaration, specifier }]
        : [],
    ),
  );

  const matching = named.filter(
    ({ specifier }) => importedNameOf(specifier) === exportName,
  );

  const value = matching.find(isValueImport);

  if (value !== undefined) {
    return { localName: value.specifier.local.name, edits: () => [] };
  }

  const typeOnly = matching.find(
    ({ declaration }) => declaration.importKind !== 'type',
  )?.specifier;

  if (typeOnly !== undefined) {
    const typeKeyword = sourceCode.getFirstToken(typeOnly);

    // Up to whatever follows `type`, a comment included, so that the comment
    // stays.
    const next =
      typeKeyword === null
        ? null
        : sourceCode.getTokenAfter(typeKeyword, { includeComments: true });

    return typeKeyword === null || next === null
      ? undefined
      : {
          localName: typeOnly.local.name,
          edits: (fixer) => [
            fixer.removeRange([typeKeyword.range[0], next.range[0]]),
          ],
        };
  }

  const isTaken = imports.some((declaration) =>
    declaration.specifiers.some(
      (specifier) => specifier.local.name === exportName,
    ),
  );

  if (isTaken) {
    return undefined;
  }

  const last = named.find(isValueImport)?.declaration.specifiers.at(-1);

  return last === undefined
    ? undefined
    : {
        localName: exportName,
        edits: (fixer) => [fixer.insertTextAfter(last, `, ${exportName}`)],
      };
};
