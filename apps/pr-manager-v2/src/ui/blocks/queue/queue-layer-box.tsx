import { combine, map, type InitializedObservable } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import type { QueueBox } from '../../../domain/index.mjs';
import { ExternalLink } from '../../common/index.mjs';

type Props = Readonly<{
  box: InitializedObservable<QueueBox>;
  /** Which part of the row it is in. */
  kind: InitializedObservable<'next' | 'running' | 'waiting'>;
  /** Under the box: `running`, `next`, or its place in the order, `2`, `3`, … */
  place: InitializedObservable<string>;
}>;

/**
 * One box of the queue's row: the priority on a pill across the top edge, the
 * number, with the running ring on the one running and on one whose queue
 * layer's checks are going, a word under it on why it waits or what it is (a
 * layer's in its verdict's colour), struck out where it names only a
 * `Merge-After:` that is met, and its place under the box. What it waits for
 * ahead of it in the row is an arc from that box to this one, higher the
 * farther it reaches.
 */
export const QueueLayerBox = ({ box, kind, place }: Props): JSX.Element => (
  <li
    class={constant('queue-slot')}
    data-kind={combine([box, kind]).pipe(
      map(([b, k]) => (k === 'waiting' && b.failing ? 'failing' : k)),
    )}
    data-layer={box.pipe(map(({ layer }) => layer?.standing ?? 'none'))}
    data-priority={box.pipe(map(({ priority }) => priority))}
  >
    <For items={box.pipe(map(({ arcs }) => arcs))} key={({ number }) => number}>
      {(arc$) => (
        <span
          aria-hidden={constant('true')}
          class={constant('queue-arc')}
          data-level={arc$.pipe(map(({ span }) => arcLevelOf(span).toString()))}
          style={{
            left: arc$.pipe(map(({ span }) => `calc(50% - ${span * 100}%)`)),
            width: arc$.pipe(map(({ span }) => `${span * 100}%`)),
          }}
        />
      )}
    </For>
    <ExternalLink
      class={constant('queue-link')}
      href={box.pipe(map(({ url }) => url))}
      title={box.pipe(map(tooltipOf))}
    >
      <If
        cond={box.pipe(map(({ priority }) => priority !== 'none'))}
        then={
          <span
            class={constant('queue-priority')}
            data-priority={box.pipe(map(({ priority }) => priority))}
          >
            {box.pipe(map(({ priority }) => priority))}
          </span>
        }
      />
      <span class={constant('queue-number')}>
        <If
          cond={combine([box, kind]).pipe(
            map(([b, k]) => k === 'running' || b.layer?.standing === 'running'),
          )}
          then={<span class={constant('spinner')} />}
        />
        {box.pipe(map(({ number }) => `#${number}`))}
      </span>
      <If
        cond={box.pipe(map((b) => noteOf(b) !== undefined))}
        then={
          <span
            class={constant('queue-note')}
            data-settled={box.pipe(map(({ settled }) => settled.toString()))}
          >
            {box.pipe(map((b) => noteOf(b) ?? ''))}
          </span>
        }
      />
    </ExternalLink>
    <span class={constant('queue-place')}>{place}</span>
  </li>
);

/**
 * How high an arc spanning `span` places is drawn, 1 to 5: a step higher each
 * time the span doubles, so a long arc clears the short ones under it.
 */
export const arcLevelOf = (span: number): number =>
  Math.min(1 + Math.ceil(Math.log2(Math.max(span, 1))), MAX_ARC_LEVEL);

const MAX_ARC_LEVEL = 5;

/** The word under the number: why it waits, or what it is. */
const noteOf = (box: QueueBox): string | undefined =>
  box.why ?? (box.bypass === undefined ? undefined : '⚑ bypass');

const tooltipOf = (box: QueueBox): string =>
  [
    `#${box.number} ${box.title}`,
    ...(box.detail === undefined ? [] : [box.detail]),
    ...box.arcs.map(
      ({ number, span }) =>
        `Waits for #${number}, ${span} ${span === 1 ? 'place' : 'places'} ahead (the arc).`,
    ),
    ...(box.bypass === undefined
      ? []
      : [`Only a ruleset bypass merges it: ${box.bypass}.`]),
  ].join('\n');
