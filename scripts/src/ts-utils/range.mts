/**
 * @param start
 * @param end
 * @param step Default value is 1
 * @throws Will throw an error if the argument is not safe integer.
 */
export function range(
  start: SafeUintWithSmallInt,
  end: SafeUintWithSmallInt,
  step?: PositiveSafeIntWithSmallInt,
): Generator<SafeUint, void, unknown>;
export function range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step?: NonZeroSafeIntWithSmallInt,
): Generator<SafeInt, void, unknown>;
export function* range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step: NonZeroSafeIntWithSmallInt = 1,
): Generator<SafeInt, void, unknown> {
  for (
    let mut_i: number = start;
    step > 0 ? mut_i < end : mut_i > end;
    mut_i += step
  ) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    yield mut_i as SafeInt;
  }
}
