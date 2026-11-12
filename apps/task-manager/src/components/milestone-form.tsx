import { derive, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { RelaxedExtract } from 'ts-type-forge';
import { m } from '../i18n/index.mjs';
import {
  clockStore,
  dataStore,
  editorStore,
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
import { GroupField } from './group-field.js';
import { MilestoneExplanation } from './milestone-explanation.js';
import { MilestoneReachState } from './milestone-reach-state.js';

type Props = Readonly<{
  editor: InitializedObservable<
    RelaxedExtract<EditorState, Readonly<{ type: 'milestone' }>>
  >;
}>;

/**
 * A milestone's fields: what a milestone is, its title and its group, then the
 * conditions under which it is reached — its date, its manual check (resolved
 * and reopened here) and its dependencies — with whether it is reached as
 * drafted and what it still waits for, and its description last.
 */
export const MilestoneForm = ({ editor }: Props): JSX.Element => {
  const checks$ = derive([dataStore.state, editor], (state, { ref, rows }) =>
    validateRows(state, ref, rows),
  );

  const insight$ = derive(
    [dataStore.state, editor, checks$, clockStore.now],
    (state, { ref, draft }, checks, now) =>
      milestoneDraftInsight(
        state,
        ref.id,
        { ...draft, dependencies: validDependencies(checks) },
        now,
      ),
  );

  return (
    <>
      <MilestoneExplanation
        collapsed={editor.pipe(map(({ isNew }) => !isNew))}
      />
      <div class={constant('form-grid')}>
        <label class={constant('bp6-label field field-wide')}>
          {constant(m.fields.title)}
          <input
            class={constant('bp6-input bp6-fill')}
            data-e2e={constant('title-input')}
            required={constant(true)}
            type={constant('text')}
            value={editor.pipe(map(({ draft }) => draft.title))}
            onInput={(changed) => {
              editorStore.updateMilestoneDraft({
                title: changed.currentTarget.value,
              });
            }}
          />
        </label>
        <GroupField
          value={editor.pipe(map(({ draft }) => draft.groupId))}
          onChange={(changed) => {
            editorStore.updateMilestoneDraft({
              groupId: changed.currentTarget.value,
            });
          }}
        />
      </div>
      <fieldset class={constant('condition-group')}>
        <legend>{constant(m.nodeDialog.reachConditions)}</legend>
        <MilestoneReachState insight={insight$} />
        <div class={constant('form-grid')}>
          <DateTimeField
            id={'milestone-date'}
            label={m.nodeDialog.milestoneDate}
            allDay={editor.pipe(map(({ draft }) => draft.dateAllDay))}
            value={editor.pipe(map(({ draft }) => draft.date))}
            onAllDayChange={editorStore.setAllDay}
            onChange={(date) => {
              editorStore.updateMilestoneDraft({ date });
            }}
          />
          <div class={constant('field field-wide')}>
            <label class={constant('bp6-control bp6-checkbox')}>
              <input
                checked={editor.pipe(
                  map(({ draft }) => draft.requiresManualCheck),
                )}
                class={constant('bp6-control-input')}
                type={constant('checkbox')}
                onChange={(changed) => {
                  editorStore.updateMilestoneDraft({
                    requiresManualCheck: changed.currentTarget.checked,
                  });
                }}
              />
              <span class={constant('bp6-control-indicator')} />
              {constant(m.nodeDialog.requiresCheck)}
            </label>
            <If
              cond={editor.pipe(map(({ draft }) => draft.requiresManualCheck))}
              then={
                <div class={constant('manual-check')}>
                  <If
                    cond={editor.pipe(
                      map(({ draft }) => draft.checkedAt === undefined),
                    )}
                    then={
                      <>
                        <span>{constant(m.nodeDialog.unchecked)}</span>
                        <button
                          class={constant('bp6-button bp6-intent-success')}
                          data-e2e={constant('check-button')}
                          type={constant('button')}
                          onClick={editorStore.check}
                        >
                          {constant(m.nodeDialog.check)}
                        </button>
                      </>
                    }
                    else={
                      <>
                        <span>
                          {editor.pipe(
                            map(({ draft }) =>
                              draft.checkedAt === undefined
                                ? ''
                                : m.nodeDialog.checkedAt(
                                    formatDateTime(draft.checkedAt),
                                  ),
                            ),
                          )}
                        </span>
                        <button
                          class={constant('bp6-button')}
                          type={constant('button')}
                          onClick={editorStore.uncheck}
                        >
                          {constant(m.nodeDialog.uncheck)}
                        </button>
                      </>
                    }
                  />
                </div>
              }
            />
          </div>
        </div>
        <fieldset class={constant('condition-dependencies')}>
          <legend class={constant('condition-sub-label')}>
            {constant(m.fields.dependencies)}
          </legend>
          <DependencyEditor
            checks={checks$}
            editor={editor}
            unmet={insight$.pipe(map((i) => i.unmet))}
          />
        </fieldset>
      </fieldset>
      <label class={constant('bp6-label field description-field')}>
        {constant(m.fields.description)}
        <textarea
          class={constant('bp6-input bp6-fill')}
          rows={constant(3)}
          value={editor.pipe(map(({ draft }) => draft.description))}
          onInput={(changed) => {
            editorStore.updateMilestoneDraft({
              description: changed.currentTarget.value,
            });
          }}
        />
      </label>
    </>
  );
};
