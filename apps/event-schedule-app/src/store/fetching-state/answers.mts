import {
  combine,
  createEventEmitter,
  createState,
  filter,
  throttle,
  unwrapResultOk,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { createBooleanState } from 'synstate-react-hooks';
import { Result, isNotUndefined } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { noop, type TimerId } from '../../utils-ported/index.mjs';
import { Router } from '../router.mjs';
import { EventScheduleStore } from './event-schedule.mjs';

const [fetchAnswers$, fetchAnswers] = createEventEmitter();

const fetchAnswersThrottled$ = fetchAnswers$.pipe(throttle(fetchThrottleTime));

const [answersResult$, setAnswersResult] = createState<
  | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
  | undefined
>(undefined);

const result$ = answersResult$;

const [useRefreshButtonIsLoading, { setState: setRefreshButtonIsLoading }] =
  createBooleanState(false);

const [useRefreshButtonIsDisabled, { setState: setRefreshButtonIsDisabled }] =
  createBooleanState(false);

const refreshAnswers = (): void => {
  EventScheduleStore.fetchEventSchedule();

  fetchAnswers();

  setRefreshButtonIsLoading(true);
};

/* subscriptions */

combine([fetchAnswersThrottled$, Router.eventId$]).subscribe(([_, eventId]) => {
  if (eventId === undefined) return;

  setRefreshButtonIsLoading(true);

  api.answers
    .fetchList(eventId)
    .then((result) => {
      setAnswersResult(result);

      setRefreshButtonIsLoading(false);
    })
    .catch(noop);
});

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('answersResult', e.value);
  }
});

{
  let mut_timer: TimerId | undefined = undefined;

  fetchAnswersThrottled$.subscribe(() => {
    if (mut_timer !== undefined) {
      clearTimeout(mut_timer);
    }

    setRefreshButtonIsDisabled(true);

    mut_timer = setTimeout(() => {
      setRefreshButtonIsDisabled(false);
    }, fetchThrottleTime);
  });
}

const answers$: InitializedObservable<readonly Answer[] | undefined> = result$
  .pipe(filter(isNotUndefined))
  .pipe(unwrapResultOk())
  .pipe(withInitialValue(undefined));

export const AnswersStore = {
  answers$,
  result$,
  useRefreshButtonIsDisabled,
  useRefreshButtonIsLoading,
  fetchAnswers,
  refreshAnswers,
} as const;
