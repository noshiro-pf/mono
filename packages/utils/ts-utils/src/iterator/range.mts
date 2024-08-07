import { SafeInt, toSafeInt } from '../num/index.mjs';

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
    let mut_i: SafeInt = toSafeInt(start);
    step > 0 ? mut_i < end : mut_i > end;
    mut_i = SafeInt.add(mut_i, step)
  ) {
    yield mut_i;
  }
}
