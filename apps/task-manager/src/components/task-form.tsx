import { HtmlSelect } from 'blueprint-synstate';
import { combine, map, type InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import type { RelaxedExtract } from 'ts-type-forge';
import { priorities, progresses } from '../domain/index.mjs';
import {
  clockStore,
  dataStore,
  editorStore,
  type EditorState,
} from '../store/index.mjs';
import {
  formatLabels,
  labelsByUse,
  parseLabels,
  priorityLabels,
  progressLabels,
  taskDraftInsight,
  validateRows,
  validDependencies,
} from '../view-model/index.mjs';
import { DateTimeField } from './date-time-field.js';
import { DependencyEditor } from './dependency-editor.js';
import { GroupField } from './group-field.js';
import { LabelInput } from './label-input.js';
import { StatusBadge } from './status-badge.js';
import { WarningBadge } from './warning-badge.js';

type Props = Readonly<{
  editor: InitializedObservable<
    RelaxedExtract<EditorState, Readonly<{ type: 'task' }>>
  >;
}>;

/**
 * A task's fields, and what it waits for. The status shown is the draft's —
 * what the task would be with the dependencies its rows would save and this
 * progress — so the effect of a change is visible before it is saved.
 */
export const TaskForm = ({ editor }: Props): JSX.Element => {
  const checks$ = combine([dataStore.state, editor]).pipe(
    map(([state, { ref, rows }]) => validateRows(state, ref, rows)),
  );

  const insight$ = combine([
    dataStore.state,
    editor,
    checks$,
    clockStore.now,
  ]).pipe(
    map(([state, { ref, draft }, checks, now]) =>
      taskDraftInsight(
        state,
        ref.id,
        { progress: draft.progress, dependencies: validDependencies(checks) },
        now,
      ),
    ),
  );

  const known$ = dataStore.state.pipe(map(labelsByUse));

  return (
    <>
      <div class={constant('form-grid')}>
        <label class={constant('bp6-label field field-wide')}>
          {constant('タイトル')}
          <input
            class={constant('bp6-input bp6-fill')}
            data-e2e={constant('title-input')}
            required={constant(true)}
            type={constant('text')}
            value={view(editor, ({ draft }) => draft.title)}
            onInput={(changed) => {
              editorStore.updateTaskDraft({
                title: changed.currentTarget.value,
              });
            }}
          />
        </label>
        <label class={constant('bp6-label field')}>
          {constant('進捗')}
          <HtmlSelect
            data-e2e={constant('progress-select')}
            fill
            value={view(editor, ({ draft }) => draft.progress)}
            onChange={(changed) => {
              const progress = progresses.find(
                (p) => p === changed.currentTarget.value,
              );

              if (progress !== undefined) {
                editorStore.updateTaskDraft({ progress });
              }
            }}
          >
            {progresses.map((progress) => (
              <option value={constant(progress)}>
                {constant(progressLabels[progress])}
              </option>
            ))}
          </HtmlSelect>
        </label>
        <div class={constant('field')}>
          <span class={constant('field-label')}>{constant('状態')}</span>
          <span class={constant('badges')} data-e2e={constant('draft-status')}>
            <StatusBadge displayStatus={view(insight$, (i) => i.status)} />
            <If
              cond={view(insight$, (i) => i.startedWithUnmetDependencies)}
              then={<WarningBadge />}
            />
          </span>
        </div>
        <label class={constant('bp6-label field')}>
          {constant('優先度')}
          <HtmlSelect
            fill
            value={view(editor, ({ draft }) => draft.priority.toString())}
            onChange={(changed) => {
              const priority = priorities.find(
                (p) => p.toString() === changed.currentTarget.value,
              );

              if (priority !== undefined) {
                editorStore.updateTaskDraft({ priority });
              }
            }}
          >
            {priorities.map((priority) => (
              <option value={constant(priority.toString())}>
                {constant(`${priority}（${priorityLabels[priority]}）`)}
              </option>
            ))}
          </HtmlSelect>
        </label>
        <DateTimeField
          id={'task-due-date'}
          label={'期限'}
          allDay={view(editor, ({ draft }) => draft.dueAllDay)}
          value={view(editor, ({ draft }) => draft.dueDate)}
          onAllDayChange={editorStore.setAllDay}
          onChange={(dueDate) => {
            editorStore.updateTaskDraft({ dueDate });
          }}
        />
        <label class={constant('bp6-label field')}>
          {constant('見積（時間）')}
          <input
            class={constant('bp6-input bp6-fill')}
            inputMode={constant('decimal')}
            min={constant('0')}
            step={constant('0.5')}
            type={constant('number')}
            value={view(editor, ({ draft }) => draft.estimateHours)}
            onInput={(changed) => {
              editorStore.updateTaskDraft({
                estimateHours: changed.currentTarget.value,
              });
            }}
          />
        </label>
        <GroupField
          value={view(editor, ({ draft }) => draft.groupId)}
          onChange={(changed) => {
            editorStore.updateTaskDraft({
              groupId: changed.currentTarget.value,
            });
          }}
        />
        <LabelInput
          caption={'ラベル'}
          e2e={'task-labels'}
          id={'task-labels'}
          known={known$}
          labels={editor
            .pipe(map(({ draft }) => draft.labels))
            .pipe(map(parseLabels))}
          onChange={(labels) => {
            editorStore.updateTaskDraft({ labels: formatLabels(labels) });
          }}
        />
        <label class={constant('bp6-label field field-wide')}>
          {constant('説明')}
          <textarea
            class={constant('bp6-input bp6-fill')}
            rows={constant(3)}
            value={view(editor, ({ draft }) => draft.description)}
            onInput={(changed) => {
              editorStore.updateTaskDraft({
                description: changed.currentTarget.value,
              });
            }}
          />
        </label>
      </div>
      <fieldset class={constant('condition-group')}>
        <legend>{constant('着手条件（すべて満たされると着手可）')}</legend>
        <p class={constant('bp6-text-muted condition-hint')}>
          {constant(
            '特定の日時や外部要因を待つときは、マイルストーンを作って依存させます。',
          )}
        </p>
        <DependencyEditor
          checks={checks$}
          editor={editor}
          unmet={insight$.pipe(map((i) => i.unmet))}
        />
      </fieldset>
    </>
  );
};
