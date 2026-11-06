import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type Observable,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Gives each value of the source the values `other` emitted since the previous
 * one, in order: those emitted in the same update included, those it held
 * before this node was created not.
 */
export const withBufferedFrom =
  <A, B>(
    other: Observable<B>,
  ): Operator<A, readonly [A, readonly B[]], 'keep'> =>
  (source) =>
    view(new WithBufferedFromClass(toNode(source), toNode(other)));

class WithBufferedFromClass<A, B> extends DerivedClass<
  readonly [A, readonly B[]]
> {
  readonly #parent: ObservableClass<A>;

  readonly #other: ObservableClass<B>;

  #mut_buffer: B[];

  constructor(parent: ObservableClass<A>, other: ObservableClass<B>) {
    const v = parent.current;

    super([parent, other], v === noValue ? noValue : [v, []]);

    this.#parent = parent;

    this.#other = other;

    this.#mut_buffer = [];
  }

  override recompute(): boolean {
    const o = this.#other.current;

    if (o !== noValue && this.emittedNow(this.#other)) {
      this.#mut_buffer.push(o);
    }

    const v = this.#parent.current;

    if (v === noValue || !this.emittedNow(this.#parent)) {
      return false;
    }

    this.current = [v, this.#mut_buffer];

    this.#mut_buffer = [];

    return true;
  }
}
