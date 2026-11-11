import {
  asSafeInt,
  isNonNullObject,
  Optional,
  type SafeInt,
} from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';
import { decodeCanonicalInt, valuesEqual } from './internal/index.mjs';
import type { ParamCodec } from './param-codec.mjs';
import type {
  StandardSchemaV1,
  StandardSchemaV1Output,
  StandardSchemaV1Result,
} from './standard-schema.mjs';

/**
 * Why a present search value was read as absent: it failed its codec
 * (`'invalid'`), or its schema validated asynchronously (`'async'`), which a
 * synchronous match cannot wait for.
 */
export type SearchIssue = 'async' | 'invalid';

export type SearchParseResult<T> = Readonly<{
  value: T;
  /** `undefined` when the value was read, or was absent or empty. */
  issue: SearchIssue | undefined;
}>;

/**
 * Reads the values of one search key into a field and writes it back.
 *
 * A value that fails to decode is read as absent, never as an error: the field
 * takes its default, or `undefined`.
 */
export type SearchCodec<T> = Readonly<{
  /**
   * Reads raw values by the same rules as the route, for a value that comes
   * from somewhere else, such as a `<select>`.
   */
  decode: (raw: string | readonly string[]) => T;
  /** The values to write under the key; an empty array leaves it out. */
  encode: (value: T) => readonly string[];
  /** Like `decode`, and says why a present value was read as absent. */
  parse: (raw: readonly string[]) => SearchParseResult<T>;
}>;

/**
 * A search codec for one value with no default: the input of `search.array` and
 * `search.refine`.
 */
export type SearchElementCodec<V> = SearchCodec<V | undefined> &
  Readonly<{
    decodeElement: (raw: string) => ElementOutcome<V>;
    encodeElement: (value: V) => string;
    /** Whether `?key=` is the value `''` rather than an absent value. */
    emptyIsValue: boolean;
  }>;

export type ElementOutcome<V> = Readonly<
  { ok: true; value: V } | { ok: false; issue: SearchIssue }
>;

type DefaultOption<V> = Readonly<{ default: V }>;

const elementCodec = <V,>({
  decodeElement,
  encodeElement,
  emptyIsValue,
}: Readonly<{
  decodeElement: (raw: string) => ElementOutcome<V>;
  encodeElement: (value: V) => string;
  emptyIsValue: boolean;
}>): SearchElementCodec<V> => {
  const parse = (raw: readonly string[]): SearchParseResult<V | undefined> => {
    const first = raw[0];

    if (first === undefined || (first === '' && !emptyIsValue)) {
      return { value: undefined, issue: undefined };
    }

    const outcome = decodeElement(first);

    return outcome.ok
      ? { value: outcome.value, issue: undefined }
      : { value: undefined, issue: outcome.issue };
  };

  return {
    decode: (raw) => parse(toValues(raw)).value,
    encode: (value) => (value === undefined ? [] : [encodeElement(value)]),
    parse,
    decodeElement,
    encodeElement,
    emptyIsValue,
  };
};

const toValues = (raw: string | readonly string[]): readonly string[] =>
  typeof raw === 'string' ? ([raw] as const) : raw;

const withDefault = <V,>(
  codec: SearchElementCodec<V>,
  defaultValue: V,
): SearchCodec<V> => {
  const parse = (raw: readonly string[]): SearchParseResult<V> => {
    const result = codec.parse(raw);

    return {
      value: result.value ?? defaultValue,
      issue: result.issue,
    };
  };

  return {
    decode: (raw) => parse(toValues(raw)).value,
    encode: (value) =>
      valuesEqual(value, defaultValue) ? [] : [codec.encodeElement(value)],
    parse,
  };
};

const applyDefault = <V,>(
  codec: SearchElementCodec<V>,
  options: DefaultOption<V> | undefined,
): SearchCodec<V> | SearchElementCodec<V> =>
  options === undefined ? codec : withDefault(codec, options.default);

const fromOptional = <V,>(decoded: Optional<V>): ElementOutcome<V> =>
  Optional.isSome(decoded)
    ? ({ ok: true, value: Optional.unwrap(decoded) } as const)
    : ({ ok: false, issue: 'invalid' } as const);

const invalid: ElementOutcome<never> = { ok: false, issue: 'invalid' } as const;

// string

const stringElement: SearchElementCodec<string> = elementCodec({
  decodeElement: (raw) => ({ ok: true, value: raw }),
  encodeElement: (value) => value,
  emptyIsValue: true,
});

function searchString(): SearchElementCodec<string>;

function searchString(options: DefaultOption<string>): SearchCodec<string>;

function searchString(
  options?: DefaultOption<string>,
): SearchCodec<string> | SearchElementCodec<string> {
  return applyDefault(stringElement, options);
}

