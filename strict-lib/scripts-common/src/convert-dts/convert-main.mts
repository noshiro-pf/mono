import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithNoMatchCheckBetweenRegexp,
} from '../functions/utils/node-utils.mjs';
import {
  closeBraceRegexp,
  createBrandedNumber,
  idFn,
  tsLibShapeFor,
  type ConverterConfig,
  type ConverterOptions,
} from './common.mjs';
import { convertReturnTypeToUintRange } from './convert-return-type-to-uint-range.mjs';
import { convertLibDomCommon } from './dom-common.mjs';
import { convertLibDomIterable } from './lib.dom.iterable.mjs';
import { convertLibDom } from './lib.dom.mjs';
import { convertLibEs5 } from './lib.es5.mjs';
import { convertLibEs2015Collection } from './lib.es2015.collection.mjs';
import { convertLibEs2015Core } from './lib.es2015.core.mjs';
import { convertLibEs2015Iterable } from './lib.es2015.iterable.mjs';
import { convertEs2015SymbolWellknown } from './lib.es2015.symbol.wellknown.mjs';
import { convertLibEs2016ArrayInclude } from './lib.es2016.array.include.mjs';
import { convertLibEs2017Date } from './lib.es2017.date.mjs';
import { convertLibEs2017Object } from './lib.es2017.object.mjs';
import { convertLibEs2017Sharedmemory } from './lib.es2017.sharedmemory.mjs';
import { convertLibEs2019Array } from './lib.es2019.array.mjs';
import { convertLibEs2019Object } from './lib.es2019.object.mjs';
import { convertLibEs2019String } from './lib.es2019.string.mjs';
import { convertLibEs2020Bigint } from './lib.es2020.bigint.mjs';
import { convertLibEs2020Sharedmemory } from './lib.es2020.sharedmemory.mjs';
import { convertLibEs2022Array } from './lib.es2022.array.mjs';
import { convertLibEs2022Object } from './lib.es2022.object.mjs';
import { convertLibEs2023Array } from './lib.es2023.array.mjs';
import { convertLibEs2024Arraybuffer } from './lib.es2024.arraybuffer.mjs';
import { convertLibEs2024Sharedmemory } from './lib.es2024.sharedmemory.mjs';
import { convertLibEsnextFloat16 } from './lib.esnext.float16.mjs';
import { convertLibEsNextIterator } from './lib.esnext.iterator.mjs';

/**
 * Converts `Map.groupBy` (the `MapConstructor.groupBy` static). This shipped in
 * `lib.esnext.collection.d.ts` in TS 5.4–5.6 and was promoted to
 * `lib.es2024.collection.d.ts` in TS 5.7. The same transforms apply to both
 * locations, so both filenames route here. Pass `tolerant: true` for the
 * `esnext` layout so the rules become no-ops in TS 5.7+, where that file holds
 * the Set-method declarations instead and no longer contains `groupBy`.
 */
const convertGroupByCollection = (
  { config, brandedNumber }: ConverterOptions,
  tolerant: boolean,
): MonoTypeFunction<string> => {
  const opt = tolerant ? ({ onNotFound: 'off' } as const) : undefined;

  return composeMonoTypeFns(
    config.returnType === 'readonly'
      ? idFn
      : replaceWithNoMatchCheck(
          'ReadonlyMap<K, readonly T[]>;',
          'Map<K, T[]>;',
          opt,
        ),
    replaceWithNoMatchCheck(
      'keySelector: (item: T, index: number) => K',
      `keySelector: (item: T, index: ${brandedNumber.ArraySize}) => K`,
      opt,
    ),
  );
};

/**
 * Converts `Object.groupBy` (the `ObjectConstructor.groupBy` static). Shipped
 * in `lib.esnext.object.d.ts` in TS 5.4–5.6 and promoted to
 * `lib.es2024.object.d.ts` in TS 5.7. See {@link convertGroupByCollection}.
 */
const convertGroupByObject = (
  { config, brandedNumber }: ConverterOptions,
  tolerant: boolean,
): MonoTypeFunction<string> => {
  const opt = tolerant ? ({ onNotFound: 'off' } as const) : undefined;

  return composeMonoTypeFns(
    config.returnType === 'readonly'
      ? idFn
      : replaceWithNoMatchCheck(
          'Partial<Record<K, readonly T[]>>',
          'Partial<MutableRecord<K, T[]>>',
          opt,
        ),
    replaceWithNoMatchCheck(
      'keySelector: (item: T, index: number) => K',
      `keySelector: (item: T, index: ${brandedNumber.ArraySize}) => K`,
      opt,
    ),
  );
};

