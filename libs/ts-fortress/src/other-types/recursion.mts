import { memoizeFunction } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { createAssertFn, createCastFn, createIsFn } from '../utils/index.mjs';

/**
 * Creates a recursive type definition for self-referential or mutually recursive data structures.
 *
 * This function enables defining types that refer to themselves (like linked lists, trees)
 * or mutually refer to each other (like even/odd number chains).
 *
 * @template A - The type to be defined recursively
 * @param typeName - A descriptive name for the recursive type
 * @param definition - A function that returns the Type definition. This function is called
 *                     lazily to allow self-reference
 * @param options - Optional configuration
 * @param options.defaultValue - Explicit default value for the type. Recommended for
 *                               mutually recursive types to avoid infinite loops
 *
 * @returns A Type that can validate and work with recursive structures
 *
 * @example
 * // Simple recursive type: Linked list
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type LinkedList = Readonly<{
 *   value: number;
 *   next: LinkedList | null;
 * }>;
 *
 * const LinkedListNumber: t.Type<LinkedList> = t.recursion('LinkedList', () =>
 *   t.record({
 *     value: t.number(),
 *     next: t.union([t.nullType, LinkedListNumber]),
 *   }),
 * );
 * ```
 *
 * @example
 * // Tree structure
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type TreeNode<T> = Readonly<{
 *   value: T;
 *   children: readonly TreeNode<T>[];
 * }>;
 *
 * const TreeNodeString: t.Type<TreeNode<string>> = t.recursion(
 *   'TreeNode<string>',
 *   () =>
 *     t.record({
 *       value: t.string(),
 *       children: t.array(TreeNodeString),
 *     }),
 * );
 * ```
 *
 * @example
 * // Mutually recursive types: Even/Odd chain
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;
 *
 * type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;
 *
 * // IMPORTANT: For mutual recursion, place terminal types (like nullType)
 * // first in unions, or provide explicit defaultValue
 * const EvenNumber: t.Type<EvenNumber> = t.recursion('EvenNumber', () =>
 *   t.record({
 *     type: t.literal('even'),
 *     next: t.union([t.nullType, OddNumber]), // nullType first!
 *   }),
 * );
 *
 * const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
 *   t.record({
 *     type: t.literal('odd'),
 *     next: t.union([t.nullType, EvenNumber]), // nullType first!
 *   }),
 * );
 * ```
 *
 * @example
 * // Alternative: Provide explicit defaultValue for mutual recursion
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;
 *
 * type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;
 *
 * const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
 *   t.record({
 *     type: t.literal('odd'),
 *     next: t.union([t.nullType, {} as t.Type<EvenNumber>]),
 *   }),
 * );
 *
 * const EvenNumber: t.Type<EvenNumber> = t.recursion(
 *   'EvenNumber',
 *   () =>
 *     t.record({
 *       type: t.literal('even'),
 *       next: t.union([OddNumber, t.nullType]), // Order doesn't matter
 *     }),
 *   { defaultValue: { type: 'even' as const, next: null } }, // Explicit default
 * );
 * ```
 *
 * @remarks
 * **Important Notes:**
 * - The `definition` function is called lazily on first use, enabling self-reference
 * - For mutually recursive types, accessing `defaultValue` may cause infinite loops
 *   unless proper precautions are taken:
 *   1. Place terminal types (like `nullType`) first in union types, OR
 *   2. Provide an explicit `defaultValue` in options
 * - The type definition itself (validation, type checking) works fine regardless of
 *   union ordering or defaultValue specification
 */
export const recursion = <A,>(
  typeName: string,
  definition: () => Type<A>,
  options?: Partial<
    Readonly<{
      defaultValue: A;
    }>
  >,
): Type<A> => {
  const getDefaultValue = memoizeFunction(
    (): A => options?.defaultValue ?? getInnerType().defaultValue,
  );

  const getInnerType: () => Type<A> = memoizeFunction(definition);

  const validate: Type<A>['validate'] = (a) => getInnerType().validate(a);

  const is = createIsFn<A>(validate);

  const fill: Type<A>['fill'] = (a) => getInnerType().fill(a);

  return {
    typeName,
    get defaultValue(): A {
      return getDefaultValue();
    },
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
};
