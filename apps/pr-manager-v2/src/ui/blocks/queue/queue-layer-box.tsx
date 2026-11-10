import { combine, map, type InitializedObservable } from 'synstate';
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
    title={combine([box, place]).pipe(
      map(([b]) =>
        [
          `#${b.number} ${b.title}`,
          ...(b.detail === undefined ? [] : [b.detail]),
          ...(b.checkedAhead
            ? ['The worker is checking it ahead on a queue/pr- layer.']
            : []),
          ...(b.bypass === undefined
            ? []
            : [`Only a ruleset bypass merges it: ${b.bypass}.`]),
        ].join('\n'),
      ),
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
        cond={place.pipe(map((p) => p === 'running'))}
        then={<span class={constant('spinner')} />}
      />
      {combine([box, place]).pipe(
        map(([b, p]) =>
          p === 'running'
            ? ' running'
            : p === 'waiting'
              ? (b.why ?? 'waiting')
              : b.checkedAhead
                ? `${p} · checked ahead`
                : p,
        ),
      )}
    </span>
  </li>
);
