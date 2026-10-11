import { memoNamed } from 'preact-utils';
import type { DisplayStatus } from '../domain/index.mjs';
import { displayStatusLabels } from '../view-model/index.mjs';

type Props = Readonly<{
  displayStatus: DisplayStatus;
}>;

/**
 * A task's status as a coloured tag. The colour is never the only signal:
 * the word is always there.
 */
export const StatusBadge = memoNamed<Props>('StatusBadge', (props) => {
  const { displayStatus } = props;

  return (
    <span className={`bp6-tag bp6-round status-badge status-${displayStatus}`}>
      {displayStatusLabels[displayStatus]}
    </span>
  );
});
