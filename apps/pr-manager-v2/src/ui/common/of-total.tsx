import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import './common.css';

/**
 * ` of 5` after a count that leaves some out: small and quiet, so the count the
 * list agrees with stays the one that is read.
 */
export const OfTotal = ({
  total,
}: Readonly<{ total: InitializedObservable<number> }>): JSX.Element => (
  <span class={constant('count-total')}>
    {total.pipe(map((n) => ` of ${n}`))}
  </span>
);
