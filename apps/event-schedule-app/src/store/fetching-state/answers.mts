import {
  createEventEmitter,
  createState,
  debounce,
  filter,
  map,
  mapTo,
  merge,
  throttle,
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result, isNotUndefined } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import { Router } from '../router.mjs';
import { EventScheduleStore } from './event-schedule.mjs';

const [fetchAnswers$, fetchAnswers] = createEventEmitter();

/**
 * For the refetch after this client has written an answer. Not throttled, for
 * the reason `refetchEventScheduleAfterWrite` gives.
 */
const [refetchAnswersAfterWrite$, refetchAnswersAfterWrite] =
  createEventEmitter();

const fetchAnswersThrottled$ = fetchAnswers$.pipe(throttle(fetchThrottleTime));

const [answersResult$, setAnswersResult] = createState<
  | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
  | undefined
>(undefined);

const result$ = answersResult$;

// Read on request (the first is made below), and again whenever the page moves
// to another event.
const fetchAnswersStarted$ = merge([
  fetchAnswersThrottled$,
  refetchAnswersAfterWrite$,
  Router.eventId$,
])
  .pipe(withCurrentValueFrom(Router.eventId$))
  // Every request is a read, even one for the event already read.
  .pipe(map(([_, eventId]) => eventId, { equals: () => false }))
  .pipe(filter(isNotUndefined));

const [useRefreshButtonIsLoading, setRefreshButtonIsLoading] =
  createReducerWithActions(
    (_: boolean, isLoading: boolean) => isLoading,
    false,
    [fetchAnswersStarted$.pipe(mapTo(true)), answersResult$.pipe(mapTo(false))],
  );

/** Disabled for `fetchThrottleTime` after each read the button can ask for. */
const refreshButtonIsDisabled$ = merge([
  fetchAnswersThrottled$.pipe(mapTo(true)),
  fetchAnswersThrottled$.pipe(debounce(fetchThrottleTime)).pipe(mapTo(false)),
]).pipe(withInitialValue(false));

const useRefreshButtonIsDisabled = (): boolean =>
  useObservableValue(refreshButtonIsDisabled$);

const refreshAnswers = (): void => {
  EventScheduleStore.fetchEventSchedule();

  fetchAnswers();

  setRefreshButtonIsLoading(true);
};

/* subscriptions */

fetchAnswersStarted$.subscribe((eventId) => {
  api.answers
    .fetchList(eventId)
    .then((result) => {
      setAnswersResult(result);
    })
    .catch(() => {});
});

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('answersResult', e.value);
  }
});

// The first read, asked for as the page's own requests are, so that the
// throttle drops the one the page makes as it mounts.
fetchAnswers();

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
  refetchAnswersAfterWrite,
  refreshAnswers,
} as const;
