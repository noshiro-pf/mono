import {
  useStream,
  useStreamEffect,
  useStreamValue,
  useValueAsStream,
} from '@noshiro/react-syncflow-hooks';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  fromPromise,
  map,
  Observable,
  pluck,
  switchMap,
  unwrapResultOk,
  withInitialValue,
} from '@noshiro/syncflow';
import { isNotUndefined, Result } from '@noshiro/ts-utils';
import { api } from '../../../api/api';
import { IAnswer } from '../../../types/record/answer';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList } from '../../../utils/immutable';
import { clog } from '../../../utils/log';

type FetchResults = Readonly<{
  eventSchedule$: Observable<IEventSchedule | undefined>;
  answers$: Observable<IList<IAnswer> | undefined>;
  answersResultTimestamp$: Observable<number>;
  errorType:
    | Readonly<{ data: 'answersResult'; type: 'not-found' | 'others' }>
    | Readonly<{ data: 'eventScheduleResult'; type: 'not-found' | 'others' }>
    | undefined;
}>;

export const useFetchResults = (
  fetchEventScheduleThrottled$: Observable<void>,
  fetchAnswersThrottled$: Observable<void>,
  eventId: string | undefined
): FetchResults => {
  const eventId$ = useValueAsStream(eventId);

  const eventScheduleResult$ = useStream<
    Result<IEventSchedule, 'not-found' | 'others'> | undefined
  >(() =>
    combineLatest(fetchEventScheduleThrottled$, eventId$)
      .chain(map(([_, x]) => x))
      .chain(
        switchMap((eId) =>
          fromPromise(api.event.get(eId ?? '')).chain(unwrapResultOk())
        )
      )
      .chain(withInitialValue(undefined))
  );

  const answersResult$ = useStream<{
    timestamp: number;
    value: Result<IList<IAnswer>, 'not-found' | 'others'> | undefined;
  }>(() =>
    combineLatest(fetchAnswersThrottled$, eventId$)
      .chain(map(([_, x]) => x))
      .chain(
        switchMap((eId) =>
          fromPromise(api.answers.getList(eId ?? '')).chain(unwrapResultOk())
        )
      )
      .chain(map((r) => ({ timestamp: Date.now(), value: r })))
      .chain(withInitialValue({ timestamp: Date.now(), value: undefined }))
  );

  useStreamEffect(eventScheduleResult$, (e) => {
    if (e !== undefined && Result.isErr(e)) {
      clog('eventScheduleResult', e);
    }
  });

  useStreamEffect(answersResult$, (e) => {
    if (Result.isErr(e.value)) {
      clog('answersResult', e.value);
    }
  });

  const answersResultTimestamp$ = useStream<number>(() =>
    answersResult$
      .chain(pluck('timestamp'))
      .chain(distinctUntilChanged())
      .chain(withInitialValue(Date.now()))
  );

  const eventSchedule$ = useStream<IEventSchedule | undefined>(() =>
    eventScheduleResult$
      .chain(filter(isNotUndefined))
      .chain(unwrapResultOk())
      .chain(withInitialValue(undefined))
  );

  const answers$ = useStream<IList<IAnswer> | undefined>(() =>
    answersResult$
      .chain(pluck('value'))
      .chain(filter(isNotUndefined))
      .chain(unwrapResultOk())
      .chain(withInitialValue(undefined))
  );

  const errorType$ = useStream<
    | Readonly<{ data: 'answersResult'; type: 'not-found' | 'others' }>
    | Readonly<{ data: 'eventScheduleResult'; type: 'not-found' | 'others' }>
    | undefined
  >(() =>
    combineLatest(eventScheduleResult$, answersResult$)
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
      .chain(withInitialValue(undefined))
  );

  const errorType = useStreamValue(errorType$);

  return {
    eventSchedule$,
    answers$,
    answersResultTimestamp$,
    errorType,
  };
};
