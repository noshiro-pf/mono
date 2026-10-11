import {
  isAsExpression,
  isInterfaceDeclaration,
  isNonNullExpression,
  isParenthesizedExpression,
  isSatisfiesExpression,
  isTypeAssertion,
  type PropertyAccessExpression,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import type {
  Checker,
  Symbol as TsSymbol,
} from 'typescript-native/unstable/sync';

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
 *
 * A receiver behind a type wrapper (`(xs as T).push`, `(<T>xs).sort`) is
 * resolved on the type of the value underneath, because the cast's type can
 * say anything: `{ push: … }` would hide `Array`'s `push` behind a member of
 * one's own (docs/writing-lint-rules.md at the repository root).
 */
export const ownerOf = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  access: PropertyAccessExpression,
): string | undefined => {
  const symbol = memberSymbolOf(checker, access);

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

/**
 * Parentheses, `as`, `satisfies`, `!` and `<T>` say nothing about what an
 * expression denotes. Judge the syntax, and ask the type, of what is
 * underneath (docs/writing-lint-rules.md at the repository root).
 */
export const unwrap = (node: TsNode): TsNode =>
  isParenthesizedExpression(node) ||
  isAsExpression(node) ||
  isSatisfiesExpression(node) ||
  isNonNullExpression(node) ||
  isTypeAssertion(node)
    ? unwrap(node.expression)
    : node;

/**
 * The member `access` names: the symbol the checker resolved, or — when the
 * receiver is wrapped — the property of that name on the unwrapped
 * receiver's type.
 */
const memberSymbolOf = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  access: PropertyAccessExpression,
): TsSymbol | undefined => {
  const receiver = unwrap(access.expression);

  if (receiver === access.expression) {
    return checker.getSymbolAtLocation(access.name);
  }

  const receiverType = checker.getTypeAtLocation(receiver);

  if (receiverType === undefined) {
    return undefined;
  }

  return checker.getPropertyOfType(
    checker.getApparentType(receiverType) ?? receiverType,
    access.name.text,
  );
};
