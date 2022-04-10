import { IList, Maybe, MutableMap, noop } from '@noshiro/ts-utils';
import type {
  ChildObservable,
  InitializedObservable,
  Observable,
  ObservableBase,
  Operator,
  Subscriber,
  SubscriberId,
  Subscription,
  ToInitializedOperator,
  Token,
} from '../types';
import {
  issueObservableId,
  issueSubscriberId,
  issueToken,
  toSubscriber,
} from '../utils';

export class ObservableBaseClass<
  A,
  Kind extends ObservableBase<A>['kind'],
  Depth extends ObservableBase<A>['depth']
> implements ObservableBase<A>
{
  readonly id;
  readonly kind: Kind;
  readonly type;
  readonly depth: Depth;
  #children: readonly ChildObservable<unknown>[];
  readonly #subscribers: MutableMap<SubscriberId, Subscriber<A>>;
  #currentValue: ObservableBase<A>['currentValue'];
  #isCompleted: ObservableBase<A>['isCompleted'];
  #token: ObservableBase<A>['token'];

  constructor({
    kind,
    type,
    depth,
    currentValueInit,
  }: Readonly<{
    kind: Kind;
    type: ObservableBase<A>['type'];
    depth: Depth;
    currentValueInit: ObservableBase<A>['currentValue'];
  }>) {
    this.kind = kind;
    this.type = type;
    this.depth = depth;
    this.id = issueObservableId();
    this.#currentValue = currentValueInit;
    this.#children = [];
    this.#subscribers = new MutableMap<SubscriberId, Subscriber<A>>();
    this.#isCompleted = false;
    this.#token = issueToken();
  }

  addChild<B>(child: ChildObservable<B>): void {
    this.#children = IList.push(
      this.#children,
      child as ChildObservable<unknown>
    );
  }

  get currentValue(): ObservableBase<A>['currentValue'] {
    return this.#currentValue;
  }

  protected getCurrentValue(): ObservableBase<A>['currentValue'] {
    return this.#currentValue;
  }

  get isCompleted(): boolean {
    return this.#isCompleted;
  }

  get token(): Token {
    return this.#token;
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

  protected setNext(nextValue: A, token: Token): void {
    this.#token = token;
    this.#currentValue = Maybe.some(nextValue);

    for (const s of this.#subscribers.values()) {
      s.onNext(nextValue);
    }
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
  tryUpdate(_token: Token): void {
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

  chain<B>(operator: ToInitializedOperator<A, B>): InitializedObservable<B>;
  chain<B>(operator: Operator<A, B>): Observable<B>;
  chain<B>(operator: Operator<A, B>): Observable<B> {
    return operator(this as unknown as InitializedObservable<A>);
  }

  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    // first emit
    const curr = this.currentValue;
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
      toSubscriber(onNext, onComplete)
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
