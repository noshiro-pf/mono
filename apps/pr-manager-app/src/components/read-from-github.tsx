import { memoNamed } from 'preact-utils';
import { formatLocalTime } from '../format.mjs';
import { readerSignals } from '../store/index.mjs';
import { Age } from './age.js';

type Props = Readonly<{
  /**
   * In the folded header, a few words beside the title, with the exact time
   * in the tooltip; otherwise its own line under the header.
   */
  folded: boolean;
}>;

/**
 * When the report on screen was read: how long ago, and exactly when in the
 * reader's own time zone.
 *
 * Its own component because every read changes it, and the one that reads
 * it is the one that renders again for it.
 */
export const ReadFromGitHub = memoNamed<Props>('ReadFromGitHub', (props) => {
  const { folded } = props;

  const readAt = readerSignals.readAt.value;

  return folded ? (
    <span className={'toolbar-read'} title={formatLocalTime(readAt)}>
      {'Read '}
      <Age epochMs={readAt} />
    </span>
  ) : (
    <p className={'page-subtitle read-from-github'}>
      {'Read from GitHub '}
      <Age epochMs={readAt} />
      {' · '}
      {formatLocalTime(readAt)}
    </p>
  );
});
