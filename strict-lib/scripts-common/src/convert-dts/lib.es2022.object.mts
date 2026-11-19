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
            declare namespace StrictLibInternals {
              /**
               * @internal
               * The key with which \`Object.hasOwn(obj, key)\` narrows an \`obj\` of type \`R\`
               * where it returns \`true\`, or \`never\` where it narrows nothing.
               *
               * A type predicate narrows both ways, but \`Object.hasOwn\` returning \`false\`
               * says only that \`obj\` has no *own* property \`key\`: a type does not tell an
               * own property from an inherited one (a class's getter), and a value may
               * have properties its type does not name. So no member of \`R\` may be
               * removed where it returns \`false\`, which holds when no member of \`R\` is
               * assignable to the narrowed type: \`K\` must be one literal key (not a union,
               * not \`string\`, \`number\`, \`symbol\` or a template literal pattern) that no
               * member of \`R\` declares as required.
               */
              export type HasOwnNarrowableKey<
                R,
                K extends PropertyKey
              > = IsUnion<K> extends true
                ? never
                : // A property is optional in the first and required in the second only
                // where \`K\` is a literal. Where \`K\` is \`string\`, \`number\`, \`symbol\`, a
                // template literal pattern or \`never\`, both are the same index signature,
                // or no property at all.
                Partial<{ [P in K]: unknown }> extends { [P in K]: unknown }
                ? never
                : true extends (R extends { readonly [P in K]: unknown } ? true : false)
                ? never
                : K;

              /**
               * @internal
               * What \`Object.hasOwn(obj, key)\` narrows an \`obj\` of type \`R\` to where it
               * returns \`true\`: each member of \`R\` with the property \`K\`, typed as that
               * member declares it, or \`unknown\`.
               */
              export type HasOwnReturnType<
                R,
                K extends PropertyKey
              > = R extends unknown // union distribution
                ? R & { ${returnType === 'readonly' ? 'readonly ' : ''}[P in K]: P extends keyof R ? R[P] : unknown }
                : never;
            }

            interface ObjectConstructor {
          `,
        ),
        replaceWithNoMatchCheck('@param o', '@param obj'),
        replaceWithNoMatchCheck('@param v', '@param key'),
        // The predicate overload is taken only for a key that
        // `HasOwnNarrowableKey` accepts, since its parameter is `never`
        // otherwise, and any other call resolves on upstream's signature, which
        // narrows nothing.
        replaceWithNoMatchCheck(
          'hasOwn(o: object, v: PropertyKey): boolean;',
          dedent`
            hasOwn<R extends object, K extends PropertyKey>(
              obj: R,
              key: K & StrictLibInternals.HasOwnNarrowableKey<R, K>
            ): obj is StrictLibInternals.HasOwnReturnType<R, K>;

            /**
             * Determines whether an object has a property with the specified name.
             * @param obj An object.
             * @param key A property name.
             */
            hasOwn(obj: object, key: PropertyKey): boolean;
          `,
        ),
      ),
    ).value;
