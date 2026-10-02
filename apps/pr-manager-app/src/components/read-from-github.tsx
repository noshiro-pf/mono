import { memoNamed } from 'preact-utils';
import { formatLocalTime } from '../format.mjs';
import { readerSignals } from '../store/index.mjs';
import { Age } from './age.js';

/**
 * When the report on screen was read: how long ago, and exactly when in the
 * reader's own time zone.
 *
 * Its own component because every read changes it, and the one that reads
 * it is the one that renders again for it.
 */
export const ReadFromGitHub = memoNamed('ReadFromGitHub', () => {
  const readAt = readerSignals.readAt.value;

  return (
    <p className={'page-subtitle'}>
      {'Read from GitHub '}
      <Age epochMs={readAt} />
      {' · '}
      {formatLocalTime(readAt)}
    </p>
  );
});
