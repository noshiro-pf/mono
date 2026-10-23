import { constant, derive, If, view, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { MAX_SCALE, MIN_SCALE } from '../dag-zoom.mjs';
import { issuesViewStore } from '../store/index.mjs';

/**
 * How large the DAG is drawn (`dag-zoom.mts`): a zoom out and a zoom in on
 * either side of the scale it is drawn at, then the fit and the natural size,
 * shaped as the List / DAG switch is (`issues-view-switch.tsx`), the one
 * the DAG is drawn by pressed. A zoom leaves neither pressed; one that can go
 * no further is disabled. Not drawn while there is no graph to zoom.
 */
export const IssueDagZoom = (): JSX.Element => (
  <If
    cond={view(issuesViewStore.graph, ({ nodes }) => Arr.isNonEmpty(nodes))}
    then={<Zoom />}
  />
);

const Zoom = (): JSX.Element => {
  const { dagScale: scale$, dagFitted: fitted$ } = issuesViewStore;

  return (
    <div class={constant('issue-dag-zoom')}>
      <fieldset aria-label={constant('Zoom')} class={constant('view-switch')}>
        <button
          aria-label={constant('Zoom out')}
          class={constant('view-switch-option')}
          disabled={view(scale$, (scale) => scale <= MIN_SCALE)}
          title={constant('Zoom out')}
          type={constant('button')}
          onClick={zoomOut}
        >
          {constant('−')}
        </button>

        <output
          aria-live={constant('polite')}
          class={constant('issue-dag-zoom-level')}
        >
          {view(scale$, (scale) => `${Math.round(scale * 100)}%`)}
        </output>

        <button
          aria-label={constant('Zoom in')}
          class={constant('view-switch-option')}
          disabled={view(scale$, (scale) => scale >= MAX_SCALE)}
          title={constant('Zoom in')}
          type={constant('button')}
          onClick={zoomIn}
        >
          {constant('+')}
        </button>
      </fieldset>

      <fieldset
        aria-label={constant('Draw the graph at')}
        class={constant('view-switch')}
      >
        <button
          aria-pressed={view(fitted$, String)}
          class={constant('view-switch-option')}
          title={constant('The whole graph in the box, however large it is')}
          type={constant('button')}
          onClick={fit}
        >
          {constant('Fit')}
        </button>

        <button
          aria-pressed={derive([fitted$, scale$], (fitted, scale) =>
            String(!fitted && scale === 1),
          )}
          class={constant('view-switch-option')}
          title={constant('Back to the natural size')}
          type={constant('button')}
          onClick={reset}
        >
          {constant('100%')}
        </button>
      </fieldset>
    </div>
  );
};

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
