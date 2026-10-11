import { computed } from '@preact/signals';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { describeAge } from '../format.mjs';
import { readerSignals } from '../store/index.mjs';

type Props = Readonly<{
  /** The instant, in milliseconds since the epoch. */
  epochMs: number;
}>;

/**
 * How long ago an instant was — "3 minutes ago" — kept current by the clock
 * without a render.
 *
 * What it draws is a computed signal rather than its value, and Preact binds
 * a signal child to its text node: a tick rewrites that text and renders no
 * component, this one included. Reading `.value` here instead would
 * subscribe the component, and every tick would render it again.
 */
export const Age = memoNamed<Props>('Age', (props) => {
  const { epochMs } = props;

  const age = useMemo(
    () => computed(() => describeAge(epochMs, readerSignals.nowMs.value)),
    [epochMs],
  );

  return <>{age}</>;
});
