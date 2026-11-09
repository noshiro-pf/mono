import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { formatZoom, stepZoom, type ZoomStep } from '../../core/index.mjs';
import { Icon } from './icon.js';

/** −, the level when not 100% (a press goes back to it), and + (spec P4). */
export const ZoomControls = ({
  zoom$,
  onZoom,
}: Readonly<{
  zoom$: InitializedObservable<number>;
  onZoom: (step: ZoomStep) => void;
}>): JSX.Element => {
  const label$ = zoom$.pipe(map(formatZoom));

  return (
    <>
      <button
        aria-label={constant('Zoom out')}
        class={constant('pane__button')}
        disabled={zoom$.pipe(map((zoom) => stepZoom(zoom, 'out') === zoom))}
        title={constant('Zoom out (Ctrl + wheel does it too)')}
        type={constant('button')}
        onClick={() => {
          onZoom('out');
        }}
      >
        <Icon icon={'minus'} />
      </button>
      <If
        cond={zoom$.pipe(map((zoom) => zoom !== 1))}
        then={
          <button
            aria-label={label$.pipe(
              map((label) => `Zoom ${label}. Back to 100%`),
            )}
            class={constant('pane__zoom')}
            title={constant('Back to 100%')}
            type={constant('button')}
            onClick={() => {
              onZoom('reset');
            }}
          >
            {label$}
          </button>
        }
      />
      <button
        aria-label={constant('Zoom in')}
        class={constant('pane__button')}
        disabled={zoom$.pipe(map((zoom) => stepZoom(zoom, 'in') === zoom))}
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
