import { memoNamed } from 'preact-utils';
import { useRef } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { GraphLayout } from '../dag/index.mjs';
import {
  dagAutoLayoutSignal,
  dagViewModeSignal,
  domainSignal,
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
export const DagView = memoNamed('DagView', () => {
  const layoutState = dagAutoLayoutSignal.value;

  const { tasks, milestones } = domainSignal.value;

  const toolbarRef = useRef<HTMLDivElement>(null);

  const laidOut =
    layoutState.type === 'ready'
      ? layoutState.layout
      : layoutState.type === 'computing'
        ? layoutState.previous
        : undefined;

  const layout =
    laidOut === undefined && dagViewModeSignal.value !== 'dag'
      ? NOT_LAID_OUT
      : laidOut;

  return (
    <main
      aria-busy={layoutState.type === 'computing'}
      className={'dag-view'}
      data-e2e={'dag-view'}
    >
      {Arr.isEmpty(tasks) && Arr.isEmpty(milestones) ? (
        <p className={'bp6-text-muted dag-message'}>
          {'タスクもマイルストーンもまだありません。'}
        </p>
      ) : layoutState.type === 'error' ? (
        <p
          className={'bp6-callout bp6-intent-danger dag-message'}
          role={'alert'}
        >
          {`レイアウトを計算できませんでした（${layoutState.message}）。`}
        </p>
      ) : layout === undefined ? (
        <output className={'bp6-text-muted dag-message'}>
          {'レイアウトを計算中…'}
        </output>
      ) : (
        <>
          <DagToolbar toolbarRef={toolbarRef} />
          <DagCanvas layout={layout} toolbarRef={toolbarRef} />
          <DagSelectionBar />
          <DagSettingsPanel />
        </>
      )}
    </main>
  );
});

/** The DAG before ELK has laid it out: nothing, for the modes drawn without. */
const NOT_LAID_OUT: GraphLayout = { nodes: [], edges: [], groups: [] } as const;
