import type { InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { RelaxedExclude } from 'ts-type-forge';
import { m } from '../i18n/index.mjs';
import { editorStore, type EditorState } from '../store/index.mjs';
import { DeleteControls } from './delete-controls.js';
import { followModal } from './follow-modal.mjs';
import { MilestoneForm } from './milestone-form.js';
import { TaskForm } from './task-form.js';

/**
 * The dialog of one task or milestone, for viewing, editing, creating and
 * deleting it.
 *
 * A native `<dialog>` opened modal, so the page behind is inert and focus stays
 * inside; Escape and a tap on the backdrop close it. Styled with
 * Blueprint's dialog classes, and a full-screen sheet on a phone (`index.css`).
 * Whether it is open is the editor store's: the element follows it
 * (`follow-modal.mts`), and its form is built afresh each time it opens.
 */
export const NodeDialog = (): JSX.Element => (
  <dialog
    ref={(dialog) => {
      followModal(
        dialog,
        editorStore.editor,
        (editor) => editor.type !== 'closed',
        editorStore.close,
      );
    }}
    aria-labelledby={constant(TITLE_ID)}
    class={constant('bp6-dialog node-dialog')}
    data-e2e={constant('node-dialog')}
    onCancel={(cancelled) => {
      // Closed through the store, which then closes the element.
      cancelled.preventDefault();

      editorStore.close();
    }}
  >
    <MatchOptional
      value={view(editorStore.editor, (editor) =>
        editor.type === 'closed' ? Optional.none : Optional.some(editor),
      )}
      some={(editor$) => <NodeForm editor={editor$} />}
    />
  </dialog>
);

/** The editor while it is open. */
type OpenEditorState = RelaxedExclude<
  EditorState,
  Readonly<{ type: 'closed' }>
>;

/**
 * Saves. A dependency row that is wrong holds the save back, and its error is
 * already on screen, so the first such row is brought into view and focused
 * instead.
 */
const onSubmit = (
  submitted: Event & Readonly<{ currentTarget: Element }>,
): void => {
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

const NodeForm = ({
  editor,
}: Readonly<{
  editor: InitializedObservable<OpenEditorState>;
}>): JSX.Element => (
  <form class={constant('node-dialog-form')} onSubmit={onSubmit}>
    <div class={constant('bp6-dialog-header')}>
      <h2 class={constant('bp6-heading')} id={constant(TITLE_ID)}>
        {view(editor, ({ type, isNew }) =>
          type === 'task'
            ? isNew
              ? m.nodeDialog.newTask
              : m.nodeKinds.task
            : isNew
              ? m.nodeDialog.newMilestone
              : m.nodeKinds.milestone,
        )}
      </h2>
      <button
        aria-label={constant(m.common.close)}
        class={constant('bp6-button bp6-minimal')}
        type={constant('button')}
        onClick={editorStore.close}
      >
        {constant('×')}
      </button>
    </div>
    <div class={constant('bp6-dialog-body node-dialog-body')}>
      <If
        cond={view(editor, ({ error }) => error !== undefined)}
        then={
          <p
            class={constant('bp6-callout bp6-intent-danger')}
            role={constant('alert')}
          >
            {view(editor, ({ error }) => error ?? '')}
          </p>
        }
      />
      <MatchOptional
        value={view(editor, (e) =>
          e.type === 'task' ? Optional.some(e) : Optional.none,
        )}
        some={(task$) => <TaskForm editor={task$} />}
      />
      <MatchOptional
        value={view(editor, (e) =>
          e.type === 'milestone' ? Optional.some(e) : Optional.none,
        )}
        some={(milestone$) => <MilestoneForm editor={milestone$} />}
      />
    </div>
    <div class={constant('bp6-dialog-footer node-dialog-footer')}>
      <If
        cond={view(editor, ({ isNew }) => isNew)}
        then={<span />}
        else={
          <DeleteControls
            confirming={view(editor, (e) => e.confirmingDelete)}
          />
        }
      />
      <div class={constant('bp6-dialog-footer-actions')}>
        <button
          class={constant('bp6-button')}
          type={constant('button')}
          onClick={editorStore.close}
        >
          {constant(m.common.cancel)}
        </button>
        <button
          class={constant('bp6-button bp6-intent-primary')}
          data-e2e={constant('save')}
          type={constant('submit')}
        >
          {constant(m.common.save)}
        </button>
      </div>
    </div>
  </form>
);

const TITLE_ID = 'node-dialog-title';
