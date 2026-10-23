import { HtmlSelect } from 'blueprint-synstate';
import { combine, map, type InitializedObservable } from 'synstate';
import { constant, For, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { RelaxedExclude } from 'ts-type-forge';
import {
  GroupIdCodec,
  ProgressCodec,
  progresses,
  type NodeEdit,
} from '../domain/index.mjs';
import {
  bulkEditStore,
  dataStore,
  type BulkEditState,
} from '../store/index.mjs';
import { parseLabels, progressLabels } from '../view-model/index.mjs';
import { followModal } from './follow-modal.mjs';
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
export const BulkEditDialog = (): JSX.Element => (
  <dialog
    ref={(dialog) => {
      followModal(
        dialog,
        bulkEditStore.editor,
        (editor) => editor.type !== 'closed',
        bulkEditStore.close,
      );
    }}
    aria-labelledby={constant(TITLE_ID)}
    class={constant('bp6-dialog node-dialog bulk-edit-dialog')}
    data-e2e={constant('bulk-edit-dialog')}
    onCancel={(cancelled) => {
      cancelled.preventDefault();

      bulkEditStore.close();
    }}
  >
    <MatchOptional
      value={view(bulkEditStore.editor, (editor) =>
        editor.type === 'closed' ? Optional.none : Optional.some(editor),
      )}
      some={(editor$) => <BulkEditForm editor={editor$} />}
    />
  </dialog>
);

type OpenBulkEditState = RelaxedExclude<
  BulkEditState,
  Readonly<{ type: 'closed' }>
>;

const BulkEditForm = ({
  editor,
}: Readonly<{
  editor: InitializedObservable<OpenBulkEditState>;
}>): JSX.Element => {
  const counts$ = editor.pipe(
    map(({ refs }) => ({
      tasks: refs.filter((ref) => ref.kind === 'task').length,
      milestones: refs.filter((ref) => ref.kind === 'milestone').length,
    })),
  );

  // Every label the tasks have, in the order first met.
  const labels$ = combine([dataStore.state, editor]).pipe(
    map(([{ tasks }, { refs }]) => {
      const taskIds = new Set(
        Arr.generate(function* () {
          for (const ref of refs) {
            if (ref.kind === 'task') {
              yield ref.id;
            }
          }
        }),
      );

      return Arr.uniq(
        tasks
          .filter(({ id }) => taskIds.has(id))
          .flatMap((task) => task.labels),
      );
    }),
  );

  return (
    <form
      class={constant('node-dialog-form')}
      onSubmit={(submitted) => {
        submitted.preventDefault();

        bulkEditStore.save();
      }}
    >
      <div class={constant('bp6-dialog-header')}>
        <h2 class={constant('bp6-heading')} id={constant(TITLE_ID)}>
          {constant('一括編集')}
        </h2>
        <button
          aria-label={constant('閉じる')}
          class={constant('bp6-button bp6-minimal')}
          type={constant('button')}
          onClick={bulkEditStore.close}
        >
          {constant('×')}
        </button>
      </div>
      <div class={constant('bp6-dialog-body node-dialog-body')}>
        <p
          class={constant('bp6-text-muted')}
          data-e2e={constant('bulk-edit-summary')}
        >
          {view(counts$, ({ tasks, milestones }) =>
            [
              tasks > 0 ? `タスク ${tasks} 件` : undefined,
              milestones > 0 ? `マイルストーン ${milestones} 件` : undefined,
            ]
              .filter((part) => part !== undefined)
              .join('・'),
          )}
          {constant('を変更します。「変更しない」の項目はそのままです。')}
          {view(counts$, ({ tasks, milestones }) =>
            milestones > 0 && tasks > 0
              ? 'マイルストーンには進捗とラベルはありません。'
              : '',
          )}
        </p>
        <div class={constant('form-grid')}>
          <If
            cond={view(counts$, ({ tasks }) => tasks > 0)}
            then={
              <>
                <label class={constant('bp6-label field')}>
                  {constant('進捗')}
                  <HtmlSelect
                    data-e2e={constant('bulk-progress-select')}
                    fill
                    value={view(editor, ({ progress }) => progress ?? KEEP)}
                    onChange={(changed) => {
                      const { value } = changed.currentTarget;

                      bulkEditStore.setProgress(
                        ProgressCodec.is(value) ? value : undefined,
                      );
                    }}
                  >
                    <option value={constant(KEEP)}>
                      {constant('変更しない')}
                    </option>
                    {progresses.map((progress) => (
                      <option value={constant(progress)}>
                        {constant(progressLabels[progress])}
                      </option>
                    ))}
                  </HtmlSelect>
                </label>
                <label class={constant('bp6-label field field-wide')}>
                  {constant('追加するラベル（カンマ区切り）')}
                  <input
                    class={constant('bp6-input bp6-fill')}
                    data-e2e={constant('bulk-add-labels')}
                    type={constant('text')}
                    value={view(editor, ({ addLabels }) => addLabels)}
                    onInput={(changed) => {
                      bulkEditStore.setAddLabels(changed.currentTarget.value);
                    }}
                  />
                  <LabelChips
                    labels={view(editor, ({ addLabels }) =>
                      parseLabels(addLabels),
                    )}
                  />
                </label>
                <If
                  cond={view(labels$, Arr.isNonEmpty)}
                  then={
                    <fieldset
                      class={constant('field field-wide bulk-remove-labels')}
                    >
                      <legend class={constant('field-label')}>
                        {constant('外すラベル')}
                      </legend>
                      <For items={labels$} key={(label) => label}>
                        {(label$) => (
                          <label
                            class={constant(
                              'bp6-control bp6-checkbox bp6-inline',
                            )}
                          >
                            <input
                              checked={combine([editor, label$]).pipe(
                                map(([{ removeLabels }, label]) =>
                                  removeLabels.includes(label),
                                ),
                              )}
                              class={constant('bp6-control-input')}
                              data-e2e={constant('bulk-remove-label')}
                              type={constant('checkbox')}
                              value={label$}
                              onChange={(changed) => {
                                bulkEditStore.toggleRemoveLabel(
                                  changed.currentTarget.value,
                                );
                              }}
                            />
                            <span class={constant('bp6-control-indicator')} />
                            {label$}
                          </label>
                        )}
                      </For>
                    </fieldset>
                  }
                />
              </>
            }
          />
          <label class={constant('bp6-label field')}>
            {constant('グループ')}
            <HtmlSelect
              data-e2e={constant('bulk-group-select')}
              fill
              value={view(editor, ({ group }) => groupValue(group))}
              onChange={(changed) => {
                const { value } = changed.currentTarget;

                const id = value.startsWith(GROUP)
                  ? value.slice(GROUP.length)
                  : undefined;

                bulkEditStore.setGroup(
                  value === NONE
                    ? { to: undefined }
                    : id !== undefined && GroupIdCodec.is(id)
                      ? { to: id }
                      : undefined,
                );
              }}
            >
              <option value={constant(KEEP)}>{constant('変更しない')}</option>
              <option value={constant(NONE)}>{constant('なし')}</option>
              <For items={dataStore.groups} key={(group) => group.id}>
                {(group$) => (
                  <option value={view(group$, ({ id }) => `${GROUP}${id}`)}>
                    {view(group$, ({ title }) => title)}
                  </option>
                )}
              </For>
            </HtmlSelect>
          </label>
        </div>
      </div>
      <div class={constant('bp6-dialog-footer node-dialog-footer')}>
        <span />
        <div class={constant('bp6-dialog-footer-actions')}>
          <button
            class={constant('bp6-button')}
            type={constant('button')}
            onClick={bulkEditStore.close}
          >
            {constant('キャンセル')}
          </button>
          <button
            class={constant('bp6-button bp6-intent-primary')}
            data-e2e={constant('bulk-save')}
            type={constant('submit')}
          >
            {constant('保存')}
          </button>
        </div>
      </div>
    </form>
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
