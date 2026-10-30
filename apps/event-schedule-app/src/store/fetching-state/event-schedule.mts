import {
  createEventEmitter,
  filter,
  merge,
  throttle,
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { createState } from 'synstate-react-hooks';
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
  useEventScheduleResult: () => EventScheduleResult;
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

  const [
    useEventScheduleResult,
    setEventScheduleResult,
    { state: eventScheduleResult$ },
  ] = createState<EventScheduleResult>(undefined);

  const result$ = eventScheduleResult$;

  const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
    result$
      .pipe(filter(isNotUndefined))
      .pipe(unwrapResultOk())
      .pipe(withInitialValue(undefined));

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

    const subscriptions: readonly Subscription[] = [
      // Read on request (the first is made below), and again whenever the
      // page moves to another event.
      merge([
        fetchEventScheduleThrottled$,
        refetchEventScheduleAfterWrite$,
        deps.eventId$,
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
    useEventScheduleResult,
    fetchEventSchedule,
    refetchEventScheduleAfterWrite,
    start,
  };
};
