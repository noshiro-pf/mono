import { combine, map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { isReading, type ReportStatus } from '../../store/index.mjs';

/** Reads now; "Reading…" while a read is out. */
export const RefreshButton = ({
  status,
  refresh,
}: Readonly<{
  status: InitializedObservable<ReportStatus>;
  refresh: () => void;
}>): JSX.Element => {
  const reading = status.pipe(map(isReading));

  return (
    <button
      class={constant('button')}
      disabled={combine([reading, status]).pipe(
        map(([r, s]) => r || s.kind === 'no-token'),
      )}
      type={constant('button')}
      onClick={refresh}
    >
      {reading.pipe(map((r) => (r ? 'Reading…' : 'Refresh')))}
    </button>
  );
};
