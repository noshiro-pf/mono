import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';
import { castDeepMutable } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

type ScopeSource = Readonly<{
  getScope: TSESLint.SourceCode['getScope'];
}>;

/**
 * The name of the global `node` refers to, or `undefined` when it refers to
 * none: a bare identifier (`Number`), or a property of the global object read
 * through `globalThis`, `window`, `self` or `global` (`globalThis.Number`,
 * `globalThis['Number']`). Type wrappers are looked through on the node, the
 * object and the key. A name that a user declaration shadows — the identifier
 * itself, or the global object's — is not the global.
 */
export const globalReferenceName = (
  sourceCode: ScopeSource,
  node: DeepReadonly<TSESTree.Node>,
): string | undefined => {
  const target = skipTypeWrappers(node);

  if (target.type === AST_NODE_TYPES.Identifier) {
    return isDeclaredByUser(sourceCode, node, target.name)
      ? undefined
      : target.name;
  }

  if (target.type !== AST_NODE_TYPES.MemberExpression) {
    return undefined;
  }

  const object = skipTypeWrappers(target.object);

  if (
    object.type !== AST_NODE_TYPES.Identifier ||
    !globalObjectNames.has(object.name) ||
    isDeclaredByUser(sourceCode, node, object.name)
  ) {
    return undefined;
  }

  return staticPropertyName(target);
};

/** The names the global object is reachable by, depending on the host. */
const globalObjectNames: ReadonlySet<string> = new Set<string>([
  'globalThis',
  'window',
  'self',
  'global',
]);

/** `true` when a scope enclosing `node` declares `name` in the source. */
const isDeclaredByUser = (
  sourceCode: ScopeSource,
  node: DeepReadonly<TSESTree.Node>,
  name: string,
): boolean => {
  for (
    let mut_scope: TSESLint.Scope.Scope | null = sourceCode.getScope(
      castDeepMutable(node),
    );
    mut_scope !== null;
    mut_scope = mut_scope.upper
  ) {
    const variable = mut_scope.set.get(name);

    if (variable !== undefined && variable.defs.length > 0) {
      return true;
    }
  }

  return false;
};

/** `x.name` and `x['name']` → `name`; any other key → `undefined`. */
const staticPropertyName = (
  member: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined => {
  if (!member.computed) {
    return member.property.type === AST_NODE_TYPES.Identifier
      ? member.property.name
      : undefined;
  }

  const key = skipTypeWrappers(member.property);

  return key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string'
    ? key.value
    : undefined;
};
