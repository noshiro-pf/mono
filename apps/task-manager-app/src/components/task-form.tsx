import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import type { RelaxedExtract } from 'ts-type-forge';
import { priorities, progresses } from '../domain/index.mjs';
import {
  domainSignal,
  editorStore,
  nowSignal,
  type EditorState,
} from '../store/index.mjs';
import {
  parseLabels,
  priorityLabels,
  progressLabels,
  taskDraftInsight,
  validateRows,
  validDependencies,
} from '../view-model/index.mjs';
import { DateTimeField } from './date-time-field.js';
import { DependencyEditor } from './dependency-editor.js';
import { HtmlSelect } from './html-select.js';
import { LabelChips } from './label-chips.js';
import { StatusBadge } from './status-badge.js';
import { WarningBadge } from './warning-badge.js';

type Props = Readonly<{
  editor: RelaxedExtract<EditorState, Readonly<{ type: 'task' }>>;
}>;

/**
 * A task's fields, and what it waits for. The status shown is the draft's —
 * what the task would be with the dependencies its rows would save and this
 * progress — so the effect of a change is visible before it is saved.
 */
export const TaskForm = memoNamed<Props>('TaskForm', (props) => {
  const { editor } = props;

  const { draft } = editor;

  const checks = validateRows(domainSignal.value, editor.ref, editor.rows);

  const insight = taskDraftInsight(
    domainSignal.value,
    editor.ref.id,
    { progress: draft.progress, dependencies: validDependencies(checks) },
    nowSignal.value,
  );

  return (
    <>
      <div className={'form-grid'}>
        <label className={'bp6-label field field-wide'}>
          {'タイトル'}
          <input
            className={'bp6-input bp6-fill'}
            data-e2e={'title-input'}
            required
            type={'text'}
            value={draft.title}
            onInput={onTitle}
          />
        </label>
        <label className={'bp6-label field'}>
          {'進捗'}
          <HtmlSelect
            data-e2e={'progress-select'}
            fill
            value={draft.progress}
            onChange={onProgress}
          >
            {progresses.map((progress) => (
              <option key={progress} value={progress}>
                {progressLabels[progress]}
              </option>
            ))}
          </HtmlSelect>
        </label>
        <div className={'field'}>
          <span className={'field-label'}>{'状態'}</span>
          <span className={'badges'} data-e2e={'draft-status'}>
            <StatusBadge displayStatus={insight.status} />
            {insight.startedWithUnmetDependencies ? (
              <WarningBadge />
            ) : undefined}
          </span>
        </div>
        <label className={'bp6-label field'}>
          {'優先度'}
          <HtmlSelect fill value={String(draft.priority)} onChange={onPriority}>
            {priorities.map((priority) => (
              <option key={priority} value={String(priority)}>
                {`${priority}（${priorityLabels[priority]}）`}
              </option>
            ))}
          </HtmlSelect>
        </label>
        <DateTimeField
          id={'task-due-date'}
          label={'期限'}
          value={draft.dueDate}
          onChange={onDueDate}
        />
        <label className={'bp6-label field'}>
          {'見積（時間）'}
          <input
            className={'bp6-input bp6-fill'}
            inputMode={'decimal'}
            min={0}
            step={0.5}
            type={'number'}
            value={draft.estimateHours}
            onInput={onEstimate}
          />
        </label>
        <label className={'bp6-label field field-wide'}>
          {'ラベル（カンマ区切り）'}
          <input
            className={'bp6-input bp6-fill'}
            type={'text'}
            value={draft.labels}
            onInput={onLabels}
          />
          <LabelChips labels={parseLabels(draft.labels)} />
        </label>
        <label className={'bp6-label field field-wide'}>
          {'説明'}
          <textarea
            className={'bp6-input bp6-fill'}
            rows={3}
            value={draft.description}
            onInput={onDescription}
          />
        </label>
      </div>
      <fieldset className={'condition-group'}>
        <legend>{'着手条件（すべて満たされると着手可）'}</legend>
        <p className={'bp6-text-muted condition-hint'}>
          {
            '特定の日時や外部要因を待つときは、マイルストーンを作って依存させます。'
          }
        </p>
        <DependencyEditor
          checks={checks}
          owner={editor.ref}
          rows={editor.rows}
          unmet={insight.unmet}
        />
      </fieldset>
    </>
  );
});

// Outside the component, since none of them reads its props.

const onTitle: GenericEventHandler<HTMLInputElement> = (changed) => {
  editorStore.updateTaskDraft({ title: changed.currentTarget.value });
};

const onProgress: GenericEventHandler<HTMLSelectElement> = (changed) => {
  const progress = progresses.find((p) => p === changed.currentTarget.value);

  if (progress !== undefined) {
    editorStore.updateTaskDraft({ progress });
  }
};

const onPriority: GenericEventHandler<HTMLSelectElement> = (changed) => {
  const priority = priorities.find(
    (p) => String(p) === changed.currentTarget.value,
  );

  if (priority !== undefined) {
    editorStore.updateTaskDraft({ priority });
  }
};

const onDueDate = (dueDate: string): void => {
  editorStore.updateTaskDraft({ dueDate });
};

const onEstimate: GenericEventHandler<HTMLInputElement> = (changed) => {
  editorStore.updateTaskDraft({ estimateHours: changed.currentTarget.value });
};

const onLabels: GenericEventHandler<HTMLInputElement> = (changed) => {
  editorStore.updateTaskDraft({ labels: changed.currentTarget.value });
};

const onDescription: GenericEventHandler<HTMLTextAreaElement> = (changed) => {
  editorStore.updateTaskDraft({ description: changed.currentTarget.value });
};
