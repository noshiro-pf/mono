import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import type { ReportStatus } from '../../store/index.mjs';
import { Age } from '../common/index.mjs';
import { Updating } from './updating.js';

type Props = Readonly<{
  status: InitializedObservable<ReportStatus>;
  now: InitializedObservable<number>;
}>;

/**
 * "Read from GitHub 2 minutes ago", the exact time on hover, the "Updating…"
 * ring, and "last refresh failed" with the reason on hover (spec §4.1, §4.2).
 * Before anything is read it says so instead of giving an age.
 */
export const ReadLine = ({ status, now }: Props): JSX.Element => (
  <p class={constant('read-line')}>
    {status.pipe(
      map((s) =>
        s.kind === 'no-token'
          ? 'Nothing read yet: there is no token.'
          : s.kind === 'first-read'
            ? 'Reading from GitHub…'
            : s.kind === 'failed'
              ? 'Nothing read yet: the read failed.'
              : s.kind === 'waiting'
                ? 'Nothing read yet: it reads once the tab is shown.'
                : '',
      ),
    )}

    <If
      cond={status.pipe(map((s) => s.kind === 'ready'))}
      then={
        <>
          {constant('Read from GitHub ')}

          <Age
            at={status.pipe(map((s) => (s.kind === 'ready' ? s.readAtMs : 0)))}
            now={now}
          />

          <If
            cond={status.pipe(
              map((s) => s.kind === 'ready' && s.failure !== undefined),
            )}
            then={
              <span
                class={constant('read-failed')}
                title={status.pipe(
                  map((s) => (s.kind === 'ready' ? (s.failure ?? '') : '')),
                )}
              >
                {constant(' · ⚠ last refresh failed')}
              </span>
            }
          />
        </>
      }
    />

    <Updating status={status} />
  </p>
);
