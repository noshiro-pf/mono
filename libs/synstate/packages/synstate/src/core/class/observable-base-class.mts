import { Arr, Optional } from 'ts-data-forge';
import {
  type ChildObservable,
  type InitializedObservable,
  type Observable,
  type ObservableBase,
  type Operator,
  type Subscriber,
  type SubscriberId,
  type Subscription,
  type UpdaterSymbol,
  type WithInitialValueOperator,
} from '../types/index.mjs';
import {
  issueObservableId,
  issueSubscriberId,
  issueUpdaterSymbol,
  toSubscriber,
} from '../utils/index.mjs';

export class ObservableBaseClass<
  A,
  Kind extends ObservableBase<A>['kind'],
  Depth extends ObservableBase<A>['depth'],
> implements ObservableBase<A> {
  readonly id;
  readonly kind: Kind;
  readonly depth: Depth;
  #mut_children: readonly ChildObservable<unknown>[];
  readonly #subscribers: MutableMap<SubscriberId, Subscriber<A>>;
  #mut_currentValue: ReturnType<ObservableBase<A>['getSnapshot']>;
  #mut_isCompleted: ObservableBase<A>['isCompleted'];
  #mut_updaterSymbol: ObservableBase<A>['updaterSymbol'];

  constructor({
    kind,
    depth,
    initialValue,
  }: Readonly<{
    kind: Kind;
    depth: Depth;
    initialValue: ReturnType<ObservableBase<A>['getSnapshot']>;
  }>) {
    this.kind = kind;

    this.depth = depth;

    this.id = issueObservableId();

    this.#mut_currentValue = initialValue;

    this.#mut_children = [];

    this.#subscribers = new Map<SubscriberId, Subscriber<A>>();

    this.#mut_isCompleted = false;

    this.#mut_updaterSymbol = issueUpdaterSymbol();
  }

  addChild<B>(child: ChildObservable<B>): void {
    this.#mut_children = Arr.toPushed(
      this.#mut_children,

      child as ChildObservable<unknown>,
    );
  }

  getSnapshot(): ReturnType<ObservableBase<A>['getSnapshot']> {
    return this.#mut_currentValue;
  }

  protected getCurrentValue(): ReturnType<ObservableBase<A>['getSnapshot']> {
    return this.#mut_currentValue;
  }

  get isCompleted(): boolean {
    return this.#mut_isCompleted;
  }

  get updaterSymbol(): UpdaterSymbol {
    return this.#mut_updaterSymbol;
  }

  get hasSubscriber(): boolean {
    return this.#subscribers.size > 0;
  }

  get hasChild(): boolean {
    return Arr.isNonEmpty(this.#mut_children);
  }

  hasActiveChild(): boolean {
    return this.#mut_children.some((c) => !c.isCompleted);
  }

  protected setNext(nextValue: A, updaterSymbol: UpdaterSymbol): void {
    this.#mut_updaterSymbol = updaterSymbol;

    this.#mut_currentValue = Optional.some(nextValue);

    for (const s of this.#subscribers.values()) {
      s.onNext(nextValue);
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  tryUpdate(_updaterSymbol: UpdaterSymbol): void {
    throw new Error('not implemented');
  }

  tryComplete(): void {
    if (!this.hasSubscriber && !this.hasActiveChild()) {
      this.complete();
    }
  }

  complete(): void {
    if (this.isCompleted) return; // terminate only once

    // change state
    this.#mut_isCompleted = true;

    // run subscribers for the current value
    for (const s of this.#subscribers.values()) {
      s.onComplete();
    }

    // remove all subscribers
    this.#subscribers.clear();

    // propagate to children
    for (const o of this.#mut_children) {
      o.tryComplete();
    }
  }

  pipe<B>(operator: WithInitialValueOperator<A, B>): InitializedObservable<B>;
  pipe<B>(operator: Operator<A, B>): Observable<B>;
  pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      this as unknown as InitializedObservable<A>,
    );
  }

  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    // first emit
    const curr = this.getSnapshot();

    if (Optional.isSome(curr)) {
      onNext(curr.value);
    }

    if (this.isCompleted) {
      if (onComplete !== undefined) {
        onComplete();
      }

      return { unsubscribe: () => {} };
    }

    const id: SubscriberId = this.#addSubscriber(
      toSubscriber(onNext, onComplete),
    );

    return {
      unsubscribe: () => {
        this.#removeSubscriber(id);
      },
    };
  }

  #addSubscriber(s: Subscriber<A>): SubscriberId {
    // return the id of added subscriber
    const id = issueSubscriberId();

    this.#subscribers.set(id, s);

    return id;
  }

  #removeSubscriber(id: SubscriberId): void {
    this.#subscribers.delete(id);
  }
}
