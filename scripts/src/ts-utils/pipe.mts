export type Pipe<A> = Readonly<{
  value: A;
  chain: <B>(fn: (a: A) => B) => Pipe<B>;
  chainMonoTypeFns: (...fns: readonly ((a: A) => A)[]) => Pipe<A>;
  chainOptional: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;

export const pipe = <A,>(a: A): Pipe<A> => ({
  value: a,
  chain: (fn) => pipe(fn(a)),
  chainMonoTypeFns: (...fns) => pipe(fns.reduce((result, fn) => fn(result), a)),
  chainOptional: (fn) => pipe(a == null ? undefined : fn(a)),
});
