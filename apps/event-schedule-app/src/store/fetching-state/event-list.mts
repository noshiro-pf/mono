import type { EventListItem } from 'event-schedule-app-shared';
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
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { Result, isNotUndefined, tp, unknownToString } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import type { EventListFilterStore } from '../event-list-page-state/index.mjs';

export type EventListDeps = Readonly<{
  fetchEventList: Api['eventList']['fetch'];
  /** The signed-in user; the list is theirs, and read again when it changes. */
  fireAuthUser$: InitializedObservable<Readonly<{ uid: string }> | undefined>;
  /** The filters the list is read with, and read again when one changes. */
  filter: StrictPick<
    EventListFilterStore,
    | 'filterByText$'
    | 'filterOptionState$'
    | 'filterText$'
    | 'showAllPastDaysEvent$'
    | 'showOnlyEventSchedulesICreated$'
  >;
  /** How long a requested read keeps the next requested one from going out. */
  throttleMs: number;
}>;

/** The filters a read of the list is made with. */
export type EventListRequest = Parameters<EventListDeps['fetchEventList']>[0];

export type EventListResult =
  | Result<
      readonly EventListItem[] | undefined,
      Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
    >
  | undefined;

export type EventListFetcher = Readonly<{
  /**
   * The list as last read: `undefined` until the first list comes back, again
   * once the user signs out, and after a read that fails (`readFailed$`).
   */
  eventList$: InitializedObservable<readonly EventListItem[] | undefined>;
  /**
   * Whether the last read taken failed: it answered an error, or taking its
   * answer threw. The page shows that, with a way to read again, until a read
   * is answered; none once the user signs out.
   */
  readFailed$: InitializedObservable<boolean>;
  /**
   * The filters the last list that came back was read with, which the filters
   * on the page are not while a read for a change is out; `undefined` until the
   * first list comes back, and again once the user signs out. A read that fails
   * leaves it as it was.
   */
  listedWith$: InitializedObservable<EventListRequest | undefined>;
  /** Reads the list again, unless a read was requested within `throttleMs`. */
  fetchEventList: () => void;
  /**
   * Whether a read has yet to come back: any read, the refresh button's or a
   * filter's; none once the user signs out, nor once the store stops.
   */
  refreshButtonIsLoading$: InitializedObservable<boolean>;
  /** Disabled for `throttleMs` after each read the button can ask for. */
  refreshButtonIsDisabled$: InitializedObservable<boolean>;
  /**
   * `fetchEventList`, for the refresh button: the read it starts is what shows
   * it loading, and none goes out while nobody is signed in, or within
   * `throttleMs` of the last.
   */
  refreshEventList: () => void;
  /** Starts reading, with the first read; returns what stops it. */
  start: () => () => void;
}>;

