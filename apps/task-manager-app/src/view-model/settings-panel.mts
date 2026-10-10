/**
 * Where the graph screen's 「表示設定」 panel opens: a popover hanging from
 * its button on a wide screen, a sheet across the bottom on a narrow one,
 * where a popover would be cramped and out of the thumb's reach. Worked out
 * from the button's box when it opens.
 */

export type SettingsPanelPlacement = Readonly<
  | { kind: 'sheet' }
  | {
      kind: 'popover';
      /** From the top of the screen to the top of the panel. */
      top: number;
      /** From the right of the screen to the right of the panel. */
      right: number;
      /** What is left below it, for a panel that scrolls rather than spill. */
      maxHeight: number;
    }
>;

/** Between the button and the panel. */
export const POPOVER_GAP = 6;

/** The least the panel keeps clear of the screen's edges. */
export const POPOVER_MARGIN = 8;

/**
 * The panel of a button whose box ends at `anchor`, on a screen
 * `screenSize` big, `narrow` or not (`store.mts`, `NARROW_QUERY`).
 */
export const settingsPanelPlacement = (
  anchor: Readonly<{ bottom: number; right: number }>,
  screenSize: Readonly<{ width: number; height: number }>,
  narrow: boolean,
): SettingsPanelPlacement => {
  if (narrow) {
    return { kind: 'sheet' };
  }

  const panelTop = anchor.bottom + POPOVER_GAP;

  return {
    kind: 'popover',
    top: panelTop,
    right: Math.max(POPOVER_MARGIN, screenSize.width - anchor.right),
    maxHeight: Math.max(0, screenSize.height - panelTop - POPOVER_MARGIN),
  };
};
