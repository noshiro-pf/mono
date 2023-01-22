// eslint-disable-next-line @typescript-eslint/sort-type-constituents
export type ObservableKind = 'root' | 'sync child' | 'async child';

export type ManagerObservableKind = StrictExclude<ObservableKind, 'sync child'>;

export type ChildObservableKind = StrictExclude<ObservableKind, 'root'>;
