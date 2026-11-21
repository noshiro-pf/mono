/** `as`, `satisfies`, `!` and `<T>`. */
const typeWrapper =
  ':matches(TSAsExpression, TSSatisfiesExpression, TSNonNullExpression, TSTypeAssertion)';

/** The literal `getSnapshot`: a string, or a template with no `${…}`. */
const getSnapshotLiteral =
  ":matches(Literal[value='getSnapshot'], TemplateLiteral[expressions.length=0][quasis.0.value.cooked='getSnapshot'])";

/**
 * {@link getSnapshotLiteral} under `depth` of {@link typeWrapper}, the outermost
 * in `field` of its parent and each one below in `expression` of the one above.
 */
const literalUnder = (
  depth: number,
  field: 'expression' | 'property',
): string =>
  depth === 0
    ? `${getSnapshotLiteral}.${field}`
    : `${typeWrapper}.${field} > ${literalUnder(depth - 1, 'expression')}`;

/**
 * A computed key that is {@link getSnapshotLiteral}, bare or under up to three
 * of {@link typeWrapper}: a selector cannot strip a chain of any length, and a
 * longer one is written to hide the read (the test records the limit).
 */
const getSnapshotKeys = Array.from(
  { length: 4 },
  (_, depth) =>
    `MemberExpression[computed=true] > ${literalUnder(depth, 'property')}`,
);

/**
 * The ban on reading `getSnapshot` in src/, an entry of `no-restricted-syntax`
 * in eslint.config.mts, kept here so that test/eslint-config.test.mts picks out
 * its reports by its message.
 *
 * `getSnapshot` builds an `Optional` for the application; the package reads
 * `current`, or `value` on an `InitializedObservable`, so that an update
 * allocates none. A member access by that name is matched, and a computed key
 * that is that literal (see `getSnapshotKeys`). A key read from a variable,
 * `Reflect.get` and destructuring are not: the first two would be written to
 * hide it, and `createBooleanState` takes the helper of `createState` by
 * destructuring. The test pins both sides.
 */
export const getSnapshotBan = {
  selector: `MemberExpression[computed=false] > Identifier.property[name='getSnapshot'], ${getSnapshotKeys.join(', ')}`,
  message:
    'src/ does not read `getSnapshot`: an observable\'s `getSnapshot` builds an Optional. Read `current`, or `value` on an `InitializedObservable`; see DESIGN.md "Values".',
} as const;
