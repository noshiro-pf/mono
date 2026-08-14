import {
  type InitializedObservable,
  combine,
  createEventEmitter,
  filter,
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

combine([fetchEventScheduleThrottled$, Router.eventId$]).subscribe(
  ([_, eventId]) => {
    if (eventId === undefined) return;

    api.event
      .fetch(eventId)
      .then((result) => {
        setEventScheduleResult(result);
      })
      .catch(noop);
  },
);

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
} as const;
