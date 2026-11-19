import dedent from 'dedent';
import { pipe } from 'ts-data-forge';
import type { MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import type { ConverterOptions } from './common.mjs';

export const convertLibEs5_ObjectConstructor =
  ({
    config: { commentOutDeprecated },
    readonlyModifier,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'ObjectConstructor',
          mapFn: composeMonoTypeFns(
            ...[
              'new (value?: unknown): Object;',
              '(): unknown;',
              '(value: unknown): unknown;',
            ].map((line) =>
              replaceWithNoMatchCheck(
                line,
                dedent`
                    /** @deprecated Don't use Object constructor */
                  ${commentOutDeprecated ? `// ${line}` : line}
                `,
              ),
            ),
            // One signature for every object: a type `UnknownRecord` accepts,
            // such as an object literal's, gets its keys, and any other object
            // (an interface or a class that declares no string index signature,
            // an array, a function, `object`) gets `string`. One signature
            // rather than a fallback overload, so that a reference that does
            // not call it, as in `records.map(Object.keys)`, still gets the
            // keys: TypeScript reads an overload set there as its last
            // signature. The condition is not distributive, so that an argument
            // typed `any`, or by an unresolved import, gets the keys of a
            // record as before rather than a union with `string`, and a union
            // of records gets the keys of the union, as before. Known limit: in
            // a generic function the condition stays unresolved, so
            // `Object.keys(t)` with `t: T extends UnknownRecord` is an array of
            // that condition rather than `ToObjectKeys<T>[]`; its elements are
            // still strings, which is all a caller there can rely on.
            replaceWithNoMatchCheck(
              dedent`
                 */
                keys(o: object): readonly string[];
              `,
              dedent`
                 *
                 * @example
                 * const ks = Object.keys({ x: 1, y: 2, z: '3', 3: 4 }); // ('3' | 'x' | 'y' | 'z' | (string & {}))[]
                 *
                 */
                keys<const R extends object>(object: R): ${readonlyModifier}([R] extends [UnknownRecord] ? StrictLibInternals.ToObjectKeys<R> : string)[];
              `,
            ),
          ),
        }),
      ),
    ).value;
