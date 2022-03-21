import type { Option } from '@noshiro/ts-utils';
import { IList, isArrayOfLength1OrMore } from '@noshiro/ts-utils';
import type {
  AsyncChildObservable,
  AsyncChildObservableType,
  ChildObservable,
  InitializedObservable,
  InitializedSyncChildObservable,
  InitializedToInitializedOperator,
  NonEmptyUnknownList,
  Observable,
  ObservableId,
  Operator,
  SyncChildObservable,
  SyncChildObservableType,
  ToInitializedOperator,
  Wrap,
} from '../types';
import { isManagerObservable } from '../types';
import { binarySearch, issueToken, maxDepth } from '../utils';
import { ObservableBaseClass } from './observable-base-class';

const registerChild = <A>(
  child: ChildObservable<A>,
  parents: ChildObservable<A>['parents']
): void => {
  for (const p of parents) {
    p.addChild(child);
  }
  // register child to all reachable ManagerObservables
  const rest = parents.slice();
  while (isArrayOfLength1OrMore(rest)) {
    const p = rest.pop();
    if (p === undefined) break;
    if (isManagerObservable(p)) {
      p.addDescendant(child);
    } else {
      // trace back dependency graph
      rest.push(...p.parents);
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
  private _procedure: readonly ChildObservable<unknown>[];
  protected readonly _descendantsIdSet: Set<ObservableId>;

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
    this._procedure = [];
    this._descendantsIdSet = new Set<ObservableId>();
    registerChild(this, parents);
  }

  // overload
  addDescendant<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this._procedure.map((a) => a.depth),
      child.depth
    );
    this._procedure = IList.insert(this._procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const token = issueToken();
    this.setNext(nextValue, token);

    for (const p of this._procedure) {
      p.tryUpdate(token);
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

  override get currentValue(): Option.Some<A> {
    return super.getCurrentValue() as Option.Some<A>;
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
