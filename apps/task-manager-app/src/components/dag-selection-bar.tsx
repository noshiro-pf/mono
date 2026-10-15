import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import { nodeRefOf } from '../domain/index.mjs';
import {
  bulkEditStore,
  dagSelectionSignal,
  dagSelectionStore,
} from '../store/index.mjs';

/**
 * While nodes are selected on the DAG (`dag-canvas.tsx`): how many, and
 * 「一括編集」, which opens the dialog that edits them together
 * (`bulk-edit-dialog.tsx`), and 「選択解除」. Nothing while none are.
 */
export const DagSelectionBar = memoNamed('DagSelectionBar', () => {
  const selected = dagSelectionSignal.value;

  return Arr.isNonEmpty(selected) ? (
    <div
      aria-label={'選択したノード'}
      className={'dag-selection-bar'}
      data-e2e={'dag-selection-bar'}
      role={'toolbar'}
    >
      <output data-e2e={'dag-selection-count'}>
        {`${selected.length} 件を選択中`}
      </output>
      <button
        className={'bp6-button bp6-intent-primary'}
        data-e2e={'dag-bulk-edit'}
        type={'button'}
        onClick={openBulkEdit}
      >
        {'一括編集'}
      </button>
      <button
        className={'bp6-button bp6-minimal'}
        data-e2e={'dag-clear-selection'}
        type={'button'}
        onClick={dagSelectionStore.clear}
      >
        {'選択解除'}
      </button>
    </div>
  ) : undefined;
});

const openBulkEdit = (): void => {
  bulkEditStore.open(
    dagSelectionStore.selected.getSnapshot().value.map(nodeRefOf),
  );
};
