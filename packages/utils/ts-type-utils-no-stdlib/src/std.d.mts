/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/ban-types */

type PropertyKey = number | string | symbol;

/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Make all properties in T readonly
 */
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * From T, pick a set of properties whose keys are in the union K
 */
type Pick<T, K extends keyof T> = {
  readonly [P in K]: T[P];
};

/**
 * Exclude from T those types that are assignable to U
 */
type Exclude<T, U extends T> = T extends U ? never : T;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Extract from T those types that are assignable to U
 */
type Extract<T, U> = T extends U ? T : never;

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends keyof never, T> = {
  readonly [P in K]: T;
};

/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: readonly never[]) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: readonly never[]) => unknown> = T extends (
  ...args: readonly never[]
) => infer R
  ? R
  : unknown;

/////////////////////////////
/// ECMAScript Array API (specially handled by compiler)
/////////////////////////////

interface ReadonlyArray<T> {
  /**
   * Gets the length of the array. This is a number one higher than the highest element defined in an array.
   */
  readonly length: number;

  readonly [n: number]: T;
}

interface Array<T> {
  /**
   * Gets or sets the length of the array. This is a number one higher than the highest index in the array.
   */
  readonly length: number;

  [n: number]: T;
}

// global definitions for compiler

interface IArguments {}
interface Function {}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface Number {}
// eslint-disable-next-line no-restricted-syntax
interface String {}
interface Boolean {}
interface Object {}
interface RegExp {}
