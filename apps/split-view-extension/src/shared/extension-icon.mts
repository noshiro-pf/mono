import { Num } from 'ts-data-forge';

/**
 * The extension's icon, in unit space: a rounded square in the blue the
 * interface uses for anything active, with four white panes in it.
 *
 * Drawn in two places — into `public/icons/` by `scripts/gen-icons.mts`, and,
 * in another colour and with its panes faded, under the number in a split
 * view's favicon by `src/state/tab-identity.mts` — so that the tab shows the
 * shape the toolbar does, and the shape has one definition.
 */
export const extensionIcon = {
  background: [79, 127, 217],
  pane: [255, 255, 255],
  /** How far the rounded square is inset, and how round it is. */
  squareInset: 0.02,
  squareRadius: 0.2,
  /** Where the four panes sit inside it, and how far apart. */
  paneInset: 0.2,
  paneGutter: 0.07,
} as const;

/**
 * Where the four panes start and end along either axis, in whole pixels.
 *
 * Snapped, because the alternative is what 16px looked like when this was
 * fractions of a unit square: a one-pixel gutter spread across two pixels at
 * half strength, and four panes that read as one grey smudge.
 */
export const extensionIconPaneBoundsOf = (
  size: number,
): readonly [number, number, number, number] => {
  const inset = Math.max(1, Math.round(extensionIcon.paneInset * size));

  const gutter = Math.max(1, Math.round(extensionIcon.paneGutter * size));

  const span = Math.max(1, Math.floor(Num.div(size - 2 * inset - gutter, 2)));

  return [inset, inset + span, size - inset - span, size - inset];
};
