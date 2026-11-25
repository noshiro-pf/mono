import {
  createEventEmitter,
  createState,
  debounce,
  derive,
  filter,
  map,
  mapTo,
  merge,
  throttle,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
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

  // The last read, with the event it was for.
  const [lastRead$, setLastRead] = createState<
    | Readonly<{ eventId: string; result: NonNullable<AnswersResult> }>
    | undefined
  >(undefined);

  // Derived, not written on navigation: a read counts only while the page names
  // the event it was for, so another event's page never shows its answers.
  const result$: InitializedObservable<AnswersResult> = derive(
    [lastRead$, deps.eventId$],
    (lastRead, eventId) =>
      lastRead !== undefined && lastRead.eventId === eventId
        ? lastRead.result
        : undefined,
  );

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

  const [refreshButtonIsLoading$, setRefreshButtonIsLoading] =
    createReducerWithActions(
      (_: boolean, isLoading: boolean) => isLoading,
      false,
      [fetchAnswersStarted$.pipe(mapTo(true)), lastRead$.pipe(mapTo(false))],
    );

  /** Disabled for `throttleMs` after each read the button can ask for. */
  const refreshButtonIsDisabled$ = merge([
    fetchAnswersThrottled$.pipe(mapTo(true)),
    fetchAnswersThrottled$.pipe(debounce(deps.throttleMs)).pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const refreshAnswers = (): void => {
    deps.fetchEventSchedule();

    fetchAnswers();

    setRefreshButtonIsLoading(true);
  };

  const answers$: InitializedObservable<readonly Answer[] | undefined> =
    result$.pipe(
      map((result) =>
        result !== undefined && Result.isOk(result) ? result.value : undefined,
      ),
    );

  const start = (): (() => void) => {
    const mut_run = {
      stopped: false,
      /** The request made last, the only one whose answer is taken. */
      latest: 0,
    };

    const subscriptions: readonly Subscription[] = [
      fetchAnswersStarted$.subscribe((eventId) => {
        mut_run.latest += 1;

        const request = mut_run.latest;

        deps
          .fetchAnswers(eventId)
          .then((result) => {
            // A read still out when the store stops is dropped, and so is one a
            // later request has replaced.
            if (mut_run.stopped || request !== mut_run.latest) {
              return;
            }

            setLastRead({ eventId, result });
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
    fetchAnswers,
    refetchAnswersAfterWrite,
    refreshAnswers,
    start,
  };
};
