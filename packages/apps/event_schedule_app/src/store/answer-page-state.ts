import type {
  Answer,
  EventSchedule,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import type { InitializedObservable, Observable } from '@noshiro/syncflow';
import {
  combineLatest,
  createState,
  createVoidEventEmitter,
  distinctUntilChangedI,
  filter,
  map,
  mapI,
  throttleTime,
  unwrapResultOk,
  withInitialValue,
} from '@noshiro/syncflow';
import { IList, isNotUndefined, Result } from '@noshiro/ts-utils';
import { api } from '../api';
import { fetchThrottleTime } from '../constants';
import type { CalendarCurrentPageReducerState } from '../functions';
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

const [answersResult$, setAnswersResult] = createState<
  Result<readonly Answer[], 'not-found' | 'others'> | undefined
>(undefined);

combineLatest([
  fetchEventScheduleThrottled$,
  router.eventId$,
] as const).subscribe(([_, eventId]) => {
  if (eventId === undefined) return;

  api.event
    .get(eventId)
    .then((result) => {
      setEventScheduleResult(result);
    })
    .catch(console.error);
});

combineLatest([fetchAnswersThrottled$, router.eventId$] as const).subscribe(
  ([_, eventId]) => {
    if (eventId === undefined) return;

    api.answers
      .getList(eventId)
      .then((result) => {
        setAnswersResult(result);
        setRefreshButtonIsLoading(false);
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
    .chain(filter(isNotUndefined))
    .chain(unwrapResultOk())
    .chain(withInitialValue(undefined));

const requiredParticipantsExist$: InitializedObservable<boolean> =
  answers$.chain(
    mapI((answers) => answers?.some((a) => a.isRequiredParticipants) === true)
  );

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
        : Result.isErr(ar)
        ? ({
            data: 'answersResult' as const,
            type: ar.value,
          } as const)
        : undefined
    )
  )
  .chain(withInitialValue(undefined));

const [refreshButtonIsLoading$, setRefreshButtonIsLoading] =
  createState<boolean>(false);

const refreshAnswers = (): void => {
  fetchAnswers();
  setRefreshButtonIsLoading(true);
};

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

const selectedDates$: InitializedObservable<readonly YearMonthDate[]> =
  eventSchedule$.chain(
    mapI(
      (eventSchedule) =>
        eventSchedule?.datetimeRangeList.map((d) => d.ymd) ?? []
    )
  );

const setYearMonth$: Observable<CalendarCurrentPageReducerState> =
  selectedDates$
    .chain(
      map((selectedDates) =>
        IList.isNonEmpty(selectedDates) ? selectedDates[0] : undefined
      )
    )
    .chain(filter(isNotUndefined));

export {
  eventScheduleResult$,
  eventSchedule$,
  answers$,
  errorType$,
  fetchAnswers,
  refreshAnswers,
  fetchEventSchedule,
  refreshButtonIsLoading$,
  refreshButtonIsDisabled$,
  requiredParticipantsExist$,
  selectedDates$,
  setYearMonth$,
};

router.eventId$.chain(distinctUntilChangedI()).subscribe(() => {
  fetchEventSchedule();
  fetchAnswers();
});

eventScheduleResult$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});

answersResult$.subscribe((e) => {
  if (Result.isErr(e)) {
    clog('answersResult', e);
  }
});

eventScheduleResult$.subscribe((e) => {
  if (Result.isErr(e)) {
    clog('eventScheduleResult', e);
  }
});
