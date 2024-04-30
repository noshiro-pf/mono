import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import { NumberType, closeBraceRegexp, converterOptions } from './common.mjs';

const { commentOutDeprecated, returnType } = converterOptions;

export const convertLibEs2015Core = (source: string): string =>
  pipe(source)
    .chain(
      // Array
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `predicate: (value: T, index: number, obj: readonly T[]) => unknown,`,
                `predicate: (value: T, index: number, obj: readonly T[]) => boolean,`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `index: number,`,
                `index: ${NumberType.ArraySize},`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `): number;`,
                `): ${NumberType.ArraySearchResult};`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `start?: number`,
                `start?: ${NumberType.ArraySizeArg}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                //
                `end?: number`,
                `end?: ${NumberType.ArraySizeArg}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                //
                `start: number`,
                `start: ${NumberType.ArraySizeArg}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'target: number',
                `target: ${NumberType.ArraySizeArg}`,
              ),
            ).value,
      }),
    )
    .chain(
      // ArrayConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chainMonoTypeFns([
            replaceWithNoMatchCheck(
              `from<T>(arrayLike: ArrayLike<T>): readonly T[];`,
              `from<T>(arrayLike: ArrayLike<T>): T[];`,
            ),
            replaceWithNoMatchCheck(
              `from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: unknown): readonly U[];`,
              `from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: ${NumberType.ArraySize}) => U, thisArg?: unknown): U[];`,
            ),
          ]).value,
      }),
    )
    .chain(
      // Math
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Math {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `  clz32(x: number): number;`,
                `  clz32(x: number): UintRange<0, 33>;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  imul(x: number, y: number): number;`,
                `  imul(x: Int32, y: Int32): Int32;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  sign(x: number): number;`,
                `  sign(x: number): -1 | 0 | -0 | 1 | NaNType;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  acosh(x: number): number;`,
                `  acosh(x: number): NonNegativeNumber | NaNType;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  cosh(x: number): number;`,
                `  cosh(x: number): PositiveNumber | NaNType;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  hypot(...values: readonly number[]): number;`,
                `  hypot(...values: readonly number[]): NonNegativeNumber | NaNType;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  trunc(x: number): number;`,
                `  trunc(x: number): Int | InfiniteNumber | NaNType;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  fround(x: number): number;`,
                `  fround(x: number): Float32 | NaNType;`,
              ),
            ).value,
      }),
    )
    .chain(
      // NumberConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface NumberConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'readonly EPSILON: number;',
                'readonly EPSILON: PositiveNumber;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  isFinite(number: unknown): boolean;',
                '  isFinite(number: number): number is FiniteNumber;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  isInteger(number: unknown): boolean;',
                '  isInteger(number: number): number is Int;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  isNaN(number: unknown): boolean;',
                '  isNaN(number: number): number is NaNType;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  isSafeInteger(number: unknown): boolean;',
                '  isSafeInteger(number: number): number is SafeInt;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'readonly MAX_SAFE_INTEGER: number;',
                `readonly MAX_SAFE_INTEGER: SafeUint;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'readonly MIN_SAFE_INTEGER: number;',
                'readonly MIN_SAFE_INTEGER: SafeInt;',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  parseFloat(string: string): number',
                '  parseFloat(string: string): number | NaNType',
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  parseInt(string: string, radix?: number): number;',
                '  parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
              ),
            ).value,
      }),
    )
    .chain(
      // ObjectConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ObjectConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `interface ObjectConstructor {`,
                [
                  'declare namespace LibEs2015Core {',
                  '  /** @internal */',
                  '  export type ToObjectKeysValue<A> = A extends string',
                  '    ? A',
                  '    : A extends number',
                  // eslint-disable-next-line no-template-curly-in-string
                  '    ? `${A}`',
                  '    : never;',
                  '}',
                  '',
                  'interface ObjectConstructor {',
                ].join('\n'),
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                [
                  //
                  '     */',
                  `    keys(o: {}): readonly string[];`,
                ].join('\n'),
                [
                  '   *',
                  '   * @example',
                  '   * ```ts',
                  "   * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z')[]",
                  '   * ```',
                  '   */',
                  `  keys<R extends RecordBase>(object: R): ${returnType === 'readonly' ? 'readonly ' : ''}LibEs2015Core.ToObjectKeysValue<keyof R>[];`,
                ].join('\n'),
              ),
            ).value,
      }),
    )
    .chain(
      // ReadonlyArray
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                `index: number`,
                `index: ${NumberType.ArraySize}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                //
                `) => unknown,`,
                `) => boolean,`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `): number;`,
                `): ${NumberType.ArraySearchResult};`,
              ),
            ).value,
      }),
    )
    .chain(
      // String
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface String {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                '  codePointAt(pos: number): number | undefined',
                `  codePointAt(pos: ${NumberType.StringSizeArgNonNegative}): Uint32 | undefined`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                `  repeat(count: number): string`,
                `  repeat(count: Uint): string`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  includes(searchString: string, position?: number): boolean;',
                `  includes(searchString: string, position?: ${NumberType.StringSizeArgNonNegative}): boolean;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  endsWith(searchString: string, endPosition?: number): boolean;',
                `  endsWith(searchString: string, endPosition?: ${NumberType.StringSizeArgNonNegative}): boolean;`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                '  startsWith(searchString: string, position?: number): boolean;',
                `  startsWith(searchString: string, position?: ${NumberType.StringSizeArgNonNegative}): boolean;`,
              ),
            ).value,
      }),
    )
    .chain(
      // StringConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface StringConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice).chain(
            replaceWithNoMatchCheck(
              `  fromCodePoint(...codePoints: readonly number[]): string`,
              `  fromCodePoint(...codePoints: readonly Uint32[]): string`,
            ),
          ).value,
      }),
    )
    .chainMonoTypeFns(
      !commentOutDeprecated
        ? []
        : [
            'anchor(name: string): string;',
            'big(): string;',
            'blink(): string;',
            'bold(): string;',
            'fixed(): string;',
            'fontcolor(color: string): string;',
            `fontsize(size: ${NumberType.SafeUint}): string;`,
            'fontsize(size: string): string;',
            'italics(): string;',
            'link(url: string): string;',
            'small(): string;',
            'strike(): string;',
            'sub(): string;',
            'sup(): string;',
          ].map(
            // comment out deprecated functions
            (line) =>
              replaceWithNoMatchCheck(
                //
                line,
                `// ${line}`,
              ),
          ),
    ).value;
