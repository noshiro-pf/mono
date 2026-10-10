import { memoNamed } from 'preact-utils';
import { editorStore } from '../store/index.mjs';

type Props = Readonly<{
  confirming: boolean;
}>;

/**
 * Delete, in two steps: the first press asks, the second deletes — the node
 * and every dependency on it.
 */
export const DeleteControls = memoNamed<Props>('DeleteControls', (props) => {
  const { confirming } = props;

  return confirming ? (
    <fieldset aria-label={'削除の確認'} className={'delete-confirm'}>
      <span>{'依存ごと削除しますか？'}</span>
      <button
        className={'bp6-button bp6-intent-danger'}
        data-e2e={'confirm-delete'}
        type={'button'}
        onClick={editorStore.confirmDelete}
      >
        {'削除する'}
      </button>
      <button
        className={'bp6-button'}
        type={'button'}
        onClick={editorStore.cancelDelete}
      >
        {'やめる'}
      </button>
    </fieldset>
  ) : (
    <button
      className={'bp6-button bp6-minimal bp6-intent-danger'}
      data-e2e={'delete'}
      type={'button'}
      onClick={editorStore.requestDelete}
    >
      {'削除'}
    </button>
  );
});
