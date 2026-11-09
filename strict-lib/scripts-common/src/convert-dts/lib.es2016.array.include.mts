import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { enumType, type ConverterOptions } from './common.mjs';

export const convertLibEs2016ArrayInclude =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        ...(['Array', 'ReadonlyArray'] as const).map((typeName) =>
          replaceWithinInterface({
            name: typeName,
            mapFn: replaceWithNoMatchCheck(
              'includes(searchElement: T, fromIndex?: number): boolean;',
              // A type predicate narrows the false branch too, but `false`
              // means "not in this array", not "not of type `T`" (#2879).
              // So `includes` narrows only an argument none of whose members is
              // in `T` — `KEYS.includes(s)` for `s: string` — where the false
              // branch, which removes the members of `T`, has nothing to
              // remove. The `this` parameter holds that condition, because a
              // predicate's type must be assignable to its parameter's. It is
              // spelled `[S] extends [Exclude<S, T>]`:
              // `[Extract<S, T>] extends [never]` says the same, but makes two
              // tuples of structurally equal, differently written elements
              // (`{ readonly a: 1 }`, `Readonly<{ a: 1 }>`) no longer
              // identical. ts-data-forge's `expectType<…>('=')` tests catch
              // that; the harnesses' entry files do not reproduce it. An
              // argument already in `T`, or overlapping it (`'a' | 'c'` against
              // `'a' | 'b'`), gets a `boolean`.
              dedent`
                includes(searchElement: T, fromIndex?: ${brandedNumber.ArraySizeArg}): boolean;
                ${includesDoc}
                includes<S extends WidenLiteral<T> & {}>(
                  this: [S] extends [Exclude<S, T>] ? unknown : never,
                  searchElement: S,
                  fromIndex?: ${brandedNumber.ArraySizeArg},
                ): searchElement is S & T;
                ${includesDoc}
                includes(searchElement: WidenLiteral<T> & {}, fromIndex?: ${brandedNumber.ArraySizeArg}): boolean;
              `,
            ),
          }),
        ),

        ...(
          [
            ['Int8Array', enumType.Int8],
            ['Uint8Array', enumType.Uint8],
            ['Uint8ClampedArray', enumType.Uint8],
            ['Int16Array', brandedNumber.Int16],
            ['Uint16Array', brandedNumber.Uint16],
            ['Int32Array', brandedNumber.Int32],
            ['Uint32Array', brandedNumber.Uint32],
            ['Float32Array', brandedNumber.Float32],
            ['Float64Array', brandedNumber.Float64],
          ] as const
        ).map(([typeName, elemType]) =>
          replaceWithinInterface({
            name: typeName,
            mapFn: replaceWithNoMatchCheck(
              'includes(searchElement: number, fromIndex?: number): boolean;',
              `includes(searchElement: ${elemType}, fromIndex?: ${brandedNumber.TypedArraySizeArg}): boolean;`,
            ),
          }),
        ),
      ),
    ).value;

/**
 * The lib's own documentation of `includes`, repeated on the overloads the
 * converter adds: an editor shows the documentation of the overload a call
 * resolves to, and the lib documents only the first.
 */
const includesDoc = dedent`
  /**
   * Determines whether an array includes a certain element, returning true or false as appropriate.
   * @param searchElement The element to search for.
   * @param fromIndex The position in this array at which to begin searching for searchElement.
   */
`;
