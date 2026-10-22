import type { EventListItem } from 'event-schedule-app-shared';
import {
  combine,
  createEventEmitter,
  createState,
  debounce,
  filter,
  map,
  merge,
  throttle,
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result, isNotUndefined, tp } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import { Auth } from '../auth.mjs';
import { EventListPageFilterStore } from '../event-list-page-state/index.mjs';

const [fetchEventList$, fetchEventList] = createEventEmitter();

const fetchEventListThrottled$ = fetchEventList$.pipe(
  throttle(fetchThrottleTime),
);

const [fetchedEventListResult$, setFetchedEventListResult] = createState<
  | Result<
      readonly EventListItem[] | undefined,
      Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
    >
  | undefined
>(undefined);

// Read on request (the first is made below), and again whenever the user or a
// filter changes.
const fetchEventListRequest$ = combine(
  tp(
    fetchEventListThrottled$,
    Auth.fireAuthUser$,

    EventListPageFilterStore.filterByText$
      .pipe(withInitialValue(undefined))
      .pipe(withCurrentValueFrom(EventListPageFilterStore.filterText$))
      .pipe(map(([_, filterText]) => filterText)),
    EventListPageFilterStore.filterOptionState$,
    EventListPageFilterStore.showAllPastDaysEvent$,
    EventListPageFilterStore.showOnlyEventSchedulesICreated$,
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

const [useRefreshButtonIsLoading, setRefreshButtonIsLoading] =
  createReducerWithActions(
    (_: boolean, isLoading: boolean) => isLoading,
    false,
    [
      fetchEventListStarted$.pipe(map(() => true)),
      fetchedEventListResult$.pipe(map(() => false)),
    ],
  );

/** Disabled for `fetchThrottleTime` after each read the button can ask for. */
const refreshButtonIsDisabled$ = merge([
  fetchEventListThrottled$.pipe(map(() => true)),
  fetchEventListThrottled$
    .pipe(debounce(fetchThrottleTime))
    .pipe(map(() => false)),
]).pipe(withInitialValue(false));

const useRefreshButtonIsDisabled = (): boolean =>
  useObservableValue(refreshButtonIsDisabled$);

const refreshEventList = (): void => {
  fetchEventList();

  setRefreshButtonIsLoading(true);
};

/* subscriptions */

fetchEventListStarted$.subscribe(
  ([
    _,
    _fireAuthUser,
    filterText,
    filterOptionState,
    showAllPastDaysEvent,
    showOnlyEventSchedulesICreated,
  ]) => {
    api.eventList
      .fetch({
        filterText,
        filterOptionState,
        showAllPastDaysEvent,
        showOnlyEventSchedulesICreated,
      })
      .then((result) => {
        setFetchedEventListResult(result);
      })
      .catch(() => {});
  },
);

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('eventListResult', e);
  }
});

// The first read, asked for as the page's own requests are, so that the
// throttle drops the one the page makes as it mounts.
fetchEventList();

export const eventList$: InitializedObservable<
  readonly EventListItem[] | undefined
> = result$
  .pipe(filter(isNotUndefined))
  .pipe(unwrapResultOk())
  .pipe(withInitialValue(undefined));

export const EventListStore = {
  fetchEventList,
  useRefreshButtonIsDisabled,
  useRefreshButtonIsLoading,
  refreshEventList,
} as const;
