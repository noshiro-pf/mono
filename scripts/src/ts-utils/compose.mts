export type Compose<A, B> = Readonly<{
  chain: <C>(fnNext: (b: B) => C) => Compose<A, C>;
  fn: (a: A) => B;
}>;

const composeSub = <A, B>(fn: (a: A) => B): Compose<A, B> => ({
  chain: <C,>(fnNext: (b: B) => C) => composeSub<A, C>((a) => fnNext(fn(a))),
  fn,
});

export const compose = {
  chain: <A, B>(fn: (b: A) => B) => composeSub<A, B>((a) => fn(a)),
  fn: <A,>(a: A) => a,
} as const;
