import type {
  GenericEventHandler,
  RefCallback,
  SubmitEventHandler,
} from 'preact';
import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import {
  GroupIdCodec,
  ProgressCodec,
  progresses,
  type NodeEdit,
} from '../domain/index.mjs';
import {
  bulkEditSignal,
  bulkEditStore,
  domainSignal,
  groupsSignal,
} from '../store/index.mjs';
import { parseLabels, progressLabels } from '../view-model/index.mjs';
import { closeOnBackdropClick } from './close-on-backdrop-click.mjs';
import { HtmlSelect } from './html-select.js';
import { LabelChips } from './label-chips.js';

/**
 * 「一括編集」: the progress and the labels of every task selected on the
 * DAG, and the group of every node selected, changed together
 * (`bulk-edit-store.mts`). Each starts at 「変更しない」; labels are added
 * from a field, as a task's are typed, and taken off by ticking those the
 * tasks have. A milestone has no progress and no labels, and with no task
 * selected those fields are left out. A native `<dialog>` as the node's is
 * (`node-dialog.tsx`).
 */
export const BulkEditDialog = memoNamed('BulkEditDialog', () => {
  const editor = bulkEditSignal.value;

  const { tasks } = domainSignal.value;

  const groups = groupsSignal.value;

  const taskIds = new Set(
    editor.type === 'closed'
      ? []
      : editor.refs.flatMap((ref) => (ref.kind === 'task' ? [ref.id] : [])),
  );

  const milestoneCount =
    editor.type === 'closed'
      ? 0
      : editor.refs.filter((ref) => ref.kind === 'milestone').length;

  // Every label the tasks have, in the order first met.
  const labels = Arr.uniq(
    tasks.filter(({ id }) => taskIds.has(id)).flatMap((task) => task.labels),
  );

  return (
    <dialog
      ref={followOpen}
      aria-labelledby={TITLE_ID}
      className={'bp6-dialog node-dialog bulk-edit-dialog'}
      data-e2e={'bulk-edit-dialog'}
      onCancel={onCancel}
    >
      {editor.type === 'closed' ? undefined : (
        <form className={'node-dialog-form'} onSubmit={onSubmit}>
          <div className={'bp6-dialog-header'}>
            <h2 className={'bp6-heading'} id={TITLE_ID}>
              {'一括編集'}
            </h2>
            <button
              aria-label={'閉じる'}
              className={'bp6-button bp6-minimal'}
              type={'button'}
              onClick={bulkEditStore.close}
            >
              {'×'}
            </button>
          </div>
          <div className={'bp6-dialog-body node-dialog-body'}>
            <p className={'bp6-text-muted'} data-e2e={'bulk-edit-summary'}>
              {[
                taskIds.size > 0 ? `タスク ${taskIds.size} 件` : undefined,
                milestoneCount > 0
                  ? `マイルストーン ${milestoneCount} 件`
                  : undefined,
              ]
                .filter((part) => part !== undefined)
                .join('・')}
              {'を変更します。「変更しない」の項目はそのままです。'}
              {milestoneCount > 0 && taskIds.size > 0
                ? 'マイルストーンには進捗とラベルはありません。'
                : undefined}
            </p>
            <div className={'form-grid'}>
              {taskIds.size === 0 ? undefined : (
                <>
                  <label className={'bp6-label field'}>
                    {'進捗'}
                    <HtmlSelect
                      data-e2e={'bulk-progress-select'}
                      fill
                      value={editor.progress ?? KEEP}
                      onChange={onProgress}
                    >
                      <option value={KEEP}>{'変更しない'}</option>
                      {progresses.map((progress) => (
                        <option key={progress} value={progress}>
                          {progressLabels[progress]}
                        </option>
                      ))}
                    </HtmlSelect>
                  </label>
                  <label className={'bp6-label field field-wide'}>
                    {'追加するラベル（カンマ区切り）'}
                    <input
                      className={'bp6-input bp6-fill'}
                      data-e2e={'bulk-add-labels'}
                      type={'text'}
                      value={editor.addLabels}
                      onInput={onAddLabels}
                    />
                    <LabelChips labels={parseLabels(editor.addLabels)} />
                  </label>
                  {Arr.isNonEmpty(labels) ? (
                    <fieldset className={'field field-wide bulk-remove-labels'}>
                      <legend className={'field-label'}>{'外すラベル'}</legend>
                      {labels.map((label) => (
                        <label
                          key={label}
                          className={'bp6-control bp6-checkbox bp6-inline'}
                        >
                          <input
                            checked={editor.removeLabels.includes(label)}
                            className={'bp6-control-input'}
                            data-e2e={'bulk-remove-label'}
                            type={'checkbox'}
                            value={label}
                            onChange={onRemoveLabel}
                          />
                          <span className={'bp6-control-indicator'} />
                          {label}
                        </label>
                      ))}
                    </fieldset>
                  ) : undefined}
                </>
              )}
              <label className={'bp6-label field'}>
                {'グループ'}
                <HtmlSelect
                  data-e2e={'bulk-group-select'}
                  fill
                  value={groupValue(editor.group)}
                  onChange={onGroup}
                >
                  <option value={KEEP}>{'変更しない'}</option>
                  <option value={NONE}>{'なし'}</option>
                  {groups.map((group) => (
                    <option key={group.id} value={`${GROUP}${group.id}`}>
                      {group.title}
                    </option>
                  ))}
                </HtmlSelect>
              </label>
            </div>
          </div>
          <div className={'bp6-dialog-footer node-dialog-footer'}>
            <span />
            <div className={'bp6-dialog-footer-actions'}>
              <button
                className={'bp6-button'}
                type={'button'}
                onClick={bulkEditStore.close}
              >
                {'キャンセル'}
              </button>
              <button
                className={'bp6-button bp6-intent-primary'}
                data-e2e={'bulk-save'}
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
    bulkEditStore.close,
  );

  const subscription = bulkEditStore.editor.subscribe((editor) => {
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

  bulkEditStore.close();
};

const onSubmit: SubmitEventHandler<HTMLFormElement> = (submitted) => {
  submitted.preventDefault();

  bulkEditStore.save();
};

const onProgress: GenericEventHandler<HTMLSelectElement> = (changed) => {
  const { value } = changed.currentTarget;

  bulkEditStore.setProgress(ProgressCodec.is(value) ? value : undefined);
};

const onAddLabels: GenericEventHandler<HTMLInputElement> = (changed) => {
  bulkEditStore.setAddLabels(changed.currentTarget.value);
};

const onRemoveLabel: GenericEventHandler<HTMLInputElement> = (changed) => {
  bulkEditStore.toggleRemoveLabel(changed.currentTarget.value);
};

const onGroup: GenericEventHandler<HTMLSelectElement> = (changed) => {
  const { value } = changed.currentTarget;

  const id = value.startsWith(GROUP) ? value.slice(GROUP.length) : undefined;

  bulkEditStore.setGroup(
    value === NONE
      ? { to: undefined }
      : id !== undefined && GroupIdCodec.is(id)
        ? { to: id }
        : undefined,
  );
};

/** The option of the group field for `group`. */
const groupValue = (group: NodeEdit['group']): string =>
  group === undefined
    ? KEEP
    : group.to === undefined
      ? NONE
      : (`${GROUP}${group.to}` as const);

// The options' values: a group's id may be any string, so it is prefixed.
const KEEP = 'keep';

const NONE = 'none';

const GROUP = 'group:';

const TITLE_ID = 'bulk-edit-dialog-title';
