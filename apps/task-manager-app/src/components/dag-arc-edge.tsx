import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import type { DagArcRecord } from './dag-canvas-scene.mjs';
import { DagEdgeLabel } from './dag-edge-label.js';
import { SvgTitle } from './svg-title.js';

type Props = Readonly<{
  record: InitializedObservable<DagArcRecord>;
}>;

/**
 * A dependency in 「アーク」: an arc beside the column from the node depended
 * on to the node that waits (`dag/arc-geometry.mts`), ending in an arrowhead
 * pointing into it, with its label (`SS`, the lag) at the apex. The name is
 * both its `aria-label` and its `<title>`, the tooltip.
 */
export const DagArcEdge = ({ record }: Props): JSX.Element => {
  const name = view(record, ({ arc }) => arc.ariaLabel);

  return (
    // An SVG has no <img>: the group is one, named by its label.

    <g
      aria-label={name}
      class={constant('dag-edge dag-arc')}
      data-e2e={constant('dag-arc')}
      data-from={view(record, ({ arc }) => arc.from)}
      data-highlight={view(record, ({ highlight }) => highlight)}
      data-to={view(record, ({ arc }) => arc.to)}
      role={constant('img')}
    >
      <SvgTitle>{name}</SvgTitle>
      <path
        class={constant('dag-edge-line')}
        d={view(record, ({ arc }) => arc.path)}
        marker-end={view(record, ({ highlight }) =>
          highlight === 'on' ? 'url(#dag-arrow-highlight)' : 'url(#dag-arrow)',
        )}
      />
      <DagEdgeLabel pick={({ arc }) => arc} source={record} />
    </g>
  );
};
