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
