import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import { closeBraceRegexp, type ConverterOptions } from './common.mjs';

export const convertLibEs2015Collection =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) => {
    // TS 5.2 introduced `WeakKey`; 5.0 and 5.1 constrain the weak collections
    // to `object`.
    const weakKey = /\bWeakKey\b/u.test(src) ? 'WeakKey' : 'object';

    return pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          // change Set.has() and Map.has() to accept widen literal types
          'has(key: K): boolean;',
          'has(key: K | (WidenLiteral<K> & {})): boolean;',
        ),

        replaceWithNoMatchCheck(
          'has(value: T): boolean;',
          'has(value: T | (WidenLiteral<T> & {})): boolean;',
        ),

        replaceWithNoMatchCheck(
          //
          'size: number',
          `size: ${brandedNumber.ArraySize}`,
        ),

        // Every collection constructor is split into a no-argument overload
        // whose element types default to `never`, plus an overload that
        // *requires* the initializer. Two things come out of that shape:
        //
        // - `new Map()` / `new Set()` / `new WeakMap()` / `new WeakSet()`
        //   written without a type argument cannot silently swallow anything,
        //   because every later `set`/`add` on a `never`-parameterized
        //   collection is rejected. Upstream defaults these to `any` (and the
        //   weak ones to `WeakKey`/`unknown`), so an untyped `new WeakSet()`
        //   accepts every object.
        // - `null` is no longer an accepted initializer. Upstream allows
        //   `new Set(null)` because the runtime tolerates it, but a `null`
        //   reaching a collection constructor is a bug at the call site, not
        //   an intentional "start empty" — `new Set()` says that.
        //
        // The no-argument overload has to carry the type parameters itself
        // (`new <T = never>(): Set<T>`, not `new (): Set<never>`): an overload
        // with no type parameters is not a candidate once the call supplies a
        // type argument, so the bare form would reject `new Set<number>()` and
        // `new WeakMap<object, number>()` with TS2554.
        //
        // `prototype`, by contrast, is deliberately left as the `Readonly*`
        // form the pipeline already produced (mirroring
        // `ArrayConstructor.prototype: readonly unknown[]`). It must NOT be
        // narrowed to `never`: `prototype` is what the `extends` clause
        // checks a subclass's static side against, so `prototype: Set<never>`
        // makes every `class X extends Set<T>` / `class X extends Map<K, V>`
        // fail with TS2417.
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface MapConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'new (): ReadonlyMap<unknown, unknown>;',
              'new <K = never, V = never>(): Map<K, V>;',
            ),
            replaceWithNoMatchCheck(
              'new <K, V>(entries?: readonly (readonly [K, V])[] | null): ReadonlyMap<K, V>;',
              'new <K, V>(entries: readonly (readonly [K, V])[]): Map<K, V>;',
            ),
          ),
        }),

        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface SetConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            'new <T = unknown>(values?: readonly T[] | null): ReadonlySet<T>;',
            dedent`
              new <T = never>(): Set<T>;
              new <T>(values: readonly T[]): Set<T>;
            `,
          ),
        }),

        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface WeakMapConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            `new <K extends ${weakKey} = ${weakKey}, V = unknown>(entries?: readonly (readonly [K, V])[] | null): WeakMap<K, V>;`,
            dedent`
              new <K extends ${weakKey} = never, V = never>(): WeakMap<K, V>;
              new <K extends ${weakKey}, V>(entries: readonly (readonly [K, V])[]): WeakMap<K, V>;
            `,
          ),
        }),

        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface WeakSetConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: replaceWithNoMatchCheck(
            `new <T extends ${weakKey} = ${weakKey}>(values?: readonly T[] | null): WeakSet<T>;`,
            dedent`
              new <T extends ${weakKey} = never>(): WeakSet<T>;
              new <T extends ${weakKey}>(values: readonly T[]): WeakSet<T>;
            `,
          ),
        }),
      ),
    ).value;
  };
