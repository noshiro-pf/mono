import type { MonoTypeFunction } from 'ts-type-forge';
import {
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { widenedLookupParam, type ConverterOptions } from './common.mjs';

/**
 * Converts `ReadonlySetLike`, the argument type of the ES2025 Set methods
 * (`union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`,
 * `isSupersetOf`, `isDisjointFrom`). It shipped in `lib.esnext.collection.d.ts`
 * in TS 5.5–5.9 and was promoted to `lib.es2025.collection.d.ts` in TS 6.0.
 * Pass `tolerant: true` for the `esnext` layout, which TS 5.0–5.4 ship without
 * the interface.
 *
 * `has` takes the same parameter as `ReadonlySet#has`
 * ({@link widenedLookupParam}): the Set methods call `other.has(value)` with
 * the receiver's elements, which need not be members of `other`. Without its
 * `NoInfer`, `U` in `union<U>(other: ReadonlySetLike<U>)` was inferred as
 * `string` from a `ReadonlySet<'a' | 'b'>`.
 */
export const convertLibEs2025Collection =
  (
    { tsLibShape }: ConverterOptions,
    tolerant: boolean,
  ): MonoTypeFunction<string> =>
  (src) =>
    tolerant && !/\binterface ReadonlySetLike\b/u.test(src)
      ? src
      : replaceWithinInterface({
          name: 'ReadonlySetLike',
          mapFn: replaceWithNoMatchCheck(
            'has(value: T): boolean;',
            `has(value: ${widenedLookupParam('T', tsLibShape)}): boolean;`,
          ),
        })(src);
