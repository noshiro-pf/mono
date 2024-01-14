export declare const pipe: <A>(a: A) => Pipe<A>;

export type Pipe<A> = Readonly<{
  value: A;
  chain: <B>(fn: (a: A) => B) => Pipe<B>;
  chainOptional: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;
