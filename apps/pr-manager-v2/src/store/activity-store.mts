import { readContextOf, type Read } from 'pr-report-core-v2';
import { createState, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import {
  nextMidnightMs,
  type Repo,
  type WeeklyActivity,
} from '../domain/index.mjs';
import {
  browserTransport,
  readWeeklyActivity,
  type StoredToken,
} from '../github/index.mjs';
import { describeReadError } from './report-store.mjs';
import type { Timers } from './timers.mjs';

export type ActivityStatus = Readonly<
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; activity: WeeklyActivity }
  | { kind: 'failed'; message: string }
>;

export type ReadActivity = (
  token: string,
  nowMs: number,
) => Promise<Read<WeeklyActivity>>;

export type ActivityDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  timers: Timers;
  read: ReadActivity;
}>;

export type ActivityStore = Readonly<{
  open: InitializedObservable<boolean>;
  status: InitializedObservable<ActivityStatus>;
  openDialog: () => void;
  closeDialog: () => void;
  retry: () => void;
  start: () => () => void;
}>;

/**
 * The Activity dialog (spec §5): open or not, and the week it shows.
 *
 * - **Read when opened**, never with the report, so a reader who does not
 *   open it pays no search. Each opening reads again, since today moves; what
 *   is held stays on screen meanwhile when it is of the same day.
 * - **Midnight moves the week on**: read again then if open, otherwise
 *   forgotten. A sleeping tab's timer fires late, so an opening also checks the
 *   held week is today's.
 * - A token changed forgets the week, as it empties the page.
 * - Only the latest read is shown; one overtaken is dropped.
 */
export const createActivityStore = (deps: ActivityDeps): ActivityStore => {
  const [open, setOpen, { getSnapshot: getOpen }] = createState(false);

  const [status, setStatus, { getSnapshot: getStatus }] =
    createState<ActivityStatus>({ kind: 'idle' });

  const mut_reads = { latest: 0 };

  const read = (keepShown: boolean): void => {
    mut_reads.latest += 1;

    const id = mut_reads.latest;

    const stored = deps.token.getSnapshot().value;

    if (stored === undefined) {
      setStatus({
        kind: 'failed',
        message: 'There is no token to read GitHub with.',
      });

      return;
    }

    if (!keepShown) {
      setStatus({ kind: 'loading' });
    }

    // A read that throws is a failed read too, or the dialog would say
    // "Counting…" until midnight.
    (async () => deps.read(stored.value, deps.timers.now()))()
      .then((answer): ActivityStatus =>
        Result.isOk(answer)
          ? { kind: 'ready', activity: answer.value }
          : { kind: 'failed', message: describeReadError(answer.value) },
      )
      .catch((): ActivityStatus => ({
        kind: 'failed',
        message: 'Could not read the week’s activity: the read threw.',
      }))
      .then((next) => {
        if (id === mut_reads.latest) {
          setStatus(next);
        }
      })
      .catch(() => undefined);
  };

  /** The week held is no longer the one to show. */
  const forget = (): void => {
    if (getOpen()) {
      read(false);
    } else {
      mut_reads.latest += 1;

      setStatus({ kind: 'idle' });
    }
  };

  return {
    open,
    status,
    openDialog: () => {
      setOpen(true);

      const held = getStatus();

      if (held.kind === 'loading') {
        return;
      }

      const nowMs = deps.timers.now();

      read(
        held.kind === 'ready' &&
          nextMidnightMs(held.activity.countedAtMs) === nextMidnightMs(nowMs),
      );
    },
    closeDialog: () => {
      setOpen(false);
    },
    retry: () => {
      read(false);
    },
    start: () => {
      const mut_timer = { cancel: (): void => undefined };

      const schedule = (): void => {
        const nowMs = deps.timers.now();

        mut_timer.cancel = deps.timers.setTimer(
          nextMidnightMs(nowMs) - nowMs,
          () => {
            forget();

            schedule();
          },
        );
      };

      schedule();

      // The token's first value is the one the page started with, no change.
      const mut_token = { first: true };

      const subscription = deps.token.subscribe(() => {
        if (mut_token.first) {
          mut_token.first = false;

          return;
        }

        forget();
      });

      return () => {
        mut_timer.cancel();

        subscription.unsubscribe();
      };
    },
  };
};

/**
 * The browser's reader. Its budget is not reported: one search query when the
 * dialog opens is not what paces the poll.
 */
export const browserReadActivity =
  (repo: Repo): ReadActivity =>
  (token, nowMs) =>
    readWeeklyActivity(
      readContextOf({
        transport: browserTransport(() => undefined),
        owner: repo.owner,
        name: repo.name,
        token,
      }),
      nowMs,
    );
