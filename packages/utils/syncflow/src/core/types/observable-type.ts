export type RootObservableType =
  | 'FromArray'
  | 'FromPromise'
  | 'FromSubscribable'
  | 'Interval'
  | 'Of'
  | 'Source'
  | 'Timer';

export type SyncChildObservableType =
  | 'combineLatest'
  | 'distinctUntilChanged'
  | 'filter'
  | 'map'
  | 'mapMaybe'
  | 'mapResultErr'
  | 'mapResultOk'
  | 'mapTo'
  | 'mapWithIndex'
  | 'merge'
  | 'pairwise'
  | 'pluck'
  | 'scan'
  | 'skip'
  | 'skipUntil'
  | 'skipWhile'
  | 'take'
  | 'takeUntil'
  | 'takeWhile'
  | 'throttleTime'
  | 'unwrapMaybe'
  | 'unwrapResultErr'
  | 'unwrapResultOk'
  | 'withBufferedFrom'
  | 'withIndex'
  | 'withInitialValue'
  | 'withLatestFrom'
  | 'zip';

export type AsyncChildObservableType =
  | 'auditTime'
  | 'debounceTime'
  | 'mergeMap'
  | 'switchMap';

export type ChildObservableType =
  | AsyncChildObservableType
  | SyncChildObservableType;

export type ManagerObservableType =
  | AsyncChildObservableType
  | RootObservableType;

export type ObservableType =
  | AsyncChildObservableType
  | RootObservableType
  | SyncChildObservableType;
