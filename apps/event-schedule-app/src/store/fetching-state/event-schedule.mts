import {
  type InitializedObservable,
  createEventEmitter,
  filter,
  merge,
  throttle,
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
} from 'synstate';
import { createState } from 'synstate-react-hooks';
import { Result, isNotUndefined } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { Router } from '../store.mjs';

const [fetchEventSchedule$, fetchEventSchedule] = createEventEmitter();

/**
 * For the refetch after this client has written the event. It is not
 * throttled with the others: `throttle` drops a request that comes within
 * `fetchThrottleTime` of the last one rather than delaying it, so a save made
 * that soon after the page loaded went on showing the event as it was.
 */
const [refetchEventScheduleAfterWrite$, refetchEventScheduleAfterWrite] =
  createEventEmitter();

const fetchEventScheduleThrottled$ = fetchEventSchedule$.pipe(
  throttle(fetchThrottleTime),
);

const [
  useEventScheduleResult,
  setEventScheduleResult,
  { state: eventScheduleResult$ },
] = createState<
  | Result<
      EventSchedule,
      Readonly<{ type: 'not-found' | 'others'; message: string }>
    >
  | undefined
>(undefined);

const result$ = eventScheduleResult$;

// Read on request (the first is made below), and again whenever the page moves
// to another event.
merge([
  fetchEventScheduleThrottled$,
  refetchEventScheduleAfterWrite$,
  Router.eventId$,
])
  .pipe(withCurrentValueFrom(Router.eventId$))
  .subscribe(([_, eventId]) => {
    if (eventId === undefined) {
      return;
    }

    api.event
      .fetch(eventId)
      .then((result) => {
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

// The first read, asked for as the page's own requests are, so that the
// throttle drops the one the page makes as it mounts.
fetchEventSchedule();

export const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
  result$
    .pipe(filter(isNotUndefined))
    .pipe(unwrapResultOk())
    .pipe(withInitialValue(undefined));

export const EventScheduleStore = {
  result$,
  useEventScheduleResult,
  fetchEventSchedule,
  refetchEventScheduleAfterWrite,
} as const;
