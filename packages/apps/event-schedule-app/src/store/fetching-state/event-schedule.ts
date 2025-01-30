import { api } from '../../api';
import { fetchThrottleTime } from '../../constants';
import { Router } from '../router';

const [fetchEventSchedule$, fetchEventSchedule] = createVoidEventEmitter();

const fetchEventScheduleThrottled$ = fetchEventSchedule$.chain(
  throttleTime(fetchThrottleTime),
);

const {
  state: eventScheduleResult$,
  useCurrentValue: useEventScheduleResult,
  setState: setEventScheduleResult,
} = createState<
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
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(setInitialValue(undefined));

export const EventScheduleStore = {
  result$,
  useEventScheduleResult,
  fetchEventSchedule,
} as const;
