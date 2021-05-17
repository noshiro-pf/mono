import type { StrictExclude } from '@noshiro/ts-utils';

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type ObservableKind = 'root' | 'sync child' | 'async child';

export type ManagerObservableKind = StrictExclude<ObservableKind, 'sync child'>;

export type ChildObservableKind = StrictExclude<ObservableKind, 'root'>;
