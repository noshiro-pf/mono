const {
  state: filterOptionState$,
  useCurrentValue: useFilterOptionState,
  setState: setFilterOptionState,
} = createState<'archive' | 'inProgress'>('inProgress');

const {
  useCurrentValue: useShowOnlyEventSchedulesICreated,
  state: showOnlyEventSchedulesICreated$,
  setState: setShowOnlyEventSchedulesICreated,
} = createBooleanState(false);

const {
  useCurrentValue: useShowAllPastDaysEvent,
  state: showAllPastDaysEvent$,
  setState: setShowAllPastDaysEvent,
} = createBooleanState(false);

const {
  useCurrentValue: useFilterText,
  state: filterText$,
  setState: setFilterText,
} = createState<string>('');

const [filterByText$, filterByText] = createVoidEventEmitter();

export const EventListPageFilterStore = {
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
} as const;