/** The signed-in user's events, filtered, as the database last answered. */
export const createEventListStore = (deps: EventListDeps): EventListFetcher => {
  const [fetchEventList$, fetchEventList] = createEventEmitter();

  const fetchEventListThrottled$ = fetchEventList$.pipe(
    throttle(deps.throttleMs),
  );

  const [fetchedEventListResult$, setFetchedEventListResult] =
    createState<EventListResult>(undefined);

  // Read on request (the first is made in `start`), and again whenever the user
  // or a filter changes.
  const fetchEventListRequest$ = derive(
    tp(
      fetchEventListThrottled$,
      deps.fireAuthUser$,

      deps.filter.filterByText$
        .pipe(withInitialValue(undefined))
        .pipe(withCurrentValueFrom(deps.filter.filterText$))
        // Every press of the filter button reads again, even for the same text.
        .pipe(map(([_, filterText]) => filterText, { equals: () => false })),
      deps.filter.filterOptionState$,
      deps.filter.showAllPastDaysEvent$,
      deps.filter.showOnlyEventSchedulesICreated$,
    ),
    (...values) => values,
  );

  const fetchEventListStarted$ = fetchEventListRequest$.pipe(
    filter(([_, fireAuthUser]) => fireAuthUser?.uid !== undefined),
  );

  /** Nobody is signed in, so there is no list to read. */
  const signedOutResult$ = fetchEventListRequest$
    .pipe(filter(([_, fireAuthUser]) => fireAuthUser?.uid === undefined))
    .pipe(map(() => Result.ok(undefined)));

  const result$ = merge([fetchedEventListResult$, signedOutResult$]).pipe(
    withInitialValue(undefined),
  );

  const [listedWith$, setListedWith] = createReducerWithActions(
    (_: EventListRequest | undefined, next: EventListRequest | undefined) =>
      next,
    undefined,
    // Signing out leaves no list.
    [signedOutResult$.pipe(mapTo(undefined))],
  );

  const [refreshButtonIsLoading$, setRefreshButtonIsLoading] =
    createReducerWithActions(
      (_: boolean, isLoading: boolean) => isLoading,
      false,
      [
        fetchEventListStarted$.pipe(mapTo(true)),
        fetchedEventListResult$.pipe(mapTo(false)),
        // Signing out drops the answer to a read still out.
        signedOutResult$.pipe(mapTo(false)),
      ],
    );

  /** Disabled for `throttleMs` after each read the button can ask for. */
  const refreshButtonIsDisabled$ = merge([
    fetchEventListThrottled$.pipe(mapTo(true)),
    fetchEventListThrottled$.pipe(debounce(deps.throttleMs)).pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const readFailed$: InitializedObservable<boolean> = result$.pipe(
    map((result) => result !== undefined && Result.isErr(result)),
  );

  const eventList$: InitializedObservable<
    readonly EventListItem[] | undefined
  > = result$
    .pipe(filter(isNotUndefined))
    .pipe(unwrapResultOk())
    .pipe(withInitialValue(undefined));

  const start = (): (() => void) => {
    const mut_run: {
      stopped: boolean;
      /**
       * The read sent last, the only one whose answer is taken; none once the
       * user signs out.
       */
      latest: EventListRequest | undefined;
    } = { stopped: false, latest: undefined };

    const subscriptions: readonly Subscription[] = [
      fetchEventListStarted$.subscribe(
        ([
          _,
          _fireAuthUser,
          filterText,
          filterOptionState,
          showAllPastDaysEvent,
          showOnlyEventSchedulesICreated,
        ]) => {
          const request: EventListRequest = {
            filterText,
            filterOptionState,
            showAllPastDaysEvent,
            showOnlyEventSchedulesICreated,
          };

          mut_run.latest = request;

          const answer = (result: NonNullable<EventListResult>): void => {
            // A read still out when the store stops is dropped, and so is one a
            // later read has overtaken, which would put back the list of
            // filters no longer set.
            if (mut_run.stopped || mut_run.latest !== request) {
              return;
            }

            if (Result.isOk(result)) {
              setListedWith(request);
            }

            setFetchedEventListResult(result);
          };

          deps
            .fetchEventList(request)
            .then(answer)
            .catch((error: unknown) => {
              // The read threw, or a subscriber did while its answer was taken:
              // logged, and taken as a failed read, so that the page shows it
              // with a way to read again rather than loading forever.
              console.error('eventList', error);

              if (mut_run.stopped || mut_run.latest !== request) {
                return;
              }

              setFetchedEventListResult(
                Result.err({ type: 'others', message: unknownToString(error) }),
              );
            });
        },
      ),
      // Signing out drops the answer to a read still out.
      signedOutResult$.subscribe(() => {
        mut_run.latest = undefined;
      }),
      result$.subscribe((e) => {
        if (e !== undefined && Result.isErr(e)) {
          // TODO: use toast
          console.error('eventListResult', e);
        }
      }),
    ] as const;

    // The first read, asked for as the page's own requests are, so that the
    // throttle drops the one the page makes as it mounts.
    fetchEventList();

    return () => {
      mut_run.stopped = true;

      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }

      // The answer to a read still out is dropped, so nothing else would.
      setRefreshButtonIsLoading(false);
    };
  };

  return {
    eventList$,
    readFailed$,
    listedWith$,
    fetchEventList,
    refreshButtonIsLoading$,
    refreshButtonIsDisabled$,
    refreshEventList: fetchEventList,
    start,
  };
};
