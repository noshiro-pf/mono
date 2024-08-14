const { state: filterOptionState$, setState: setFilterOptionState } =
  createState<'archive' | 'inProgress'>('inProgress');

const {
  state: showOnlyEventSchedulesICreated$,
  setState: setShowOnlyEventSchedulesICreated,
} = createBooleanState(false);

const { state: showAllPastDaysEvent$, setState: setShowAllPastDaysEvent } =
  createBooleanState(false);

const { state: filterText$, setState: setFilterText } = createState<string>('');

const [filterByText$, filterByText] = createVoidEventEmitter();

export const EventListPageFilterStore = {
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
} as const;
