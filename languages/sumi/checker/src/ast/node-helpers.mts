import {
  isAsExpression,
  isInterfaceDeclaration,
  isNonNullExpression,
  isParenthesizedExpression,
  isSatisfiesExpression,
  isTypeAssertion,
  type AsExpression,
  type NonNullExpression,
  type ParenthesizedExpression,
  type PropertyAccessExpression,
  type SatisfiesExpression,
  type Node as TsNode,
  type TypeAssertion,
} from 'typescript-native/unstable/ast';
import type {
  Checker,
  Symbol as TsSymbol,
} from 'typescript-native/unstable/sync';

/**
 * The name of the interface that declares the member being accessed — or
 * `undefined` where it does not resolve — at each of the receiver's
 * {@link wrapperLayers}, outermost first. One entry for a receiver that is
 * not wrapped.
 *
 * This is how a rule tells `xs.sort()` from a `sort` of one's own: the method
 * name selects a candidate syntactically, and the declaring interface —
 * `Array`, `Map`, `ObjectConstructor` — decides. It is a checker query, so
 * narrow the candidates by syntax first: the pass walks every node of every
 * file and each query is a round trip (D-55). Each layer past the first costs
 * a type query or two, and the fallback for a member reached through a mapped
 * type one more.
 *
 * A wrapped receiver can name a different owner at each layer:
 * `(xs as { push: … }).push(1)` resolves to a member of one's own outside
 * and to `Array`'s inside. The caller decides how the layers combine — a rule
 * that reports a danger (a mutation) reports if any layer shows it, and an
 * exemption that spares a report holds only if every layer does.
 */
export const ownersOf = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  access: PropertyAccessExpression,
): readonly (string | undefined)[] =>
  wrapperLayers(access.expression).map((layer, index) => {
    // The outermost layer is the receiver as written, whose member the
    // checker has already resolved.
    const symbol =
      index === 0
        ? checker.getSymbolAtLocation(access.name)
        : propertyAt(checker, layer, access.name.text);

    return symbol === undefined ? undefined : interfaceNameOf(symbol);
  });

/**
 * Parentheses, `as`, `satisfies`, `!` and `<T>` say nothing about what an
 * expression denotes. Judge the syntax of what is underneath ({@link unwrap}),
 * and ask the type of every layer ({@link wrapperLayers});
 * docs/writing-lint-rules.md at the repository root.
 */
export const isTransparent = (node: TsNode): node is TransparentWrapper =>
  isParenthesizedExpression(node) ||
  isAsExpression(node) ||
  isSatisfiesExpression(node) ||
  isTypeAssertion(node) ||
  isNonNullExpression(node);

/** The expression under any {@link isTransparent} wrappers. */
export const unwrap = (node: TsNode): TsNode =>
  isTransparent(node) ? unwrap(node.expression) : node;

/**
 * `node` and every expression inside the {@link isTransparent} wrappers around
 * it, outermost first: `(x as A)!` gives `(x as A)!`, `(x as A)`, `x as A` and
 * `x`, the last of which is `unwrap(node)`.
 *
 * A wrapper changes no value, so syntax is judged on `unwrap(node)`: a type
 * that only says `0` (`n as 0`) is not the literal `0`. A type is asked at
 * every layer, the `unknown` of `x as unknown as T` included, and an
 * assertion only ever moves a rule to the cautious side: a conclusion that
 * spares a report or enables a fix holds only if it holds at every layer, and
 * a rule that reports a danger reports it if any layer shows it. A widening
 * `as` (`x as string | undefined`) is thus respected as the author's claim,
 * and a narrowing one (`x!`, a cast from `unknown`) cannot hide what the
 * value's own type says (docs/writing-lint-rules.md at the repository root;
 * `typeWrapperLayers` in `libs/eslint-rule-forge` is the ESTree
 * counterpart).
 */
export const wrapperLayers = (node: TsNode): readonly TsNode[] =>
  isTransparent(node)
    ? ([node, ...wrapperLayers(node.expression)] as const)
    : ([node] as const);

/** The outermost {@link isTransparent} wrapper around `node`, or `node`. */
export const outermostWrapper = (node: TsNode): TsNode =>
  isTransparent(node.parent) ? outermostWrapper(node.parent) : node;

/** The expressions {@link isTransparent} sees through. */
export type TransparentWrapper =
  | AsExpression
  | NonNullExpression
  | ParenthesizedExpression
  | SatisfiesExpression
  | TypeAssertion;

/** The name of the interface that declares `symbol`, if it resolves. */
const interfaceNameOf = (
  // `Symbol` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: TsSymbol,
): string | undefined => {
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
 * The property `name` on the apparent type of `node`, which is how a member
 * is resolved on a layer of the receiver the checker did not resolve it on.
 */
const propertyAt = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,

  node: TsNode,
  name: string,
): TsSymbol | undefined => {
  const type = checker.getTypeAtLocation(node);

  return type === undefined
    ? undefined
    : checker.getPropertyOfType(checker.getApparentType(type) ?? type, name);
};
