import { createUiStore } from './ui-store.mjs';

describe(createUiStore, () => {
  test('switches the view', () => {
    const store = createUiStore({ initialView: 'list' });

    store.setView('dag');

    assert.strictEqual(store.view.getSnapshot().value, 'dag');
  });

  test('shows and dismisses a notice', () => {
    const store = createUiStore({ initialView: 'list' });

    store.showNotice('oops');

    assert.strictEqual(store.notice.getSnapshot().value, 'oops');

    store.dismissNotice();

    assert.isUndefined(store.notice.getSnapshot().value);
  });

  test('opens the display settings where it is told, and closes them', () => {
    const store = createUiStore({ initialView: 'dag' });

    assert.isUndefined(store.settingsPanel.getSnapshot().value);

    store.openSettings({ kind: 'sheet' });

    assert.deepStrictEqual(store.settingsPanel.getSnapshot().value, {
      kind: 'sheet',
    });

    store.closeSettings();

    assert.isUndefined(store.settingsPanel.getSnapshot().value);
  });

  test('moves the open display settings, and does not open them so', () => {
    const store = createUiStore({ initialView: 'dag' });

    const popover = {
      kind: 'popover',
      top: 60,
      right: 12,
      maxHeight: 700,
    } as const;

    store.placeSettings(popover);

    assert.isUndefined(store.settingsPanel.getSnapshot().value);

    store.openSettings({ kind: 'sheet' });

    store.placeSettings(popover);

    assert.deepStrictEqual(store.settingsPanel.getSnapshot().value, popover);
  });

  test('closes the display settings when the view changes', () => {
    const store = createUiStore({ initialView: 'dag' });

    store.openSettings({ kind: 'sheet' });

    store.setView('list');

    assert.isUndefined(store.settingsPanel.getSnapshot().value);

    store.setView('dag');

    assert.isUndefined(store.settingsPanel.getSnapshot().value);
  });
});
