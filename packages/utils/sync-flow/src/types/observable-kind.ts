import { StrictExclude } from '@mono/ts-utils';

export type ObservableKind = 'root' | 'sync child' | 'async child';

export type ManagerObservableKind = StrictExclude<ObservableKind, 'sync child'>;

export type ChildObservableKind = StrictExclude<ObservableKind, 'root'>;
