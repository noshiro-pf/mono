import { type EventListItem } from 'event-schedule-app-shared';
import {
  combine,
  createEventEmitter,
  createState,
  filter,
  map,
  throttle,
  unwrapResultOk,
  withCurrentValueFrom,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { createBooleanState } from 'synstate-react-hooks';
import { Result, isNotUndefined, tp } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { fetchThrottleTime } from '../../constants/index.mjs';
import { noop, type TimerId } from '../../utils-ported/index.mjs';
import { Auth } from '../auth.mjs';
import { EventListPageFilterStore } from '../event-list-page-state/index.mjs';

const [fetchEventList$, fetchEventList] = createEventEmitter();

const fetchEventListThrottled$ = fetchEventList$.pipe(
  throttle(fetchThrottleTime),
);

const [eventListResult$, setEventListResult] = createState<
  | Result<
      readonly EventListItem[] | undefined,
      Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
    >
  | undefined
>(undefined);

const result$ = eventListResult$;

const [useRefreshButtonIsLoading, { setState: setRefreshButtonIsLoading }] =
  createBooleanState(false);

const [useRefreshButtonIsDisabled, { setState: setRefreshButtonIsDisabled }] =
  createBooleanState(false);

const refreshEventList = (): void => {
  fetchEventList();

  setRefreshButtonIsLoading(true);
};

/* subscriptions */

combine(
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
).subscribe(
  ([
    _,
    fireAuthUser,
    filterText,
    filterOptionState,
    showAllPastDaysEvent,
    showOnlyEventSchedulesICreated,
  ]) => {
    if (fireAuthUser?.uid === undefined) {
      setEventListResult(Result.ok(undefined));

      return;
    }

    setRefreshButtonIsLoading(true);

    api.eventList
      .fetch({
        filterText,
        filterOptionState,
        showAllPastDaysEvent,
        showOnlyEventSchedulesICreated,
      })
      .then((result) => {
        setEventListResult(result);

        setRefreshButtonIsLoading(false);
      })
      .catch(noop);
  },
);

result$.subscribe((e) => {
  if (e !== undefined && Result.isErr(e)) {
    // TODO: use toast
    console.error('eventListResult', e);
  }
});

{
  let mut_timer: TimerId | undefined = undefined;

  fetchEventListThrottled$.subscribe(() => {
    if (mut_timer !== undefined) {
      clearTimeout(mut_timer);
    }

    setRefreshButtonIsDisabled(true);

    mut_timer = setTimeout(() => {
      setRefreshButtonIsDisabled(false);
    }, fetchThrottleTime);
  });
}

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
