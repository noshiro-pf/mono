import {
  DerivedClass,
  InnerFollower,
  Owner,
  noValue,
  toNode,
  view,
  type Observable,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Follows the observable that `project` returns for the latest value. What the
 * projection creates belongs to an owner of its own, disposed when the next
 * value replaces it.
 *
 * The inner observable's value at the time of the switch joins the update that
 * caused it; a later emission of the inner observable arrives in an update of
 * its own. Like every node, it holds the last value it emitted: switching to an
 * inner observable that holds none emits nothing, and keeps the value held.
 * For the same reason the result may hold no value even when the source does.
 */
export const switchMap =
  <A, B>(project: (value: A) => Observable<B>): Operator<A, B, 'drop'> =>
  (source) =>
    view(new SwitchMapClass(toNode(source), project));

class SwitchMapClass<A, B> extends DerivedClass<B> {
  readonly #parent: ObservableClass<A>;

  readonly #project: (value: A) => Observable<B>;

  #mut_inner: Owner | undefined;

  /** The inner observable followed, for `settled`. */
  #mut_innerNode: ObservableClass<B> | undefined;

  constructor(
    parent: ObservableClass<A>,
    project: (value: A) => Observable<B>,
  ) {
    super([parent], noValue);

    this.#parent = parent;

    this.#project = project;

    this.#mut_inner = undefined;

    this.#mut_innerNode = undefined;

    const v = parent.current;

    if (v !== noValue) {
      this.#switchTo(v);
    }
  }

  #switchTo(value: A): void {
    this.#mut_inner?.dispose();

    // Not a child of the current owner: the inner lives as long as this node
    // follows it, and this node disposes it.
    const owner = new Owner(undefined);

    this.#mut_inner = owner;

    owner.run(() => {
      const inner = toNode(this.#project(value));

      this.#mut_innerNode = inner;

      // The constructor makes it the inner's child and gives it to `owner`.
      // oxlint-disable-next-line eslint/no-new
      new InnerFollower(inner, this, undefined);

      const v = inner.current;

      if (v !== noValue) {
        this.current = v;
      }
    });
  }

  override get settled(): boolean {
    return super.settled && (this.#mut_innerNode?.settled ?? true);
  }

  /** Called by the follower when the inner observable emits later. */
  innerEmitted(value: B): void {
    this.publish(value);
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    const before = this.current;

    this.#switchTo(v);

    return !Object.is(this.current, before);
  }

  protected override teardown(): void {
    this.#mut_inner?.dispose();

    this.#mut_inner = undefined;

    this.#mut_innerNode = undefined;

    super.teardown();
  }
}
