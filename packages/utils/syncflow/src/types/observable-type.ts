export type RootObservableType =
  | 'FromArray'
  | 'FromPromise'
  | 'FromSubscribable'
  | 'Interval'
  | 'Source'
  | 'Timer';

export type SyncChildObservableType =
  | 'combineLatest'
  | 'distinctUntilChanged'
  | 'filter'
  | 'map'
  | 'mapOption'
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
  | 'unwrapOption'
  | 'unwrapResultErr'
  | 'unwrapResultOk'
  | 'withIndex'
  | 'withInitialValue'
  | 'withLatest'
  | 'zip';

export type AsyncChildObservableType =
  | 'auditTime'
  | 'debounceTime'
  | 'mergeMap'
  | 'switchMap';

export type ChildObservableType =
  | SyncChildObservableType
  | AsyncChildObservableType;

export type ManagerObservableType =
  | RootObservableType
  | AsyncChildObservableType;

export type ObservableType =
  | RootObservableType
  | SyncChildObservableType
  | AsyncChildObservableType;
