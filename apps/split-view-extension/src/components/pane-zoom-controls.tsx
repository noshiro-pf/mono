import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import {
  formatPaneZoom,
  steppedPaneZoom,
  type PaneState,
  type PaneZoomStep,
} from '../layout/index.mjs';
import { Icon } from './icon.js';

/** The three zoom buttons, in the bar or, for a narrow pane, in the menu. */
export const PaneZoomControls = ({
  pane$,
  onZoom,
}: Readonly<{
  pane$: InitializedObservable<PaneState>;
  onZoom: (step: PaneZoomStep) => void;
}>): JSX.Element => {
  const zoomLabel$ = pane$.pipe(map((pane) => formatPaneZoom(pane.zoom)));

  return (
    <>
      <button
        aria-label={constant('Zoom out')}
        class={constant('pane__button')}
        disabled={pane$.pipe(
          map((pane) => steppedPaneZoom(pane.zoom, 'out') === pane.zoom),
        )}
        title={constant('Zoom out (Ctrl + wheel does it too)')}
        type={constant('button')}
        onClick={() => {
          onZoom('out');
        }}
      >
        <Icon icon={'minus'} />
      </button>
      <button
        aria-label={zoomLabel$.pipe(
          map((label) => `Zoom ${label}. Back to 100%`),
        )}
        class={constant('pane__zoom')}
        title={constant('Back to 100%')}
        type={constant('button')}
        onClick={() => {
          onZoom('reset');
        }}
      >
        {zoomLabel$}
      </button>
      <button
        aria-label={constant('Zoom in')}
        class={constant('pane__button')}
        disabled={pane$.pipe(
          map((pane) => steppedPaneZoom(pane.zoom, 'in') === pane.zoom),
        )}
        title={constant('Zoom in (Ctrl + wheel does it too)')}
        type={constant('button')}
        onClick={() => {
          onZoom('in');
        }}
      >
        <Icon icon={'plus'} />
      </button>
    </>
  );
};
