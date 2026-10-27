import type { InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { RelaxedExclude } from 'ts-type-forge';
import { groupEditorStore, type GroupEditorState } from '../store/index.mjs';
import { followModal } from './follow-modal.mjs';

/**
 * The dialog of one group, for creating it, renaming it and deleting it —
 * which leaves its nodes where they are, in no group. Opened from
 * 「＋グループ」 in the header (a new group) or from a frame's title
 * (`dag-group-frame.tsx`); a native `<dialog>` as the node's is
 * (`node-dialog.tsx`).
 */
export const GroupDialog = (): JSX.Element => (
  <dialog
    ref={(dialog) => {
      followModal(
        dialog,
        groupEditorStore.editor,
        (editor) => editor.type !== 'closed',
        groupEditorStore.close,
      );
    }}
    aria-labelledby={constant(TITLE_ID)}
    class={constant('bp6-dialog node-dialog group-dialog')}
    data-e2e={constant('group-dialog')}
    onCancel={(cancelled) => {
      cancelled.preventDefault();

      groupEditorStore.close();
    }}
  >
    <MatchOptional
      value={view(groupEditorStore.editor, (editor) =>
        editor.type === 'closed' ? Optional.none : Optional.some(editor),
      )}
      some={(editor$) => <GroupForm editor={editor$} />}
    />
  </dialog>
);

type OpenGroupEditorState = RelaxedExclude<
  GroupEditorState,
  Readonly<{ type: 'closed' }>
>;

const GroupForm = ({
  editor,
}: Readonly<{
  editor: InitializedObservable<OpenGroupEditorState>;
}>): JSX.Element => (
  <form
    class={constant('node-dialog-form')}
    onSubmit={(submitted) => {
      submitted.preventDefault();

      groupEditorStore.save();
    }}
  >
    <div class={constant('bp6-dialog-header')}>
      <h2 class={constant('bp6-heading')} id={constant(TITLE_ID)}>
        {view(editor, ({ isNew }) => (isNew ? '新しいグループ' : 'グループ'))}
      </h2>
      <button
        aria-label={constant('閉じる')}
        class={constant('bp6-button bp6-minimal')}
        type={constant('button')}
        onClick={groupEditorStore.close}
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
      <label class={constant('bp6-label field')}>
        {constant('グループ名')}
        <input
          class={constant('bp6-input bp6-fill')}
          data-e2e={constant('group-title-input')}
          required={constant(true)}
          type={constant('text')}
          value={view(editor, ({ title }) => title)}
          onInput={(input) => {
            groupEditorStore.setTitle(input.currentTarget.value);
          }}
        />
      </label>
      <p class={constant('bp6-text-muted')}>
        {constant(
          'DAG でノードを枠の中へドラッグするとグループに入り、枠の外へドラッグすると外れます。',
        )}
      </p>
    </div>
    <div class={constant('bp6-dialog-footer node-dialog-footer')}>
      <If
        cond={view(editor, ({ isNew }) => isNew)}
        then={<span />}
        else={
          <If
            cond={view(editor, ({ confirmingDelete }) => confirmingDelete)}
            then={
              <fieldset
                aria-label={constant('削除の確認')}
                class={constant('delete-confirm')}
              >
                <span>
                  {constant('グループを削除しますか？（ノードは残ります）')}
                </span>
                <button
                  class={constant('bp6-button bp6-intent-danger')}
                  data-e2e={constant('confirm-delete-group')}
                  type={constant('button')}
                  onClick={groupEditorStore.confirmDelete}
                >
                  {constant('削除する')}
                </button>
                <button
                  class={constant('bp6-button')}
                  type={constant('button')}
                  onClick={groupEditorStore.cancelDelete}
                >
                  {constant('やめる')}
                </button>
              </fieldset>
            }
            else={
              <button
                class={constant('bp6-button bp6-minimal bp6-intent-danger')}
                data-e2e={constant('delete-group')}
                type={constant('button')}
                onClick={groupEditorStore.requestDelete}
              >
                {constant('削除')}
              </button>
            }
          />
        }
      />
      <div class={constant('bp6-dialog-footer-actions')}>
        <button
          class={constant('bp6-button')}
          type={constant('button')}
          onClick={groupEditorStore.close}
        >
          {constant('キャンセル')}
        </button>
        <button
          class={constant('bp6-button bp6-intent-primary')}
          data-e2e={constant('save-group')}
          type={constant('submit')}
        >
          {constant('保存')}
        </button>
      </div>
    </div>
  </form>
);

const TITLE_ID = 'group-dialog-title';
