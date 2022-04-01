import { isSafeInt } from '../validator';

/**
 * @throws Will throw an error if the argument is not safe integer.
 * @param start
 * @param end
 * @param step default value is 1
 */
export function* range(
  start: number,
  end: number,
  step: number = 1
): Generator<number, void, unknown> {
  if (!isSafeInt(start)) {
    throw new Error('start must be a safe integer.');
  }
  if (!isSafeInt(end)) {
    throw new Error('end must be a safe integer.');
  }
  if (!isSafeInt(step)) {
    throw new Error('step must be a safe integer.');
  }
  // eslint-disable-next-line functional/no-let
  for (let i = start; i !== end; i += step) {
    yield i;
  }
}
