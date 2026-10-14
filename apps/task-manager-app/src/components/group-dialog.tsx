import type {
  GenericEventHandler,
  RefCallback,
  SubmitEventHandler,
} from 'preact';
import { memoNamed } from 'preact-utils';
import { groupEditorSignal, groupEditorStore } from '../store/index.mjs';
import { closeOnBackdropClick } from './close-on-backdrop-click.mjs';

/**
 * The dialog of one group, for creating it, renaming it and deleting it —
 * which leaves its nodes where they are, in no group. Opened from
 * 「＋グループ」 in the header (a new group) or from a frame's title
 * (`dag-group-frame.tsx`); a native `<dialog>` as the node's is
 * (`node-dialog.tsx`).
 */
export const GroupDialog = memoNamed('GroupDialog', () => {
  const editor = groupEditorSignal.value;

  return (
    <dialog
      ref={followOpen}
      aria-labelledby={TITLE_ID}
      className={'bp6-dialog node-dialog group-dialog'}
      data-e2e={'group-dialog'}
      onCancel={onCancel}
    >
      {editor.type === 'closed' ? undefined : (
        <form className={'node-dialog-form'} onSubmit={onSubmit}>
          <div className={'bp6-dialog-header'}>
            <h2 className={'bp6-heading'} id={TITLE_ID}>
              {editor.isNew ? '新しいグループ' : 'グループ'}
            </h2>
            <button
              aria-label={'閉じる'}
              className={'bp6-button bp6-minimal'}
              type={'button'}
              onClick={groupEditorStore.close}
            >
              {'×'}
            </button>
          </div>
          <div className={'bp6-dialog-body node-dialog-body'}>
            {editor.error === undefined ? undefined : (
              <p className={'bp6-callout bp6-intent-danger'} role={'alert'}>
                {editor.error}
              </p>
            )}
            <label className={'bp6-label field'}>
              {'グループ名'}
              <input
                className={'bp6-input bp6-fill'}
                data-e2e={'group-title-input'}
                required
                type={'text'}
                value={editor.title}
                onInput={onTitle}
              />
            </label>
            <p className={'bp6-text-muted'}>
              {
                'DAG でノードを枠の中へドラッグするとグループに入り、枠の外へドラッグすると外れます。'
              }
            </p>
          </div>
          <div className={'bp6-dialog-footer node-dialog-footer'}>
            {editor.isNew ? (
              <span />
            ) : editor.confirmingDelete ? (
              <fieldset aria-label={'削除の確認'} className={'delete-confirm'}>
                <span>{'グループを削除しますか？（ノードは残ります）'}</span>
                <button
                  className={'bp6-button bp6-intent-danger'}
                  data-e2e={'confirm-delete-group'}
                  type={'button'}
                  onClick={groupEditorStore.confirmDelete}
                >
                  {'削除する'}
                </button>
                <button
                  className={'bp6-button'}
                  type={'button'}
                  onClick={groupEditorStore.cancelDelete}
                >
                  {'やめる'}
                </button>
              </fieldset>
            ) : (
              <button
                className={'bp6-button bp6-minimal bp6-intent-danger'}
                data-e2e={'delete-group'}
                type={'button'}
                onClick={groupEditorStore.requestDelete}
              >
                {'削除'}
              </button>
            )}
            <div className={'bp6-dialog-footer-actions'}>
              <button
                className={'bp6-button'}
                type={'button'}
                onClick={groupEditorStore.close}
              >
                {'キャンセル'}
              </button>
              <button
                className={'bp6-button bp6-intent-primary'}
                data-e2e={'save-group'}
                type={'submit'}
              >
                {'保存'}
              </button>
            </div>
          </div>
        </form>
      )}
    </dialog>
  );
});

// As the node's dialog does (`node-dialog.tsx`).
const followOpen: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) {
    return undefined;
  }

  const stopClosingOnBackdropClick = closeOnBackdropClick(
    dialog,
    groupEditorStore.close,
  );

  const subscription = groupEditorStore.editor.subscribe((editor) => {
    if (editor.type !== 'closed' && !dialog.open) {
      dialog.showModal();
    } else if (editor.type === 'closed' && dialog.open) {
      dialog.close();
    }
  });

  return () => {
    subscription.unsubscribe();

    stopClosingOnBackdropClick();
  };
};

const onCancel: GenericEventHandler<HTMLDialogElement> = (cancelled) => {
  cancelled.preventDefault();

  groupEditorStore.close();
};

const onSubmit: SubmitEventHandler<HTMLFormElement> = (submitted) => {
  submitted.preventDefault();

  groupEditorStore.save();
};

const onTitle: GenericEventHandler<HTMLInputElement> = (input) => {
  groupEditorStore.setTitle(input.currentTarget.value);
};

const TITLE_ID = 'group-dialog-title';
