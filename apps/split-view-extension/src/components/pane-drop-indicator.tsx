import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import type { PaneDropTarget } from '../layout/index.mjs';

/**
 * What a drop would do, drawn over the pane it would do it to.
 *
 * The two outcomes look different rather than being explained: the middle of a
 * pane highlights the whole of it, an edge highlights the half the moved pane
 * would take. The caption is there because "swap" and "move" are the kind of
 * distinction that is obvious once and never again.
 *
 * Mounted while there is a target; `target$` may still pass `undefined` on its
 * way out, which draws nothing new.
 */
export const PaneDropIndicator = ({
  target$,
}: Readonly<{
  target$: InitializedObservable<PaneDropTarget | undefined>;
}>): JSX.Element => (
  <div
    class={constant('pane-drop')}
    style={{
      left: view(target$, (target) => pixels(target?.indicator.left)),
      top: view(target$, (target) => pixels(target?.indicator.top)),
      width: view(target$, (target) => pixels(target?.indicator.width)),
      height: view(target$, (target) => pixels(target?.indicator.height)),
    }}
  >
    <span class={constant('pane-drop__label')}>
      {view(target$, (target) =>
        target?.zone === 'center' ? 'Swap' : 'Move here',
      )}
    </span>
  </div>
);

const pixels = (value: number | undefined): string | undefined =>
  value === undefined ? undefined : (`${value.toString()}px` as const);
