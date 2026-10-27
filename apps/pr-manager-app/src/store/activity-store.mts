/**
 * The week's activity dialog: whether it is open, and the week and today it
 * shows (`weekly-activity.mts`).
 *
 * **Read when it is opened, not with the report**: a reader who never opens
 * the dialog should not pay a search a poll for it. The week's counts are of
 * days that have ended, but today's are still moving, so every opening reads
 * again — one query, both together. On the day it was read, what is held is
 * shown meanwhile rather than "Counting…", since only today can differ.
 *
 * **Midnight moves the week on.** A timer set for the next local midnight
 * reads the new week then if the dialog is open, and otherwise forgets the
 * old one, so the next opening reads it. A tab asleep past midnight fires the
 * timer late; opening the dialog checks the day itself, so that cannot show
 * yesterday's week.
 */

import {
  createState,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { Answered } from '../graphql.mjs';
import type { StoredToken } from '../token.mjs';
import {
  dayKeyOf,
  nextMidnightMs,
  type WeeklyActivity,
} from '../weekly-activity.mjs';

export type ActivityStatus = Readonly<
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'ready'; activity: WeeklyActivity }
  | { type: 'failed'; message: string }
>;

export type ActivityDeps = Readonly<{
  token: InitializedObservable<StoredToken | undefined>;
  load: (token: string, nowMs: number) => Promise<Answered<WeeklyActivity>>;
  now: () => number;
  /** Calls `run` after `delayMs`; returns what cancels it. */
  setTimer: (delayMs: number, run: () => void) => () => void;
}>;

export type ActivityStore = Readonly<{
  open: InitializedObservable<boolean>;
  status: InitializedObservable<ActivityStatus>;
  openDialog: () => void;
  closeDialog: () => void;
  /** Reads the week again, for a read that failed. */
  retry: () => void;
  /** Starts the midnight timer and follows the token; returns what stops both. */
  start: () => () => void;
}>;

export const createActivityStore = (deps: ActivityDeps): ActivityStore => {
  const [isOpen, setOpen] = createState(false);

  const [activityStatus, setStatus, { getSnapshot: getStatus }] =
    createState<ActivityStatus>({ type: 'idle' });

  // Which read is the latest, so that an answer overtaken by another — the
  // token changed, or midnight passed — is dropped rather than shown.
  const mut_reads = { latest: 0 };

  /** `keep` leaves what is shown on screen until the answer replaces it. */
  const read = (keep = false): void => {
    mut_reads.latest += 1;

    const id = mut_reads.latest;

    const stored = deps.token.getSnapshot().value;

    if (stored === undefined) {
      setStatus({
        type: 'failed',
        message: 'There is no token to read GitHub with.',
      });

      return;
    }

    if (!keep) {
      setStatus({ type: 'loading' });
    }

    deps
      .load(stored.value, deps.now())
      .then(({ result }) => {
        if (id !== mut_reads.latest) {
          return;
        }

        setStatus(
          Result.isOk(result)
            ? { type: 'ready', activity: result.value }
            : { type: 'failed', message: result.value },
        );
      })
      .catch(() => undefined);
  };

  const openDialog = (): void => {
    setOpen(true);

    const held = getStatus();

    if (held.type === 'loading') {
      return;
    }

    // Read on the same day, the week still stands and only today is redone.
    read(
      held.type === 'ready' && held.activity.countedOn === dayKeyOf(deps.now()),
    );
  };

  const closeDialog = (): void => {
    setOpen(false);
  };

  /** The week held is no longer the one to show: read it now, or next time. */
  const invalidate = (): void => {
    if (isOpen.getSnapshot().value) {
      read();
    } else {
      mut_reads.latest += 1;

      setStatus({ type: 'idle' });
    }
  };

  const start = (): (() => void) => {
    const mut_run: { cancel: () => void } = { cancel: () => undefined };

    const schedule = (): void => {
      const nowMs = deps.now();

      mut_run.cancel = deps.setTimer(nextMidnightMs(nowMs) - nowMs, () => {
        invalidate();

        schedule();
      });
    };

    schedule();

    // The token's first value is the one the page started with, not a change.
    const mut_token = { first: true };

    const tokenSubscription: Subscription = deps.token.subscribe(() => {
      if (mut_token.first) {
        mut_token.first = false;

        return;
      }

      invalidate();
    });

    return () => {
      mut_run.cancel();

      tokenSubscription.unsubscribe();
    };
  };

  return {
    open: isOpen,
    status: activityStatus,
    openDialog,
    closeDialog,
    retry: () => {
      read();
    },
    start,
  };
};
