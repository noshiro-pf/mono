type SmallInt = Int9;

/**
 * @throws Will throw an error if the argument is not safe integer.
 * @param start
 * @param end
 * @param step default value is 1
 */
export function* range(
  start: SafeInt | SmallInt,
  end: SafeInt | SmallInt,
  step: SafeInt | SmallInt = 1
): Generator<number, void, unknown> {
  // eslint-disable-next-line functional/no-let
  for (let i = start; i !== end; i += step) {
    yield i;
  }
}
