import {
  type InitializedObservable,
  combine,
  createEventEmitter,
  filter,
  merge,
  throttle,
  unwrapResultOk,
  withInitialValue,
} from 'synstate';
import { createState } from 'synstate-react-hooks';
import { Result, isNotUndefined } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { noop } from '../../utils-ported/index.mjs';
import { Router } from '../router.mjs';

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

combine([
  merge([fetchEventScheduleThrottled$, refetchEventScheduleAfterWrite$]),
  Router.eventId$,
]).subscribe(([_, eventId]) => {
  if (eventId === undefined) {
    return;
  }

  api.event
    .fetch(eventId)
    .then((result) => {
      setEventScheduleResult(result);
    })
    .catch(noop);
});

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('eventScheduleResult', e);
  }
});

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
