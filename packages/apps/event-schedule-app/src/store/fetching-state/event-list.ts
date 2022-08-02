import type { EventListItem } from '@noshiro/event-schedule-app-shared';
import { withLatestI } from '@noshiro/syncflow';
import { api } from '../../api';
import { fetchThrottleTime } from '../../constants';
import { fireAuthUser$ } from '../auth';
import { EventListPageFilterStore } from '../event-list-page-state';

export namespace EventListStore {
  const [fetchEventList$, _fetchEventList] = createVoidEventEmitter();

  export const fetchEventList = _fetchEventList;

  const fetchEventListThrottled$ = fetchEventList$.chain(
    throttleTime(fetchThrottleTime)
  );

  const { state$: eventListResult$, setState: setEventListResult } =
    createState<
      | Result<
          readonly EventListItem[] | undefined,
          Readonly<{ type: 'others' | 'wrong-type-response'; message: string }>
        >
      | undefined
    >(undefined);

  export const result$ = eventListResult$;

  export const {
    state$: refreshButtonIsLoading$,
    setState: setRefreshButtonIsLoading,
  } = createState<boolean>(false);

  export const {
    state$: refreshButtonIsDisabled$,
    setState: setRefreshButtonIsDisabled,
  } = createState<boolean>(false);

  export const refreshEventList = (): void => {
    fetchEventList();
    setRefreshButtonIsLoading(true);
  };

  /* subscriptions */

  combineLatest(
    tp(
      fetchEventListThrottled$,
      fireAuthUser$,

      EventListPageFilterStore.filterByText$
        .chain(withInitialValue(undefined))
        .chain(withLatestI(EventListPageFilterStore.filterText$))
        .chain(mapI(([_, filterText]) => filterText)),
      EventListPageFilterStore.filterOptionState$,
      EventListPageFilterStore.showAllPastDaysEvent$,
      EventListPageFilterStore.showOnlyEventSchedulesICreated$
    )
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
    }
  );

  result$.subscribe((e) => {
    if (Result.isErr(e)) {
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
}

export const eventList$: InitializedObservable<
  readonly EventListItem[] | undefined
> = EventListStore.result$
  .chain(filter(isNotUndefined))
  .chain(unwrapResultOk())
  .chain(withInitialValue(undefined));
