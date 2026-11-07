/**
 * -1 for the arrow keys that go to the item before (left, up), 1 for those
 * that go to the one after (right, down), and `undefined` for other keys.
 */
export const arrowDirection = (key: string): -1 | 1 | undefined =>
  key === 'ArrowLeft' || key === 'ArrowUp'
    ? -1
    : key === 'ArrowRight' || key === 'ArrowDown'
      ? 1
      : undefined;

/**
 * The index `step` from `index` among `length` items, wrapping from the last to
 * the first and from the first to the last, for an `index` in `[0, length)`.
 */
export const stepAround = (
  index: number,
  step: -1 | 1,
  length: number,
): number => {
  const next = index + step;

  return next < 0 ? length - 1 : next >= length ? 0 : next;
};

if (import.meta.vitest !== undefined) {
  describe(stepAround, () => {
    test('steps within the items', () => {
      assert.strictEqual(stepAround(1, 1, 3), 2);

      assert.strictEqual(stepAround(1, -1, 3), 0);
    });

    test('wraps around either end', () => {
      assert.strictEqual(stepAround(2, 1, 3), 0);

      assert.strictEqual(stepAround(0, -1, 3), 2);
    });
  });
}
