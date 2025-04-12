import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-utils';
import { closeBraceRegexp, idFn, type ConverterOptions } from '../common.mjs';

export const convertLibEs2015Core =
  ({
    brandedNumber,
    readonlyModifier,
    config: { commentOutDeprecated, returnType, numberType },
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      // Array
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Array<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `predicate: (value: T, index: number, obj: readonly T[]) => unknown,`,
            `predicate: (value: T, index: number, obj: readonly T[]) => boolean,`,
          ),
          replaceWithNoMatchCheck(
            `index: number,`,
            `index: ${brandedNumber.ArraySize},`,
          ),
          replaceWithNoMatchCheck(
            `): number;`,
            `): ${brandedNumber.ArraySearchResult};`,
          ),
          replaceWithNoMatchCheck(
            `start?: number`,
            `start?: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            //
            `end?: number`,
            `end?: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            //
            `start: number`,
            `start: ${brandedNumber.ArraySizeArg}`,
          ),
          replaceWithNoMatchCheck(
            'target: number',
            `target: ${brandedNumber.ArraySizeArg}`,
          ),
        ),
      }),

      // ArrayConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          returnType === 'readonly'
            ? idFn
            : replaceWithNoMatchCheck(
                `from<T>(arrayLike: ArrayLike<T>): readonly T[];`,
                `from<T>(arrayLike: ArrayLike<T>): T[];`,
              ),
          replaceWithNoMatchCheck(
            `from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: unknown): readonly U[];`,
            `from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: ${brandedNumber.ArraySize}) => U, thisArg?: unknown): ${readonlyModifier}U[];`,
          ),
        ),
      }),

      // Math
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Math {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            'clz32(x: number): number;',
            'clz32(x: number): UintRange<0, 33>;',
          ),
          replaceWithNoMatchCheck(
            'imul(x: number, y: number): number;',
            `imul(x: ${brandedNumber.Int32}, y: ${brandedNumber.Int32}): ${brandedNumber.Int32};`,
          ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'sign(x: number): number;',
                `sign(x: number): -1 | 0 | -0 | 1 | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'acosh(x: number): number;',
                `acosh(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'cosh(x: number): number;',
                `cosh(x: number): ${brandedNumber.PositiveNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'hypot(...values: readonly number[]): number;',
                `hypot(...values: readonly number[]): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'trunc(x: number): number;',
                `trunc(x: number): ${brandedNumber.Int} | ${brandedNumber.InfiniteNumber} | ${brandedNumber.NaNType};`,
              ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'fround(x: number): number;',
                `fround(x: number): ${brandedNumber.Float32} | ${brandedNumber.NaNType};`,
              ),
        ),
      }),

      // NumberConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface NumberConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            'EPSILON: number;',
            `EPSILON: ${brandedNumber.PositiveNumber};`,
          ),
          replaceWithNoMatchCheck(
            'isFinite(number: unknown): boolean;',
            `isFinite(number: number): ${numberType === 'normal' ? 'boolean' : `number is ${brandedNumber.FiniteNumber}`};`,
          ),
          replaceWithNoMatchCheck(
            'isInteger(number: unknown): boolean;',
            `isInteger(number: number): ${numberType === 'normal' ? 'boolean' : `number is ${brandedNumber.Int}`};`,
          ),
          replaceWithNoMatchCheck(
            'isNaN(number: unknown): boolean;',
            `isNaN(number: number): ${numberType === 'normal' ? 'boolean' : `number is ${brandedNumber.NaNType}`};`,
          ),
          replaceWithNoMatchCheck(
            'isSafeInteger(number: unknown): boolean;',
            `isSafeInteger(number: number): ${numberType === 'normal' ? 'boolean' : `number is ${brandedNumber.SafeInt}`};`,
          ),
          replaceWithNoMatchCheck(
            'MAX_SAFE_INTEGER: number;',
            `MAX_SAFE_INTEGER: ${brandedNumber.SafeUint};`,
          ),
          replaceWithNoMatchCheck(
            'MIN_SAFE_INTEGER: number;',
            `MIN_SAFE_INTEGER: ${brandedNumber.SafeInt};`,
          ),
          numberType === 'normal'
            ? idFn
            : replaceWithNoMatchCheck(
                'parseFloat(string: string): number',
                `parseFloat(string: string): number | ${brandedNumber.NaNType}`,
              ),
          replaceWithNoMatchCheck(
            'parseInt(string: string, radix?: number): number;',
            `parseInt(string: string, radix?: UintRange<2, 37>): ${numberType === 'normal' ? 'number' : `${brandedNumber.Int} | ${brandedNumber.NaNType}`};`,
          ),
        ),
      }),

      // ObjectConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ObjectConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          // use the refined type definition in lib-files/lib.es5.d.ts
          replaceWithNoMatchCheck(
            'keys(o: {}): readonly string[]',
            '// keys(o: {}): readonly string[]',
          ),
        ),
      }),

      // ReadonlyArray
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ReadonlyArray<T> {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            `index: number`,
            `index: ${brandedNumber.ArraySize}`,
          ),
          replaceWithNoMatchCheck(
            //
            `) => unknown,`,
            `) => boolean,`,
          ),
          replaceWithNoMatchCheck(
            `): number;`,
            `): ${brandedNumber.ArraySearchResult};`,
          ),
        ),
      }),

      // String
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface String {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            'codePointAt(pos: number): number | undefined',
            `codePointAt(pos: ${brandedNumber.StringSizeArgNonNegative}): ${brandedNumber.Uint32} | undefined`,
          ),
          replaceWithNoMatchCheck(
            `repeat(count: number): string`,
            `repeat(count: ${brandedNumber.SafeUintWithSmallInt}): string`,
          ),
          replaceWithNoMatchCheck(
            'includes(searchString: string, position?: number): boolean;',
            `includes(searchString: string, position?: ${brandedNumber.StringSizeArgNonNegative}): boolean;`,
          ),
          replaceWithNoMatchCheck(
            'endsWith(searchString: string, endPosition?: number): boolean;',
            `endsWith(searchString: string, endPosition?: ${brandedNumber.StringSizeArgNonNegative}): boolean;`,
          ),
          replaceWithNoMatchCheck(
            'startsWith(searchString: string, position?: number): boolean;',
            `startsWith(searchString: string, position?: ${brandedNumber.StringSizeArgNonNegative}): boolean;`,
          ),
        ),
      }),

      // StringConstructor
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface StringConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          `fromCodePoint(...codePoints: readonly number[]): string`,
          `fromCodePoint(...codePoints: readonly ${brandedNumber.Uint32}[]): string`,
        ),
      }),

      ...(!commentOutDeprecated
        ? []
        : [
            'anchor(name: string): string;',
            'big(): string;',
            'blink(): string;',
            'bold(): string;',
            'fixed(): string;',
            'fontcolor(color: string): string;',
            `fontsize(size: ${brandedNumber.SafeUint}): string;`,
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
          )),
    ).value;
