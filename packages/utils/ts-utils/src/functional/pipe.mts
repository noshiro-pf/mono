export const pipe = <const A,>(a: A): Pipe<A> =>
  ({
    value: a,
    chain: (fn) => pipe(fn(a)),
    chainOptional: (fn) => pipe(a == null ? undefined : fn(a)),
  }) as const;

type Pipe<A> = Readonly<{
  value: A;
  chain: <B>(fn: (a: A) => B) => Pipe<B>;
  chainOptional: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;
