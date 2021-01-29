class Pipe<A> {
  private readonly a: A;
  constructor(a: A) {
    this.a = a;
  }

  map<B>(fn: (a: A) => B): Pipe<B> {
    return new Pipe(fn(this.a));
  }

  get value(): A {
    return this.a;
  }
}

export const pipeClass = <A>(a: A): Pipe<A> => new Pipe(a);
