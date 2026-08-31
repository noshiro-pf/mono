import { type FixedLengthTuple } from 'ts-type-forge';
import { type TwoDiceSumValue } from '../types/index.mjs';
import { twoDiceSumSet } from './two-dice-sum-set.mjs';

const values: readonly TwoDiceSumValue[] = twoDiceSumSet().toArray();

/**
 * Every strictly ascending triple of column numbers.
 *
 * The pre-restoration version wrote this as three nested `for` loops that
 * `continue`d past `y <= x` and `z <= y`, then sorted each triple. Slicing
 * says the same thing directly: each element is drawn from beyond the last,
 * so the result is ascending by construction and there is nothing left to
 * sort.
 */
export const selected3List = (): readonly FixedLengthTuple<
  3,
  TwoDiceSumValue
>[] =>
  values.flatMap((x, xIndex) =>
    values
      .slice(xIndex + 1)
      .flatMap((y, yOffset) =>
        values
          .slice(xIndex + yOffset + 2)
          .map((z): FixedLengthTuple<3, TwoDiceSumValue> => [x, y, z]),
      ),
  );
