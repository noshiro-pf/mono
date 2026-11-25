import * as Arr from 'ts-data-forge/array';
import type { ReadonlyRecord } from 'ts-type-forge';
import { fill, scan } from './internal/index.mjs';

/**
 * The placeholder names of a message string: `PlaceholdersOf<'Hello, {name}!'>`
 * is `'name'`. A placeholder is `{`, one or more characters other than braces,
 * and `}`; the innermost braces count, so `'{{name}}'` has the placeholder
 * `name` inside literal braces, and `'{}'` has none. A string type that is not
 * a literal has none, which is why a base catalog is declared `as const`.
 */
export type PlaceholdersOf<S extends string> =
  S extends `${string}{${infer P}}${infer Rest}`
    ? InnermostName<P> | PlaceholdersOf<Rest>
    : never;

/**
 * A string that contains each of the placeholders `P`, in any order and with
 * any text around them. A translation of a base message `'Hello, {name}!'`
 * must be a `WithPlaceholders<'name'>`.
 */
export type WithPlaceholders<P extends string> = [P] extends [never]
  ? string
  : UnionToIntersection<P extends string ? `${string}{${P}}${string}` : never>;

/** A value a placeholder is filled with. */
export type PlaceholderValue = number | string;

/**
 * The placeholder names in `message`, each once, in the order they first
 * appear. The run-time counterpart of {@link PlaceholdersOf}.
 */
export const placeholdersIn = (message: string): readonly string[] =>
  Arr.uniq(scan(message).names);

/**
 * `message` with each placeholder replaced by its value in `values`. A
 * placeholder with no value is left as written, and a value is not scanned for
 * placeholders again. A number is written as `String` writes it, not in a
 * locale's format.
 */
export const fillPlaceholders = (
  message: string,
  values: ReadonlyRecord<string, PlaceholderValue>,
): string => fill(scan(message), values);

type InnermostName<P extends string> = P extends `${string}{${infer Q}`
  ? InnermostName<Q>
  : P extends ''
    ? never
    : P;

type UnionToIntersection<U> = (
  U extends unknown ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;
