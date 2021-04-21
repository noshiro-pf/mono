class Pipe<A> {
  private readonly a: A;
  constructor(a: A) {
    this.a = a;
  }

  chain<B>(fn: (a: A) => B): Pipe<B> {
    return new Pipe(fn(this.a));
  }

  get value(): A {
    return this.a;
  }
}

export const pipe = <A>(a: A): Pipe<A> => new Pipe(a);
