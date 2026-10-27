import { asGroupId } from '../domain/index.mjs';
import type { View } from '../view-model/index.mjs';
import { createDagFilterStore } from './dag-filter-store.mjs';
import { createDagViewModeStore } from './dag-view-mode-store.mjs';
import { createUiStore } from './ui-store.mjs';
import { createViewQuerySync } from './view-query-sync.mjs';

const setup = (
  search: string,
  initialView: View = 'dag',
): Readonly<{
  ui: ReturnType<typeof createUiStore>;
  mode: ReturnType<typeof createDagViewModeStore>;
  filter: ReturnType<typeof createDagFilterStore>;
  written: readonly string[];
  stopSync: () => void;
}> => {
  const mut_written: string[] = [];

  let mut_search = search;

  const ui = createUiStore({ initialView });

  const mode = createDagViewModeStore({
    initial: 'dag',
    save: () => {},
  });

  const filter = createDagFilterStore({
    initial: { groups: [], labels: [] },
  });

  const stopSync = createViewQuerySync({
    view: ui.view,
    mode: mode.mode,
    filter: filter.filter,
    read: () => mut_search,
    write: (next) => {
      mut_search = next;

      mut_written.push(next);
    },
  }).start();

  return { ui, mode, filter, written: mut_written, stopSync };
};

describe(createViewQuerySync, () => {
  test('writes the screen and the graph’s mode as they change', () => {
    const { ui, mode, written } = setup('?storage=memory');

    ui.setView('list');

    mode.set('arc');

    ui.setView('dag');

    assert.deepStrictEqual(written, [
      '?storage=memory&mode=dag',
      '?storage=memory&view=list',
      '?storage=memory&mode=arc',
    ]);
  });

  test('takes out what the URL said that is not shown', () => {
    const { written } = setup('?view=board&mode=x');

    assert.deepStrictEqual(written, ['?mode=dag']);
  });

  test('writes nothing when the URL already says it', () => {
    const { mode, written } = setup('?storage=memory&view=list', 'list');

    mode.set('tile');

    assert.deepStrictEqual(written, []);
  });

  test('writes the graph’s filter while the graph is shown', () => {
    const { ui, filter, written } = setup('?mode=dag');

    filter.toggleGroup(asGroupId('g1'));

    filter.toggleLabel(undefined);

    ui.setView('list');

    ui.setView('dag');

    assert.deepStrictEqual(written, [
      '?mode=dag&group=g1',
      '?mode=dag&group=g1&label=',
      '?view=list',
      '?mode=dag&group=g1&label=',
    ]);
  });

  test('stops writing once stopped', () => {
    const { ui, written, stopSync } = setup('?mode=dag');

    stopSync();

    ui.setView('list');

    assert.deepStrictEqual(written, []);
  });
});
