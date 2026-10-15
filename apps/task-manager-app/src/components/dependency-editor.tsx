import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback, useState } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { Dependency, NodeRef } from '../domain/index.mjs';
import { domainSignal, editorStore } from '../store/index.mjs';
import {
  dependencySourceOptions,
  shownSourceOptions,
  type DependencyRow,
  type RowCheck,
} from '../view-model/index.mjs';
import { DependencyRowItem } from './dependency-row-item.js';

type Props = Readonly<{
  owner: NodeRef;
  rows: readonly DependencyRow[];
  /** What each of `rows` amounts to, in the same order. */
  checks: readonly RowCheck[];
  /** The dependencies of `checks` that do not hold now. */
  unmet: readonly Dependency[];
}>;

/**
 * What the node waits for, as rows that are edited in place: what is typed
 * into a row is saved with the node, and 「依存を追加」 only adds a row to
 * type into. The button stays below the rows, wherever they end.
 *
 * A done task is left out of the 依存先 choices — it is rarely what a node
 * starts to wait for — unless the switch beside the button, shown while
 * there is one to choose, asks for it; a row that already has one keeps it.
 * The switch is off whenever the dialog opens.
 */
export const DependencyEditor = memoNamed<Props>(
  'DependencyEditor',
  (props) => {
    const { owner, rows, checks, unmet } = props;

    const options = dependencySourceOptions(domainSignal.value, owner);

    const [showDone, setShowDone] = useState(false);

    const onShowDoneChange = useCallback<GenericEventHandler<HTMLInputElement>>(
      (changed) => {
        setShowDone(changed.currentTarget.checked);
      },
      [],
    );

    return (
      <div className={'dependency-editor'}>
        {Arr.isEmpty(rows) ? (
          <p className={'bp6-text-muted'}>{'依存はありません。'}</p>
        ) : (
          <ol className={'dependency-rows'} data-e2e={'dependency-list'}>
            {rows.map((row, index) => {
              const check = checks.find(({ key }) => key === row.key);

              return (
                <DependencyRowItem
                  key={row.key}
                  check={check}
                  met={
                    check?.status === 'ok'
                      ? !unmet.includes(check.dependency)
                      : undefined
                  }
                  number={index + 1}
                  options={shownSourceOptions(options, showDone, row.source)}
                  row={row}
                />
              );
            })}
          </ol>
        )}
        <div className={'dependency-actions'}>
          <button
            className={'bp6-button'}
            data-e2e={'dependency-add'}
            type={'button'}
            onClick={onAdd}
          >
            {'依存を追加'}
          </button>
          {options.some(({ done }) => done) ? (
            <label
              className={
                'bp6-control bp6-switch bp6-inline dependency-show-done'
              }
            >
              <input
                checked={showDone}
                className={'bp6-control-input'}
                data-e2e={'dependency-show-done'}
                type={'checkbox'}
                onChange={onShowDoneChange}
              />
              <span className={'bp6-control-indicator'} />
              {'完了したタスクも選択肢に出す'}
            </label>
          ) : undefined}
        </div>
      </div>
    );
  },
);

// Outside the component, since it reads none of its props.

/** Adds a row, and moves to its 依存先 once it is drawn. */
const onAdd: GenericEventHandler<HTMLButtonElement> = (clicked) => {
  const editor = clicked.currentTarget.closest('.dependency-editor');

  editorStore.addDependencyRow();

  requestAnimationFrame(() => {
    editor
      ?.querySelector<HTMLSelectElement>(
        ':scope .dependency-row:last-child .dependency-source select',
      )
      ?.focus();
  });
};
