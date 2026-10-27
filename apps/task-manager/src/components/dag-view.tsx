import { combine, map, type InitializedObservable } from 'synstate';
import { constant, If, MatchOptional, view, type JSX } from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { GraphLayout } from '../dag/index.mjs';
import {
  dagLayoutStore,
  dagViewModeStore,
  dataStore,
} from '../store/index.mjs';
import { DagCanvas } from './dag-canvas.js';
import { DagSelectionBar } from './dag-selection-bar.js';
import { DagSettingsPanel } from './dag-settings-panel.js';
import { DagToolbar } from './dag-toolbar.js';

/**
 * The dependency graph, as the reader arranged it over ELK's layout or in
 * another view mode, with the toolbar over it, the 「表示設定」 panel
 * the toolbar opens, and the nodes selected with what can be done with
 * them (`dag-selection-bar.tsx`). While a new layout is
 * computed the previous one stays up; before the first, a message says so
 * in 「DAG」, while 「アーク」 and 「タイル」, which need none, are drawn.
 */
export const DagView = (): JSX.Element => {
  const { autoLayout } = dagLayoutStore;

  const layout$ = combine([autoLayout, dagViewModeStore.mode]).pipe(
    map(([layoutState, mode]): Optional<GraphLayout> => {
      const laidOut =
        layoutState.type === 'ready'
          ? layoutState.layout
          : layoutState.type === 'computing'
            ? layoutState.previous
            : undefined;

      return laidOut !== undefined
        ? Optional.some(laidOut)
        : mode === 'dag'
          ? Optional.none
          : Optional.some(NOT_LAID_OUT);
    }),
  );

  return (
    <main
      aria-busy={view(autoLayout, ({ type }) =>
        (type === 'computing').toString(),
      )}
      class={constant('dag-view')}
      data-e2e={constant('dag-view')}
    >
      <If
        cond={view(
          dataStore.state,
          ({ tasks, milestones }) =>
            Arr.isEmpty(tasks) && Arr.isEmpty(milestones),
        )}
        then={
          <p class={constant('bp6-text-muted dag-message')}>
            {constant('タスクもマイルストーンもまだありません。')}
          </p>
        }
        else={
          <If
            cond={view(autoLayout, ({ type }) => type === 'error')}
            then={
              <p
                class={constant('bp6-callout bp6-intent-danger dag-message')}
                role={constant('alert')}
              >
                {view(autoLayout, (layoutState) =>
                  layoutState.type === 'error'
                    ? `レイアウトを計算できませんでした（${layoutState.message}）。`
                    : '',
                )}
              </p>
            }
            else={
              <MatchOptional
                value={layout$}
                some={(laidOut$) => <DagScreen layout={laidOut$} />}
                none={
                  <output class={constant('bp6-text-muted dag-message')}>
                    {constant('レイアウトを計算中…')}
                  </output>
                }
              />
            }
          />
        }
      />
    </main>
  );
};

/** The graph once there is a layout to draw, and what goes over it. */
const DagScreen = ({
  layout,
}: Readonly<{ layout: InitializedObservable<GraphLayout> }>): JSX.Element => {
  // Set by the toolbar as it is made; read by the canvas, which keeps
  // every mode clear of it.
  const mut_toolbar: { element: HTMLDivElement | undefined } = {
    element: undefined,
  };

  return (
    <>
      <DagToolbar
        toolbarRef={(element) => {
          mut_toolbar.element = element;
        }}
      />
      <DagCanvas layout={layout} toolbar={() => mut_toolbar.element} />
      <DagSelectionBar />
      <DagSettingsPanel />
    </>
  );
};

/** The DAG before ELK has laid it out: nothing, for the modes drawn without. */
const NOT_LAID_OUT: GraphLayout = { nodes: [], edges: [], groups: [] } as const;
