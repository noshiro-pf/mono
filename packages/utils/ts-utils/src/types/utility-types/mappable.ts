export type Mappable<T> = Readonly<{
  map: <U>(f: (x: T, i?: number) => U) => Mappable<U>;
}>;
