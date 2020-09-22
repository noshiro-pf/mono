import {
  List,
  Map as ImMap,
  Range,
  Record,
  Repeat,
  Set as ImSet,
} from 'immutable';

export const IList = List;
export type IList<T> = List<T>;

export const IMap = ImMap;
export type IMap<K, V> = ImMap<K, V>;

export const ISet = ImSet;
export type ISet<T> = ImSet<T>;

export const IRecord = Record;
export type IRecord<T> = Record<T>;

export const IRepeat = Repeat;
export const IRange = Range;

export type IRecordType<T> = Record<T> & Readonly<T>;
