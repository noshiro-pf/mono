/**
 * What `unblock-prs` does with the queue layers that stand, from where the
 * checks on each stand ({@link LayerStatus}): which pull request it sets aside,
 * which layers it drops, which it dispatches next and whether it releases the
 * first candidate. The worker acts on it each survey; the Pull Requests Manager
 * draws each layer by {@link layerStandings}, which reads the same decision, so
 * that the two cannot disagree about the stack.
 */

import type { BuiltQueueLayer, QueueLayer } from './queue-layers.mjs';

/**
 * What to do this survey with the layers that stand, `statuses` in their order.
 *
 * - **A red first layer** names its own pull request, which is set aside. Only
 *   the first: a layer above it failed on top of pull requests that have not
 *   merged and may not, and it is judged once it is first, on `main`'s tree or
 *   rebuilt on it. It holds the release of nothing below it. Setting it aside
 *   at once would gain nothing over green layers: the first is released in the
 *   same survey and watched until it merges, while nothing is built, and the
 *   red one is first on the survey after. Over a layer still running it would
 *   blame the pull request for what may be the failure of the one below.
 * - **Every layer above a red one over green ones**, which carries it, is
 *   cleaned up, its runs cancelled to free their runners. A red layer over one
 *   still running says nothing yet.
 * - **The next layer is dispatched** only once the layers below are green, or
 *   have finished their gate and started every job, so that the first finishes
 *   as fast as it would alone, and never on top of a red layer.
 * - **The first candidate is released** when its layer is green, and also when
 *   it has none to wait for — not stacked (the version pull request, one only a
 *   bypass merges) or not buildable (its commit conflicts): the release then
 *   runs its checks, or finds the conflict, as it always has.
 */
export const decideSpeculation = ({
  layers,
  statuses,
  firstCandidate,
}: Readonly<{
  layers: readonly BuiltQueueLayer[];
  statuses: readonly LayerStatus[];
  firstCandidate: number | undefined;
}>): Readonly<{
  setAside: (QueueLayer & Readonly<{ name: string; link: string }>) | undefined;
  dropFrom: number | undefined;
  dispatch: number | undefined;
  release: boolean;
}> => {
  const { red, dropFrom, dispatch } = stackOf(statuses);

  const redLayer = red === undefined ? undefined : layers[red.index];

  const first = layers[0];

  const release =
    firstCandidate !== undefined &&
    (first?.number !== firstCandidate || statuses[0]?.kind === 'green');

  return {
    setAside:
      redLayer === undefined || red?.index !== 0
        ? undefined
        : {
            number: redLayer.number,
            head: redLayer.head,
            name: red.name,
            link: red.link,
          },
    dropFrom,
    dispatch,
    release: release && red?.index !== 0,
  };
};

/**
 * What each layer that stands is to the worker, `layers` in their order, by
 * {@link decideSpeculation}'s decision, so that what the page says of a layer
 * is what the worker does with it:
 *
 * - `set-aside` — red and first, its pull request set aside;
 * - `red` — red but not first, judged once it is;
 * - `dropped` — above a red one over green ones, cleaned up;
 * - `stalled` — a workflow cancelled too often to dispatch again;
 * - `to-dispatch` — the layer the worker dispatches next;
 * - `waits` — not dispatched, waiting for the layers below to start every job,
 *   or for one below to be dispatched first;
 * - `running` and `green` as their checks are.
 */
export const layerStandings = (
  layers: readonly Readonly<{
    status: LayerStatus;
    cancelledTooOften: boolean;
  }>[],
): readonly LayerStanding[] => {
  const { dropFrom, dispatch } = stackOf(layers.map(({ status }) => status));

  return layers.map(({ status, cancelledTooOften }, index) => {
    if (dropFrom !== undefined && index >= dropFrom) {
      return 'dropped';
    }

    switch (status.kind) {
      case 'red':
        // A red first layer is the lowest over green ones, as there are none.
        return index === 0 ? 'set-aside' : 'red';

      case 'not-dispatched':
        return cancelledTooOften
          ? 'stalled'
          : index === dispatch
            ? 'to-dispatch'
            : 'waits';

      case 'running':
      case 'green':
        return status.kind;
    }
  });
};

/**
 * Whether anything may be built on top of the layers that stand, `statuses` in
 * their order: not on a red one over green ones, whose layers above are dropped.
 */
export const mayBuildAbove = (statuses: readonly LayerStatus[]): boolean =>
  firstRedOverGreen(statuses) === undefined;

/**
 * How far the check workflows got on a layer: `running` is `queued` while a job
 * has not started or the gate has not finished, and `red` names the workflow
 * that failed and links its run.
 */
export type LayerStatus = Readonly<
  | { kind: 'not-dispatched' }
  | { kind: 'running'; queued: boolean }
  | { kind: 'green' }
  | { kind: 'red'; name: string; link: string }
>;

/** What {@link layerStandings} says of a layer. */
export type LayerStanding =
  | 'set-aside'
  | 'red'
  | 'dropped'
  | 'stalled'
  | 'to-dispatch'
  | 'waits'
  | 'running'
  | 'green';

/**
 * The lowest red layer whose layers below are all green, with what failed on
 * it; a red layer above one not yet green is not yet anyone's.
 */
const firstRedOverGreen = (
  statuses: readonly LayerStatus[],
): Readonly<{ index: number; name: string; link: string }> | undefined => {
  const index = statuses.findIndex((each) => each.kind !== 'green');

  const status = index === -1 ? undefined : statuses[index];

  return status?.kind === 'red'
    ? { index, name: status.name, link: status.link }
    : undefined;
};

/**
 * The part of {@link decideSpeculation} that reads the statuses alone: the
 * lowest red layer over green ones, the first layer dropped above it, and the
 * layer to dispatch.
 */
const stackOf = (
  statuses: readonly LayerStatus[],
): Readonly<{
  red: Readonly<{ index: number; name: string; link: string }> | undefined;
  dropFrom: number | undefined;
  dispatch: number | undefined;
}> => {
  const red = firstRedOverGreen(statuses);

  const standing = red === undefined ? statuses.length : red.index + 1;

  const dispatch = statuses
    .slice(0, standing)
    .findIndex((status) => status.kind === 'not-dispatched');

  const below = dispatch === -1 ? ([] as const) : statuses.slice(0, dispatch);

  // Green, or running with every job started: never on top of a red layer,
  // which spoils whatever is stacked above it.
  const ready = below.every(
    (status) =>
      status.kind === 'green' || (status.kind === 'running' && !status.queued),
  );

  return {
    red,
    dropFrom:
      red === undefined || red.index + 1 >= statuses.length
        ? undefined
        : red.index + 1,
    dispatch: dispatch === -1 || !ready ? undefined : dispatch,
  };
};
