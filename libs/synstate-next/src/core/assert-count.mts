/** Throws a `RangeError` unless `count` is a safe integer of at least `minimum`. */
export const assertCount = (count: number, minimum: number): void => {
  if (!Number.isSafeInteger(count) || count < minimum) {
    throw new RangeError(
      `synstate-next: the count must be an integer of at least ${minimum}, but was ${count}.`,
    );
  }
};
