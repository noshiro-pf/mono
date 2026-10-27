import {
  POPOVER_GAP,
  POPOVER_MARGIN,
  settingsPanelPlacement,
} from './settings-panel.mjs';

describe(settingsPanelPlacement, () => {
  const screenSize = { width: 1280, height: 800 } as const;

  test('is a sheet at the bottom on a narrow screen, wherever the button is', () => {
    assert.deepStrictEqual(
      settingsPanelPlacement({ bottom: 120, right: 380 }, screenSize, true),
      { kind: 'sheet' },
    );
  });

  test('hangs below the button, their right edges aligned, on a wide one', () => {
    assert.deepStrictEqual(
      settingsPanelPlacement({ bottom: 100, right: 1268 }, screenSize, false),
      {
        kind: 'popover',
        top: 100 + POPOVER_GAP,
        right: 1280 - 1268,
        maxHeight: 800 - 100 - POPOVER_GAP - POPOVER_MARGIN,
      },
    );
  });

  test('stays clear of the edges of the screen', () => {
    const placed = settingsPanelPlacement(
      { bottom: 795, right: 1279 },
      screenSize,
      false,
    );

    assert.deepStrictEqual(placed, {
      kind: 'popover',
      top: 795 + POPOVER_GAP,
      right: POPOVER_MARGIN,
      maxHeight: 0,
    });
  });
});
