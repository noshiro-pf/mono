// cspell:ignore Uncapitalize

/**
 * The standard library, reduced to what `../src` actually needs.
 *
 * `configs/tsconfig.build.json` compiles `src/` with `"lib": []`, so the
 * published declarations depend on no standard-library snapshot:
 * `strict-ts-lib-v*` imports `ts-type-forge`, and this package stays the root
 * of that dependency graph by not depending on any standard library back.
 * With no lib files loaded, this file supplies the two things the build still
 * needs:
 *
 * - the global types the compiler itself requires (`Array`, `Boolean`,
 *   `Function`, `IArguments`, `Number`, `Object`, `RegExp`, `String`, ...) —
 *   with `"lib": []` their absence is an immediate TS2318/TS2552, whether or
 *   not the source mentions them;
 * - the lib utility types and collection types the source references by name
 *   (`Readonly`, `Record`, `Uppercase`, `ReadonlyMap`, ...).
 *
 * Every definition is copied from the stock lib verbatim (minus members the
 * source never touches), because the emitted `dist/*.d.mts` reference these
 * names and a consumer resolves them against their own standard library: what
 * the build checked must mean the same thing there. The file itself is not
 * published — `package.json` `files` ships `dist/` only — and the dist smoke
 * tests (`test/dist_/`) type-check the output against a real
 * `ESNext` + `DOM` lib to prove the round trip.
 *
 * This file is intentionally excluded from `../tsconfig.json`: that program
 * loads the real lib (the type tests assert against `URL` and friends), and
 * the type aliases here would collide with the lib's own as duplicate
 * identifiers.
 */

declare type PropertyKey = string | number | symbol;

interface Object {}
interface Function {}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface IArguments {}
interface Boolean {}
interface Number {}
interface String {
  readonly length: number;
}
interface RegExp {}

interface Array<T> {
  length: number;
  [n: number]: T;
}

interface ReadonlyArray<T> {
  readonly length: number;
  readonly [n: number]: T;
}

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};

type Exclude<T, U> = T extends U ? never : T;

type Extract<T, U> = T extends U ? T : never;

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type NonNullable<T> = T & {};

type Parameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

type ReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

type Uppercase<S extends string> = intrinsic;
type Lowercase<S extends string> = intrinsic;
type Capitalize<S extends string> = intrinsic;
type Uncapitalize<S extends string> = intrinsic;

interface ReadonlyMap<K, V> {
  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    thisArg?: any,
  ): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  readonly size: number;
}

interface Map<K, V> {
  clear(): void;
  delete(key: K): boolean;
  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any,
  ): void;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
  readonly size: number;
}

interface ReadonlySet<T> {
  forEach(
    callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void,
    thisArg?: any,
  ): void;
  has(value: T): boolean;
  readonly size: number;
}

interface Set<T> {
  add(value: T): this;
  clear(): void;
  delete(value: T): boolean;
  forEach(
    callbackfn: (value: T, value2: T, set: Set<T>) => void,
    thisArg?: any,
  ): void;
  has(value: T): boolean;
  readonly size: number;
}
