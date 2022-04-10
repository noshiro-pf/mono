export const pipe = <A>(a: A): Pipe<A> => new PipeClass(a);

type Pipe<A> = Readonly<{
  chain: <B>(fn: (a: A) => B) => Pipe<B>;
  value: A;
}>;

class PipeClass<A> implements Pipe<A> {
  readonly #a: A;
  constructor(a: A) {
    this.#a = a;
  }

  chain<B>(fn: (a: A) => B): PipeClass<B> {
    return new PipeClass(fn(this.#a));
  }

  get value(): A {
    return this.#a;
  }
}
