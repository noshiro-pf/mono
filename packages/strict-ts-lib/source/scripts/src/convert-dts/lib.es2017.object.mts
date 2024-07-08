import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '@noshiro/mono-scripts';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibEs2017Object = ({
  readonlyModifier,
  config: { returnType },
}: ConverterOptions): MonoTypeFunction<string> =>
  composeMonoTypeFns(
    replaceWithNoMatchCheck(
      'interface ObjectConstructor {',
      [
        'declare namespace StrictLibInternals {',
        '  /** @internal */',
        '  type ToObjectKeysValueImpl <A>= A extends string',
        '  ? A',
        '  : A extends number',
        // eslint-disable-next-line no-template-curly-in-string
        '    ? `${A}`',
        '    : never;',
        '',
        '  /** @internal */',
        '  type ToObjectKeysValue<A> = ToObjectKeysValueImpl<A> | (string & {})',
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
        '  export type ToObjectEntries<R extends UnknownRecord> = R extends R',
        `    ? ${readonlyModifier}{`,
        `        ${readonlyModifier}[K in keyof R]: readonly [`,
        '          ToObjectKeysValueImpl<keyof PickByValue<R, R[K]>>,',
        '          R[K]',
        '        ];',
        '        // eslint-disable-next-line @typescript-eslint/no-restricted-types',
        '      }[RelaxedExclude<keyof R, symbol>][]',
        '    : never;',
        '  }',
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
        "   * const entries = Object.entries(obj); // (['3', 4] | ['x', 1] | ['y' | 'z', 2])[]",
        '   * ```',
        '   *',
        '   */',
        'entries<R extends UnknownRecord>(object: R): StrictLibInternals.ToObjectEntries<R>;',
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
  );
