import { createEventEmitter } from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';

const [
  useFilterOptionState,
  setFilterOptionState,
  { state: filterOptionState$ },
] = createState<'archive' | 'inProgress'>('inProgress');

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
