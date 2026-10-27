import { HtmlSelect } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { dependencyTypes } from '../domain/index.mjs';
import { editorStore } from '../store/index.mjs';
import {
  dependencyTypeLabels,
  parseSourceValue,
  type DependencyRow,
  type RowCheck,
  type SourceOption,
} from '../view-model/index.mjs';

/** One row of `DependencyEditor`, with what it needs to draw it. */
export type DependencyRowView = Readonly<{
  row: DependencyRow;
  /** `undefined` only while the row and its check are out of step. */
  check: RowCheck | undefined;
  /** Whether the dependency holds now; `undefined` for a row that is none. */
  met: boolean | undefined;
  /** What the controls are named after: the dependency, or its number. */
  name: string;
  options: readonly SourceOption[];
}>;

type Props = Readonly<{
  row: InitializedObservable<DependencyRowView>;
}>;

/**
 * One dependency as an editable row: on which node, of which type (a task
 * can be waited on until it is done, or until it has started; a milestone
 * until it is reached), and how long after. The type's slot is kept for
 * every row so that choosing a source does not move the fields around.
 * Below the fields, whether the dependency holds, or why the row cannot be
 * saved.
 */
export const DependencyRowItem = ({ row }: Props): JSX.Element => {
  // A row keeps its key for as long as it exists.
  const { key } = row.getSnapshot().value.row;

  const errorId = `dependency-row-error-${key}` as const;

  const isError = view(row, ({ check }) => check?.status === 'error');

  return (
    <li
      class={view(
        row,
        ({ check }) =>
          `bp6-card bp6-compact dependency-row${check?.status === 'error' ? ' invalid' : ''}`,
      )}
      data-e2e={constant('dependency-row')}
    >
      <div class={constant('dependency-row-fields')}>
        <label class={constant('bp6-label dependency-source')}>
          {constant('依存先')}
          <HtmlSelect
            aria-describedby={view(row, ({ check }) =>
              check?.status === 'error' ? errorId : undefined,
            )}
            aria-invalid={view(row, ({ check }) =>
              String(check?.status === 'error'),
            )}
            data-e2e={constant('dependency-source')}
            fill
            value={view(row, (r) => r.row.source)}
            onChange={(changed) => {
              editorStore.updateDependencyRow(key, {
                source: parseSourceValue(changed.currentTarget.value),
              });
            }}
          >
            <option value={constant('')}>{constant('選んでください')}</option>
            <If
              cond={view(
                row,
                (r) =>
                  r.row.source !== '' &&
                  r.options.every(({ value }) => value !== r.row.source),
              )}
              then={
                <option value={view(row, (r) => r.row.source)}>
                  {constant('（見つからない依存先）')}
                </option>
              }
            />
            <For items={view(row, (r) => r.options)} key={(o) => o.value}>
              {(option$) => (
                <option value={view(option$, ({ value }) => value)}>
                  {view(option$, ({ label }) => label)}
                </option>
              )}
            </For>
          </HtmlSelect>
        </label>
        <If
          cond={view(row, (r) => r.row.source.startsWith('task:'))}
          then={
            <label class={constant('bp6-label dependency-type')}>
              {constant('種類')}
              <HtmlSelect
                data-e2e={constant('dependency-type')}
                fill
                value={view(row, (r) => r.row.type)}
                onChange={(changed) => {
                  const type = dependencyTypes.find(
                    (t) => t === changed.currentTarget.value,
                  );

                  if (type !== undefined) {
                    editorStore.updateDependencyRow(key, { type });
                  }
                }}
              >
                {dependencyTypes.map((type) => (
                  <option value={constant(type)}>
                    {constant(
                      `${dependencyTypeLabels[type]}（${type === 'finish-to-start' ? 'FS' : 'SS'}）`,
                    )}
                  </option>
                ))}
              </HtmlSelect>
            </label>
          }
          else={
            <div class={constant('dependency-type')}>
              <span class={constant('field-label')}>{constant('種類')}</span>
              <span class={constant('dependency-type-fixed bp6-text-muted')}>
                {view(row, (r) =>
                  r.row.source.startsWith('milestone:') ? '到達後' : '―',
                )}
              </span>
            </div>
          }
        />
        <label class={constant('bp6-label dependency-lag-days')}>
          {constant('ずらす日数')}
          <input
            class={constant('bp6-input bp6-fill')}
            data-e2e={constant('dependency-lag-days')}
            inputMode={constant('decimal')}
            min={constant('0')}
            step={constant('1')}
            type={constant('number')}
            value={view(row, (r) => r.row.lagDays)}
            onInput={(changed) => {
              editorStore.updateDependencyRow(key, {
                lagDays: changed.currentTarget.value,
              });
            }}
          />
        </label>
        <label class={constant('bp6-label dependency-lag-hours')}>
          {constant('時間')}
          <input
            class={constant('bp6-input bp6-fill')}
            data-e2e={constant('dependency-lag-hours')}
            inputMode={constant('decimal')}
            min={constant('0')}
            step={constant('1')}
            type={constant('number')}
            value={view(row, (r) => r.row.lagHours)}
            onInput={(changed) => {
              editorStore.updateDependencyRow(key, {
                lagHours: changed.currentTarget.value,
              });
            }}
          />
        </label>
        <button
          aria-label={view(row, ({ name }) => `${name}を外す`)}
          class={constant('bp6-button bp6-minimal dependency-remove')}
          data-e2e={constant('dependency-remove')}
          type={constant('button')}
          onClick={() => {
            editorStore.removeDependencyRow(key);
          }}
        >
          {constant('外す')}
        </button>
      </div>
      <If
        cond={isError}
        then={
          <p
            class={constant(
              'bp6-callout bp6-intent-danger dependency-row-message',
            )}
            data-e2e={constant('dependency-error')}
            id={constant(errorId)}
            role={constant('alert')}
          >
            {view(row, ({ check }) =>
              check?.status === 'error' ? check.message : '',
            )}
          </p>
        }
        else={
          <If
            cond={view(row, ({ met }) => met !== undefined)}
            then={
              <p class={constant('dependency-row-message')}>
                <span
                  class={view(
                    row,
                    ({ met }) =>
                      `bp6-tag bp6-minimal ${met === true ? 'bp6-intent-success' : 'bp6-intent-warning'}`,
                  )}
                >
                  {view(row, ({ met }) => (met === true ? '充足' : '未充足'))}
                </span>
              </p>
            }
          />
        }
      />
    </li>
  );
};
