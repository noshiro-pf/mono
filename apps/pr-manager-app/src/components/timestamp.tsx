import { memoNamed } from 'preact-utils';
import { formatLocalTime } from '../format.mjs';
import { epochMsOf } from '../timestamp.mjs';
import { Age } from './age.js';

type Props = Readonly<{
  /** What it is the time of: `pushed`, `updated`, and so on. */
  label: string;
  /** As GitHub sends it; `undefined` when there is no such instant. */
  iso: string | undefined;
}>;

/**
 * One instant, said twice: how long ago in the text, and exactly when in the
 * reader's own time zone on hover.
 *
 * Nothing at all when there is none, rather than a dash: a row of empty
 * labels is a row a reader has to check every time to find it still empty.
 */
export const Timestamp = memoNamed<Props>('Timestamp', (props) => {
  const { label, iso } = props;

  const epochMs = iso === undefined ? undefined : epochMsOf(iso);

  return iso === undefined || epochMs === undefined ? undefined : (
    <span className={'timestamp'}>
      {`${label} `}
      <time dateTime={iso} title={formatLocalTime(epochMs)}>
        <Age epochMs={epochMs} />
      </time>
    </span>
  );
});
