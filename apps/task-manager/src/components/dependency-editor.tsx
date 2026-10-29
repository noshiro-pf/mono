import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { constant, For, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { Dependency, NodeRef } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import { dataStore, editorStore } from '../store/index.mjs';
import {
  dependencySourceOptions,
  describeDependency,
  shownSourceOptions,
  type DependencyRow,
  type RowCheck,
} from '../view-model/index.mjs';
import {
  DependencyRowItem,
  type DependencyRowView,
} from './dependency-row-item.js';

type Props = Readonly<{
  /** The node's, as its dialog holds them. */
  editor: InitializedObservable<
    Readonly<{ ref: NodeRef; rows: readonly DependencyRow[] }>
  >;
  /** What each of the rows amounts to, in the same order. */
  checks: InitializedObservable<readonly RowCheck[]>;
  /** The dependencies of `checks` that do not hold now. */
  unmet: InitializedObservable<readonly Dependency[]>;
}>;

/**
 * What the node waits for, as rows that are edited in place: what is typed
 * into a row is saved with the node, and 「依存を追加」 only adds a row to
 * type into. The button stays below the rows, wherever they end.
 *
 * A done task is left out of the 依存先 choices — it is rarely what a node
 * starts to wait for — unless the switch beside the button, shown while
 * there is one to choose, asks for it; a row that already has one keeps it.
 * The switch is off whenever the dialog opens: it is made with the form.
 */
export const DependencyEditor = ({
  editor,
  checks,
  unmet,
}: Props): JSX.Element => {
  const [showDone$, setShowDone] = createState(false);

  const options$ = combine([dataStore.state, editor]).pipe(
    map(([state, { ref }]) => dependencySourceOptions(state, ref)),
  );

  const rows$ = combine([
    dataStore.state,
    editor,
    checks,
    unmet,
    options$,
    showDone$,
  ]).pipe(
    map(([state, { rows }, rowChecks, unmetNow, options, showDone]) =>
      rows.map((row, index): DependencyRowView => {
        const check = rowChecks.find(({ key }) => key === row.key);

        return {
          row,
          check,
          met:
            check?.status === 'ok'
              ? !unmetNow.includes(check.dependency)
              : undefined,
          name:
            check?.status === 'ok'
              ? m.common.quoted(describeDependency(state, check.dependency))
              : m.dependencies.row(index + 1),
          options: shownSourceOptions(options, showDone, row.source),
        };
      }),
    ),
  );

  return (
    <div class={constant('dependency-editor')}>
      <If
        cond={view(rows$, Arr.isEmpty)}
        then={
          <p class={constant('bp6-text-muted')}>
            {constant(m.dependencies.none)}
          </p>
        }
        else={
          <ol
            class={constant('dependency-rows')}
            data-e2e={constant('dependency-list')}
          >
            <For items={rows$} key={({ row }) => row.key}>
              {(row$) => <DependencyRowItem row={row$} />}
            </For>
          </ol>
        }
      />
      <div class={constant('dependency-actions')}>
        <button
          class={constant('bp6-button')}
          data-e2e={constant('dependency-add')}
          type={constant('button')}
          onClick={onAdd}
        >
          {constant(m.dependencies.add)}
        </button>
        <If
          cond={view(options$, (options) => options.some(({ done }) => done))}
          then={
            <label
              class={constant(
                'bp6-control bp6-switch bp6-inline dependency-show-done',
              )}
            >
              <input
                checked={showDone$}
                class={constant('bp6-control-input')}
                data-e2e={constant('dependency-show-done')}
                type={constant('checkbox')}
                onChange={(changed) => {
                  setShowDone(changed.currentTarget.checked);
                }}
              />
              <span class={constant('bp6-control-indicator')} />
              {constant(m.dependencies.showDone)}
            </label>
          }
        />
      </div>
    </div>
  );
};

/**
 * Adds a row, and moves to its 依存先, which is drawn by the time the store
 * has the row.
 */
const onAdd = (clicked: Readonly<{ currentTarget: Element }>): void => {
  const editor = clicked.currentTarget.closest('.dependency-editor');

  editorStore.addDependencyRow();

  editor
    ?.querySelector<HTMLSelectElement>(
      ':scope .dependency-row:last-child .dependency-source select',
    )
    ?.focus();
};
