import {
  useDataStream,
  useStreamEffect,
  useStreamValue,
  useValueAsStream,
} from '@noshiro/react-rxjs-utils';
import { asValueFrom, filterNotUndefined } from '@noshiro/rxjs-utils';
import { Result } from '@noshiro/ts-utils';
import { combineLatest, from, Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck, switchMap } from 'rxjs/operators';
import { api } from '../../../api/api';
import { IAnswer } from '../../../types/record/answer';
import { IEventSchedule } from '../../../types/record/event-schedule';
import { IList } from '../../../utils/immutable';
import { clog } from '../../../utils/log';

interface FetchResults {
  eventSchedule$: Observable<undefined | IEventSchedule>;
  answers$: Observable<undefined | IList<IAnswer>>;
  answersResultTimestamp$: Observable<number>;
  errorType:
    | undefined
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' }
    | { data: 'answersResult'; type: 'not-found' | 'others' };
}

export const useFetchResults = (
  fetchEventScheduleThrottled$: Observable<void>,
  fetchAnswersThrottled$: Observable<void>,
  eventId: string | undefined
): FetchResults => {
  const eventId$ = useValueAsStream(eventId);

  const eventScheduleResult$ = useDataStream<
    undefined | Result<IEventSchedule, 'not-found' | 'others'>
  >(
    undefined,
    fetchEventScheduleThrottled$.pipe(
      asValueFrom(eventId$),
      switchMap((eId) => from(api.event.get(eId ?? '')))
    )
  );

  const answersResult$ = useDataStream<{
    timestamp: number;
    value: undefined | Result<IList<IAnswer>, 'not-found' | 'others'>;
  }>(
    { timestamp: Date.now(), value: undefined },
    fetchAnswersThrottled$.pipe(
      asValueFrom(eventId$),
      switchMap((eId) => from(api.answers.getList(eId ?? ''))),
      map((r) => ({ timestamp: Date.now(), value: r }))
    )
  );

  useStreamEffect(eventScheduleResult$, (e) => {
    if (Result.isErr(e)) {
      clog('eventScheduleResult', e);
    }
  });

  useStreamEffect(answersResult$, (e) => {
    if (Result.isErr(e.value)) {
      clog('answersResult', e.value);
    }
  });

  const answersResultTimestamp$ = useDataStream<number>(
    Date.now(),
    answersResult$.pipe(pluck('timestamp'), distinctUntilChanged())
  );

  const eventSchedule$ = useDataStream<undefined | IEventSchedule>(
    undefined,
    eventScheduleResult$.pipe(filterNotUndefined(), map(Result.unwrap))
  );

  const answers$ = useDataStream<undefined | IList<IAnswer>>(
    undefined,
    answersResult$.pipe(
      pluck('value'),
      filterNotUndefined(),
      map(Result.unwrap)
    )
  );

  const errorType$ = useDataStream<
    | undefined
    | { data: 'eventScheduleResult'; type: 'not-found' | 'others' }
    | { data: 'answersResult'; type: 'not-found' | 'others' }
  >(
    undefined,
    combineLatest([eventScheduleResult$, answersResult$]).pipe(
      map(([esr, ar]) =>
        Result.isErr(esr)
          ? { data: 'eventScheduleResult' as const, type: esr.value }
          : Result.isErr(ar.value)
          ? { data: 'answersResult' as const, type: ar.value.value }
          : undefined
      )
    )
  );

  const errorType = useStreamValue(errorType$);

  return {
    eventSchedule$,
    answers$,
    answersResultTimestamp$,
    errorType,
  };
};
