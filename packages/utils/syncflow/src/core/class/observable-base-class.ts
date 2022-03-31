import { IList, Maybe, noop } from '@noshiro/ts-utils';
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
  private _children: readonly ChildObservable<unknown>[];
  private readonly _subscribers: Map<SubscriberId, Subscriber<A>>;
  private _currentValue: ObservableBase<A>['currentValue'];
  private _isCompleted: ObservableBase<A>['isCompleted'];
  private _token: ObservableBase<A>['token'];

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
    this._currentValue = currentValueInit;
    this._children = [];
    this._subscribers = new Map<SubscriberId, Subscriber<A>>();
    this._isCompleted = false;
    this._token = issueToken();
  }

  addChild<B>(child: ChildObservable<B>): void {
    this._children = IList.push(
      this._children,
      child as ChildObservable<unknown>
    );
  }

  get currentValue(): ObservableBase<A>['currentValue'] {
    return this._currentValue;
  }

  protected getCurrentValue(): ObservableBase<A>['currentValue'] {
    return this._currentValue;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get token(): Token {
    return this._token;
  }

  get hasSubscriber(): boolean {
    return this._subscribers.size > 0;
  }

  get hasChild(): boolean {
    return this._children.length > 0;
  }

  hasActiveChild(): boolean {
    return this._children.some((c) => !c.isCompleted);
  }

  protected setNext(nextValue: A, token: Token): void {
    this._token = token;
    this._currentValue = Maybe.some(nextValue);

    for (const s of this._subscribers.values()) {
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
    this._isCompleted = true;

    // run subscribers for the current value
    for (const s of this._subscribers.values()) {
      s.onComplete();
    }

    // remove all subscribers
    this._subscribers.clear();

    // propagate to children
    for (const o of this._children) {
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

    const id: SubscriberId = this.addSubscriber(
      toSubscriber(onNext, onComplete)
    );
    return {
      unsubscribe: () => {
        this.removeSubscriber(id);
      },
    };
  }

  private addSubscriber(s: Subscriber<A>): SubscriberId {
    // return the id of added subscriber
    const id = issueSubscriberId();
    this._subscribers.set(id, s);
    return id;
  }

  private removeSubscriber(id: SubscriberId): void {
    this._subscribers.delete(id);
  }
}
