// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReadonlyRecord<K extends keyof any, V> = Readonly<Record<K, V>>;
