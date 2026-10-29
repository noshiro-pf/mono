import { createEventEmitter, type InitializedObservable } from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';

export type EventListFilterOption = 'archive' | 'inProgress';

export type EventListFilterStore = Readonly<{
  useFilterOptionState: () => EventListFilterOption;
  filterOptionState$: InitializedObservable<EventListFilterOption>;
  setFilterOptionState: (next: EventListFilterOption) => void;
  showOnlyEventSchedulesICreated$: InitializedObservable<boolean>;
  useShowOnlyEventSchedulesICreated: () => boolean;
  setShowOnlyEventSchedulesICreated: (next: boolean) => void;
  showAllPastDaysEvent$: InitializedObservable<boolean>;
  useShowAllPastDaysEvent: () => boolean;
  setShowAllPastDaysEvent: (next: boolean) => void;
  filterText$: InitializedObservable<string>;
  useFilterText: () => string;
  setFilterText: (next: string) => void;
  /** Each press of the filter button. */
  filterByText$: ReturnType<typeof createEventEmitter>[0];
  filterByText: () => void;
}>;

/** The event list page's filters, as the user has set them. */
export const createEventListFilterStore = (): EventListFilterStore => {
  const [
    useFilterOptionState,
    setFilterOptionState,
    { state: filterOptionState$ },
  ] = createState<EventListFilterOption>('inProgress');

  const [
    useShowOnlyEventSchedulesICreated,
    {
      setState: setShowOnlyEventSchedulesICreated,
      state: showOnlyEventSchedulesICreated$,
    },
  ] = createBooleanState(false);

  const [
    useShowAllPastDaysEvent,
    { setState: setShowAllPastDaysEvent, state: showAllPastDaysEvent$ },
  ] = createBooleanState(false);

  const [useFilterText, setFilterText, { state: filterText$ }] =
    createState<string>('');

  const [filterByText$, filterByText] = createEventEmitter();

  return {
    useFilterOptionState,
    filterOptionState$,
    setFilterOptionState,
    showOnlyEventSchedulesICreated$,
    useShowOnlyEventSchedulesICreated,
    setShowOnlyEventSchedulesICreated,
    showAllPastDaysEvent$,
    useShowAllPastDaysEvent,
    setShowAllPastDaysEvent,
    filterText$,
    useFilterText,
    setFilterText,
    filterByText$,
    filterByText,
  };
};
