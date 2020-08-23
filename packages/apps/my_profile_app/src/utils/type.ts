export interface Mappable<T> {
  map<U>(f: (x: T, i?: number) => U): Mappable<U>;
}

export type JsonPrimities = null | boolean | number | string;
export type Json = { [key: string]: JsonValue };
export type JsonValue = JsonPrimities | Array<Json> | Json;
