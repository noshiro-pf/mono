export type Compose<A, B> = Readonly<{
  chain: <const C>(fnNext: (b: B) => C) => Compose<A, C>;
  fn: (a: A) => B;
}>;

const composeSub = <const A, B>(fn: (a: A) => B): Compose<A, B> => ({
  chain: <const C,>(fnNext: (b: B) => C) =>
    composeSub<A, C>((a) => fnNext(fn(a))),
  fn,
});

export const compose = {
  chain: <const A, const B>(fn: (b: A) => B) => composeSub<A, B>((a) => fn(a)),
  fn: <const A,>(a: A) => a,
} as const;
