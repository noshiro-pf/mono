import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import {
  arrayIteratorName,
  closeBraceRegexp,
  idFn,
  typedArrayInterfaceStartRegexp,
  typedArrayThisCaptureRegexSource,
  type ConverterOptions,
} from './common.mjs';
import { convertInterfaceTypedArray } from './lib.es5-typed-array.mjs';
import {
  BYTES_PER_ELEMENT,
  typedArrayTypeToElemType,
} from './lib.typed-array-common.mjs';

// TS 5.6 renamed `IterableIterator` -> `ArrayIterator`; accept both forms.
const arrayIteratorAlt = '(?:Array|Iterable)Iterator';

/**
 * Converts `lib.esnext.float16.d.ts` (added in TS 5.8), which declares
 * `Float16Array`, `Float16ArrayConstructor`, `Math.f16round`, and the
 * `DataView.getFloat16`/`setFloat16` augmentations.
 *
 * `Float16Array` is a number-element typed array structurally identical to
 * `Float32Array`, but ships as a single self-contained file rather than being
 * split across `lib.es5` / `lib.es2015.iterable` / `lib.es2022.array` /
 * `lib.es2023.array` the way the older typed arrays are. This converter
 * therefore re-applies, for the single `Float16Array` interface, the same
 * brandings those files apply to the other typed arrays:
 *
 * - Element type -> `Float16`;
 * - Sizes/indices -> `TypedArraySize` / `TypedArraySizeArg`;
 * - Search results -> `TypedArraySearchResult`;
 * - `BYTES_PER_ELEMENT` -> `2`;
 * - Iterators -> `ArrayIterator`. The `Float16` brand comes from ts-type-forge
 *   (>= the release that adds it).
 */
