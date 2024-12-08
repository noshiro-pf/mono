import {
  composeMonoTypeFns,
  pipe,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '@noshiro/mono-scripts';
import {
  brandedNumberTypeDefString,
  closeBraceRegexp,
  idFn,
  type ConverterOptions,
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

export const convertLibEs5 =
  (options: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).chainMonoTypeFns(
      convertReturnTypeToUintRange,
      convertLibEs5_String(options),
      convertLibEs5_Number,
      convertLibEs5_Json(options),
      convertLibEs5_Math(options),
      convertLibEs5_Date(options),
      convertLibEs5_ObjectConstructor(options),
      convertLibEs5_FunctionConstructor(options),
      convertLibEs5_BooleanConstructor(options),
      convertLibEs5_NumberConstructor(options),
      convertLibEs5_StringConstructor(options),
      convertLibEs5_Array(options),
      convertLibEs5_TypedArray(options),
      replaceWithNoMatchCheck(
        //
        'keyof unknown',
        'keyof never',
      ),
      replaceWithNoMatchCheck(
        'declare function parseInt(string: string, radix?: number): number;',
        `declare function parseInt(string: string, radix?: UintRange<2, 37>): ${options.config.useBrandedNumber ? `${options.brandedNumber.Int} | ${options.brandedNumber.NaNType}` : 'number'};`,
      ),
      !options.config.useBrandedNumber
        ? idFn
        : replaceWithNoMatchCheck(
            'declare function parseFloat(string: string): number;',
            `declare function parseFloat(string: string): number | ${options.brandedNumber.NaNType};`,
          ),
      replaceWithNoMatchCheck(
        'declare const NaN: number;',
        `declare const NaN: ${options.brandedNumber.NaNType};`,
      ),
      replaceWithNoMatchCheck(
        'declare const Infinity: number;',
        `declare const Infinity: ${options.brandedNumber.POSITIVE_INFINITY};`,
      ),
      replaceWithNoMatchCheck(
        //
        'NaN: number;',
        `NaN: ${options.brandedNumber.NaNType};`,
      ),
      replaceWithNoMatchCheck(
        'NEGATIVE_INFINITY: number;',
        `NEGATIVE_INFINITY: ${options.brandedNumber.NEGATIVE_INFINITY};`,
      ),
      replaceWithNoMatchCheck(
        'POSITIVE_INFINITY: number;',
        `POSITIVE_INFINITY: ${options.brandedNumber.POSITIVE_INFINITY};`,
      ),
      replaceWithNoMatchCheck(
        // Type utils
        'type Exclude<T, U> = T extends U ? never : T;',
        'type Exclude<T, U extends T> = T extends U ? never : T;',
      ),
      replaceWithNoMatchCheck(
        'type Omit<T, K extends keyof never> = Pick<T, Exclude<keyof T, K>>;',
        'type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;',
      ),

      // Fix incorrect results of eslint fix
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'type Partial<T> = { readonly',
          'type Partial<T> = {',
        ),
        replaceWithNoMatchCheck(
          'type Pick<T, K extends keyof T> = { readonly',
          'type Pick<T, K extends keyof T> = {',
        ),
        replaceWithNoMatchCheck(
          'type Required<T> = { readonly',
          'type Required<T> = {',
        ),
        replaceWithNoMatchCheck(
          'type Record<K extends keyof never, T> = { readonly',
          'type Record<K extends keyof never, T> = {',
        ),
      ),

      replaceWithNoMatchCheck(
        'extends (...args: unknown) =>',
        'extends (...args: readonly never[]) =>',
      ),
      replaceWithNoMatchCheck(
        'extends abstract new (...args: unknown) =>',
        'extends abstract new (...args: readonly never[]) =>',
      ),

      // Error クラスを継承した際に name を書き換えるケースに対応するため
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface Error {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            //
            'readonly name: string;',
            'name: string;',
          ),
          replaceWithNoMatchCheck(
            //
            'readonly stack?: string;',
            'stack?: string;',
          ),
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBuffer {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${options.brandedNumber.TypedArraySize}`,
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface ArrayBufferConstructor {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'byteLength: number',
          `byteLength: ${options.brandedNumber.TypedArraySize}`,
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp:
          'interface ArrayBufferView<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            'byteLength: number',
            `byteLength: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            'byteOffset: number',
            `byteOffset: ${options.brandedNumber.TypedArraySize}`,
          ),
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp:
          'interface DataView<TArrayBuffer extends ArrayBufferLike = ArrayBufferLike> {',
        endRegexp: closeBraceRegexp,
        mapFn: composeMonoTypeFns(
          replaceWithNoMatchCheck(
            'byteLength: number',
            `byteLength: ${options.brandedNumber.TypedArraySize}`,
          ),
          replaceWithNoMatchCheck(
            'byteOffset: number',
            `byteOffset: ${options.brandedNumber.TypedArraySize}`,
          ),
        ),
      }),

      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExp {',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly lastIndex: number;',
          `readonly lastIndex: ${options.brandedNumber.ArraySize};`,
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExpExecArray',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly index: number;',
          `readonly index: ${options.brandedNumber.ArraySize};`,
        ),
      }),
      replaceWithNoMatchCheckBetweenRegexp({
        startRegexp: 'interface RegExpMatchArray',
        endRegexp: closeBraceRegexp,
        mapFn: replaceWithNoMatchCheck(
          'readonly index?: number;',
          `readonly index?: ${options.brandedNumber.ArraySizeArg};`,
        ),
      }),

      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          [
            //
            'type Partial<T> = {',
            '  [P in keyof T]?: T[P];',
            '};',
          ].join('\n'),
          [
            '// This is already defined in ts-type-utils.',
            '// type Partial<T> = {',
            '//   [P in keyof T]?: T[P];',
            '// };',
          ].join('\n'),
        ),
        replaceWithNoMatchCheck(
          [
            //
            'type Required<T> = {',
            '  [P in keyof T]-?: T[P];',
            '};',
          ].join('\n'),
          [
            '// This is already defined in ts-type-utils.',
            '// type Required<T> = {',
            '//   [P in keyof T]-?: T[P];',
            '// };',
          ].join('\n'),
        ),
        replaceWithNoMatchCheck(
          [
            //
            'type Readonly<T> = {',
            '  readonly [P in keyof T]: T[P];',
            '};',
          ].join('\n'),
          [
            '// This is already defined in ts-type-utils.',
            '// type Readonly<T> = {',
            '//   readonly [P in keyof T]: T[P];',
            '// };',
          ].join('\n'),
        ),
        replaceWithNoMatchCheck(
          [
            //
            'type Pick<T, K extends keyof T> = {',
            '  [P in K]: T[P];',
            '};',
          ].join('\n'),
          [
            '// This is already defined in ts-type-utils.',
            '// type Pick<T, K extends keyof T> = {',
            '//   [P in K]: T[P];',
            '// };',
          ].join('\n'),
        ),
        replaceWithNoMatchCheck(
          [
            //
            'type Record<K extends keyof never, T> = {',
            '  [P in K]: T;',
            '};',
          ].join('\n'),
          [
            '// This is already defined in ts-type-utils.',
            '// type Record<K extends keyof never, T> = {',
            '//   readonly [P in K]: T;',
            '// };',
          ].join('\n'),
        ),
        ...[
          //
          'declare type PropertyKey = string | number | symbol;',
          'type Exclude<T, U extends T> = T extends U ? never : T;',
          'type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;',
          'type Extract<T, U> = T extends U ? T : never;',
          'type Parameters<T extends (...args: readonly never[]) => unknown> = T extends (...args: infer P) => unknown ? P : never;',
          'type ReturnType<T extends (...args: readonly never[]) => unknown> = T extends (...args: readonly never[]) => infer R ? R : unknown;',
          'type Uppercase<S extends string> = intrinsic;',
        ].map((line) =>
          replaceWithNoMatchCheck(
            line,
            [
              //
              '// This is already defined in ts-type-utils.',
              `// ${line}`,
            ].join('\n'),
          ),
        ),

        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface ReadonlyArray<T> {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            ...[
              //
              'readonly length: number;',
              'readonly [n: number]: T;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                [
                  //
                  '// This is already defined in ts-type-utils.',
                  `// ${line}`,
                ].join('\n'),
              ),
            ),
          ),
        }),
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface Array<T> {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            ...[
              //
              'readonly length: number;',
              '[n: number]: T;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                [
                  //
                  '// This is already defined in ts-type-utils.',
                  `// ${line}`,
                ].join('\n'),
              ),
            ),
          ),
        }),
      ),

      convertLibEs5_deprecated(options),
      (s) =>
        // append type utils
        [
          s,
          'type RawDateMutType = Date;',
          'type RawDateType = Readonly<RawDateMutType>;',
          'type TimerId = ReturnType<typeof setTimeout>; // NodeJS.Timeout or number',
          '',
          options.config.useBrandedNumber ? brandedNumberTypeDefString() : '',
        ].join('\n\n'),
    ).value;
