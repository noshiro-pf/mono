import type { Answer, EventSchedule } from '@noshiro/event-schedule-app-shared';
import type { InitializedObservable } from '@noshiro/syncflow';
import {
  combineLatest,
  createState,
  createVoidEventEmitter,
  distinctUntilChanged,
  filter,
  map,
  pluck,
  throttleTime,
  unwrapResultOk,
  withInitialValue,
} from '@noshiro/syncflow';
import { isNotUndefined, Result } from '@noshiro/ts-utils';
import { api } from '../api';
import { fetchThrottleTime } from '../constants';
import { clog } from '../utils';
import { router } from './router';

const [fetchEventSchedule$, fetchEventSchedule] = createVoidEventEmitter();

const [fetchAnswers$, fetchAnswers] = createVoidEventEmitter();

const fetchEventScheduleThrottled$ = fetchEventSchedule$.chain(
  throttleTime(fetchThrottleTime)
);

const fetchAnswersThrottled$ = fetchAnswers$.chain(
  throttleTime(fetchThrottleTime)
);

const [eventScheduleResult$, setEventScheduleResult] = createState<
  Result<EventSchedule, 'not-found' | 'others'> | undefined
>(undefined);

router.eventId$.subscribe((eId) => {
  if (eId === undefined) return;
  api.event.get(eId).then(setEventScheduleResult).catch(console.error);
});

const [answersResult$, setAnswersResult] = createState<
  Readonly<{
    timestamp: number;
    value: Result<readonly Answer[], 'not-found' | 'others'> | undefined;
  }>
>({ timestamp: Date.now(), value: undefined });

combineLatest([fetchAnswersThrottled$, router.eventId$] as const).subscribe(
  ([_, eventId]) => {
    if (eventId === undefined) return;

    api.answers
      .getList(eventId)
      .then((result) => {
        setAnswersResult({ timestamp: Date.now(), value: result });
      })
      .catch(console.error);
  }
);

const eventSchedule$: InitializedObservable<EventSchedule | undefined> =
  eventScheduleResult$
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));

const answers$: InitializedObservable<readonly Answer[] | undefined> =
  answersResult$
    .chain(pluck('value'))
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));

const errorType$: InitializedObservable<
  | Readonly<{ data: 'answersResult'; type: 'not-found' | 'others' }>
  | Readonly<{ data: 'eventScheduleResult'; type: 'not-found' | 'others' }>
  | undefined
> = combineLatest([eventScheduleResult$, answersResult$] as const)
  .chain(
    map(([esr, ar]) =>
      Result.isErr(esr)
        ? ({
            data: 'eventScheduleResult' as const,
            type: esr.value,
          } as const)
        : Result.isErr(ar.value)
        ? ({
            data: 'answersResult' as const,
            type: ar.value.value,
          } as const)
        : undefined
    )
  )
  .chain(withInitialValue(undefined));

const [refreshButtonIsLoading$, setRefreshButtonIsLoading] =
  createState<boolean>(false);

const answersResultTimestamp$: InitializedObservable<number> = answersResult$
  .chain(pluck('timestamp'))
  .chain(distinctUntilChanged())
  .chain(withInitialValue(Date.now()));

fetchAnswersThrottled$.subscribe(() => {
  setRefreshButtonIsLoading(true);
});
answersResultTimestamp$.subscribe(() => {
  setRefreshButtonIsLoading(false);
});

const [refreshButtonIsDisabled$, setRefreshButtonIsDisabled] =
  createState<boolean>(false);

{
  let timer: TimerId | undefined = undefined;
  fetchAnswersThrottled$.subscribe(() => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    setRefreshButtonIsDisabled(true);
    timer = setTimeout(() => {
      setRefreshButtonIsDisabled(false);
    }, fetchThrottleTime);
  });
}

export {
  eventScheduleResult$,
  eventSchedule$,
  answers$,
  errorType$,
  fetchAnswers,
  fetchEventSchedule,
  refreshButtonIsLoading$,
  refreshButtonIsDisabled$,
};

eventScheduleResult$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});

answersResult$.subscribe((e) => {
  if (Result.isErr(e.value)) {
    clog('answersResult', e.value);
  }
});

fetchEventScheduleThrottled$.subscribe(() => {
  clog('fetchEventScheduleThrottled$');
});

fetchAnswersThrottled$.subscribe(() => {
  clog('fetchAnswers$');
});

eventScheduleResult$.subscribe((e) => {
  if (Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});
