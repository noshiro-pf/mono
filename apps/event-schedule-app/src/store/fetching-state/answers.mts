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
  type Subscription,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result, isNotUndefined } from 'ts-data-forge';
import type { Api } from '../../api/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';

export type AnswersDeps = Readonly<{
  fetchAnswers: Api['answers']['fetchList'];
  /** The event the page shows; its answers are read again whenever this changes. */
  eventId$: InitializedObservable<string | undefined>;
  /** Asked for with the answers when the refresh button is pressed. */
  fetchEventSchedule: () => void;
  /** How long a requested read keeps the next requested one from going out. */
  throttleMs: number;
}>;

export type AnswersResult =
  | Result<readonly Answer[], Readonly<{ type: 'others'; message: string }>>
  | undefined;

export type AnswersFetcher = Readonly<{
  answers$: InitializedObservable<readonly Answer[] | undefined>;
  result$: InitializedObservable<AnswersResult>;
  /** Whether a read the refresh button asked for has yet to come back. */
  refreshButtonIsLoading$: InitializedObservable<boolean>;
  /** Disabled for `throttleMs` after each read the button can ask for. */
  refreshButtonIsDisabled$: InitializedObservable<boolean>;
  useRefreshButtonIsDisabled: () => boolean;
  useRefreshButtonIsLoading: () => boolean;
  /** Reads the answers again, unless a read was requested within `throttleMs`. */
  fetchAnswers: () => void;
  /**
   * For the refetch after this client has written an answer. Not throttled, for
   * the reason `refetchEventScheduleAfterWrite` gives.
   */
  refetchAnswersAfterWrite: () => void;
  refreshAnswers: () => void;
  /** Starts reading, with the first read; returns what stops it. */
  start: () => () => void;
}>;

/** The answers to the event the page shows, as the database last answered. */
export const createAnswersStore = (deps: AnswersDeps): AnswersFetcher => {
  const [fetchAnswers$, fetchAnswers] = createEventEmitter();

  const [refetchAnswersAfterWrite$, refetchAnswersAfterWrite] =
    createEventEmitter();

  const fetchAnswersThrottled$ = fetchAnswers$.pipe(throttle(deps.throttleMs));

  const [answersResult$, setAnswersResult] =
    createState<AnswersResult>(undefined);

  const result$ = answersResult$;

  // Read on request (the first is made in `start`), and again whenever the page
  // moves to another event.
  const fetchAnswersStarted$ = merge([
    fetchAnswersThrottled$,
    refetchAnswersAfterWrite$,
    deps.eventId$,
  ])
    .pipe(withCurrentValueFrom(deps.eventId$))
    // Every request is a read, even one for the event already read.
    .pipe(map(([_, eventId]) => eventId, { equals: () => false }))
    .pipe(filter(isNotUndefined));

  const [
    useRefreshButtonIsLoading,
    setRefreshButtonIsLoading,
    { state: refreshButtonIsLoading$ },
  ] = createReducerWithActions(
    (_: boolean, isLoading: boolean) => isLoading,
    false,
    [fetchAnswersStarted$.pipe(mapTo(true)), answersResult$.pipe(mapTo(false))],
  );

  /** Disabled for `throttleMs` after each read the button can ask for. */
  const refreshButtonIsDisabled$ = merge([
    fetchAnswersThrottled$.pipe(mapTo(true)),
    fetchAnswersThrottled$.pipe(debounce(deps.throttleMs)).pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const useRefreshButtonIsDisabled = (): boolean =>
    useObservableValue(refreshButtonIsDisabled$);

  const refreshAnswers = (): void => {
    deps.fetchEventSchedule();

    fetchAnswers();

    setRefreshButtonIsLoading(true);
  };

  const answers$: InitializedObservable<readonly Answer[] | undefined> = result$
    .pipe(filter(isNotUndefined))
    .pipe(unwrapResultOk())
    .pipe(withInitialValue(undefined));

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

    const subscriptions: readonly Subscription[] = [
      fetchAnswersStarted$.subscribe((eventId) => {
        deps
          .fetchAnswers(eventId)
          .then((result) => {
            // A read still out when the store stops is dropped.
            if (mut_run.stopped) {
              return;
            }

            setAnswersResult(result);
          })
          .catch(() => {});
      }),
      result$.subscribe((e) => {
        if (e !== undefined && Result.isErr(e)) {
          // TODO: use toast
          console.error('answersResult', e.value);
        }
      }),
    ] as const;

    // The first read, asked for as the page's own requests are, so that the
    // throttle drops the one the page makes as it mounts.
    fetchAnswers();

    return () => {
      mut_run.stopped = true;

      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }
    };
  };

  return {
    answers$,
    result$,
    refreshButtonIsLoading$,
    refreshButtonIsDisabled$,
    useRefreshButtonIsDisabled,
    useRefreshButtonIsLoading,
    fetchAnswers,
    refetchAnswersAfterWrite,
    refreshAnswers,
    start,
  };
};
