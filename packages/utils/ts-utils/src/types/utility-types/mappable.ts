export interface Mappable<T> {
  map<U>(f: (x: T, i?: number) => U): Mappable<U>;
}
