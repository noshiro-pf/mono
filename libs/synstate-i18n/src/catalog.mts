import { hasKey } from 'ts-data-forge';
import * as Arr from 'ts-data-forge/array';
import {
  hasOwnThen,
  isGroup,
  isPromise,
  isThenable,
  loaderHint,
} from './internal/index.mjs';
import {
  placeholdersIn,
  type PlaceholdersOf,
  type WithPlaceholders,
} from './placeholders.mjs';

/**
 * A message that needs more than placeholders (plurals, a choice between
 * wordings): a function from its parameters to the text. The base catalog
 * annotates the parameters; a translation has the same function type.
 *
 * The parameters are one object: `t` and `peek` pass only the first argument,
 * so a parameter after it is always `undefined`. A message that may be called
 * without it marks it optional, `(params?: P) => string`; `P | undefined`
 * without the `?` is not read as optional.
 */
export type MessageFn = (params: never) => string;

/**
 * A catalog of messages: strings with `{name}` placeholders, functions, and
 * nested catalogs. The base catalog, written in the base locale, defines the
 * keys, the nesting and the parameters of every message, and is declared
 * `as const` so that its strings keep their placeholders in their types.
 */
export type Catalog = Readonly<{
  [key: string]: Catalog | MessageFn | string;
}>;

/**
 * What a translation of the base catalog `Base` must be: the same keys and
 * nesting, each string with the same placeholders (in any order), each
 * function with the same parameters. Write a translation with
 * `satisfies TranslationOf<typeof base>`, which checks it and types the
 * parameters of its functions.
 *
 * A placeholder the base string does not have is not a type error, since a type
 * can only require the base ones; {@link checkTranslation} reports it.
 */
export type TranslationOf<Base> = Readonly<{
  [K in keyof Base]: Base[K] extends string
    ? WithPlaceholders<PlaceholdersOf<Base[K]>>
    : Base[K] extends (...args: infer A extends readonly unknown[]) => string
      ? // The base's first parameter, optional where the base marks it so;
        // the later ones are never passed.
        (...args: FirstParam<A>) => string
      : TranslationOf<Base[K]>;
}>;

/**
 * What is wrong with `translation` as a translation of `base`, one line per
 * problem, keyed by the message's path: a missing or extra key, a value of the
 * wrong kind, and a placeholder missing from a string or not in the base one.
 * An empty list means none.
 *
 * The type of a translation catches all of these but the extra placeholder, so
 * call this in a test of each translation; it also checks one the type checker
 * never saw, such as a catalog read from JSON.
 */
export const checkTranslation = (
  base: Catalog,
  translation: unknown,
): readonly string[] => checkCatalog(base, translation, []);

// The base's first parameter, required or optional as it is there; a rest
// parameter alone is required, as `t` and `peek` take it. Matches
// `TakesOptionalParams` in create-i18n.mts, which reads the list whole: so
// here, where `A` is a parameter and would otherwise be distributed over a rest
// parameter typed as a union of tuples.
type FirstParam<A extends readonly unknown[]> = [A] extends [readonly []]
  ? readonly []
  : [A] extends [readonly [infer P, ...unknown[]]]
    ? readonly [params: P]
    : [Required<A>] extends [readonly [infer P, ...unknown[]]]
      ? readonly [params?: P]
      : readonly [params: A[number]];

const kindOf = (value: unknown): string =>
  value === null
    ? 'null'
    : Arr.isArray(value)
      ? 'array'
      : isPromise(value)
        ? 'promise'
        : // Not a hand-written object with a `then` of its own.
          isThenable(value) && !hasOwnThen(value)
          ? 'thenable'
          : typeof value;

const label = (path: readonly string[]): string =>
  Arr.isEmpty(path) ? '(root)' : path.join('.');

const checkString = (
  base: string,
  value: unknown,
  path: readonly string[],
): readonly string[] => {
  if (typeof value !== 'string') {
    return [`${label(path)}: expected a string, got ${kindOf(value)}`];
  }

  const expected = placeholdersIn(base);

  const actual = placeholdersIn(value);

  return [
    ...expected
      .filter((name) => !actual.includes(name))
      .map((name) => `${label(path)}: placeholder {${name}} is missing`),
    ...actual
      .filter((name) => !expected.includes(name))
      .map(
        (name) =>
          `${label(path)}: placeholder {${name}} is not in the base message`,
      ),
  ];
};

const checkEntry = (
  baseValue: Catalog | MessageFn | string,
  value: unknown,
  path: readonly string[],
): readonly string[] =>
  typeof baseValue === 'string'
    ? checkString(baseValue, value, path)
    : typeof baseValue === 'function'
      ? typeof value === 'function'
        ? ([] as const)
        : ([
            `${label(path)}: expected a function, got ${kindOf(value)}`,
          ] as const)
      : checkCatalog(baseValue, value, path);

const checkCatalog = (
  base: Catalog,
  translation: unknown,
  path: readonly string[],
): readonly string[] => {
  // Only the root is ever loaded, so only there is a thenable not a catalog, as
  // the store reads it; a root with a `then` of its own, which the store
  // refuses, is read on so that the key is reported as one the base lacks.
  const root = Arr.isEmpty(path);

  // A `then` of its own is an extra key, reported below as one.
  if (
    !isGroup(translation) ||
    (root && isThenable(translation) && !hasOwnThen(translation))
  ) {
    return [
      `${label(path)}: expected a nested catalog, got ${kindOf(translation)}${
        root ? loaderHint(translation) : ''
      }`,
    ];
  }

  return [
    ...Object.entries(base).flatMap(([key, baseValue]) => {
      const at = Arr.toPushed(path, key);

      return hasKey(translation, key)
        ? checkEntry(baseValue, translation[key], at)
        : [`${label(at)}: missing`];
    }),
    ...Object.keys(translation)
      .filter((key) => !hasKey(base, key))
      .map(
        (key) => `${label(Arr.toPushed(path, key))}: not in the base catalog`,
      ),
  ];
};
