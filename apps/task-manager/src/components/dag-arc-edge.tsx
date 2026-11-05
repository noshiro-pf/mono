import { type InitializedObservable, map } from 'synstate';
import { constant, inlineMap, type JSX } from 'synstate-dom';
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
  const name = record.pipe(map(({ arc }) => arc.ariaLabel));

  return (
    // An SVG has no <img>: the group is one, named by its label.

    <g
      aria-label={name}
      class={constant('dag-edge dag-arc')}
      data-e2e={constant('dag-arc')}
      data-from={inlineMap(record, ({ arc }) => arc.from)}
      data-highlight={inlineMap(record, ({ highlight }) => highlight)}
      data-to={inlineMap(record, ({ arc }) => arc.to)}
      role={constant('img')}
    >
      <SvgTitle>{name}</SvgTitle>
      <path
        class={constant('dag-edge-line')}
        d={inlineMap(record, ({ arc }) => arc.path)}
        marker-end={inlineMap(record, ({ highlight }) =>
          highlight === 'on' ? 'url(#dag-arrow-highlight)' : 'url(#dag-arrow)',
        )}
      />
      <DagEdgeLabel pick={({ arc }) => arc} source={record} />
    </g>
  );
};
