import { Arr, MutableSet, type Maybe } from '@noshiro/ts-utils';
import {
  isManagerObservable,
  type AsyncChildObservable,
  type AsyncChildObservableType,
  type ChildObservable,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type InitializedToInitializedOperator,
  type NonEmptyUnknownList,
  type Observable,
  type ObservableId,
  type Operator,
  type SyncChildObservable,
  type SyncChildObservableType,
  type ToInitializedOperator,
  type Wrap,
} from '../types';
import { binarySearch, issueUpdaterSymbol, maxDepth } from '../utils';
import { ObservableBaseClass } from './observable-base-class';

const registerChild = <A>(
  child: ChildObservable<A>,
  parents: ChildObservable<A>['parents']
): void => {
  for (const p of parents) {
    p.addChild(child);
  }
  // register child to all reachable ManagerObservables
  const mut_rest = Array.from(parents);

  while (mut_rest.length >= 1) {
    const p = mut_rest.pop();
    if (p === undefined) break;
    if (isManagerObservable(p)) {
      p.addDescendant(child);
    } else {
      // trace back dependency graph
      mut_rest.push(...p.parents);
    }
  }
};

const tryComplete = <A>({
  hasSubscriber,
  hasActiveChild,
  parents,
  complete,
}: Readonly<{
  hasSubscriber: boolean;
  hasActiveChild: boolean;
  parents: ChildObservable<A>['parents'];
  complete: () => void;
}>): void => {
  // If there is no working parent node
  if (parents.every((r) => r.isCompleted)) {
    complete();
    return;
  }

  // If there are no active child node
  if (!hasSubscriber && !hasActiveChild) {
    complete();
  }

  // propagate to parents
  for (const par of parents) {
    par.tryComplete();
  }
};

export class AsyncChildObservableClass<
    A,
    Type extends AsyncChildObservableType,
    P extends NonEmptyUnknownList
  >
  extends ObservableBaseClass<A, 'async child', number>
  implements AsyncChildObservable<A, Type, P>
{
  override readonly type: Type;
  readonly parents;
  #procedure: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: MutableSet<ObservableId>;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor({
    type,
    parents,
    depth = 1 + maxDepth(parents),
    currentValueInit,
  }: Readonly<{
    type: Type;
    parents: Wrap<P>;
    depth?: number;
    currentValueInit: AsyncChildObservable<A, Type>['currentValue'];
  }>) {
    super({
      kind: 'async child',
      type,
      depth,
      currentValueInit,
    });
    this.type = type;
    this.parents = parents;
    this.#procedure = [];
    this._descendantsIdSet = new MutableSet<ObservableId>();
    registerChild(this, parents);
  }

  // overload
  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#procedure.map((a) => a.depth),
      child.depth
    );
    this.#procedure = Arr.inserted(this.#procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const updaterSymbol = issueUpdaterSymbol();
    this.setNext(nextValue, updaterSymbol);

    for (const p of this.#procedure) {
      p.tryUpdate(updaterSymbol);
    }
  }

  override complete(): void {
    super.complete();

    // propagate to parents
    for (const par of this.parents) {
      par.tryComplete();
    }
  }

  override tryComplete(): void {
    tryComplete({
      complete: () => {
        this.complete();
      },
      hasActiveChild: this.hasActiveChild(),
      hasSubscriber: this.hasSubscriber,
      parents: this.parents,
    });
  }
}

export class SyncChildObservableClass<
    A,
    Type extends SyncChildObservableType,
    P extends NonEmptyUnknownList
  >
  extends ObservableBaseClass<A, 'sync child', number>
  implements SyncChildObservable<A, Type, P>
{
  override readonly type: Type;
  readonly parents;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor({
    type,
    parents,
    depth = 1 + maxDepth(parents),
    currentValueInit,
  }: Readonly<{
    type: Type;
    parents: Wrap<P>;
    depth?: number;
    currentValueInit: SyncChildObservable<A, Type>['currentValue'];
  }>) {
    super({
      kind: 'sync child',
      type,
      depth,
      currentValueInit,
    });
    this.type = type;
    this.parents = parents;
    registerChild(this, parents);
  }

  override complete(): void {
    super.complete();
    for (const par of this.parents) {
      par.tryComplete();
    }
  }

  override tryComplete(): void {
    tryComplete({
      complete: () => {
        this.complete();
      },
      hasActiveChild: this.hasActiveChild(),
      hasSubscriber: this.hasSubscriber,
      parents: this.parents,
    });
  }
}

export class InitializedSyncChildObservableClass<
    A,
    Type extends SyncChildObservableType,
    P extends NonEmptyUnknownList
  >
  extends SyncChildObservableClass<A, Type, P>
  implements InitializedSyncChildObservable<A, Type, P>
{
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor({
    type,
    parents,
    depth = 1 + maxDepth(parents),
    currentValueInit,
  }: Readonly<{
    type: Type;
    parents: Wrap<P>;
    depth?: number;
    currentValueInit: InitializedSyncChildObservable<A, Type>['currentValue'];
  }>) {
    super({ type, parents, depth, currentValueInit });
  }

  override get currentValue(): Maybe.Some<A> {
    return super.getCurrentValue() as Maybe.Some<A>;
  }

  override chain<B>(
    operator:
      | InitializedToInitializedOperator<A, B>
      | ToInitializedOperator<A, B>
  ): InitializedObservable<B>;

  override chain<B>(operator: Operator<A, B>): Observable<B>;
  override chain<B>(operator: Operator<A, B>): Observable<B> {
    return operator(this as unknown as InitializedObservable<A>);
  }
}
