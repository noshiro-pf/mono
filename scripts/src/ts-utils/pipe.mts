export type Pipe<A> = Readonly<{
  value: A;
  chain: <const B>(fn: (a: A) => B) => Pipe<B>;
  chainMonoTypeFns: (...fns: readonly ((a: A) => A)[]) => Pipe<A>;
  chainOptional: <const B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;

export const pipe = <const A,>(a: A): Pipe<A> => ({
  value: a,
  chain: (fn) => pipe(fn(a)),
  chainMonoTypeFns: (...fns) => pipe(fns.reduce((result, fn) => fn(result), a)),
  chainOptional: (fn) => pipe(a == null ? undefined : fn(a)),
});
