import {
  createEventEmitter,
  createState,
  derive,
  map,
  merge,
  throttle,
  withCurrentValueFrom,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { Result, unknownToString } from 'ts-data-forge';
import type { Api } from '../../api/index.mjs';

export type EventScheduleDeps = Readonly<{
  fetchEventSchedule: Api['event']['fetch'];
  /** The event the page shows; it is read again whenever this changes. */
  eventId$: InitializedObservable<string | undefined>;
  /** How long a requested read keeps the next requested one from going out. */
  throttleMs: number;
}>;

export type EventScheduleResult =
  | Result<
      EventSchedule,
      Readonly<{ type: 'not-found' | 'others'; message: string }>
    >
  | undefined;

export type EventScheduleFetcher = Readonly<{
  result$: InitializedObservable<EventScheduleResult>;
  eventSchedule$: InitializedObservable<EventSchedule | undefined>;
  /** Reads the event again, unless one was requested within `throttleMs`. */
  fetchEventSchedule: () => void;
  /**
   * For the refetch after this client has written the event. It is not
   * throttled with the others: `throttle` drops a request that comes within
   * `fetchThrottleTime` of the last one rather than delaying it, so a save made
   * that soon after the page loaded went on showing the event as it was.
   */
  refetchEventScheduleAfterWrite: () => void;
  /** Starts reading, with the first read; returns what stops it. */
  start: () => () => void;
}>;

/** The event the page shows, as the database last answered for it. */
export const createEventScheduleStore = (
  deps: EventScheduleDeps,
): EventScheduleFetcher => {
  const [fetchEventSchedule$, fetchEventSchedule] = createEventEmitter();

  const [refetchEventScheduleAfterWrite$, refetchEventScheduleAfterWrite] =
    createEventEmitter();

  const fetchEventScheduleThrottled$ = fetchEventSchedule$.pipe(
    throttle(deps.throttleMs),
  );

  // The last read, with the event it was for.
  const [lastRead$, setLastRead] = createState<
    | Readonly<{ eventId: string; result: NonNullable<EventScheduleResult> }>
    | undefined
  >(undefined);

  // Derived, not written on navigation: a read counts only while the page names
  // the event it was for, so another event's page never opens on it.
  const result$: InitializedObservable<EventScheduleResult> = derive(
    [lastRead$, deps.eventId$],
    (lastRead, eventId) =>
      lastRead !== undefined && lastRead.eventId === eventId
        ? lastRead.result
        : undefined,
  );

  const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
    result$.pipe(
      map((result) =>
        result !== undefined && Result.isOk(result) ? result.value : undefined,
      ),
    );

  const start = (): (() => void) => {
    const mut_run = {
      stopped: false,
      /** The request made last, the only one whose answer is taken. */
      latest: 0,
    };

    const subscriptions: readonly Subscription[] = [
      // Read on request (the first is made below), and again whenever the page
      // moves to another event.
      merge([
        fetchEventScheduleThrottled$,
        refetchEventScheduleAfterWrite$,
        deps.eventId$,
      ])
        .pipe(withCurrentValueFrom(deps.eventId$))
        .subscribe(([_, eventId]) => {
          // Counted even when there is nothing to read, so that leaving the
          // event also retires the reads still out for it.
          mut_run.latest += 1;

          if (eventId === undefined) {
            return;
          }

          const request = mut_run.latest;

          deps
            .fetchEventSchedule(eventId)
            .then((result) => {
              // A read still out when the store stops is dropped, and so is one
              // a later request has replaced.
              if (mut_run.stopped || request !== mut_run.latest) {
                return;
              }

              setLastRead({ eventId, result });
            })
            .catch((error: unknown) => {
              // The read threw, or a subscriber did while its answer was taken:
              // logged, and taken as a failed read.
              console.error('eventScheduleResult', error);

              if (mut_run.stopped || request !== mut_run.latest) {
                return;
              }

              setLastRead({
                eventId,
                result: Result.err({
                  type: 'others',
                  message: unknownToString(error),
                }),
              });
            });
        }),
      result$.subscribe((e) => {
        if (e !== undefined && Result.isErr(e)) {
          // TODO: use toast
          console.error('eventScheduleResult', e);
        }
      }),
    ] as const;

    // The first read, asked for as the page's own requests are, so that the
    // throttle drops the one the page makes as it mounts.
    fetchEventSchedule();

    return () => {
      mut_run.stopped = true;

      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    };
  };

  return {
    result$,
    eventSchedule$,
    fetchEventSchedule,
    refetchEventScheduleAfterWrite,
    start,
  };
};