export const convertLibEsnextFloat16 = (
  options: ConverterOptions,
): MonoTypeFunction<string> => {
  const {
    brandedNumber,
    tsLibShape,
    config: { useBrandedNumber },
  } = options;

  const elem = typedArrayTypeToElemType('Float16', useBrandedNumber);

  const ai = arrayIteratorName(tsLibShape);

  const thisCap = typedArrayThisCaptureRegexSource('Float16Array');

  return (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // ---- interface Float16Array ----
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: typedArrayInterfaceStartRegexp('Float16Array'),
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            // `findLast` / `findLastIndex` (normally handled by lib.es2023.array
            // for the other typed arrays). Run before the shared converter so
            // its generic `predicate: (...) => unknown` rule doesn't partially
            // rewrite these first.
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`findLast<S extends number>\(\s*predicate:\s*\(\s*value:\s*number,\s*index:\s*number,\s*array:\s*${thisCap},?\s*\)\s*=>\s*value is S,\s*thisArg\?:\s*unknown,?\s*\):\s*S \| undefined;`,
                'gu',
              ),
              `findLast<S extends ${elem}>(predicate: (value: ${elem}, index: ${brandedNumber.TypedArraySize}, array: $1) => value is S, thisArg?: unknown): S | undefined;`,
            ),
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`findLast\(\s*predicate:\s*\(\s*value:\s*number,\s*index:\s*number,\s*array:\s*${thisCap},?\s*\)\s*=>\s*unknown,\s*thisArg\?:\s*unknown,?\s*\):\s*number \| undefined;`,
                'gu',
              ),
              `findLast(predicate: (value: ${elem}, index: ${brandedNumber.TypedArraySize}, array: $1) => boolean, thisArg?: unknown): ${elem} | undefined;`,
            ),
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`findLastIndex\(\s*predicate:\s*\(\s*value:\s*number,\s*index:\s*number,\s*array:\s*${thisCap},?\s*\)\s*=>\s*unknown,\s*thisArg\?:\s*unknown,?\s*\):\s*number;`,
                'gu',
              ),
              `findLastIndex(predicate: (value: ${elem}, index: ${brandedNumber.TypedArraySize}, array: $1) => boolean, thisArg?: unknown): ${brandedNumber.TypedArraySearchResult};`,
            ),

            // shared per-interface typed-array conversion (element type,
            // callbacks, find/findIndex, reduce, fill, set, sort, etc.)
            convertInterfaceTypedArray(options, 'Float16'),

            // `at` (normally handled by lib.es2022.array)
            replaceWithNoMatchCheck(
              'at(index: number): number | undefined;',
              `at(index: ${brandedNumber.TypedArraySizeArg}): ${elem} | undefined;`,
            ),

            // `with` (normally handled by lib.es2023.array)
            replaceWithNoMatchCheck(
              'with(index: number, value: number)',
              `with(index: ${brandedNumber.TypedArraySizeArg}, value: ${elem})`,
            ),

            // interface-level members (normally handled by lib.es5-typed-array)
            replaceWithNoMatchCheck(
              'BYTES_PER_ELEMENT: number;',
              `BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT('Float16')};`,
            ),
            replaceWithNoMatchCheck(
              'byteLength: number',
              `byteLength: ${brandedNumber.TypedArraySize}`,
            ),
            replaceWithNoMatchCheck(
              'byteOffset: number',
              `byteOffset: ${brandedNumber.TypedArraySize}`,
            ),
            replaceWithNoMatchCheck(
              'readonly [index: number]: ',
              '[index: number]: ',
            ),

            // iterators (normally handled by lib.es2015.iterable)
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`\[Symbol\.iterator\]\(\): ${arrayIteratorAlt}<number>;`,
                'gu',
              ),
              `[Symbol.iterator](): ${ai}<${elem}>;`,
            ),
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`entries\(\): ${arrayIteratorAlt}<readonly \[number, number\]>;`,
                'gu',
              ),
              `entries(): ${ai}<readonly [${brandedNumber.TypedArraySize}, ${elem}]>;`,
            ),
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`keys\(\): ${arrayIteratorAlt}<number>;`,
                'gu',
              ),
              `keys(): ${ai}<${brandedNumber.TypedArraySize}>;`,
            ),
            replaceWithNoMatchCheck(
              new RegExp(
                String.raw`values\(\): ${arrayIteratorAlt}<number>`,
                'gu',
              ),
              `values(): ${ai}<${elem}>`,
            ),
          ),
        }),

        // ---- interface Float16ArrayConstructor ----
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: 'interface Float16ArrayConstructor {',
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'byteOffset?: number',
              `byteOffset?: ${brandedNumber.TypedArraySize}`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'length?: number',
              `length?: ${brandedNumber.TypedArraySize}`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'BYTES_PER_ELEMENT: number;',
              `BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT('Float16')};`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'new (array: ArrayLike<number>',
              `new (array: ArrayLike<${elem}>`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'of(...items: readonly number[])',
              `of(...items: readonly ${elem}[])`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'from(arrayLike: ArrayLike<number>)',
              `from(arrayLike: ArrayLike<${elem}>)`,
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              'mapfn: (v: T, k: number) => number,',
              `mapfn: (v: T, k: ${brandedNumber.TypedArraySize}) => ${elem},`,
              { onNotFound: 'off' },
            ),
            // `from(elements: Iterable<number>)` overloads (lib.es2015.iterable)
            replaceWithNoMatchCheck(
              /from\(\s*(?:arrayLike|elements):\s*Iterable<number>/gu,
              'from<T extends number>(arrayLike: Iterable<T>',
              { onNotFound: 'off' },
            ),
            replaceWithNoMatchCheck(
              /mapfn\?: \(v: (?:T|number), k: number\) => number,/gu,
              `mapfn?: (v: T, k: ${brandedNumber.TypedArraySize}) => ${elem},`,
              { onNotFound: 'off' },
            ),
          ),
        }),

        // ---- Math.f16round (cf. Math.fround in lib.es2015.core) ----
        !useBrandedNumber
          ? idFn
          : replaceWithNoMatchCheck(
              'f16round(x: number): number;',
              `f16round(x: number): ${brandedNumber.Float16} | ${brandedNumber.NaNType};`,
            ),

        // ---- DataView.getFloat16 / setFloat16 (cf. lib.es5-typed-array) ----
        replaceWithNoMatchCheckBetweenRegexp({
          startRegexp: typedArrayInterfaceStartRegexp('DataView'),
          endRegexp: closeBraceRegexp,
          mapFn: composeMonoTypeFns(
            replaceWithNoMatchCheck(
              'getFloat16(byteOffset: number, littleEndian?: boolean): number;',
              `getFloat16(byteOffset: ${brandedNumber.TypedArraySizeArg}, littleEndian?: boolean): ${brandedNumber.Float16};`,
            ),
            replaceWithNoMatchCheck(
              'setFloat16(byteOffset: number, value: number, littleEndian?: boolean): void;',
              `setFloat16(byteOffset: ${brandedNumber.TypedArraySizeArg}, value: ${brandedNumber.Float16}, littleEndian?: boolean): void;`,
            ),
          ),
        }),
      ),
    ).value;
};
