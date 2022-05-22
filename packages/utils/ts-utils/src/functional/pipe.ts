import { assertType } from '../assert-type';

export const pipe = <A>(a: A): Pipe<A> => new PipeClass(a);

type Pipe<A> = Readonly<{
  chain: <B>(fn: (a: A) => B) => Pipe<B>;
  value: A;
  chainNullable: <B>(fn: (a: NonNullable<A>) => B) => Pipe<B | undefined>;
}>;

class PipeClass<A> implements Pipe<A> {
  readonly #a: A;

  constructor(a: A) {
    this.#a = a;
  }

  chain<B>(fn: (a: A) => B): PipeClass<B> {
    return new PipeClass(fn(this.#a));
  }

  chainNullable<B>(fn: (a: NonNullable<A>) => B): PipeClass<B | undefined> {
    const v = this.#a;
    return new PipeClass(v == null ? undefined : fn(v as NonNullable<A>));
  }

  get value(): A {
    return this.#a;
  }
}

const y: number | undefined = (() => 1 as number | undefined)();

const z = pipe(y)
  .chainNullable((x) => x + 1)
  .chainNullable((x) => `${x}`).value;

assertType<TypeEq<typeof z, string | undefined>>();
