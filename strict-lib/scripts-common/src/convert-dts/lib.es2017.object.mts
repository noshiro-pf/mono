import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs2017Object =
  ({
    readonlyModifier,
    config: { returnType },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'interface ObjectConstructor {',
          dedent`
            declare namespace StrictLibInternals {
              /**
               * Opens a union of string literals so that it still accepts — and
               * completes to — the literals, without rejecting the excess keys a
               * wider object may carry.
               *
               * Adds nothing when \`K\` already contains \`string\`: \`string | (string & {})\`
               * *is* \`string\`, so the arm would only leave a confusing artifact in
               * every type computed from it.
               *
               * @internal
               */
              type WithOpenString<K> = string extends K ? K : K | (string & {});

              /** @internal */
              type ToObjectKeys<R extends UnknownRecord> = WithOpenString<ToStr<keyof R>>;

            /** @internal */
              type ToStr<A> = A extends string ? A : A extends number ? \`\${A}\` : never;

              /** @internal */
              type PickByValue<R, V> = Pick<
                R,
                {
                  [K in keyof R]: R[K] extends V ? K : never;
                }[keyof R]
              >;

              /** @internal */
              type ToObjectEntries<R extends UnknownRecord> = R extends R
                ? ${readonlyModifier}(
                    | (string extends ToStr<keyof R>
                        ? never
                        : readonly [string & {}, WidenLiteral<ValueOf<R>>])
                    | {
                        ${readonlyModifier}[K in keyof R]: readonly [
                          ToStr<keyof PickByValue<R, R[K]>>,
                          R[K],
                        ];
                        // eslint-disable-next-line @typescript-eslint/no-restricted-types
                      }[RelaxedExclude<keyof R, symbol>]
                  )[]
                : never;
            }

            interface ObjectConstructor {
          `,
        ),
        replaceWithNoMatchCheck(
          dedent`
             */
            entries<T>(o: { readonly [s: string]: T } | ArrayLike<T>): readonly (readonly [string, T])[];
          `,
          dedent`
             *
             * \`\`\`ts
             * const obj = {
             *   x: 1,
             *   y: 2,
             *   z: 2,
             *   3: 4,
             * } as const;
             *
             * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2] | [string, unknown])[]
             * \`\`\`
             *
             */
            entries<const R extends UnknownRecord>(object: R): StrictLibInternals.ToObjectEntries<R>;

            /**
             * Returns an array of key/values of the enumerable own properties of an
             * object
             *
             * @param o Object that contains the properties and methods. This can be an
             *   object that you created or an existing Document Object Model (DOM)
             *   object.
             */
            entries<T>(o: { readonly [s: string]: T } | ArrayLike<T>): readonly (readonly [string, T])[];
          `,
        ),
        returnType === 'readonly'
          ? idFn
          : composeMonoTypeFns(
              replaceWithNoMatchCheck(
                'readonly [P in keyof T]: TypedPropertyDescriptor<T[P]>',
                '[P in keyof T]: TypedPropertyDescriptor<T[P]>',
              ),
              replaceWithNoMatchCheck(
                'readonly [x: string]: PropertyDescriptor',
                '[x: string]: PropertyDescriptor',
              ),
            ),
      ),
    ).value;
