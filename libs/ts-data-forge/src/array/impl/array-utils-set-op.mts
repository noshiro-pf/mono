/**
 * Checks if two arrays are equal by comparing their elements.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 3] as const;
 * const sameNumbers = [1, 2, 3] as const;
 * const differentNumbers = [1, 2, 4] as const;
 *
 * assert.ok(Arr.eq(numbers, sameNumbers));
 * assert.notOk(Arr.eq(numbers, differentNumbers));
 * ```
 */
export const eq = <E,>(
  array1: readonly E[],
  array2: readonly E[],
  equality: (a: E, b: E) => boolean = Object.is,
): boolean =>
  array1.length === array2.length &&
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  array1.every((v, i) => equality(v, array2[i]!));

/**
 * Alias for `eq`.
 *
 * @see {@link eq}
 */
export const equal = eq;

/**
 * Checks if the first array is a subset of the second array.
 *
 * @example
 *
 * ```ts
 * const subset = [1, 2] as const;
 * const superset = [1, 2, 3] as const;
 * const notSubset = [2, 4] as const;
 *
 * assert.ok(Arr.isSubset(subset, superset));
 * assert.notOk(Arr.isSubset(notSubset, superset));
 * ```
 */
export const isSubset = <E1 extends Primitive, E2 extends Primitive = E1>(
  array1: readonly E1[],
  array2: readonly E2[],
): boolean =>
  array1.every((a) =>
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    array2.includes(a as E1 & E2),
  );

/**
 * Checks if the first array is a superset of the second array.
 *
 * @example
 *
 * ```ts
 * const potentialSuperset = ['a', 'b', 'c'] as const;
 * const subset = ['a', 'c'] as const;
 * const notSuperset = ['a', 'd'] as const;
 *
 * assert.ok(Arr.isSuperset(potentialSuperset, subset));
 * assert.notOk(Arr.isSuperset(subset, potentialSuperset));
 * assert.notOk(Arr.isSuperset(potentialSuperset, notSuperset));
 * ```
 */
export const isSuperset = <E1 extends Primitive, E2 extends Primitive = E1>(
  array1: readonly E1[],
  array2: readonly E2[],
): boolean => isSubset(array2, array1);

/**
 * Returns the intersection of two arrays.
 *
 * @example
 *
 * ```ts
 * const refs = ['Ada', 'Alan', 'Grace'] as const;
 * const attendees = ['Grace', 'Alan', 'Barbara'] as const;
 *
 * const both = Arr.setIntersection(refs, attendees);
 *
 * assert.deepStrictEqual(both, ['Alan', 'Grace']);
 * ```
 */
export const setIntersection = <
  E1 extends Primitive,
  E2 extends Primitive = E1,
>(
  array1: readonly E1[],
  array2: readonly E2[],
): readonly (E1 & E2)[] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array1.filter((e) => array2.includes(e as E1 & E2)) as (E1 & E2)[];

/**
 * Returns the set difference of two arrays (elements in first but not in second).
 *
 * @example
 *
 * ```ts
 * const baseline = [1, 2, 3, 4] as const;
 * const removed = [2, 4] as const;
 *
 * const remaining = Arr.setDifference(baseline, removed);
 *
 * assert.deepStrictEqual(remaining, [1, 3]);
 * ```
 */
export const setDifference = <E extends Primitive>(
  array1: readonly E[],
  array2: readonly E[],
): readonly E[] => array1.filter((e) => !array2.includes(e));

/**
 * Returns the set difference of two sorted numeric arrays (optimized for sorted arrays).
 *
 * @example
 *
 * ```ts
 * const upcoming = [1, 3, 5, 7, 9] as const;
 * const completed = [3, 4, 7] as const;
 *
 * const remaining = Arr.sortedNumSetDifference(upcoming, completed);
 *
 * const expected = [1, 5, 9] as const;
 *
 * assert.deepStrictEqual(remaining, expected);
 * ```
 */
export const sortedNumSetDifference = <E extends number>(
  sortedList1: readonly E[],
  sortedList2: readonly E[],
): readonly E[] => {
  const mut_result: E[] = [];
  let mut_it1 = 0; // iterator for sortedList1
  let mut_it2 = 0; // iterator for sortedList2

  while (mut_it1 < sortedList1.length && mut_it2 < sortedList2.length) {
    // Non-null assertions are safe due to loop condition
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const val1 = sortedList1[mut_it1]!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const val2 = sortedList2[mut_it2]!;

    if (val1 === val2) {
      mut_it1 += 1;
      mut_it2 += 1;
    } else if (val1 < val2) {
      mut_result.push(val1);
      mut_it1 += 1;
    } else {
      // val1 > val2
      mut_it2 += 1;
    }
  }
  // Add remaining elements from sortedList1
  for (; mut_it1 < sortedList1.length; mut_it1 += 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mut_result.push(sortedList1[mut_it1]!);
  }

  return mut_result;
};
