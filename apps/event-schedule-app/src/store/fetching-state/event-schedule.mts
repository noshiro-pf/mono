import {
  createEventEmitter,
  createOwner,
  createState,
  dropInitialValue,
  filter,
  map,
  merge,
  throttle,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { Result, isNotUndefined } from 'ts-data-forge';
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

  const [eventScheduleResult$, setEventScheduleResult] =
    createState<EventScheduleResult>(undefined);

  const result$ = eventScheduleResult$;

  const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
    result$
      .pipe(filter(isNotUndefined))
      .pipe(map((result) => Result.unwrapOk(result)))
      .pipe(withInitialValue(undefined));

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

    // Every node and subscription `start` makes belongs to one owner, so that
    // stopping disposes them all, the `merge` and `dropInitialValue` before the
    // first subscription included.
    const owner = createOwner();

    owner.run(() => {
      // Read on request (the first is made below), and again whenever the page
      // moves to another event.
      merge([
        fetchEventScheduleThrottled$,
        refetchEventScheduleAfterWrite$,
        // The event it shows when this starts is read by the first request.
        deps.eventId$.pipe(dropInitialValue()),
      ])
        .pipe(withCurrentValueFrom(deps.eventId$))
        .subscribe(([_, eventId]) => {
          if (eventId === undefined) {
            return;
          }

          deps
            .fetchEventSchedule(eventId)
            .then((result) => {
              // A read still out when the store stops is dropped.
              if (mut_run.stopped) {
                return;
              }

              setEventScheduleResult(result);
            })
            .catch(() => {});
        });

      result$.subscribe((e) => {
        if (e !== undefined && Result.isErr(e)) {
          // TODO: use toast
          console.error('eventScheduleResult', e);
        }
      });
    });

    // The first read, asked for as the page's own requests are, so that the
    // throttle drops the one the page makes as it mounts.
    fetchEventSchedule();

    return () => {
      mut_run.stopped = true;

      owner.dispose();
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
