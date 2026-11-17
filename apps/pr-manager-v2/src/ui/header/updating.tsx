import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { isReading, type ReportStatus } from '../../store/index.mjs';

/**
 * The "Updating…" ring while a read is out: hidden rather than removed when
 * none is, so the line it is in does not jump (spec §4.2). The folded toolbar
 * keeps the ring alone.
 */
export const Updating = ({
  status,
}: Readonly<{ status: InitializedObservable<ReportStatus> }>): JSX.Element => (
  <span
    aria-hidden={status.pipe(map((s) => (!isReading(s)).toString()))}
    class={constant('updating')}
    data-active={status.pipe(map((s) => isReading(s).toString()))}
  >
    <span class={constant('spinner')} />

    <span class={constant('updating-word')}>{constant(' Updating…')}</span>
  </span>
);
