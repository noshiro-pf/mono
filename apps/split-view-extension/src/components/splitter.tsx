import { type InitializedObservable, map } from 'synstate';
import type { JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { SplitterRect } from '../layout/index.mjs';

/**
 * A divider between two panes, from the layout's own rectangle for it.
 *
 * Keyed by its path in the tree, so the node it divides can change direction
 * under it — `2 cols` then `2 rows` — and its axis is followed like the rest.
 */
export const Splitter = ({
  splitter$,
  onDragStart,
}: Readonly<{
  splitter$: InitializedObservable<SplitterRect>;
  onDragStart: (dragged: SplitterRect) => void;
}>): JSX.Element => (
  <hr
    aria-orientation={splitter$.pipe(
      map(({ axis }) => (axis === 'row' ? 'vertical' : 'horizontal')),
    )}
    class={splitter$.pipe(map(({ axis }) => `splitter splitter--${axis}`))}
    style={{
      left: splitter$.pipe(map((splitter) => `${splitter.rect.left}px`)),
      top: splitter$.pipe(map((splitter) => `${splitter.rect.top}px`)),
      width: splitter$.pipe(map((splitter) => `${splitter.rect.width}px`)),
      height: splitter$.pipe(map((splitter) => `${splitter.rect.height}px`)),
    }}
    onPointerDown={(pointerEvent) => {
      // Without this, the press starts a text selection that follows the
      // pointer over the panes for the length of the drag.
      pointerEvent.preventDefault();

      onDragStart(Optional.unwrap(splitter$.getSnapshot()));
    }}
  />
);
