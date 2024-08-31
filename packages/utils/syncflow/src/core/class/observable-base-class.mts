import { Arr, Maybe, noop } from '@noshiro/ts-utils';
import {
  type ChildObservable,
  type InitializedObservable,
  type Observable,
  type ObservableBase,
  type Operator,
  type SetInitialValueOperator,
  type Subscriber,
  type SubscriberId,
  type Subscription,
  type UpdaterSymbol,
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
> implements ObservableBase<A>
{
  readonly id;
  readonly kind: Kind;
  readonly depth: Depth;
  #children: readonly ChildObservable<unknown>[];
  readonly #subscribers: MutableMap<SubscriberId, Subscriber<A>>;
  #currentValue: ReturnType<ObservableBase<A>['getSnapshot']>;
  #isCompleted: ObservableBase<A>['isCompleted'];
  #updaterSymbol: ObservableBase<A>['updaterSymbol'];

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
    this.#currentValue = initialValue;
    this.#children = [];
    // eslint-disable-next-line no-restricted-globals
    this.#subscribers = new Map<SubscriberId, Subscriber<A>>();
    this.#isCompleted = false;
    this.#updaterSymbol = issueUpdaterSymbol();
  }

  addChild<B>(child: ChildObservable<B>): void {
    this.#children = Arr.pushed(
      this.#children,

      child as ChildObservable<unknown>,
    );
  }

  getSnapshot(): ReturnType<ObservableBase<A>['getSnapshot']> {
    return this.#currentValue;
  }

  protected getCurrentValue(): ReturnType<ObservableBase<A>['getSnapshot']> {
    return this.#currentValue;
  }

  get isCompleted(): boolean {
    return this.#isCompleted;
  }

  get updaterSymbol(): UpdaterSymbol {
    return this.#updaterSymbol;
  }

  get hasSubscriber(): boolean {
    return this.#subscribers.size > 0;
  }

  get hasChild(): boolean {
    return this.#children.length > 0;
  }

  hasActiveChild(): boolean {
    return this.#children.some((c) => !c.isCompleted);
  }

  protected setNext(nextValue: A, updaterSymbol: UpdaterSymbol): void {
    this.#updaterSymbol = updaterSymbol;
    this.#currentValue = Maybe.some(nextValue);

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
    this.#isCompleted = true;

    // run subscribers for the current value
    for (const s of this.#subscribers.values()) {
      s.onComplete();
    }

    // remove all subscribers
    this.#subscribers.clear();

    // propagate to children
    for (const o of this.#children) {
      o.tryComplete();
    }
  }

  pipe<B>(operator: SetInitialValueOperator<A, B>): InitializedObservable<B>;
  pipe<B>(operator: Operator<A, B>): Observable<B>;
  pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      this as unknown as InitializedObservable<A>,
    );
  }

  chain<B>(operator: SetInitialValueOperator<A, B>): InitializedObservable<B>;
  chain<B>(operator: Operator<A, B>): Observable<B>;
  chain<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      this as unknown as InitializedObservable<A>,
    );
  }

  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    // first emit
    const curr = this.getSnapshot();
    if (Maybe.isSome(curr)) {
      onNext(curr.value);
    }

    if (this.isCompleted) {
      if (onComplete !== undefined) {
        onComplete();
      }
      return { unsubscribe: noop };
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
