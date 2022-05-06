export namespace EventListPageFilteringState {
  export const { state$: filterOptionState$, setState: setFilterOptionState } =
    createState<'archive' | 'inProgress'>('inProgress');

  export const {
    state$: showOnlyEventSchedulesICreated$,
    setState: setShowOnlyEventSchedulesICreated,
  } = createBooleanState(false);

  export const {
    state$: showAllPastDaysEvent$,
    setState: setShowAllPastDaysEvent,
  } = createBooleanState(false);

  export const { state$: filterText$, setState: setFilterText } =
    createState<string>('');

  export const [filterByText$, filterByText] = createVoidEventEmitter();
}
