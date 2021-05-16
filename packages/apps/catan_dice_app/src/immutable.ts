import { List, Record as ImRecord, Repeat } from 'immutable';

export const IList = List;
export type IList<T> = List<T>;

export const IRepeat = Repeat;
export const IRecord = ImRecord;
export type IRecord<T> = ImRecord<T>;
