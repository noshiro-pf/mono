import {
  isAsExpression,
  isInterfaceDeclaration,
  isNonNullExpression,
  isParenthesizedExpression,
  type PropertyAccessExpression,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { type Checker } from 'typescript-native/unstable/sync';

/**
 * The name of the interface that declares the member being accessed, or
 * `undefined` when it does not resolve.
 *
 * This is how a rule tells `xs.sort()` from a `sort` of one's own: the method
 * name selects a candidate syntactically, and the declaring interface —
 * `Array`, `Map`, `ObjectConstructor` — decides. It is a checker query, so
 * narrow the candidates by syntax first: the pass walks every node of every
 * file and each query is a round trip (D-55). The fallback for a member
 * reached through a mapped type costs one more.
 */
export const ownerOf = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  access: PropertyAccessExpression,
): string | undefined => {
  const symbol = checker.getSymbolAtLocation(access.name);

  if (symbol === undefined) {
    return undefined;
  }

  const parent = symbol.getParent();

  if (parent !== undefined) {
    return parent.name;
  }

  // A member reached through a mapped type — `Readonly<Date>`,
  // `Readonly<Uint8Array>` — is a synthesized symbol with no parent, so the
  // mutator would go unrecognized exactly where the binding is annotated
  // readonly-looking. Its declaration still sits in the interface that
  // declared it (measured against the API).
  const container = symbol.declarations.at(0)?.resolve()?.parent;

  return container !== undefined && isInterfaceDeclaration(container)
    ? container.name.text
    : undefined;
};

/** Parentheses, `as` and `!` say nothing about what an expression denotes. */
export const unwrap = (node: TsNode): TsNode =>
  isParenthesizedExpression(node) ||
  isAsExpression(node) ||
  isNonNullExpression(node)
    ? unwrap(node.expression)
    : node;
