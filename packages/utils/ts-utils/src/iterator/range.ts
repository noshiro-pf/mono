import { SafeInt, toSafeInt } from '../num';

type SmallInt = Int10;

/**
 * @throws Will throw an error if the argument is not safe integer.
 * @param start
 * @param end
 * @param step default value is 1
 */
export function* range<I extends SafeInt>(
  start: I | SmallInt,
  end: I | SmallInt,
  step: Exclude<SmallInt, 0> | IntersectBrand<I, NonZeroNumber> = 1
): Generator<I, void, unknown> {
  for (
    let mut_i = toSafeInt(start);
    step > 0 ? mut_i < end : mut_i > end;
    mut_i = SafeInt.add(mut_i, step as I)
  ) {
    yield mut_i as I;
  }
}