/**
 * Brands the length parameter of `String.prototype.padStart` / `padEnd`.
 * TypeScript 7.0 renamed that parameter from `maxLength` to `targetLength`
 * (aligning the lib with the spec), so the spelling actually present in the
 * file is detected first; every lib file carries exactly one of the two.
 */
const convertLibEs2017String =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) => {
    const paramName = src.includes('targetLength: number')
      ? 'targetLength'
      : 'maxLength';

    return replaceWithNoMatchCheck(
      `${paramName}: number`,
      `${paramName}: ${brandedNumber.StringSizeArgNonNegative}`,
    )(src);
  };

/**
 * TypeScript 6.0 turned several lib files (`lib.dom.iterable.d.ts`,
 * `lib.dom.asynciterable.d.ts`, and their WebWorker counterparts) into stubs
 * whose real declarations were folded into the main `lib.dom.d.ts` /
 * `lib.webworker.d.ts`. Such a stub carries this marker comment in place of the
 * declarations the per-file transforms expect.
 */
const stubFileMarker = 'contents are now included in the main types file';

/**
 * Skip the given (per-file) transform for TypeScript 6.0 stub files, passing
 * their contents through unchanged, while the common transforms still run. Every
 * 5.x lib file is a non-stub and never contains {@link stubFileMarker}, so their
 * generated output is byte-for-byte unchanged.
 */
const skipForStubFile =
  (fn: MonoTypeFunction<string>): MonoTypeFunction<string> =>
  (src) =>
    src.includes(stubFileMarker) ? src : fn(src);

