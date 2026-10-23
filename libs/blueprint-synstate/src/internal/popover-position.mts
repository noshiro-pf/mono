/** Where a popover hanging from its target is drawn, in viewport pixels. */
export type PopoverPosition = Readonly<{
  placement: 'bottom' | 'top';
  left: number;
  top: number;
  /** The arrow's left edge, from the popover's. */
  arrowLeft: number;
}>;

type Rect = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

/**
 * Where Blueprint's popover with placement `bottom-start` goes, as Popper
 * places it there: below the target by half the arrow's size, its left edge
 * at the target's; above instead when it fits there and not below; moved
 * sideways to stay in the viewport. The arrow points at the middle of the
 * target, kept within the popover.
 */
export const placeBottomStart = (
  target: Rect,
  popover: Readonly<{ width: number; height: number }>,
  viewport: Readonly<{ width: number; height: number }>,
): PopoverPosition => {
  const below = target.top + target.height + ARROW_OFFSET;

  const above = target.top - ARROW_OFFSET - popover.height;

  const fitsBelow = below + popover.height <= viewport.height;

  const placement = !fitsBelow && above >= 0 ? 'top' : 'bottom';

  const left = clamp(
    target.left,
    0,
    Math.max(0, viewport.width - popover.width),
  );

  const arrowLeft = clamp(
    target.left + target.width / 2 - left - ARROW_SIZE / 2,
    0,
    Math.max(0, popover.width - ARROW_SIZE),
  );

  return {
    placement,
    left,
    top: placement === 'bottom' ? below : above,
    arrowLeft,
  };
};

/** The width and height of Blueprint's popover arrow. */
export const ARROW_SIZE = 30;

/** How far the popover stands off its target: half the arrow. */
const ARROW_OFFSET = ARROW_SIZE / 2;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

if (import.meta.vitest !== undefined) {
  describe(placeBottomStart, () => {
    const viewport = { width: 400, height: 800 } as const;

    const popover = { width: 250, height: 300 } as const;

    test('hangs below the target from its left edge', () => {
      assert.deepStrictEqual(
        placeBottomStart(
          { left: 20, top: 100, width: 300, height: 40 },
          popover,
          viewport,
        ),
        { placement: 'bottom', left: 20, top: 155, arrowLeft: 135 },
      );
    });

    test('moves left to stay in the viewport', () => {
      const position = placeBottomStart(
        { left: 300, top: 100, width: 80, height: 40 },
        popover,
        viewport,
      );

      assert.strictEqual(position.left, 150);

      // The middle of the target, 340, less the left edge and half the arrow.
      assert.strictEqual(position.arrowLeft, 175);
    });

    test('goes above when it fits only there', () => {
      const position = placeBottomStart(
        { left: 20, top: 600, width: 300, height: 40 },
        popover,
        viewport,
      );

      assert.strictEqual(position.placement, 'top');

      assert.strictEqual(position.top, 285);
    });

    test('stays below when it fits on neither side', () => {
      assert.strictEqual(
        placeBottomStart(
          { left: 20, top: 200, width: 300, height: 40 },
          { width: 250, height: 700 },
          viewport,
        ).placement,
        'bottom',
      );
    });

    test('keeps the arrow within a popover narrower than the target', () => {
      assert.strictEqual(
        placeBottomStart(
          { left: 0, top: 0, width: 400, height: 40 },
          { width: 100, height: 100 },
          viewport,
        ).arrowLeft,
        70,
      );
    });
  });
}
