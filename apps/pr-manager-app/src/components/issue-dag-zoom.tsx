import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import { MAX_SCALE, MIN_SCALE } from '../dag-zoom.mjs';
import { issuesViewSignals, issuesViewStore } from '../store/index.mjs';

/**
 * How large the DAG is drawn (`dag-zoom.mts`): a zoom out and a zoom in on
 * either side of the scale it is drawn at, then the fit and the natural size,
 * shaped as the List / DAG switch is (`issues-view-switch.tsx`), the one
 * the DAG is drawn by pressed. A zoom leaves neither pressed; one that can go
 * no further is disabled. Not drawn while there is no graph to zoom.
 */
export const IssueDagZoom = memoNamed('IssueDagZoom', () => {
  const scale = issuesViewSignals.dagScale.value;

  const fitted = issuesViewSignals.dagFitted.value;

  if (!Arr.isNonEmpty(issuesViewSignals.graph.value.nodes)) {
    return undefined;
  }

  return (
    <div className={'issue-dag-zoom'}>
      <fieldset aria-label={'Zoom'} className={'view-switch'}>
        <button
          aria-label={'Zoom out'}
          className={'view-switch-option'}
          disabled={scale <= MIN_SCALE}
          title={'Zoom out'}
          type={'button'}
          onClick={zoomOut}
        >
          {'−'}
        </button>

        <output aria-live={'polite'} className={'issue-dag-zoom-level'}>
          {`${Math.round(scale * 100)}%`}
        </output>

        <button
          aria-label={'Zoom in'}
          className={'view-switch-option'}
          disabled={scale >= MAX_SCALE}
          title={'Zoom in'}
          type={'button'}
          onClick={zoomIn}
        >
          {'+'}
        </button>
      </fieldset>

      <fieldset aria-label={'Draw the graph at'} className={'view-switch'}>
        <button
          aria-pressed={fitted}
          className={'view-switch-option'}
          title={'The whole graph in the box, however large it is'}
          type={'button'}
          onClick={fit}
        >
          {'Fit'}
        </button>

        <button
          aria-pressed={!fitted && scale === 1}
          className={'view-switch-option'}
          title={'Back to the natural size'}
          type={'button'}
          onClick={reset}
        >
          {'100%'}
        </button>
      </fieldset>
    </div>
  );
});

// Outside the component, so that each button is handed the same function on
// every render.

const zoomOut = (): void => {
  issuesViewStore.zoomOut();
};

const zoomIn = (): void => {
  issuesViewStore.zoomIn();
};

const fit = (): void => {
  issuesViewStore.fitDag();
};

const reset = (): void => {
  issuesViewStore.resetZoom();
};
