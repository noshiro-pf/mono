/**
 * What the arc diagram brings forward while the pointer is over a task or a
 * task has the focus: its arcs, both ways, and the tasks at their other
 * ends. Everything else is dimmed until it is left.
 */

import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { GraphNodeId } from '../domain/index.mjs';

/** The highlight around `pointed`; `undefined` while nothing is pointed at. */
export const arcHighlight = (
  pointed: GraphNodeId | undefined,
  edges: readonly DeepReadonly<{
    id: string;
    from: GraphNodeId;
    to: GraphNodeId;
  }>[],
): ArcHighlight | undefined => {
  if (pointed === undefined) {
    return undefined;
  }

  const incident = edges.filter(
    ({ from, to }) => from === pointed || to === pointed,
  );

  const others = incident.map(({ from, to }) => (from === pointed ? to : from));

  return {
    nodes: new Set(Arr.toUnshifted(others, pointed)),
    edges: new Set(incident.map(({ id }) => id)),
  };
};

/**
 * How a node or an arc is drawn: as usual with nothing highlighted, brought
 * forward in `highlighted`, dimmed outside it.
 */
export const highlightOf = <K extends string>(
  highlighted: ReadonlySet<K> | undefined,
  key: K,
): HighlightState =>
  highlighted === undefined ? 'none' : highlighted.has(key) ? 'on' : 'dim';

export type ArcHighlight = Readonly<{
  nodes: ReadonlySet<GraphNodeId>;
  edges: ReadonlySet<string>;
}>;

export type HighlightState = 'none' | 'on' | 'dim';
