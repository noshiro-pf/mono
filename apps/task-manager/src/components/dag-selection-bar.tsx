import { constant, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { nodeRefOf } from '../domain/index.mjs';
import {
  bulkDeleteStore,
  bulkEditStore,
  dagSelectionStore,
} from '../store/index.mjs';

/**
 * While nodes are selected on the DAG (`dag-canvas.tsx`): how many, and
 * 「一括編集」, which opens the dialog that edits them together
 * (`bulk-edit-dialog.tsx`), 「削除」, which asks before deleting them
 * (`bulk-delete-store.mts`), and 「選択解除」. Nothing while none are.
 */
export const DagSelectionBar = (): JSX.Element => (
  <If
    cond={view(dagSelectionStore.selected, Arr.isNonEmpty)}
    then={
      <div
        aria-label={constant('選択したノード')}
        class={constant('dag-selection-bar')}
        data-e2e={constant('dag-selection-bar')}
        role={constant('toolbar')}
      >
        <If
          cond={bulkDeleteStore.confirming}
          then={
            <>
              <output data-e2e={constant('dag-bulk-delete-question')}>
                {view(
                  dagSelectionStore.selected,
                  (ids) => `${ids.length} 件を依存ごと削除しますか？`,
                )}
              </output>
              <button
                class={constant('bp6-button bp6-intent-danger')}
                data-e2e={constant('dag-bulk-delete-confirm')}
                type={constant('button')}
                onClick={bulkDeleteStore.confirm}
              >
                {constant('削除する')}
              </button>
              <button
                class={constant('bp6-button bp6-minimal')}
                type={constant('button')}
                onClick={bulkDeleteStore.cancel}
              >
                {constant('やめる')}
              </button>
            </>
          }
          else={
            <>
              <output data-e2e={constant('dag-selection-count')}>
                {view(
                  dagSelectionStore.selected,
                  (ids) => `${ids.length} 件を選択中`,
                )}
              </output>
              <button
                class={constant('bp6-button bp6-intent-primary')}
                data-e2e={constant('dag-bulk-edit')}
                type={constant('button')}
                onClick={() => {
                  bulkEditStore.open(
                    dagSelectionStore.selected
                      .getSnapshot()
                      .value.map(nodeRefOf),
                  );
                }}
              >
                {constant('一括編集')}
              </button>
              <button
                class={constant('bp6-button bp6-minimal bp6-intent-danger')}
                data-e2e={constant('dag-bulk-delete')}
                type={constant('button')}
                onClick={bulkDeleteStore.request}
              >
                {constant('削除')}
              </button>
              <button
                class={constant('bp6-button bp6-minimal')}
                data-e2e={constant('dag-clear-selection')}
                type={constant('button')}
                onClick={dagSelectionStore.clear}
              >
                {constant('選択解除')}
              </button>
            </>
          }
        />
      </div>
    }
  />
);
