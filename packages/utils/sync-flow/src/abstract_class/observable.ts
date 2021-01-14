import { ObservableType, Operator, Subscriber, Subscription } from '../types';
import {
  genId,
  IdType,
  isNotNone,
  noop,
  Option,
  some,
  unifySubscriberType,
} from '../util';
import { Observable } from './observable-interface';

export abstract class ObservableClass<A> implements Observable<A> {
  /** @internal */
  readonly type: ObservableType;
  /** @internal */
  readonly id: IdType;
  /** @internal */
  readonly isUpdateManager: boolean;
  /** @internal */
  readonly depth: number;
  /** @internal */
  readonly parents: Observable<any>[];

  /** @internal */
  isUpdated: boolean;
  private _currentValue: Option<A>;

  private _subscribers: Map<IdType, Subscriber<A>> = new Map<
    IdType,
    Subscriber<A>
  >();
  protected _children: Observable<any>[];
  protected _descendantsIdSet: Set<IdType> = new Set<IdType>();

  private _isCompleted: boolean = false;

  constructor(
    type: ObservableType,
    isSourceObservable: boolean,
    depth: number,
    parents: Observable<any>[],
    currentValueInit: Option<A>,
    isUpdatedInit: boolean
  ) {
    this.id = genId();
    this.type = type;
    this.isUpdateManager = isSourceObservable;
    this.depth = depth;
    this.parents = parents;
    this._children = [];
    this._currentValue = currentValueInit;
    this.isUpdated = isUpdatedInit;
    this.registerThis();
  }

  get currentValue(): Option<A> {
    return this._currentValue;
  }

  get children(): readonly Observable<any>[] {
    return this._children;
  }

  get descendantsIds(): readonly IdType[] {
    return Array.from(this._descendantsIdSet);
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  /** @internal */
  addChild(child: Observable<any>): void {
    this._children.push(child);
  }

  protected registerThis(): void {
    for (const p of this.parents) {
      p.addChild(this);
    }
    // register this to ancestor SourceObservables
    const rest = this.parents.slice();
    while (rest.length > 0) {
      const p = rest.pop();
      if (p === undefined) break;
      p.addDescendant(this);
      if (!p.isUpdateManager) {
        rest.push(...p.parents);
      }
    }
  }

  /** @internal */
  addDescendant(rn: Readonly<Observable<any>>): void {
    this._descendantsIdSet.add(rn.id);
  }

  protected complete(): void {
    if (this.isCompleted) return; // terminate only once

    // change state
    this._isCompleted = true;

    // run subscribers for the current value
    this._subscribers.forEach((s) => {
      s.complete();
    });

    // remove all subscribers
    this._subscribers.clear();

    // propagate to children
    this.children.forEach((rn) => {
      rn.tryComplete();
    });
  }

  tryComplete(): void {
    if (this.parents.length > 0 && this.parents.every((r) => r.isCompleted)) {
      this.complete();
    }
  }

  // TODO: error handling

  /** @internal */
  subscribe(
    nextOrSubscriber: ((v: A) => void) | Subscriber<A>,
    error?: (e?: any) => void,
    complete?: () => void
  ): Subscription {
    const subscriber = unifySubscriberType(nextOrSubscriber, error, complete);

    // first emit
    const curr = this.currentValue;
    if (isNotNone(curr)) {
      subscriber.next(curr.value);
    }

    if (this.isCompleted) {
      subscriber.complete();
      return { unsubscribe: noop };
    }

    const id: IdType = this.addSubscriber(subscriber);
    return {
      unsubscribe: () => {
        this.removeSubscriber(id);
        this.tryComplete();
      },
    };
  }

  protected update(nextValue: A): void {
    this._currentValue = some(nextValue);
    this._subscribers.forEach((s) => s.next(nextValue));
  }

  protected tryUpdateAndSetFlag(tryUpdateBodyFn: () => boolean): void {
    this.isUpdated = tryUpdateBodyFn();
  }

  /** @internal */
  tryUpdate(nextValue?: A): void {
    this.tryUpdateAndSetFlag(() => {
      // always update by default
      if (nextValue !== undefined) {
        this.update(nextValue);
        return true;
      } else {
        return false;
      }
    });
  }

  pipe(
    ...operators: readonly [Operator<any, any>, ...Operator<any, any>[]]
  ): Observable<any> {
    return operators.reduce((parent: Observable<any>, op) => op(parent), this);
  }

  private addSubscriber(s: Subscriber<A>): IdType {
    // return the index of added subscriber
    const id = genId();
    this._subscribers.set(id, s);
    return id;
  }

  private removeSubscriber(id: number): void {
    this._subscribers.delete(id);
  }
}
