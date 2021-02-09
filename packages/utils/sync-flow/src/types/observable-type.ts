export type RootObservableType =
  | 'Source'
  | 'FromArray'
  | 'FromPromise'
  | 'FromSubscribable'
  | 'Interval'
  | 'Timer';

export type SyncChildObservableType =
  | 'combineLatest'
  | 'merge'
  | 'zip'
  | 'map'
  | 'mapWithIndex'
  | 'take'
  | 'skip'
  | 'takeWhile'
  | 'skipWhile'
  | 'takeUntil'
  | 'skipUntil'
  | 'scan'
  | 'filter'
  | 'throttleTime';

export type AsyncChildObservableType =
  | 'auditTime'
  | 'debounceTime'
  | 'switchMap'
  | 'mergeMap';

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
