import { Optional } from 'ts-data-forge';
import { createUiStore } from './ui-store.mjs';

describe(createUiStore, () => {
  test('switches the view', () => {
    const store = createUiStore({ initialView: 'list' });

    store.setView('dag');

    assert.strictEqual(Optional.unwrap(store.view.getSnapshot()), 'dag');
  });

  test('shows and dismisses a notice', () => {
    const store = createUiStore({ initialView: 'list' });

    store.showNotice('oops');

    assert.strictEqual(Optional.unwrap(store.notice.getSnapshot()), 'oops');

    store.dismissNotice();

    assert.isUndefined(Optional.unwrap(store.notice.getSnapshot()));
  });

  test('opens the display settings where it is told, and closes them', () => {
    const store = createUiStore({ initialView: 'dag' });

    assert.isUndefined(Optional.unwrap(store.settingsPanel.getSnapshot()));

    store.openSettings({ kind: 'sheet' });

    assert.deepStrictEqual(Optional.unwrap(store.settingsPanel.getSnapshot()), {
      kind: 'sheet',
    });

    store.closeSettings();

    assert.isUndefined(Optional.unwrap(store.settingsPanel.getSnapshot()));
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

    assert.isUndefined(Optional.unwrap(store.settingsPanel.getSnapshot()));

    store.openSettings({ kind: 'sheet' });

    store.placeSettings(popover);

    assert.deepStrictEqual(
      Optional.unwrap(store.settingsPanel.getSnapshot()),
      popover,
    );
  });

  test('closes the display settings when the view changes', () => {
    const store = createUiStore({ initialView: 'dag' });

    store.openSettings({ kind: 'sheet' });

    store.setView('list');

    assert.isUndefined(Optional.unwrap(store.settingsPanel.getSnapshot()));

    store.setView('dag');

    assert.isUndefined(Optional.unwrap(store.settingsPanel.getSnapshot()));
  });
});
