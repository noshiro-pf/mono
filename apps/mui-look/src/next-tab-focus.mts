import { Num } from 'ts-data-forge';

/**
 * The tab a key moves the focus to, from the one at `current` of `count`, as in
 * the WAI-ARIA tabs pattern and MUI's `Tabs`: the arrow keys move to the next
 * or the previous tab and wrap around, Home and End jump to the first and the
 * last. `undefined` for any other key, which moves nothing.
 */
export const nextTabFocus = (
  key: string,
  current: number,
  count: number,
): number | undefined => {
  if (!Num.isNonZero(count)) {
    return undefined;
  }

  switch (key) {
    case 'ArrowRight':
      return Num.rem(current + 1, count);

    case 'ArrowLeft':
      return Num.rem(current - 1 + count, count);

    case 'Home':
      return 0;

    case 'End':
      return count - 1;

    default:
      return undefined;
  }
};
