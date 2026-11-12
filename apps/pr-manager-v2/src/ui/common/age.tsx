import { combine, map, type InitializedObservable } from 'synstate';
import {
  constant,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { describeAge, formatLocalTime } from '../../domain/index.mjs';

type Props = Readonly<{
  /** Epoch milliseconds. */
  at: Bindable<number>;
  now: InitializedObservable<number>;
  /** Written before the age, e.g. `pushed `. */
  prefix?: string;
}>;

/**
 * `3 minutes ago`, kept current by the page's one clock, with the exact time on
 * hover. Only this text node changes on a tick.
 */
export const Age = ({ at, now, prefix = '' }: Props): JSX.Element => (
  <time class={constant('age')} title={mapBindable(at, formatLocalTime)}>
    {combine([toObservable(at), now]).pipe(
      map(([atMs, nowMs]) => `${prefix}${describeAge(atMs, nowMs)}`),
    )}
  </time>
);