// int

/** The same rule as `param.int`, so that a path and a query agree. */
const intElement: SearchElementCodec<SafeInt> = elementCodec({
  decodeElement: (raw) => fromOptional(decodeCanonicalInt(raw)),
  encodeElement: (value) => value.toString(),
  emptyIsValue: false,
});

function searchInt(): SearchElementCodec<SafeInt>;

/** `default` is checked to be a safe integer when the codec is made. */
function searchInt(options: DefaultOption<number>): SearchCodec<SafeInt>;

function searchInt(
  options?: DefaultOption<number>,
): SearchCodec<SafeInt> | SearchElementCodec<SafeInt> {
  return options === undefined
    ? intElement
    : withDefault(intElement, asSafeInt(options.default));
}

// boolean

const booleanElement: SearchElementCodec<boolean> = elementCodec({
  decodeElement: (raw) =>
    raw === 'true'
      ? { ok: true, value: true }
      : raw === 'false'
        ? { ok: true, value: false }
        : invalid,
  encodeElement: (value) => (value ? 'true' : 'false'),
  emptyIsValue: false,
});

function searchBoolean(): SearchElementCodec<boolean>;

function searchBoolean(options: DefaultOption<boolean>): SearchCodec<boolean>;

function searchBoolean(
  options?: DefaultOption<boolean>,
): SearchCodec<boolean> | SearchElementCodec<boolean> {
  return applyDefault(booleanElement, options);
}

// literal

function searchLiteral<const Ls extends NonEmptyTuple<string>>(
  values: Ls,
): SearchElementCodec<Ls[number]>;

function searchLiteral<const Ls extends NonEmptyTuple<string>>(
  values: Ls,
  options: DefaultOption<NoInfer<Ls[number]>>,
): SearchCodec<Ls[number]>;

function searchLiteral<const Ls extends NonEmptyTuple<string>>(
  values: Ls,
  options?: DefaultOption<Ls[number]>,
): SearchCodec<Ls[number]> | SearchElementCodec<Ls[number]> {
  const members: ReadonlySet<string> = new Set(values);

  const isMember = (raw: string): raw is Ls[number] => members.has(raw);

  return applyDefault(
    elementCodec<Ls[number]>({
      decodeElement: (raw) =>
        isMember(raw) ? { ok: true, value: raw } : invalid,
      encodeElement: (value) => value,
      emptyIsValue: false,
    }),
    options,
  );
}

// from / custom

function searchFrom<T>(codec: ParamCodec<T>): SearchElementCodec<T>;

function searchFrom<T>(
  codec: ParamCodec<T>,
  options: DefaultOption<NoInfer<T>>,
): SearchCodec<T>;

function searchFrom<T>(
  codec: ParamCodec<T>,
  options?: DefaultOption<T>,
): SearchCodec<T> | SearchElementCodec<T> {
  return applyDefault(
    elementCodec<T>({
      decodeElement: (raw) => fromOptional(codec.decode(raw)),
      encodeElement: (value) => codec.encode(value),
      emptyIsValue: false,
    }),
    options,
  );
}

// refine

function searchRefine<V, W extends V>(
  codec: SearchElementCodec<V>,
  guard: (value: V) => value is W,
): SearchElementCodec<W>;

function searchRefine<V, W extends V>(
  codec: SearchElementCodec<V>,
  guard: (value: V) => value is W,
  options: DefaultOption<NoInfer<W>>,
): SearchCodec<W>;

function searchRefine<V, W extends V>(
  codec: SearchElementCodec<V>,
  guard: (value: V) => value is W,
  options?: DefaultOption<W>,
): SearchCodec<W> | SearchElementCodec<W> {
  return applyDefault(
    elementCodec<W>({
      decodeElement: (raw) => {
        const outcome = codec.decodeElement(raw);

        return !outcome.ok
          ? outcome
          : guard(outcome.value)
            ? { ok: true, value: outcome.value }
            : invalid;
      },
      encodeElement: (value) => codec.encodeElement(value),
      emptyIsValue: codec.emptyIsValue,
    }),
    options,
  );
}

// array

const searchArray = <V,>(
  codec: SearchElementCodec<V>,
): SearchCodec<readonly V[]> => {
  const parse = (raw: readonly string[]): SearchParseResult<readonly V[]> => {
    const mut_values: V[] = [];

    for (const value of raw) {
      // An empty value is absent, as for a single value, so a blank input in a
      // repeated group leaves the others in place.
      if (value === '' && !codec.emptyIsValue) {
        continue;
      }

      const outcome = codec.decodeElement(value);

      // All or nothing: dropping only the bad elements would change what the
      // URL means without saying so.
      if (!outcome.ok) {
        return { value: [], issue: outcome.issue };
      }

      mut_values.push(outcome.value);
    }

    return { value: mut_values, issue: undefined };
  };

  return {
    decode: (raw) => parse(toValues(raw)).value,
    encode: (values) => values.map((value) => codec.encodeElement(value)),
    parse,
  };
};

