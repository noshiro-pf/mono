import { mapBindable, type Bindable, type JSX } from 'synstate-dom';
import type { DisplayStatus } from '../domain/index.mjs';
import { displayStatusLabels } from '../view-model/index.mjs';

type Props = Readonly<{
  displayStatus: Bindable<DisplayStatus>;
}>;

/**
 * A task's status as a coloured tag. The colour is never the only signal:
 * the word is always there.
 */
export const StatusBadge = ({ displayStatus }: Props): JSX.Element => (
  <span
    class={mapBindable(
      displayStatus,
      (status) => `bp6-tag bp6-round status-badge status-${status}`,
    )}
  >
    {mapBindable(displayStatus, (status) => displayStatusLabels[status])}
  </span>
);
