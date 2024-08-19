export type RootObservableType =
  | 'FromArray'
  | 'FromPromise'
  | 'FromSubscribable'
  | 'Interval'
  | 'Of'
  | 'Source'
  | 'Timer';

export type SyncChildObservableType =
  | 'combine'
  | 'skipIfNoChange'
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
  | 'attachIndex'
  | 'setInitialValue'
  | 'withCurrentValueFrom'
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
