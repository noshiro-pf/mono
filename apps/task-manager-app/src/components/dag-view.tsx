import { memoNamed } from 'preact-utils';
import { useRef } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import { dagAutoLayoutSignal, domainSignal } from '../store/index.mjs';
import { DagCanvas } from './dag-canvas.js';
import { DagSettingsPanel } from './dag-settings-panel.js';
import { DagToolbar } from './dag-toolbar.js';

/**
 * The dependency graph, as the reader arranged it over ELK's layout or in
 * another view mode, with the toolbar over it and the 「表示設定」 panel
 * the toolbar opens. While a new layout is
 * computed the previous one stays up; before the first, a message says so.
 */
export const DagView = memoNamed('DagView', () => {
  const layoutState = dagAutoLayoutSignal.value;

  const { tasks, milestones } = domainSignal.value;

  const toolbarRef = useRef<HTMLDivElement>(null);

  const layout =
    layoutState.type === 'ready'
      ? layoutState.layout
      : layoutState.type === 'computing'
        ? layoutState.previous
        : undefined;

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
          <DagSettingsPanel />
        </>
      )}
    </main>
  );
});
