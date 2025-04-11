import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-utils';
import { idFn, type ConverterOptions } from '../common.mjs';

export const convertLibEs2017Object =
  ({
    readonlyModifier,
    config: { returnType },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      replaceWithNoMatchCheck(
        'interface ObjectConstructor {',
        [
          'declare namespace StrictLibInternals {',
          '  /** @internal */',
          '  type ToObjectKeys<R extends UnknownRecord> = ToStr<keyof R> | (string & {});',
          '',
          '/** @internal */',
          // eslint-disable-next-line no-template-curly-in-string
          '  type ToStr<A> = A extends string ? A : A extends number ? `${A}` : never;',
          '',
          '  /** @internal */',
          '  type PickByValue<R, V> = Pick<',
          '    R,',
          '    {',
          '      [K in keyof R]: R[K] extends V ? K : never;',
          '    }[keyof R]',
          '  >;',
          '',
          '  /** @internal */',
          '  type ToObjectEntries<R extends UnknownRecord> = R extends R',
          `    ? ${readonlyModifier}(`,
          '        | readonly [string & {}, WidenLiteral<ValueOf<R>>]',
          '        | {',
          `            ${readonlyModifier}[K in keyof R]: readonly [`,
          '              ToStr<keyof PickByValue<R, R[K]>>,',
          '              R[K],',
          '            ];',
          '            // eslint-disable-next-line @typescript-eslint/no-restricted-types',
          '          }[RelaxedExclude<keyof R, symbol>]',
          '      )[]',
          '    : never;',
          '}',
          '',
          'interface ObjectConstructor {',
        ].join('\n'),
      ),
      replaceWithNoMatchCheck(
        [
          '   */',
          '  entries<T>(o: { readonly [s: string]: T } | ArrayLike<T>): readonly (readonly [string, T])[];',
        ].join('\n'),
        [
          '   *',
          '   * ```ts',
          '   * const obj = {',
          '   *   x: 1,',
          '   *   y: 2,',
          '   *   z: 2,',
          '   *   3: 4,',
          '   * } as const;',
          '   *',
          "   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2] | [string, unknown])[]",
          '   * ```',
          '   *',
          '   */',
          '  entries<const R extends UnknownRecord>(object: R): StrictLibInternals.ToObjectEntries<R>;',
          '',
          '  /**',
          '   * Returns an array of key/values of the enumerable own properties of an',
          '   * object',
          '   *',
          '   * @param o Object that contains the properties and methods. This can be an',
          '   *   object that you created or an existing Document Object Model (DOM)',
          '   *   object.',
          '   */',
          '  entries<T>(o: { readonly [s: string]: T } | ArrayLike<T>): readonly (readonly [string, T])[];',
        ].join('\n'),
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
    ).value;
