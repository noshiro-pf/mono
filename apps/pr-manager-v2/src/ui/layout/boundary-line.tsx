import { combine, map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import {
  BLOCK_NAMES,
  withBoundaryMoved,
  withEvenShares,
  withHeight,
  type DrawnGroup,
} from '../../domain/index.mjs';
import type { LayoutStore } from '../../store/index.mjs';
import { dragFrom } from './drag.mjs';

/**
 * The line under a group. In `natural` mode it sets the group's own height
 * (double-click: natural again); in `fill` mode it moves weight between the
 * group and the next (double-click: even them). The last group of a filled
 * column reaches the column's end, so it has none.
 */
export const BoundaryLine = ({
  group,
  index,
  layout,
  siblings,
}: Readonly<{
  group: InitializedObservable<DrawnGroup>;
  index: InitializedObservable<number>;
  layout: LayoutStore;
  siblings: InitializedObservable<readonly DrawnGroup[]>;
}>): JSX.Element => {
  const next = (): DrawnGroup | undefined =>
    siblings.getSnapshot().value[index.getSnapshot().value + 1];

  return (
    <div
      aria-hidden={constant('true')}
      class={constant('boundary-line')}
      data-last={combine([index, siblings]).pipe(
        map(([i, all]) => (i === all.length - 1).toString()),
      )}
      title={layout.layout.pipe(
        map((l) =>
          l.mode === 'fill'
            ? 'Drag to move height between the blocks; double-click to even them'
            : `Drag to give ${BLOCK_NAMES[group.getSnapshot().value.head]} a height of its own; double-click for its natural height`,
        ),
      )}
      onDblClick={() => {
        const { head } = group.getSnapshot().value;

        const lower = next();

        layout.change((l) =>
          l.mode === 'fill'
            ? lower === undefined
              ? l
              : withEvenShares(l, [head, lower.head])
            : withHeight(l, head, undefined),
        );
      }}
      onPointerDown={(event) => {
        const upperElement = event.currentTarget.previousElementSibling;

        if (!(upperElement instanceof HTMLElement)) {
          return;
        }

        const lowerElement = event.currentTarget.nextElementSibling;

        const { head, share } = group.getSnapshot().value;

        const fromY = event.clientY;

        const upperHeight = upperElement.getBoundingClientRect().height;

        if (layout.get().mode === 'natural') {
          dragFrom(event, (_x, y) => {
            layout.change((l) => withHeight(l, head, upperHeight + y - fromY));
          });

          return;
        }

        const lower = next();

        if (lower === undefined || !(lowerElement instanceof HTMLElement)) {
          return;
        }

        const start = {
          upper: head,
          lower: lower.head,
          upperHeight,
          lowerHeight: lowerElement.getBoundingClientRect().height,
          upperShare: share,
          lowerShare: lower.share,
        } as const;

        dragFrom(event, (_x, y) => {
          layout.change((l) => withBoundaryMoved(l, start, y - fromY));
        });
      }}
    />
  );
};
