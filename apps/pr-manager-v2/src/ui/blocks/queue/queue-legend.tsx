import { constant, type JSX } from 'synstate-dom';

/** What the queue's boxes, arcs and notes say. */
export const QueueLegend = (): JSX.Element => (
  <ul aria-label={constant('Legend')} class={constant('queue-legend')}>
    <li>
      <span class={constant('spinner queue-legend-ring')} />
      {constant('running')}
    </li>
    <li>
      <span class={constant('queue-swatch')} data-kind={constant('waiting')} />
      {constant('waits for another PR')}
    </li>
    <li>
      <span class={constant('queue-swatch')} data-kind={constant('arc')} />
      {constant('waits for the PR the arc starts at')}
    </li>
    <li>
      <span class={constant('queue-legend-after')}>{constant('after #N')}</span>
      {constant('#N is open, queued or not: a blocker')}
    </li>
    <li>
      <span class={constant('queue-legend-settled')}>
        {constant('after #N')}
      </span>
      {constant('#N merged, closed or not a PR: not a blocker')}
    </li>
    <li>
      <span class={constant('queue-swatch')} data-kind={constant('outside')} />
      {constant('set aside')}
    </li>
    <li>
      <span aria-hidden={constant('true')}>{constant('⚑')}</span>
      {constant('only a ruleset bypass merges it')}
    </li>
    <li>
      {(['high', 'mid', 'low'] as const).map((priority) => (
        <>
          <span
            class={constant('queue-swatch')}
            data-kind={constant('priority')}
            data-priority={constant(priority)}
          />
          {constant(priority)}
        </>
      ))}
    </li>
  </ul>
);
