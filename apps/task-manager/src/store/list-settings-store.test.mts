import {
  DEFAULT_LIST_SETTINGS,
  type ListSettings,
} from '../view-model/index.mjs';
import { createListSettingsStore } from './list-settings-store.mjs';

const setup = (): Readonly<{
  store: ReturnType<typeof createListSettingsStore>;
  saved: readonly ListSettings[];
}> => {
  const mut_saved: ListSettings[] = [];

  const store = createListSettingsStore({
    initial: DEFAULT_LIST_SETTINGS,
    save: (settings) => {
      mut_saved.push(settings);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createListSettingsStore, () => {
  test('edits the sort keys', () => {
    const { store } = setup();

    store.addKey('title');

    store.removeKey(0);

    store.moveKey(0, 1);

    store.toggleOrder(2);

    assert.deepStrictEqual(store.settings.getSnapshot().value.sort, [
      { key: 'dueDate', order: 'asc' },
      { key: 'priority', order: 'asc' },
      { key: 'title', order: 'desc' },
    ]);
  });

  test('saves every change', () => {
    const { store, saved } = setup();

    store.setHideDone(true);

    assert.deepStrictEqual(saved, [
      DEFAULT_LIST_SETTINGS,
      { ...DEFAULT_LIST_SETTINGS, hideDone: true },
    ]);
  });
});