// schema

type ScalarOutput = boolean | number | string;

type SchemaOptions<T> = Readonly<{ encode?: (value: T) => string }>;

type SchemaOptionsWithEncode<T> = Readonly<{ encode: (value: T) => string }>;

function searchSchema<S extends StandardSchemaV1<unknown, ScalarOutput>>(
  schema: S,
  options: SchemaOptions<StandardSchemaV1Output<S>> &
    DefaultOption<NoInfer<StandardSchemaV1Output<S>>>,
): SearchCodec<StandardSchemaV1Output<S>>;

function searchSchema<S extends StandardSchemaV1<unknown, ScalarOutput>>(
  schema: S,
  options?: SchemaOptions<StandardSchemaV1Output<S>>,
): SearchElementCodec<StandardSchemaV1Output<S>>;

function searchSchema<S extends StandardSchemaV1>(
  schema: S,
  options: SchemaOptionsWithEncode<StandardSchemaV1Output<S>> &
    DefaultOption<NoInfer<StandardSchemaV1Output<S>>>,
): SearchCodec<StandardSchemaV1Output<S>>;

function searchSchema<S extends StandardSchemaV1>(
  schema: S,
  options: SchemaOptionsWithEncode<StandardSchemaV1Output<S>>,
): SearchElementCodec<StandardSchemaV1Output<S>>;

function searchSchema<S extends StandardSchemaV1>(
  schema: S,
  options?: SchemaOptions<StandardSchemaV1Output<S>> &
    Partial<DefaultOption<StandardSchemaV1Output<S>>>,
):
  | SearchCodec<StandardSchemaV1Output<S>>
  | SearchElementCodec<StandardSchemaV1Output<S>> {
  type Out = StandardSchemaV1Output<S>;

  const encode = options?.encode ?? scalarToString;

  const codec = elementCodec<Out>({
    decodeElement: (raw) => {
      const result: unknown = schema['~standard'].validate(raw);

      if (isThenable(result)) {
        // A synchronous match cannot wait for it. The rejection is caught so
        // that it does not surface as an unhandled rejection.
        Promise.resolve(result).catch(noop);

        return { ok: false, issue: 'async' };
      }

      return readSchemaResult<Out>(result);
    },
    encodeElement: encode,
    emptyIsValue: false,
  });

  return options?.default === undefined
    ? codec
    : withDefault(codec, options.default);
}

const readSchemaResult = <Out,>(result: unknown): ElementOutcome<Out> => {
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `validate` returns when it does not return a Promise
  const sync = result as StandardSchemaV1Result<Out>;

  return sync.issues === undefined ? { ok: true, value: sync.value } : invalid;
};

const noop = (): void => {};

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  isNonNullObject(value) && typeof Reflect.get(value, 'then') === 'function';

/** `encode` for a schema whose output is a string, number or boolean. */
const scalarToString = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : typeof value === 'number' || typeof value === 'boolean'
      ? value.toString()
      : '';

/**
 * Codecs for search parameters. A value that fails to decode is read as absent:
 * the field takes its default, or `undefined`, and the page is still shown.
 *
 * - `search.string()`, `.int()`, `.boolean()`, `.literal([...])`: `T |
 *   undefined`, or `T` with `{ default }`.
 * - `search.array(codec)`: repeated keys (`?tag=a&tag=b`), all or nothing;
 *   empty elements are left out.
 * - `search.schema(schema)`: a Standard Schema (Zod, Valibot, ArkType) that
 *   validates the raw string synchronously; `encode` is needed when the output
 *   is not a string, number or boolean.
 * - `search.refine(codec, guard, { default? })`, `search.from(paramCodec, {
 *   default? })`, `search.custom({ decode, encode }, { default? })`.
 *
 * An empty value (`?page=`) is absent for every codec except `search.string()`,
 * where it is `''`.
 *
 * @example
 *
 * ```ts
 * const page = search.int({ default: 1 });
 *
 * assert.strictEqual(page.decode('3'), 3);
 *
 * // An invalid value is read as absent, so the default applies.
 * assert.strictEqual(page.decode('abc'), 1);
 *
 * const tags = search.array(search.string());
 *
 * assert.deepStrictEqual(tags.decode(['a', 'b']), ['a', 'b']);
 * ```
 */
export const search = {
  string: searchString,
  int: searchInt,
  boolean: searchBoolean,
  literal: searchLiteral,
  array: searchArray,
  schema: searchSchema,
  refine: searchRefine,
  from: searchFrom,
  custom: searchFrom,
} as const;
