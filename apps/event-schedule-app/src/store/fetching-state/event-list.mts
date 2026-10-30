import type { EventListItem } from 'event-schedule-app-shared';
import {
  combine,
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
import { Result, isNotUndefined, tp } from 'ts-data-forge';
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

export type EventListResult =
  | Result<
      readonly EventListItem[] | undefined,
      Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
    >
  | undefined;

export type EventListFetcher = Readonly<{
  eventList$: InitializedObservable<readonly EventListItem[] | undefined>;
  /** Reads the list again, unless a read was requested within `throttleMs`. */
  fetchEventList: () => void;
  /** Whether a read the refresh button asked for has yet to come back. */
  refreshButtonIsLoading$: InitializedObservable<boolean>;
  /** Disabled for `throttleMs` after each read the button can ask for. */
  refreshButtonIsDisabled$: InitializedObservable<boolean>;
  useRefreshButtonIsDisabled: () => boolean;
  useRefreshButtonIsLoading: () => boolean;
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
  const fetchEventListRequest$ = combine(
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

  const [
    useRefreshButtonIsLoading,
    setRefreshButtonIsLoading,
    { state: refreshButtonIsLoading$ },
  ] = createReducerWithActions(
    (_: boolean, isLoading: boolean) => isLoading,
    false,
    [
      fetchEventListStarted$.pipe(mapTo(true)),
      fetchedEventListResult$.pipe(mapTo(false)),
    ],
  );

  /** Disabled for `throttleMs` after each read the button can ask for. */
  const refreshButtonIsDisabled$ = merge([
    fetchEventListThrottled$.pipe(mapTo(true)),
    fetchEventListThrottled$.pipe(debounce(deps.throttleMs)).pipe(mapTo(false)),
  ]).pipe(withInitialValue(false));

  const useRefreshButtonIsDisabled = (): boolean =>
    useObservableValue(refreshButtonIsDisabled$);

  const refreshEventList = (): void => {
    fetchEventList();

    setRefreshButtonIsLoading(true);
  };

  const eventList$: InitializedObservable<
    readonly EventListItem[] | undefined
  > = result$
    .pipe(filter(isNotUndefined))
    .pipe(unwrapResultOk())
    .pipe(withInitialValue(undefined));

  const start = (): (() => void) => {
    const mut_run = { stopped: false };

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
          deps
            .fetchEventList({
              filterText,
              filterOptionState,
              showAllPastDaysEvent,
              showOnlyEventSchedulesICreated,
            })
            .then((result) => {
              // A read still out when the store stops is dropped.
              if (mut_run.stopped) {
                return;
              }

              setFetchedEventListResult(result);
            })
            .catch(() => {});
        },
      ),
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
    };
  };

  return {
    eventList$,
    fetchEventList,
    refreshButtonIsLoading$,
    refreshButtonIsDisabled$,
    useRefreshButtonIsDisabled,
    useRefreshButtonIsLoading,
    refreshEventList,
    start,
  };
};
