import { derive, map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { QueueBox } from '../../../domain/index.mjs';
import { ExternalLink } from '../../common/index.mjs';

export const QueueLayerBox = ({
  box,
  place,
}: Readonly<{
  box: InitializedObservable<QueueBox>;
  place: InitializedObservable<string>;
}>): JSX.Element => (
  <li
    class={constant('queue-box')}
    data-ahead={box.pipe(
      map(({ checkedAhead }) => (checkedAhead ? 'true' : 'false')),
    )}
    data-place={place.pipe(
      map((p) => (p === 'running' || p === 'waiting' ? p : 'next')),
    )}
    // A waiting box says why it waits; its layer is in the tooltip alone.
    data-layer={derive([box, place], (b, p) =>
      p === 'waiting' ? 'none' : (b.layer?.standing ?? 'none'),
    )}
    title={derive([box, place], (b) =>
      [
        `#${b.number} ${b.title}`,
        ...(b.detail === undefined ? [] : [b.detail]),
        ...(b.layer !== undefined
          ? [b.layer.detail]
          : b.checkedAhead
            ? ['The worker is checking it ahead on a queue/pr- layer.']
            : []),
        ...(b.bypass === undefined
          ? []
          : [`Only a ruleset bypass merges it: ${b.bypass}.`]),
      ].join('\n'),
    )}
  >
    <ExternalLink
      class={constant('queue-box-number')}
      href={box.pipe(map(({ url }) => url))}
    >
      {box.pipe(map(({ number }) => `#${number}`))}
    </ExternalLink>
    <span class={constant('queue-box-marks')}>
      <span
        class={constant('priority-pill')}
        data-priority={box.pipe(map(({ priority }) => priority))}
      >
        {box.pipe(map(({ priority }) => (priority === 'none' ? '' : priority)))}
      </span>
      <If
        cond={box.pipe(map(({ bypass }) => bypass !== undefined))}
        then={
          <span class={constant('queue-bypass')}>
            <span aria-hidden={constant('true')}>{constant('⚑ ')}</span>
            {constant('bypass')}
          </span>
        }
      />
    </span>
    <span class={constant('queue-box-place')}>
      <If
        cond={derive(
          [box, place],
          (b, p) =>
            p === 'running' ||
            (p !== 'waiting' && b.layer?.standing === 'running'),
        )}
        then={<span class={constant('spinner')} />}
      />
      {derive([box, place], (b, p) =>
        p === 'running'
          ? ' running'
          : p === 'waiting'
            ? (b.why ?? 'waiting')
            : b.layer !== undefined
              ? `${b.layer.standing === 'running' ? ' ' : ''}${p} · ${b.layer.note}`
              : b.checkedAhead
                ? `${p} · checked ahead`
                : p,
      )}
    </span>
  </li>
);
