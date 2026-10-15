import { createDagViewModeStore } from './dag-view-mode-store.mjs';
import { createUiStore } from './ui-store.mjs';
import { createViewQuerySync } from './view-query-sync.mjs';

const setup = (
  search: string,
): Readonly<{
  ui: ReturnType<typeof createUiStore>;
  mode: ReturnType<typeof createDagViewModeStore>;
  written: readonly string[];
  stopSync: () => void;
}> => {
  const mut_written: string[] = [];

  let mut_search = search;

  const ui = createUiStore({ initialView: 'list' });

  const mode = createDagViewModeStore({
    initial: 'dag',
    save: () => {},
  });

  const stopSync = createViewQuerySync({
    view: ui.view,
    mode: mode.mode,
    read: () => mut_search,
    write: (next) => {
      mut_search = next;

      mut_written.push(next);
    },
  }).start();

  return { ui, mode, written: mut_written, stopSync };
};

describe(createViewQuerySync, () => {
  test('writes the screen and the graph’s mode as they change', () => {
    const { ui, mode, written } = setup('?storage=memory');

    ui.setView('dag');

    mode.set('arc');

    ui.setView('list');

    assert.deepStrictEqual(written, [
      '?storage=memory&view=dag&mode=dag',
      '?storage=memory&view=dag&mode=arc',
      '?storage=memory',
    ]);
  });

  test('takes out what the URL said that is not shown', () => {
    const { written } = setup('?view=board');

    assert.deepStrictEqual(written, ['']);
  });

  test('writes nothing when the URL already says it', () => {
    const { mode, written } = setup('?storage=memory');

    mode.set('tile');

    assert.deepStrictEqual(written, []);
  });

  test('stops writing once stopped', () => {
    const { ui, written, stopSync } = setup('');

    stopSync();

    ui.setView('dag');

    assert.deepStrictEqual(written, []);
  });
});
