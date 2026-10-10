import { type GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import { dependencyTypes } from '../domain/index.mjs';
import { domainSignal, editorStore } from '../store/index.mjs';
import {
  dependencyTypeLabels,
  describeDependency,
  parseSourceValue,
  type DependencyRow,
  type RowCheck,
  type SourceOption,
} from '../view-model/index.mjs';
import { HtmlSelect } from './html-select.js';

type Props = Readonly<{
  row: DependencyRow;
  /** `undefined` only while the row and its check are out of step. */
  check: RowCheck | undefined;
  /** Whether the dependency holds now; `undefined` for a row that is none. */
  met: boolean | undefined;
  /** 1-based, for the names of the controls. */
  number: number;
  options: readonly SourceOption[];
}>;

/**
 * One dependency as an editable row: on which node, of which type (a task
 * can be waited on until it is done, or until it has started; a milestone
 * until it is reached), and how long after. The type's slot is kept for
 * every row so that choosing a source does not move the fields around.
 * Below the fields, whether the dependency holds, or why the row cannot be
 * saved.
 */
export const DependencyRowItem = memoNamed<Props>(
  'DependencyRowItem',
  (props) => {
    const { row, check, met, number, options } = props;

    const { key } = row;

    const onSource = useCallback<GenericEventHandler<HTMLSelectElement>>(
      (changed) => {
        editorStore.updateDependencyRow(key, {
          source: parseSourceValue(changed.currentTarget.value),
        });
      },
      [key],
    );

    const onType = useCallback<GenericEventHandler<HTMLSelectElement>>(
      (changed) => {
        const type = dependencyTypes.find(
          (t) => t === changed.currentTarget.value,
        );

        if (type !== undefined) {
          editorStore.updateDependencyRow(key, { type });
        }
      },
      [key],
    );

    const onLagDays = useCallback<GenericEventHandler<HTMLInputElement>>(
      (changed) => {
        editorStore.updateDependencyRow(key, {
          lagDays: changed.currentTarget.value,
        });
      },
      [key],
    );

    const onLagHours = useCallback<GenericEventHandler<HTMLInputElement>>(
      (changed) => {
        editorStore.updateDependencyRow(key, {
          lagHours: changed.currentTarget.value,
        });
      },
      [key],
    );

    const onRemove = useCallback(() => {
      editorStore.removeDependencyRow(key);
    }, [key]);

    const isError = check?.status === 'error';

    const errorId = `dependency-row-error-${key}` as const;

    const known = options.some(({ value }) => value === row.source);

    const rowName =
      check?.status === 'ok'
        ? (`「${describeDependency(domainSignal.value, check.dependency)}」` as const)
        : (`依存 ${number}` as const);

    return (
      <li
        className={`bp6-card bp6-compact dependency-row${isError ? ' invalid' : ''}`}
        data-e2e={'dependency-row'}
      >
        <div className={'dependency-row-fields'}>
          <label className={'bp6-label dependency-source'}>
            {'依存先'}
            <HtmlSelect
              aria-describedby={isError ? errorId : undefined}
              aria-invalid={isError}
              data-e2e={'dependency-source'}
              fill
              value={row.source}
              onChange={onSource}
            >
              <option value={''}>{'選んでください'}</option>
              {known || row.source === '' ? undefined : (
                <option value={row.source}>{'（見つからない依存先）'}</option>
              )}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </HtmlSelect>
          </label>
          {row.source.startsWith('task:') ? (
            <label className={'bp6-label dependency-type'}>
              {'種類'}
              <HtmlSelect
                data-e2e={'dependency-type'}
                fill
                value={row.type}
                onChange={onType}
              >
                {dependencyTypes.map((type) => (
                  <option key={type} value={type}>
                    {`${dependencyTypeLabels[type]}（${type === 'finish-to-start' ? 'FS' : 'SS'}）`}
                  </option>
                ))}
              </HtmlSelect>
            </label>
          ) : (
            <div className={'dependency-type'}>
              <span className={'field-label'}>{'種類'}</span>
              <span className={'dependency-type-fixed bp6-text-muted'}>
                {row.source.startsWith('milestone:') ? '到達後' : '―'}
              </span>
            </div>
          )}
          <label className={'bp6-label dependency-lag-days'}>
            {'ずらす日数'}
            <input
              className={'bp6-input bp6-fill'}
              data-e2e={'dependency-lag-days'}
              inputMode={'decimal'}
              min={0}
              step={1}
              type={'number'}
              value={row.lagDays}
              onInput={onLagDays}
            />
          </label>
          <label className={'bp6-label dependency-lag-hours'}>
            {'時間'}
            <input
              className={'bp6-input bp6-fill'}
              data-e2e={'dependency-lag-hours'}
              inputMode={'decimal'}
              min={0}
              step={1}
              type={'number'}
              value={row.lagHours}
              onInput={onLagHours}
            />
          </label>
          <button
            aria-label={`${rowName}を外す`}
            className={'bp6-button bp6-minimal dependency-remove'}
            data-e2e={'dependency-remove'}
            type={'button'}
            onClick={onRemove}
          >
            {'外す'}
          </button>
        </div>
        {check?.status === 'error' ? (
          <p
            className={'bp6-callout bp6-intent-danger dependency-row-message'}
            data-e2e={'dependency-error'}
            id={errorId}
            role={'alert'}
          >
            {check.message}
          </p>
        ) : met === undefined ? undefined : (
          <p className={'dependency-row-message'}>
            <span
              className={`bp6-tag bp6-minimal ${met ? 'bp6-intent-success' : 'bp6-intent-warning'}`}
            >
              {met ? '充足' : '未充足'}
            </span>
          </p>
        )}
      </li>
    );
  },
);
