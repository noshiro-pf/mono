import {
  List as ImList,
  Map as ImMap,
  Range as ImRange,
  Record as ImRecord,
  Set as ImSet,
} from 'immutable';

export const IList = ImList;
export type IList<T> = ImList<T>;

export const IMap = ImMap;
export type IMap<K, V> = ImMap<K, V>;

export const ISet = ImSet;
export type ISet<T> = ImSet<T>;

export const IRecord = ImRecord;
export type IRecord<T> = ImRecord<T>;

export const IRange = ImRange;
