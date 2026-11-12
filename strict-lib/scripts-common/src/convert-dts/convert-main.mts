import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import {
  anyArgumentsRef,
  createBrandedNumber,
  ensureEs5Reference,
  idFn,
  tsLibShapeFor,
  type ConverterConfig,
  type ConverterOptions,
} from './common.mjs';
import { convertReturnTypeToUintRange } from './convert-return-type-to-uint-range.mjs';
import { convertStringReplacerArgs } from './convert-string-replacer-args.mjs';
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
import { convertLibEs2017String } from './lib.es2017.string.mjs';
import { convertLibEs2019Array } from './lib.es2019.array.mjs';
import { convertLibEs2019Object } from './lib.es2019.object.mjs';
import { convertLibEs2019String } from './lib.es2019.string.mjs';
import { convertLibEs2020Bigint } from './lib.es2020.bigint.mjs';
import { convertLibEs2020Sharedmemory } from './lib.es2020.sharedmemory.mjs';
import { convertLibEs2022Array } from './lib.es2022.array.mjs';
import { convertLibEs2022Object } from './lib.es2022.object.mjs';
import { convertLibEs2022Sharedmemory } from './lib.es2022.sharedmemory.mjs';
import { convertLibEs2023Array } from './lib.es2023.array.mjs';
import { convertLibEs2024Arraybuffer } from './lib.es2024.arraybuffer.mjs';
import { convertLibEs2024Sharedmemory } from './lib.es2024.sharedmemory.mjs';
import { convertLibEs2025Collection } from './lib.es2025.collection.mjs';
import { convertLibEsnextFloat16 } from './lib.esnext.float16.mjs';
import { convertLibEsNextIterator } from './lib.esnext.iterator.mjs';
import { isStubFile } from './stub-file.mjs';

/**
 * The globals that `lib.dom.d.ts` and `lib.webworker.d.ts` both declare with
 * `declare var` — the members a window and a worker global scope share
 * (`navigator`, `location`, `crypto`, `self`, the `fetch`-family constructors,
 * …). See {@link declareGlobalsConst} for why they are kept apart.
 */
export const sharedGlobalVarNames = (
  srcFileList: readonly Readonly<{ filename: string; content: string }>[],
): ReadonlySet<string> => {
  const declaredIn = (filename: string): ReadonlySet<string> =>
    new Set(
      srcFileList
        .filter((file) => file.filename === filename)
        .flatMap(({ content }) =>
          Array.from(
            content.matchAll(/^declare var ([\w$]+)/gmu),
            (match) => match[1] ?? '',
          ),
        ),
    );

  const workerGlobals = declaredIn('lib.webworker.d.ts');

  return new Set(
    Array.from(declaredIn('lib.dom.d.ts')).filter((name) =>
      workerGlobals.has(name),
    ),
  );
};

