import { expectType } from '../expect-type';
import { SafeInt } from '../num';

/**
 * @throws Will throw an error if the argument is not safe integer.
 * @param start
 * @param end
 * @param step default value is 1
 */
export function range(
  start: SafeUint,
  end: SafeUint,
  step?: NonNegativeStep
): Generator<SafeUint, void, unknown>;
export function range(
  start: SafeInt,
  end: SafeInt,
  step?: Step
): Generator<SafeInt, void, unknown>;
export function* range(
  start: SafeInt,
  end: SafeInt,
  step: Step = 1
): Generator<SafeInt, void, unknown> {
  for (
    let mut_i = start;
    step > 0 ? mut_i < end : mut_i > end;
    mut_i = SafeInt.add(mut_i, step as SafeInt)
  ) {
    yield mut_i;
  }
}

type NonNegativeStep =
  | Exclude<SmallInt, 0>
  | IntersectBrand<SafeUintBrand, NonZeroNumber>;

expectType<
  NonNegativeStep,
  | Brand<number, 'Finite' | 'Int' | 'NonNegative' | 'SafeInt', 'NaN' | 'Zero'>
  | Exclude<SmallInt, 0>
>('=');

type Step = Exclude<SmallInt, 0> | IntersectBrand<SafeIntBrand, NonZeroNumber>;

expectType<
  Step,
  | Brand<number, 'Finite' | 'Int' | 'SafeInt', 'NaN' | 'Zero'>
  | Exclude<SmallInt, 0>
>('=');
