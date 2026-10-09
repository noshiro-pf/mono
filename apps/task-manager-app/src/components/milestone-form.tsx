import { type GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { type RelaxedExtract } from 'ts-type-forge';
import {
  domainSignal,
  editorStore,
  nowSignal,
  type EditorState,
} from '../store/index.mjs';
import {
  formatDateTime,
  milestoneDraftInsight,
  validateRows,
  validDependencies,
} from '../view-model/index.mjs';
import { DateTimeField } from './date-time-field.js';
import { DependencyEditor } from './dependency-editor.js';
import { MilestoneExplanation } from './milestone-explanation.js';
import { MilestoneReachState } from './milestone-reach-state.js';

type Props = Readonly<{
  editor: RelaxedExtract<EditorState, Readonly<{ type: 'milestone' }>>;
}>;

/**
 * A milestone's fields: what a milestone is, its title, then the conditions
 * under which it is reached — its date, its manual check (resolved and
 * reopened here) and its dependencies — with whether it is reached as
 * drafted and what it still waits for, and its description last.
 */
export const MilestoneForm = memoNamed<Props>('MilestoneForm', (props) => {
  const { editor } = props;

  const { draft } = editor;

  const checks = validateRows(domainSignal.value, editor.ref, editor.rows);

  const insight = milestoneDraftInsight(
    domainSignal.value,
    editor.ref.id,
    { ...draft, dependencies: validDependencies(checks) },
    nowSignal.value,
  );

  return (
    <>
      <MilestoneExplanation collapsed={!editor.isNew} />
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
      </div>
      <fieldset className={'condition-group'}>
        <legend>{'到達条件（すべて満たすと到達）'}</legend>
        <MilestoneReachState insight={insight} />
        <div className={'form-grid'}>
          <DateTimeField
            id={'milestone-date'}
            label={'日時（この日時になると到達）'}
            value={draft.date}
            onChange={onDate}
          />
          <div className={'field field-wide'}>
            <label className={'bp6-control bp6-checkbox'}>
              <input
                checked={draft.requiresManualCheck}
                className={'bp6-control-input'}
                type={'checkbox'}
                onChange={onRequiresCheck}
              />
              <span className={'bp6-control-indicator'} />
              {'手動チェックが必要（「解消」を押すと到達）'}
            </label>
            {draft.requiresManualCheck ? (
              <div className={'manual-check'}>
                {draft.checkedAt === undefined ? (
                  <>
                    <span>{'未解消'}</span>
                    <button
                      className={'bp6-button bp6-intent-success'}
                      data-e2e={'check-button'}
                      type={'button'}
                      onClick={editorStore.check}
                    >
                      {'解消'}
                    </button>
                  </>
                ) : (
                  <>
                    <span>{`解消済み（${formatDateTime(draft.checkedAt)}）`}</span>
                    <button
                      className={'bp6-button'}
                      type={'button'}
                      onClick={editorStore.uncheck}
                    >
                      {'未解消に戻す'}
                    </button>
                  </>
                )}
              </div>
            ) : undefined}
          </div>
        </div>
        <fieldset className={'condition-dependencies'}>
          <legend className={'condition-sub-label'}>{'依存'}</legend>
          <DependencyEditor
            checks={checks}
            owner={editor.ref}
            rows={editor.rows}
            unmet={insight.unmet}
          />
        </fieldset>
      </fieldset>
      <label className={'bp6-label field description-field'}>
        {'説明'}
        <textarea
          className={'bp6-input bp6-fill'}
          rows={3}
          value={draft.description}
          onInput={onDescription}
        />
      </label>
    </>
  );
});

// Outside the component, since none of them reads its props.

const onTitle: GenericEventHandler<HTMLInputElement> = (changed) => {
  editorStore.updateMilestoneDraft({ title: changed.currentTarget.value });
};

const onDate = (date: string): void => {
  editorStore.updateMilestoneDraft({ date });
};

const onRequiresCheck: GenericEventHandler<HTMLInputElement> = (changed) => {
  editorStore.updateMilestoneDraft({
    requiresManualCheck: changed.currentTarget.checked,
  });
};

const onDescription: GenericEventHandler<HTMLTextAreaElement> = (changed) => {
  editorStore.updateMilestoneDraft({
    description: changed.currentTarget.value,
  });
};
