import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
} from '../functions/utils/node-utils.mjs';
import { type ConverterOptions, ensureEs5Reference } from './common.mjs';

export const convertLibEs2022Object =
  ({ config: { returnType } }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        // `lib.es2022.object` augments the base `ObjectConstructor` (es5), so
        // it must reference es5. Works across TS 5.x (anchored after
        // `no-default-lib`) and TS 6.0 (which dropped `no-default-lib`).
        ensureEs5Reference,
        replaceWithNoMatchCheck(
          'interface ObjectConstructor {',
          dedent`
            // R（union 型、要素数1の場合も含む）を、K をキーとして含む要素だけに絞った型。
            // キーが index signature の要素には K のキーを足す。K を含む要素が一つも無ければ never。
            /**
             * @internal
             * What \`Object.hasOwn(obj, key)\` narrows \`obj\` to: the members of
             * \`R\` (a union, or a single type) that have \`K\` as a key, with
             * \`${returnType === 'mutable' ? 'Mutable' : ''}Record<K, R[keyof R]>\` added to a member whose key is
             * an index signature's. \`never\` when no member has \`K\`.
             */
            declare namespace StrictLibInternals {
              export type HasOwnReturnType<
                R extends UnknownRecord,
                K extends PropertyKey
              > = R extends R // union distribution
                ? K extends keyof R
                  ? string extends keyof R
                    ? ${returnType === 'mutable' ? 'Mutable' : ''}Record<K, R[keyof R]> & R
                    : number extends keyof R
                    ? ${returnType === 'mutable' ? 'Mutable' : ''}Record<K, R[keyof R]> & R
                    : symbol extends keyof R
                    ? ${returnType === 'mutable' ? 'Mutable' : ''}Record<K, R[keyof R]> & R
                    : R
                  : never // omit union member that does not have key K
                : never; // dummy case for union distribution
            }

            interface ObjectConstructor {
          `,
        ),
        replaceWithNoMatchCheck('@param o', '@param obj'),
        replaceWithNoMatchCheck('@param v', '@param key'),
        replaceWithNoMatchCheck(
          'hasOwn(o: object, v: PropertyKey): boolean;',
          dedent`
            hasOwn<R extends UnknownRecord, K extends PropertyKey>(
              obj: R,
              key: K
            ): obj is StrictLibInternals.HasOwnReturnType<R, K>;
          `,
        ),
      ),
    ).value;
