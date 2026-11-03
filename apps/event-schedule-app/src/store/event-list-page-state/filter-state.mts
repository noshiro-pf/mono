import {
  createBooleanState,
  createEventEmitter,
  createState,
  type InitializedObservable,
} from 'synstate';

export type EventListFilterOption = 'archive' | 'inProgress';

export type EventListFilterStore = Readonly<{
  filterOptionState$: InitializedObservable<EventListFilterOption>;
  setFilterOptionState: (next: EventListFilterOption) => void;
  showOnlyEventSchedulesICreated$: InitializedObservable<boolean>;
  setShowOnlyEventSchedulesICreated: (next: boolean) => void;
  showAllPastDaysEvent$: InitializedObservable<boolean>;
  setShowAllPastDaysEvent: (next: boolean) => void;
  filterText$: InitializedObservable<string>;
  setFilterText: (next: string) => void;
  /** Each press of the filter button. */
  filterByText$: ReturnType<typeof createEventEmitter>[0];
  filterByText: () => void;
}>;

/** The event list page's filters, as the user has set them. */
export const createEventListFilterStore = (): EventListFilterStore => {
  const [filterOptionState$, setFilterOptionState] =
    createState<EventListFilterOption>('inProgress');

  const [
    showOnlyEventSchedulesICreated$,
    { setState: setShowOnlyEventSchedulesICreated },
  ] = createBooleanState(false);

  const [showAllPastDaysEvent$, { setState: setShowAllPastDaysEvent }] =
    createBooleanState(false);

  const [filterText$, setFilterText] = createState<string>('');

  const [filterByText$, filterByText] = createEventEmitter();

  return {
    filterOptionState$,
    setFilterOptionState,
    showOnlyEventSchedulesICreated$,
    setShowOnlyEventSchedulesICreated,
    showAllPastDaysEvent$,
    setShowAllPastDaysEvent,
    filterText$,
    setFilterText,
    filterByText$,
    filterByText,
  };
};
