import { derive, type Bindable, type JSX } from 'synstate-dom';
import { describeAge } from '../format.mjs';
import { reader } from '../store/index.mjs';

type Props = Readonly<{
  /** The instant, in milliseconds since the epoch. */
  epochMs: Bindable<number>;
}>;

/**
 * How long ago an instant was — "3 minutes ago" — kept current by the clock.
 *
 * One text node bound to the clock and the instant: a tick rewrites that text
 * and nothing else, as every update on this page rewrites only the nodes
 * bound to what changed.
 */
export const Age = ({ epochMs }: Props): JSX.Element => (
  <>{derive([epochMs, reader.nowMs], describeAge)}</>
);
