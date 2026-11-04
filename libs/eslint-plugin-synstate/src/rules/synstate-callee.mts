import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  bindValueImports,
  getRangeWithParens,
  hasCommentWithin,
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';

/**
 * Whether the identifier that decides what `callee` calls — the callee, or the
 * namespace object — is bound by something other than an import from one of
 * `moduleNames` (synstate alone by default) where it is read.
 */
export const isShadowedCallee = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
  moduleNames: readonly string[] = SYNSTATE_ONLY,
): boolean => {
  const unwrapped = skipTypeWrappers(callee);

  const bound =
    unwrapped.type === AST_NODE_TYPES.MemberExpression
      ? skipTypeWrappers(unwrapped.object)
      : unwrapped;

  if (bound.type !== AST_NODE_TYPES.Identifier) {
    return true;
  }

  const variable = ASTUtils.findVariable(
    sourceCode.getScope(bound),
    bound.name,
  );

  return (
    variable?.defs.some((def) => !isImportFromAny(def, moduleNames)) ?? false
  );
};

/**
 * Builds the fix that rewrites the callee of a call to call synstate's export
 * `exportName` instead — the property, for a namespace import. For a call and
 * what its callee resolves to, it returns the edits, or `undefined` when they
 * cannot be made: the callee is in a type wrapper written for the type of the
 * export it calls, a comment inside the parentheses around a named callee would
 * go with it, the name would be something that is not synstate's at the call,
 * or an import already binds the name to something else (see
 * {@link bindValueImports}).
 *
 * Each fix brings the export into scope itself rather than leaving that to
 * another report's: an editor applies one fix at a time, and a fix that loses a
 * conflict with another rule's in the same pass is dropped. Fixes that all add
 * the name overlap, so `--fix` applies one per pass, and the rest in the next,
 * by when the file imports it.
 */
export const buildCalleeRewriter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  exportName: string,
): ((
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  resolved: ResolvedCallee,
) => CalleeRewrite | undefined) => {
  const binding = bindValueImports(sourceCode, SYNSTATE_MODULE, [exportName]);

  const [localName] = binding?.localNames ?? [];

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
      localName === undefined ||
      hasCommentWithin(sourceCode, node, [calleeRange]) ||
      hasForeignBinding(sourceCode, node, localName, SYNSTATE_MODULE)
    ) {
      return undefined;
    }

    return (fixer) => [
      ...binding.edits(fixer),
      fixer.replaceTextRange(calleeRange, localName),
    ];
  };
};

/** The edits {@link buildCalleeRewriter} makes for one call. */
export type CalleeRewrite = (
  fixer: TSESLint.RuleFixer,
) => readonly TSESLint.RuleFix[];

const SYNSTATE_ONLY = [SYNSTATE_MODULE] as const;

/**
 * Whether `def` is a binding an `import … from '<moduleName>'` declaration
 * introduces, for one of `moduleNames`.
 */
const isImportFromAny = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
  moduleNames: readonly string[],
): boolean =>
  (def.node.type === AST_NODE_TYPES.ImportSpecifier ||
    def.node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    def.node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
  def.node.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  moduleNames.includes(def.node.parent.source.value);
