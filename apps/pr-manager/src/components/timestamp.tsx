import { epochMsOf } from 'pr-report-core';
import {
  constant,
  mapBindable,
  MatchOptional,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { formatLocalTime } from '../format.mjs';
import { Age } from './age.js';

type Props = Readonly<{
  /** What it is the time of: `pushed`, `updated`, and so on. */
  label: string;
  /** As GitHub sends it; `undefined` when there is no such instant. */
  iso: Bindable<string | undefined>;
}>;

/**
 * One instant, said twice: how long ago in the text, and exactly when in the
 * reader's own time zone on hover.
 *
 * Nothing at all when there is none, rather than a dash: a row of empty
 * labels is a row a reader has to check every time to find it still empty.
 */
export const Timestamp = ({ label, iso }: Props): JSX.Element => (
  <MatchOptional
    some={(instant$) => (
      <span class={constant('timestamp')}>
        {constant(`${label} `)}
        <time
          dateTime={view(instant$, (instant) => instant.iso)}
          title={view(instant$, (instant) => formatLocalTime(instant.epochMs))}
        >
          <Age epochMs={view(instant$, (instant) => instant.epochMs)} />
        </time>
      </span>
    )}
    value={mapBindable(iso, instantOf)}
  />
);

type Instant = Readonly<{ iso: string; epochMs: number }>;

const instantOf = (iso: string | undefined): Optional<Instant> => {
  const epochMs = iso === undefined ? undefined : epochMsOf(iso);

  return iso === undefined || epochMs === undefined
    ? Optional.none
    : Optional.some({ iso, epochMs });
};
