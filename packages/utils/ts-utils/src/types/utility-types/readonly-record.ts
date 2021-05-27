import type { RecordKeyType } from './record-key-type';

export type ReadonlyRecord<K extends RecordKeyType, V> = Readonly<Record<K, V>>;
