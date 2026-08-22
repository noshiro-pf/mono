import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions, ensureEs5Reference } from './common.mjs';

export const convertLibEs2019Object =
  ({
    config: { returnType },
    readonlyModifier,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // `lib.es2019.object` augments the base `ObjectConstructor` (es5), so
        // it must reference es5. Works across TS 5.x (anchored after
        // `no-default-lib`) and TS 6.0 (which dropped `no-default-lib`).
        ensureEs5Reference,

        replaceWithNoMatchCheck(
          'interface ObjectConstructor {',
          dedent`
            declare namespace StrictLibInternals {
              type RecursionLimit = 20;

              /**
               * - \`[['x', 1], ['y', 3]]\` -> \`{ x: 1, y: 3 }\`
               *
               * @internal
               */
              export type EntriesToObject<
                Entries extends readonly (readonly [PropertyKey, unknown])[],
              > = ${returnType === 'readonly' ? 'Readonly' : 'MergeIntersection'}<EntriesToObjectImpl<{}, Entries>>;

              /** @internal */
              type EntriesToObjectImpl<
                R,
                Entries extends readonly (readonly [PropertyKey, unknown])[],
              > =
                TypeEq<Entries['length'], 0> extends true
                  ? R
                  : EntriesToObjectImpl<
                      R & { ${readonlyModifier}[key in Entries[0][0]]: Entries[0][1] },
                      List.Tail<Entries>
                    >;

              /**
               * - \`['x' | 'y' | 'z', number][]]\` -> \`'x' | 'y' | 'z'\`
               * - \`[['a' | 'b' | 'c', number], ...['x' | 'y' | 'z', number][]]\` -> \`'a' | 'b' |
               *   'c' | 'x' | 'y' | 'z'\`
               *
               * @internal
               *
               * @note 上の2個目の例に対応するためには、無限長の Entries に対しても再帰を回す必要があるが、
               * 止めるタイミングを決められないので再帰制限を設けている。
               */
              export type KeysOfEntries<
                Entries extends readonly (readonly [PropertyKey, unknown])[],
              > = KeysOfEntriesImpl<never, Entries, RecursionLimit>;

              /** @internal */
              type KeysOfEntriesImpl<
                K,
                Entries extends readonly (readonly [PropertyKey, unknown])[],
                RemainingNumRecursions extends number,
              > =
                TypeEq<RemainingNumRecursions, 0> extends true
                  ? K
                  : TypeEq<Entries['length'], 0> extends true
                    ? K
                    : KeysOfEntriesImpl<
                        K | Entries[0][0],
                        List.Tail<Entries>,
                        Decrement<RemainingNumRecursions>
                      >;

              /** @internal */
              export type ValuesOfEntries<
                Entries extends readonly (readonly [PropertyKey, unknown])[],
              > = ValuesOfEntriesImpl<never, Entries, RecursionLimit>;

              /** @internal */
              type ValuesOfEntriesImpl<
                K,
                Entries extends readonly (readonly [PropertyKey, unknown])[],
                RemainingNumRecursions extends number,
              > =
                TypeEq<RemainingNumRecursions, 0> extends true
                  ? K
                  : TypeEq<Entries['length'], 0> extends true
                    ? K
                    : ValuesOfEntriesImpl<
                        K | Entries[0][1],
                        List.Tail<Entries>,
                        Decrement<RemainingNumRecursions>
                      >;

              /** @internal */
              export type PartialIfKeyIsUnion<K, T> = IsUnion<K> extends true ? Partial<T> : T;
            }

            interface ObjectConstructor {
          `,
        ),

        replaceWithNoMatchCheck(
          dedent`
             */
            fromEntries<T = unknown>(entries: Iterable<readonly [PropertyKey, T]>): { readonly [k: string]: T };
          `,

          dedent`
            *
            * @example
            *   const entries = [
            *     ['x', 1],
            *     ['y', 3],
            *   ] as const satisfies [['x', 1], ['y', 3]];
            *
            *   const obj = Object.fromEntries(entries) satisfies { x: 1; y: 3 };
            *
            * @note \`entries\` がタプル型の場合には key-value の組み合わせも反映した型にする。
            * そうでない場合、 \`K\` が union 型の場合、\`entries\` がそのすべてを網羅しているとは限らないため、
            * \`fromEntries\` の返り値型がその union 要素すべてを含む型になってしまわないように \`Partial\` を付けている。
            *
            * index signature の record では \`Object.entries\` の key が \`string\` そのものになり
            * union ではなくなるため、\`Partial\` は付かない（\`WithOpenString\` 参照）。
            */
              fromEntries<const Entries extends readonly (readonly [PropertyKey, unknown])[]>(
                entries: Entries,
              ): IsFixedLengthList<Entries> extends true
                ? StrictLibInternals.EntriesToObject<Entries>
                : StrictLibInternals.PartialIfKeyIsUnion<
                    StrictLibInternals.KeysOfEntries<Entries>,
                    ${returnType === 'readonly' ? 'Record' : 'MutableRecord'}<StrictLibInternals.KeysOfEntries<Entries>, StrictLibInternals.ValuesOfEntries<Entries>>
                  >;

            /**
            * Returns an object created by key-value entries for properties and methods
            * @param entries An iterable object that contains key-value entries for properties and methods.
            *
            * @example
            *   const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [
            *     ['x', 1],
            *     ['y', 2],
            *     ['z', 3],
            *     [4, 3],
            *   ] as const;
            *
            *   const obj = Object.fromEntries(entries); // Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>
            *
            */
            fromEntries<K extends PropertyKey, V>(
              entries: Iterable<readonly [K, V]>
            ): ${returnType === 'readonly' ? 'Record' : 'MutableRecord'}<K, V>
          `,
        ),
      ),
    ).value;