export const convert = (
  filename: string,
  converterConfig: ConverterConfig,
  tsVersion: string,
  sharedGlobals: ReadonlySet<string>,
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
        // Keep the leading Microsoft copyright banner, and say under it that
        // the file is not the original. The lib files are Apache-2.0, whose
        // section 4 asks exactly this of a derivative work: retain the notices
        // the source carries, and mark modified files as modified.
        // Matched as a regex (the whole `/*! … */` block at the top of the
        // file) rather than a literal, because the exact wording drifts between
        // TypeScript releases — e.g. TS 6.0 fixed the long-standing
        // "MERCHANTABLITY" typo to "MERCHANTABILITY" — and with the no-match
        // check on, a release that drops the banner fails here rather than
        // shipping without it.
        replaceWithNoMatchCheck(
          /^\/\*![\s\S]*?\*\//gu,
          `$&\n\n${modificationNotice(filename)}`,
        ),
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

        declareGlobalsConst(sharedGlobals),
        replaceWithNoMatchCheck(
          //
          'declare let ',
          'declare const ',
          {
            onNotFound: 'off',
          },
        ),
        // A `var` inside a namespace (`WebAssembly`, `Intl`, …). A regex
        // anchored to the indentation, because a string pattern matches with
        // its whitespace ignored and would rewrite the top-level `declare var`
        // that `declareGlobalsConst` keeps.
        replaceWithNoMatchCheck(/^( +)var /gmu, '$1const ', {
          onNotFound: 'off',
        }),
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

        skipForStubFile(perFileConverters.get(filename)?.(options) ?? idFn),

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

type PerFileConverter = (options: ConverterOptions) => MonoTypeFunction<string>;

/**
 * The rewrite of each lib file, chosen by its exact file name. A file not named
 * here gets only the common transforms of {@link convert}.
 *
 * TypeScript renames a lib file when its proposal graduates, and a rewrite
 * registered under the old name then silently stops running. The generator
 * holds every version's file names against these keys (`movedWithoutConverter`)
 * and refuses a file that looks like such a move, so a file of a registered
 * feature that needs no rewrite is registered here as `() => idFn`, with the
 * reason.
 */
const perFileConverters: ReadonlyMap<string, PerFileConverter> = new Map(
  Object.entries<PerFileConverter>({
    'lib.decorators.d.ts': () =>
      // Wildcard rest parameters — see the note in `convertLibEs5` and the
      // alias's own doc comment. `ensureEs5Reference` because the alias is
      // declared in `lib.es5.d.ts`.
      composeMonoTypeFns(
        ensureEs5Reference,
        replaceWithNoMatchCheck(
          'Class extends abstract new (...args: unknown) => unknown = abstract new (...args: unknown) => unknown',
          `Class extends abstract new (...args: ${anyArgumentsRef}) => unknown = abstract new (...args: ${anyArgumentsRef}) => unknown`,
        ),
        replaceWithNoMatchCheck(
          'Value extends (this: This, ...args: unknown) => unknown = (this: This, ...args: unknown) => unknown',
          `Value extends (this: This, ...args: ${anyArgumentsRef}) => unknown = (this: This, ...args: ${anyArgumentsRef}) => unknown`,
        ),
      ),

    // TS 6.0 folded the former `lib.dom.iterable.d.ts` (now a stub) into
    // `lib.dom.d.ts`, so its branded entries()/keys() iterator transforms must
    // run here to keep parity with 5.x. Those transforms are tolerant and match
    // nothing in the 5.x `lib.dom.d.ts`, so 5.x output is unchanged.
    'lib.dom.d.ts': (options) =>
      composeMonoTypeFns(
        convertLibDom(options),
        convertLibDomIterable(options),
      ),

    'lib.webworker.d.ts': convertLibDomCommon,

    'lib.dom.iterable.d.ts': convertLibDomIterable,

    'lib.es5.d.ts': convertLibEs5,

    // Resolve the `readonly -readonly` marker that the ts-morph codemod
    // (transform-dts.mts) emits for `-readonly [K in ...]` mapped types:
    // `readonly` for the readonly flavor, `-readonly` for the mutable one.
    // (ts-morph runs config-independently, so it defers this choice to here.)
    'lib.es2015.promise.d.ts': (options) =>
      options.config.returnType === 'readonly'
        ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
        : replaceWithNoMatchCheck('readonly -readonly', '-readonly'),

    'lib.es2015.collection.d.ts': convertLibEs2015Collection,

    'lib.es2015.symbol.wellknown.d.ts': convertEs2015SymbolWellknown,

    // Wildcard rest parameter — see the note in `convertLibEs5`.
    'lib.es2015.reflect.d.ts': () =>
      composeMonoTypeFns(
        ensureEs5Reference,
        replaceWithNoMatchCheck(
          'newTarget?: new (...args: unknown) => unknown',
          `newTarget?: new (...args: ${anyArgumentsRef}) => unknown`,
        ),
      ),

    'lib.es2015.core.d.ts': convertLibEs2015Core,

    'lib.es2015.iterable.d.ts': convertLibEs2015Iterable,

    'lib.es2015.proxy.d.ts': (options) =>
      options.config.returnType === 'readonly'
        ? idFn
        : replaceWithNoMatchCheck(
            '): { readonly proxy: T; readonly revoke: () => void }',
            '): { proxy: T; revoke: () => void }',
          ),

    'lib.es2015.generator.d.ts': (options) =>
      replaceWithNoMatchCheck(
        'readonly length: number;',
        `readonly length: ${options.brandedNumber.ArraySize};`,
      ),

    'lib.es2016.array.include.d.ts': convertLibEs2016ArrayInclude,

    'lib.es2017.sharedmemory.d.ts': convertLibEs2017Sharedmemory,

    'lib.es2017.object.d.ts': convertLibEs2017Object,

    'lib.es2017.string.d.ts': convertLibEs2017String,

    'lib.es2017.date.d.ts': convertLibEs2017Date,

    // `Date.prototype.toLocale*String`'s `Intl` overloads, which take no number.
    // Its feature name is that of `lib.es2017.date.d.ts` (`Date.UTC`), which
    // TypeScript 5.0 and 5.1 do not ship.
    'lib.es2020.date.d.ts': () => idFn,

    'lib.es2018.intl.d.ts': () => convertReturnTypeToUintRange,

    'lib.es2019.array.d.ts': convertLibEs2019Array,

    'lib.es2019.object.d.ts': convertLibEs2019Object,

    'lib.es2019.string.d.ts': convertLibEs2019String,

    'lib.es2020.bigint.d.ts': convertLibEs2020Bigint,

    // (Number.NEGATIVE_INFINITY).toLocaleString() が '-∞' になるためこの変更はできない。
    // return replaceWithNoMatchCheck(
    //   //
    //   '): string;',
    //   // eslint-disable-next-line no-template-curly-in-string
    //   '): `${number}`;',
    // );
    'lib.es2020.number.d.ts': () => idFn,

    'lib.es2020.promise.d.ts': (options) =>
      composeMonoTypeFns(
        // Resolve the `readonly -readonly` marker that the ts-morph codemod
        // (transform-dts.mts) emits for `-readonly [K in ...]` mapped types:
        // `readonly` for the readonly flavor, `-readonly` for the mutable one
        // (see lib.es2015.promise).
        options.config.returnType === 'readonly'
          ? replaceWithNoMatchCheck('readonly -readonly', 'readonly')
          : replaceWithNoMatchCheck('readonly -readonly', '-readonly'),
        options.config.returnType === 'readonly'
          ? idFn
          : replaceWithNoMatchCheck(
              '): Promise<readonly PromiseSettledResult<Awaited<T>>[]>',
              '): Promise<PromiseSettledResult<Awaited<T>>[]>',
            ),
      ),

    'lib.es2020.sharedmemory.d.ts': convertLibEs2020Sharedmemory,

    // fix type errors
    'lib.es2021.weakref.d.ts': () =>
      replaceWithinInterface({
        name: 'WeakRefConstructor',
        mapFn: replaceWithNoMatchCheck(
          'readonly prototype: WeakRef<unknown>;',
          'readonly prototype: WeakRef<object>;',
        ),
      }),

    // use mutable array in return value (undo of batch replacement results)
    'lib.es2021.intl.d.ts': (options) =>
      options.config.returnType === 'readonly'
        ? idFn
        : replaceWithNoMatchCheck(
            "readonly { readonly type: 'element' | 'literal'; readonly value: string }[]",
            "{ type: 'element' | 'literal'; value: string }[]",
          ),

    'lib.es2022.array.d.ts': convertLibEs2022Array,

    'lib.es2022.object.d.ts': convertLibEs2022Object,

    // `Atomics.waitAsync` in TS 5.0–5.6; TS 5.7 moved it to
    // `lib.es2024.sharedmemory.d.ts`.
    'lib.es2022.sharedmemory.d.ts': convertLibEs2022Sharedmemory,

    // `String.prototype.replaceAll`, whose replacement callback has to be typed
    // the same way as `replace`'s.
    'lib.es2021.string.d.ts': () => convertStringReplacerArgs,

    'lib.es2022.string.d.ts': (options) =>
      replaceWithNoMatchCheck(
        'at(index: number)',
        `at(index: ${options.brandedNumber.StringSizeArg})`,
      ),

    'lib.es2022.regexp.d.ts': (options) =>
      replaceWithNoMatchCheck('number', options.brandedNumber.ArraySize),

    'lib.es2023.array.d.ts': convertLibEs2023Array,

    // `WeakKeyTypes`'s `symbol` member, which has no number in it. Its feature
    // name is that of `lib.es2024.collection.d.ts` (`Map.groupBy`, from TS 5.7)
    // and `lib.es2025.collection.d.ts` (`ReadonlySetLike`, from TS 6.0).
    'lib.es2023.collection.d.ts': () => idFn,

    // TS 5.4–5.6 shipped `Map.groupBy` / `Object.groupBy` in
    // `lib.esnext.{collection,object}.d.ts`; TS 5.7 promoted them to
    // `lib.es2024.{collection,object}.d.ts`. Route both filenames through the
    // same converter (tolerant for the esnext layout). The esnext file also
    // carries `ReadonlySetLike` in TS 5.5–5.9, which TS 6.0 promoted to
    // `lib.es2025.collection.d.ts`.
    'lib.esnext.collection.d.ts': (options) =>
      composeMonoTypeFns(
        convertGroupByCollection(options, true),
        convertLibEs2025Collection(options, true),
      ),

    'lib.es2024.collection.d.ts': (options) =>
      convertGroupByCollection(options, false),

    'lib.es2025.collection.d.ts': (options) =>
      convertLibEs2025Collection(options, false),

    'lib.esnext.object.d.ts': (options) => convertGroupByObject(options, true),

    'lib.es2024.object.d.ts': (options) => convertGroupByObject(options, false),

    'lib.es2024.sharedmemory.d.ts': convertLibEs2024Sharedmemory,

    // `Atomics.pause` (TS 5.9), whose optional iteration hint is not a size or an
    // index. Its feature name is that of `lib.es2022.sharedmemory.d.ts`, which
    // TypeScript 5.9 does not ship.
    'lib.esnext.sharedmemory.d.ts': () => idFn,

    'lib.es2024.arraybuffer.d.ts': convertLibEs2024Arraybuffer,

    // `Float16Array` and friends, added in TS 5.8 as `lib.esnext.float16.d.ts`
    // and promoted in TS 6.0 to `lib.es2025.float16.d.ts`.
    'lib.esnext.float16.d.ts': convertLibEsnextFloat16,

    'lib.es2025.float16.d.ts': convertLibEsnextFloat16,

    // The iterator helpers, added in TS 5.6 as `lib.esnext.iterator.d.ts` and
    // promoted in TS 6.0 to `lib.es2025.iterator.d.ts`.
    'lib.esnext.iterator.d.ts': convertLibEsNextIterator,

    'lib.es2025.iterator.d.ts': convertLibEsNextIterator,

    // TS 5.7 added an `index: number` parameter to `Array.fromAsync`'s mapFn;
    // pre-5.7 lib has no index parameter so this rule is a no-op for older
    // versions.
    'lib.esnext.array.d.ts': (options) =>
      replaceWithNoMatchCheck(
        'mapFn: (value: Awaited<T>, index: number) => U',
        `mapFn: (value: Awaited<T>, index: ${options.brandedNumber.ArraySize}) => U`,
        { onNotFound: 'off' },
      ),
  }),
);

/** The lib file names {@link perFileConverters} has a rewrite for. */
export const registeredLibFileNames: readonly string[] = Array.from(
  perFileConverters.keys(),
);

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
 * Skip the given (per-file) transform for TypeScript 6.0 stub files, passing
 * their contents through unchanged, while the common transforms still run. Every
 * 5.x lib file is a non-stub ({@link isStubFile}), so their generated output is
 * byte-for-byte unchanged.
 */
const skipForStubFile =
  (fn: MonoTypeFunction<string>): MonoTypeFunction<string> =>
  (src) =>
    isStubFile(src) ? src : fn(src);

/**
 * The notice that follows the Microsoft banner in every generated file. Each
 * file is published inside a bundle that also carries `LICENSE` and `NOTICE`,
 * which is where the derivation is spelled out once.
 */
const modificationNotice = (filename: string): string =>
  dedent`
    /*
     * Modified from TypeScript's \`${filename}\` by strict-ts-lib
     * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
     * stricter types. This is not the original file. See the NOTICE and LICENSE
     * files of the package this ships in.
     */
  `;

/**
 * Rewrites `declare var X` to `declare const X`, so that the type checker
 * rejects an assignment to a global — except for the names in `keepVar`.
 *
 * Only a `var` (or a function) declaration becomes a property of
 * `typeof globalThis`; a `const` does not. Every rewritten name therefore
 * disappears from `globalThis.X`, which is acceptable only where another
 * spelling reaches it in every realm that has it: `Number.NaN` for `NaN`, a
 * bare `Map`, `window.history` for what only a window has. A name a worker's
 * global scope declares too exists where there is no `window` at all — and
 * Node.js has `navigator`, `crypto` and `performance` as well — so `globalThis.X`
 * is its one portable spelling, and it stays a `var`. Reassigning it is left to
 * ESLint's `no-global-assign`.
 */
const declareGlobalsConst =
  (keepVar: ReadonlySet<string>): MonoTypeFunction<string> =>
  (src) =>
    src.replaceAll(/\bdeclare var ([\w$]+)/gu, (match, name: string) =>
      keepVar.has(name) ? match : `declare const ${name}`,
    );
