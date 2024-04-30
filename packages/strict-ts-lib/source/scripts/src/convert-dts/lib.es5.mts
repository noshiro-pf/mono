import {
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import {
  NumberType,
  closeBraceRegexp,
  converterOptions,
  numberTypeDefString,
} from './common.mjs';
import { convertReturnTypeToUintRange } from './convert-return-type-to-uint-range.mjs';
import { convertLibEs5_Array } from './lib.es5-array.mjs';
import { convertLibEs5_BooleanConstructor } from './lib.es5-boolean-ctor.mjs';
import { convertLibEs5_Date } from './lib.es5-date.mjs';
import { convertLibEs5_deprecated } from './lib.es5-deprecated.mjs';
import { convertLibEs5_FunctionConstructor } from './lib.es5-function-ctor.mjs';
import { convertLibEs5_Json } from './lib.es5-json.mjs';
import { convertLibEs5_Math } from './lib.es5-math.mjs';
import { convertLibEs5_NumberConstructor } from './lib.es5-number-ctor.mjs';
import { convertLibEs5_Number } from './lib.es5-number.mjs';
import { convertLibEs5_ObjectConstructor } from './lib.es5-object-ctor.mjs';
import { convertLibEs5_StringConstructor } from './lib.es5-string-ctor.mjs';
import { convertLibEs5_String } from './lib.es5-string.mjs';
import { convertLibEs5_TypedArray } from './lib.es5-typed-array.mjs';

const { commentOutDeprecated } = converterOptions;

export const convertLibEs5 = (source: string): string =>
  pipe(source)
    .chain(convertReturnTypeToUintRange)
    .chain(convertLibEs5_String)
    .chain(convertLibEs5_Number)
    .chain(convertLibEs5_Json)
    .chain(convertLibEs5_Math)
    .chain(convertLibEs5_Date)
    .chain((s) => convertLibEs5_ObjectConstructor(s, commentOutDeprecated))
    .chain((s) => convertLibEs5_FunctionConstructor(s, commentOutDeprecated))
    .chain((s) => convertLibEs5_BooleanConstructor(s, commentOutDeprecated))
    .chain((s) => convertLibEs5_NumberConstructor(s, commentOutDeprecated))
    .chain((s) => convertLibEs5_StringConstructor(s, commentOutDeprecated))
    .chain((s) => convertLibEs5_Array(s, commentOutDeprecated))
    .chain(convertLibEs5_TypedArray)
    .chain(replaceWithNoMatchCheck('keyof unknown', 'keyof never'))
    .chain(
      replaceWithNoMatchCheck(
        'declare function parseInt(string: string, radix?: number): number;',
        'declare function parseInt(string: string, radix?: UintRange<2, 37>): Int | NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare function parseFloat(string: string): number;',
        'declare function parseFloat(string: string): number | NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare const NaN: number;',
        'declare const NaN: NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'declare const Infinity: number;',
        'declare const Infinity: POSITIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly NaN: number;',
        'readonly NaN: NaNType;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly NEGATIVE_INFINITY: number;',
        'readonly NEGATIVE_INFINITY: NEGATIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'readonly POSITIVE_INFINITY: number;',
        'readonly POSITIVE_INFINITY: POSITIVE_INFINITY;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        // Type utils
        'type Exclude<T, U> = T extends U ? never : T;',
        'type Exclude<T, U extends T> = T extends U ? never : T;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'type Omit<T, K extends keyof never> = Pick<T, Exclude<keyof T, K>>;',
        'type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'type Partial<T> = { readonly',
        'type Partial<T> = { ',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'type Pick<T, K extends keyof T> = { readonly',
        'type Pick<T, K extends keyof T> = {',
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'type Required<T> = { readonly',
        'type Required<T> = {',
      ),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBuffer {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${NumberType.SafeUint}`,
        ),
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBufferConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${NumberType.SafeUint}`,
        ),
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBufferView {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'byteLength: number',
                `byteLength: ${NumberType.SafeUint}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'byteOffset: number',
                `byteOffset: ${NumberType.SafeUint}`,
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface DataView {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'byteLength: number',
                `byteLength: ${NumberType.SafeUint}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'byteOffset: number',
                `byteOffset: ${NumberType.SafeUint}`,
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface DataViewConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: (slice) =>
          pipe(slice)
            .chain(
              replaceWithNoMatchCheck(
                'byteLength?: number',
                `byteLength?: ${NumberType.SafeUint}`,
              ),
            )
            .chain(
              replaceWithNoMatchCheck(
                'byteOffset?: number',
                `byteOffset?: ${NumberType.SafeUint}`,
              ),
            ).value,
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExp {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly lastIndex: number;',
          `readonly lastIndex: ${NumberType.ArraySize};`,
        ),
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExpExecArray',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly index: number;',
          `readonly index: ${NumberType.ArraySize};`,
        ),
      }),
    )
    .chain(
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExpMatchArray',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly index?: number;',
          `readonly index?: ${NumberType.SafeUint};`,
        ),
      }),
    )
    .chain((s) => convertLibEs5_deprecated(s, commentOutDeprecated))
    .chain((s) =>
      // append type utils
      [
        s,
        'type RawDateMutType = Date;',
        'type RawDateType = Readonly<RawDateMutType>;',
        'type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number',
        '',
        numberTypeDefString,
      ].join('\n\n'),
    ).value;