export const convert = (
  filename: string,
  converterConfig: ConverterConfig,
  tsVersion: string,
): MonoTypeFunction<string> => {
  const options: ConverterOptions = {
    config: converterConfig,
    readonlyModifier:
      converterConfig.returnType === 'mutable'
        ? ('' as const)
        : ('readonly ' as const),
    brandedNumber: createBrandedNumber(converterConfig.useBrandedNumber),
    tsLibShape: tsLibShapeFor(tsVersion),
  } as const;

  return (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // Remove the leading Microsoft copyright banner. Matched as a regex
        // (the whole `/*! … */` block at the top of the file) rather than a
        // literal, because the exact wording drifts between TypeScript releases
        // — e.g. TS 6.0 fixed the long-standing "MERCHANTABLITY" typo to
        // "MERCHANTABILITY". The match span is identical to the old literal for
        // 5.x, so their generated output is unchanged.
        replaceWithNoMatchCheck(/^\/\*![\s\S]*?\*\//gu, ''),
        replaceWithNoMatchCheck(
          '/// <reference no-default-lib="true"/>',
          dedent`
            /// <reference no-default-lib="true"/>
          `,
          {
            onNotFound: 'off',
          },
        ),

        replaceWithNoMatchCheck(
          /\/\/\/ <reference lib="(.+)" \/>/gu,
          '/// <reference path="./lib.$1.d.ts" />',
          {
            onNotFound: 'off',
          },
        ),

        replaceWithNoMatchCheck(
          //
          'declare var ',
          'declare const ',
          {
            onNotFound: 'off',
          },
        ),
        replaceWithNoMatchCheck(
          //
          'declare let ',
          'declare const ',
          {
            onNotFound: 'off',
          },
        ),
        replaceWithNoMatchCheck(
          //
          '  var ',
          '  const ',
          {
            onNotFound: 'off',
          },
        ),
        replaceWithNoMatchCheck(
          //
          'readonly any[]',
          'readonly unknown[]',
          {
            onNotFound: 'off',
          },
        ),
        replaceWithNoMatchCheck('TReturn = unknown', 'TReturn = any', {
          onNotFound: 'off',
        }),

        skipForStubFile(
          (() => {
            switch (filename) {
              case 'lib.decorators.d.ts':
                return composeMonoTypeFns(
                  replaceWithNoMatchCheck(
                    'Class extends abstract new (...args: unknown) => unknown = abstract new (...args: unknown) => unknown',
                    'Class extends abstract new (...args: readonly never[]) => unknown = abstract new (...args: readonly never[]) => unknown',
                  ),
                  replaceWithNoMatchCheck(
                    'Value extends (this: This, ...args: unknown) => unknown = (this: This, ...args: unknown) => unknown',
                    'Value extends (this: This, ...args: readonly never[]) => unknown = (this: This, ...args: readonly never[]) => unknown',
                  ),
                );

              case 'lib.dom.d.ts':
                // TS 6.0 folded the former `lib.dom.iterable.d.ts` (now a
                // stub) into `lib.dom.d.ts`, so its branded entries()/keys()
                // iterator transforms must run here to keep parity with 5.x.
                // Those transforms are tolerant and match nothing in the 5.x
                // `lib.dom.d.ts`, so 5.x output is unchanged.
                return composeMonoTypeFns(
                  convertLibDom(options),
                  convertLibDomIterable(options),
                );

              case 'lib.webworker.d.ts':
                return convertLibDomCommon(options);

              case 'lib.dom.iterable.d.ts':
                return convertLibDomIterable(options);

              case 'lib.es5.d.ts':
                return convertLibEs5(options);

              case 'lib.es2015.promise.d.ts':
                // Resolve the `readonly -readonly` marker that the ts-morph
                // codemod (transform-dts.mts) emits for `-readonly [K in ...]`
                // mapped types: `readonly` for the readonly flavor, `-readonly`
                // for the mutable one. (ts-morph runs config-independently, so
                // it defers this choice to here.)
                return options.config.returnType === 'readonly'
                  ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
                  : replaceWithNoMatchCheck('readonly -readonly', '-readonly');

              case 'lib.es2015.collection.d.ts':
                return convertLibEs2015Collection(options);

              case 'lib.es2015.symbol.wellknown.d.ts':
                return convertEs2015SymbolWellknown(options);

              case 'lib.es2015.reflect.d.ts':
                return replaceWithNoMatchCheck(
                  'newTarget?: new (...args: unknown) => unknown',
                  'newTarget?: new (...args: readonly never[]) => unknown',
                );

              case 'lib.es2015.core.d.ts':
                return convertLibEs2015Core(options);

              case 'lib.es2015.iterable.d.ts':
                return convertLibEs2015Iterable(options);

              case 'lib.es2015.proxy.d.ts':
                return options.config.returnType === 'readonly'
                  ? idFn
                  : replaceWithNoMatchCheck(
                      '): { readonly proxy: T; readonly revoke: () => void }',
                      '): { proxy: T; revoke: () => void }',
                    );

              case 'lib.es2015.generator.d.ts':
                return replaceWithNoMatchCheck(
                  'readonly length: number;',
                  `readonly length: ${options.brandedNumber.ArraySize};`,
                );

              case 'lib.es2016.array.include.d.ts':
                return convertLibEs2016ArrayInclude(options);

              case 'lib.es2017.sharedmemory.d.ts':
                return convertLibEs2017Sharedmemory(options);

              case 'lib.es2017.object.d.ts':
                return convertLibEs2017Object(options);

              case 'lib.es2017.string.d.ts':
                return convertLibEs2017String(options);

              case 'lib.es2017.date.d.ts':
                return convertLibEs2017Date(options);

              case 'lib.es2018.intl.d.ts':
                return convertReturnTypeToUintRange;

              case 'lib.es2019.array.d.ts':
                return convertLibEs2019Array(options);

              case 'lib.es2019.object.d.ts':
                return convertLibEs2019Object(options);

              case 'lib.es2019.string.d.ts':
                return convertLibEs2019String(options);

              case 'lib.es2020.bigint.d.ts':
                return convertLibEs2020Bigint(options);

              case 'lib.es2020.number.d.ts':
                // (Number.NEGATIVE_INFINITY).toLocaleString() が '-∞' になるためこの変更はできない。
                // return replaceWithNoMatchCheck(
                //   //
                //   '): string;',
                //   // eslint-disable-next-line no-template-curly-in-string
                //   '): `${number}`;',
                // );
                return idFn;

              case 'lib.es2020.promise.d.ts':
                return composeMonoTypeFns(
                  // Resolve the `readonly -readonly` marker that the ts-morph
                  // codemod (transform-dts.mts) emits for `-readonly [K in ...]`
                  // mapped types: `readonly` for the readonly flavor,
                  // `-readonly` for the mutable one (see lib.es2015.promise).
                  options.config.returnType === 'readonly'
                    ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
                    : replaceWithNoMatchCheck(
                        'readonly -readonly',
                        '-readonly',
                      ),
                  options.config.returnType === 'readonly'
                    ? idFn
                    : replaceWithNoMatchCheck(
                        '): Promise<readonly PromiseSettledResult<Awaited<T>>[]>',
                        '): Promise<PromiseSettledResult<Awaited<T>>[]>',
                      ),
                );

              case 'lib.es2020.sharedmemory.d.ts':
                return convertLibEs2020Sharedmemory(options);

              case 'lib.es2021.weakref.d.ts':
                // fix type errors
                return replaceWithNoMatchCheckBetweenRegexp({
                  startRegexp: 'interface WeakRefConstructor {',
                  endRegexp: closeBraceRegexp,
                  mapFn: replaceWithNoMatchCheck(
                    'readonly prototype: WeakRef<unknown>;',
                    'readonly prototype: WeakRef<object>;',
                  ),
                });

              case 'lib.es2021.intl.d.ts':
                // use mutable array in return value (undo of batch replacement results)
                return options.config.returnType === 'readonly'
                  ? idFn
                  : replaceWithNoMatchCheck(
                      "readonly { readonly type: 'element' | 'literal'; readonly value: string }[]",
                      "{ type: 'element' | 'literal'; value: string }[]",
                    );

              case 'lib.es2022.array.d.ts':
                return convertLibEs2022Array(options);

              case 'lib.es2022.object.d.ts':
                return convertLibEs2022Object(options);

              case 'lib.es2022.string.d.ts':
                return replaceWithNoMatchCheck(
                  'at(index: number)',
                  `at(index: ${options.brandedNumber.StringSizeArg})`,
                );

              case 'lib.es2022.regexp.d.ts':
                return replaceWithNoMatchCheck(
                  'number',
                  options.brandedNumber.ArraySize,
                );

              case 'lib.es2023.array.d.ts':
                return convertLibEs2023Array(options);

              // TS 5.4–5.6 shipped `Map.groupBy` / `Object.groupBy` in
              // `lib.esnext.{collection,object}.d.ts`; TS 5.7 promoted them to
              // `lib.es2024.{collection,object}.d.ts`. Route both filenames
              // through the same converter (tolerant for the esnext layout).
              case 'lib.esnext.collection.d.ts':
                return convertGroupByCollection(options, true);

              case 'lib.es2024.collection.d.ts':
                return convertGroupByCollection(options, false);

              case 'lib.esnext.object.d.ts':
                return convertGroupByObject(options, true);

              case 'lib.es2024.object.d.ts':
                return convertGroupByObject(options, false);

              case 'lib.es2024.sharedmemory.d.ts':
                return convertLibEs2024Sharedmemory(options);

              case 'lib.es2024.arraybuffer.d.ts':
                return convertLibEs2024Arraybuffer(options);

              case 'lib.esnext.float16.d.ts':
                return convertLibEsnextFloat16(options);

              case 'lib.esnext.iterator.d.ts':
                return convertLibEsNextIterator(options);

              case 'lib.esnext.temporal.d.ts':
                // This lib narrows `Exclude<T, U>` to `Exclude<T, U extends T>`,
                // and upstream's `PartialTemporalLike` subtracts a literal key
                // union from a still-generic `keyof T` — which the narrowed
                // constraint rejects (TS2344), since TypeScript cannot prove the
                // union is a subset of a `keyof T` it has not resolved yet.
                // ts-type-forge's `RelaxedExclude` is the unconstrained form, so
                // it expresses the same type and satisfies nothing extra.
                // (`rewrite-ts-type-forge-refs.mts` turns the bare reference
                // into an `import('ts-type-forge')` one.)
                return replaceWithNoMatchCheck(
                  `[P in Exclude<keyof T, 'calendar' | 'timeZone'>]?:`,
                  `[P in RelaxedExclude<keyof T, 'calendar' | 'timeZone'>]?:`,
                );

              case 'lib.esnext.array.d.ts':
                // TS 5.7 added an `index: number` parameter to `Array.fromAsync`'s
                // mapFn; pre-5.7 lib has no index parameter so this rule is a no-op
                // for older versions.
                return replaceWithNoMatchCheck(
                  'mapFn: (value: Awaited<T>, index: number) => U',
                  `mapFn: (value: Awaited<T>, index: ${options.brandedNumber.ArraySize}) => U`,
                  { onNotFound: 'off' },
                );

              default:
                return idFn;
            }
          })(),
        ),

        options.config.returnType === 'readonly'
          ? idFn
          : // use mutable array in return value (undo of batch replacement results)
            composeMonoTypeFns(
              replaceWithNoMatchCheck(
                //
                '): readonly ',
                '): ',
                {
                  onNotFound: 'off',
                },
              ),
              replaceWithNoMatchCheck(
                /\): Promise<readonly ([_$a-zA-Z][_$a-zA-Z0-9]*)\[\]>/gu,
                '): Promise<$1[]>',
                {
                  onNotFound: 'off',
                },
              ),
            ),
      ),
    ).value;
};
