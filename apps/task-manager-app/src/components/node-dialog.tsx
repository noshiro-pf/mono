import type {
  GenericEventHandler,
  RefCallback,
  SubmitEventHandler,
} from 'preact';
import { memoNamed } from 'preact-utils';
import { editorSignal, editorStore } from '../store/index.mjs';
import { DeleteControls } from './delete-controls.js';
import { MilestoneForm } from './milestone-form.js';
import { TaskForm } from './task-form.js';

/**
 * The dialog of one task or milestone, for viewing, editing, creating and
 * deleting it.
 *
 * A native `<dialog>` opened modal, so the page behind is inert and focus
 * stays inside; Escape and a tap on the backdrop close it. Styled with
 * Blueprint's dialog classes, and a full-screen sheet on a phone
 * (`index.css`). Whether it is open is the editor store's: the element
 * follows it.
 */
export const NodeDialog = memoNamed('NodeDialog', () => {
  const editor = editorSignal.value;

  return (
    <dialog
      ref={followOpen}
      aria-labelledby={TITLE_ID}
      className={'bp6-dialog node-dialog'}
      data-e2e={'node-dialog'}
      onCancel={onCancel}
    >
      {editor.type === 'closed' ? undefined : (
        <form className={'node-dialog-form'} onSubmit={onSubmit}>
          <div className={'bp6-dialog-header'}>
            <h2 className={'bp6-heading'} id={TITLE_ID}>
              {editor.type === 'task'
                ? editor.isNew
                  ? '新しいタスク'
                  : 'タスク'
                : editor.isNew
                  ? '新しいマイルストーン'
                  : 'マイルストーン'}
            </h2>
            <button
              aria-label={'閉じる'}
              className={'bp6-button bp6-minimal'}
              type={'button'}
              onClick={editorStore.close}
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
            {editor.type === 'task' ? (
              <TaskForm editor={editor} />
            ) : (
              <MilestoneForm editor={editor} />
            )}
          </div>
          <div className={'bp6-dialog-footer node-dialog-footer'}>
            {editor.isNew ? (
              <span />
            ) : (
              <DeleteControls confirming={editor.confirmingDelete} />
            )}
            <div className={'bp6-dialog-footer-actions'}>
              <button
                className={'bp6-button'}
                type={'button'}
                onClick={editorStore.close}
              >
                {'キャンセル'}
              </button>
              <button
                className={'bp6-button bp6-intent-primary'}
                data-e2e={'save'}
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

// Outside the component, since none of them reads its props.

// A modal dialog is opened by a call, not an attribute, so the element
// follows the store by subscribing to it for as long as it is mounted.
const followOpen: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) {
    return undefined;
  }

  dialog.addEventListener('click', onBackdropClick);

  const subscription = editorStore.editor.subscribe((editor) => {
    if (editor.type !== 'closed' && !dialog.open) {
      dialog.showModal();
    } else if (editor.type === 'closed' && dialog.open) {
      dialog.close();
    }
  });

  return () => {
    subscription.unsubscribe();

    dialog.removeEventListener('click', onBackdropClick);
  };
};

/** Escape: closed through the store, which then closes the element. */
const onCancel: GenericEventHandler<HTMLDialogElement> = (cancelled) => {
  cancelled.preventDefault();

  editorStore.close();
};

/**
 * The form fills the dialog, so a click whose target is the dialog itself
 * landed on the backdrop around it. Listened to on the element rather than
 * through JSX: the backdrop is a pointer convenience, and Escape is how a
 * keyboard closes the dialog.
 */
const onBackdropClick = (clicked: MouseEvent): void => {
  if (clicked.target === clicked.currentTarget) {
    editorStore.close();
  }
};

/**
 * Saves. A dependency row that is wrong holds the save back, and its error
 * is already on screen, so the first such row is brought into view and
 * focused instead.
 */
const onSubmit: SubmitEventHandler<HTMLFormElement> = (submitted) => {
  submitted.preventDefault();

  editorStore.save();

  const invalidRow = submitted.currentTarget.querySelector<HTMLElement>(
    '.dependency-row.invalid',
  );

  if (invalidRow === null) {
    return;
  }

  invalidRow.querySelector<HTMLSelectElement>('select')?.focus({
    preventScroll: true,
  });

  invalidRow.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

const TITLE_ID = 'node-dialog-title';
