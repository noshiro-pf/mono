/**
 * The keys of the type-only properties of ts-std-forge's `Optional`.
 *
 * `Some<S>` and `None` are declared as objects keyed by these two symbols,
 * though at runtime a `Some` is the value it holds and `None` a reserved
 * string: the properties exist in the type alone. Each key is a `unique
 * symbol` that is declared and never defined, so no code can name it by
 * accident: an object literal or a property access cannot forge an Optional
 * or read one's value past `Optional.unwrap`. They are exported as types only,
 * so no code holds them as values either.
 *
 * They live in a package of their own so that every copy of ts-std-forge names
 * the same declarations. TypeScript treats two copies of one package at one
 * version as one, so the `Optional` of ts-std-forge 0.6.0 and that of 0.6.1 are
 * the same type as long as both depend on the same version of this package.
 * That version is the version of the runtime encoding of an Optional: it
 * changes when, and only when, two versions of ts-std-forge would read each
 * other's Optionals wrongly, so that their types stop being assignable to each
 * other exactly then. ts-std-forge's encoding test holds the two together.
 *
 * @packageDocumentation
 */

/** The key of the type-only discriminant of `Some` / `None`. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by the `export type` below, which the rule does not count
declare const optionalVariant: unique symbol;

/** The key of the type-only value of `Some`. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by the `export type` below, which the rule does not count
declare const optionalValue: unique symbol;

// Exported as types only: a value import would type-check and then find nothing
// at runtime, since nothing defines them. A type-only import can still key a
// type literal (`[optionalVariant]: 'some'`).
export type { optionalValue, optionalVariant };
