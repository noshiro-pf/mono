import { type GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { listSettingsSignal, listSettingsStore } from '../store/index.mjs';
import { SortEditor } from './sort-editor.js';

/**
 * Whether done tasks are shown, and the sort keys — behind a disclosure, so
 * they take no room on a phone until asked for.
 */
export const ListToolbar = memoNamed('ListToolbar', () => {
  const { hideDone, sort } = listSettingsSignal.value;

  return (
    <div className={'list-toolbar'}>
      <label className={'bp6-control bp6-switch toolbar-switch'}>
        <input
          checked={hideDone}
          className={'bp6-control-input'}
          data-e2e={'hide-done'}
          type={'checkbox'}
          onChange={onHideDoneChange}
        />
        <span className={'bp6-control-indicator'} />
        {'完了を隠す'}
      </label>
      <details className={'sort-details'}>
        <summary className={'bp6-button sort-summary'}>{'並べ替え'}</summary>
        <SortEditor
          actions={listSettingsStore}
          data-e2e={'list-sort-editor'}
          emptyNote={'並べ替えのキーはありません。'}
          label={'並べ替えのキー'}
          sort={sort}
        />
      </details>
    </div>
  );
});

const onHideDoneChange: GenericEventHandler<HTMLInputElement> = (changed) => {
  listSettingsStore.setHideDone(changed.currentTarget.checked);
};
