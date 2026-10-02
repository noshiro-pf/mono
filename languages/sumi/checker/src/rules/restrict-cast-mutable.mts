import {
  isArrayLiteralExpression,
  isBindingElement,
  isCallExpression,
  isExportSpecifier,
  isFunctionDeclaration,
  isIdentifier,
  isImportSpecifier,
  isJsxAttribute,
  isJsxExpression,
  isMethodDeclaration,
  isNewExpression,
  isParameterDeclaration,
  isPropertyAccessExpression,
  isPropertyAssignment,
  isPropertyDeclaration,
  isPropertySignatureDeclaration,
  isVariableDeclaration,
  type Identifier,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { SymbolFlags, type Checker } from 'typescript-native/unstable/sync';
import { outermostWrapper, unwrap } from '../ast/index.mjs';
import { type Rule } from '../engine/index.mjs';

/**
 * `readonly/restrict-cast-mutable` — `castMutable` is used only as the
 * boundary escape it is meant to be (Sumi spec/variables-and-mutation.md,
 * spec/readonly.md).
 *
 * Under readonly enforcement one's own values are readonly, and an outside API
 * that declares a mutable parameter (`string[]`) it never mutates will not
 * take them. ts-data-forge's `castMutable` (`T` → `Mutable<T>`) is the
 * explicit escape for exactly that: a value handed across the boundary to an
 * API that only asks for mutability in its type. Where the API may really
 * mutate, a copy is passed instead.
 *
 * Two uses are reported:
 *
 * - **`notAtBoundary`** — the result is not handed straight to a call. Kept in
 *   a binding, assigned, returned, or `castMutable` passed around as a value
 *   (`xs.map(castMutable)`), it is a mutable alias of a readonly value inside
 *   one's own code, which is what readonly enforcement exists to prevent. A
 *   value that is to be mutated is copied (`[...xs]`, `Array.from(xs)`).
 * - **`unnecessary`** — handed to a call whose parameter already accepts the
 *   value as it is (a readonly parameter, or a value that is mutable already).
 *   The cast asserts something nothing needed.
 *
 * "Handed straight to a call" is an argument of a call or `new`, a JSX
 * attribute, or a property or element of an object or array literal that is
 * itself in such a position — the value an outside API receives, however it
 * is shaped. `as`, `satisfies`, `<T>`, `!` and parentheses are seen through.
 *
 * `castDeepMutable` is held to the same rule. The escape is recognized by the
 * name its reference resolves to, through import aliases, so an
 * `import { castMutable as cm }` is still seen.
 */
export const restrictCastMutable: Rule = {
  ruleId: 'readonly/restrict-cast-mutable',
  description:
    'Restrict `castMutable` to the boundary escape: its result goes straight to an API whose parameter is typed mutable, and nowhere else.',
  messages: {
    notAtBoundary:
      '`{{name}}` is the escape for handing a readonly value to an API that only declares its parameter mutable. Here the mutable view stays in this code — pass the result straight to that call, or, if the value is to be mutated, make a copy (`[...xs]`, `Array.from(xs)`).',
    unnecessary:
      'This position already accepts the value without `{{name}}`: the parameter is readonly, or the value is mutable already. Remove the cast.',
  },
  visit: (node, { checker, report }) => {
    if (!isIdentifier(node) || !escapeNames.has(node.text)) {
      return;
    }

    const reference = referenceOf(node);

    if (reference === undefined) {
      return;
    }

    const name = resolvedName(checker, node);

    if (name === undefined || !escapeNames.has(name)) {
      return;
    }

    const callee = outermostWrapper(reference);

    const call = callee.parent;

    if (!isCallExpression(call) || unwrap(call.expression) !== reference) {
      report(reference, 'notAtBoundary', { name });

      return;
    }

    if (!isAtBoundary(outermostWrapper(call))) {
      report(call, 'notAtBoundary', { name });

      return;
    }

    const [argument] = call.arguments;

    if (argument === undefined) {
      return;
    }

    const expected = checker.getContextualType(call);

    const actual = checker.getTypeAtLocation(unwrap(argument));

    if (
      expected !== undefined &&
      actual !== undefined &&
      checker.isTypeAssignableTo(actual, expected)
    ) {
      report(call, 'unnecessary', { name });
    }
  },
} as const;

const escapeNames: ReadonlySet<string> = new Set([
  'castMutable',
  'castDeepMutable',
]);

/**
 * The expression that refers to the escape: the identifier, or the property
 * access it names (`tdf.castMutable`). `undefined` where the identifier is not
 * a reference at all — an import or export specifier, a declaration's name.
 */
const referenceOf = (node: Identifier): TsNode | undefined => {
  const { parent } = node;

  if (isPropertyAccessExpression(parent)) {
    return parent.name === node ? parent : node;
  }

  return isImportSpecifier(parent) ||
    isExportSpecifier(parent) ||
    isDeclarationName(parent, node)
    ? undefined
    : node;
};

/**
 * A declaration's own name (`const castMutable = …`, a parameter, a property
 * key) is not a use of the escape.
 */
const isDeclarationName = (parent: TsNode, node: Identifier): boolean =>
  (isVariableDeclaration(parent) ||
    isParameterDeclaration(parent) ||
    isBindingElement(parent) ||
    isFunctionDeclaration(parent) ||
    isPropertyAssignment(parent) ||
    isPropertyDeclaration(parent) ||
    isPropertySignatureDeclaration(parent) ||
    isMethodDeclaration(parent)) &&
  parent.name === node;

/** The name the identifier's symbol resolves to, through import aliases. */
const resolvedName = (
  // `Checker` is TypeScript's own interface, declared mutable; this package
  // does not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: Checker,
  node: Identifier,
): string | undefined => {
  const symbol = checker.getSymbolAtLocation(node);

  return symbol === undefined
    ? undefined
    : (symbol.flags & SymbolFlags.Alias) === 0
      ? symbol.name
      : checker.getAliasedSymbol(symbol).name;
};

/**
 * Whether the value of `node` (already widened to its outermost wrapper) is
 * received by a call: an argument of a call or `new`, a JSX attribute's value,
 * or a property or element of a literal in such a position.
 */
const isAtBoundary = (node: TsNode): boolean => {
  const { parent } = node;

  if (isCallExpression(parent) || isNewExpression(parent)) {
    const args: readonly TsNode[] = parent.arguments ?? [];

    return args.includes(node);
  }

  if (isJsxExpression(parent)) {
    return isJsxAttribute(parent.parent);
  }

  // A property's value: the object literal is what the call receives.
  if (isPropertyAssignment(parent)) {
    return (
      parent.initializer === node &&
      isAtBoundary(outermostWrapper(parent.parent))
    );
  }

  return (
    isArrayLiteralExpression(parent) && isAtBoundary(outermostWrapper(parent))
  );
};
