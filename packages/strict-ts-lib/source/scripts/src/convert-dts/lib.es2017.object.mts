import { pipe, replaceWithNoMatchCheck } from '@noshiro/mono-scripts';
import { converterOptions } from './common.mjs';

const { returnType } = converterOptions;

export const convertLibEs2017Object = (source: string): string =>
  pipe(source)
    .chain(
      replaceWithNoMatchCheck(
        'interface ObjectConstructor {',
        [
          'declare namespace LibEs2017Object {',
          '  /** @internal */',
          '  type ToObjectKeysValue<A> = A extends string',
          '    ? A',
          '    : A extends number',
          // eslint-disable-next-line no-template-curly-in-string
          '    ? `${A}`',
          '    : never;',
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
          '  export type _RecordUtilsEntries<R extends RecordBase> = R extends R',
          `    ? ${returnType === 'readonly' ? 'readonly ' : ''}{`,
          '        readonly [K in keyof R]: readonly [',
          '          ToObjectKeysValue<keyof PickByValue<R, R[K]>>,',
          '          R[K]',
          '        ];',
          '        // eslint-disable-next-line @typescript-eslint/ban-types',
          '      }[RelaxedExclude<keyof R, symbol>][]',
          '    : never;',
          '  }',
          '',
          'interface ObjectConstructor {',
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          '     */',
          `    entries<T>(o: { readonly [s: string]: T; } | ArrayLike<T>): readonly (readonly [string, T])[];`,
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
          'entries<R extends RecordBase>(object: R): LibEs2017Object._RecordUtilsEntries<R>;',
        ].join('\n'),
      ),
    ).value;
