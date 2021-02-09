import { isArrayOfLength1OrMore, Option } from '@mono/ts-utils';
import {
  AsyncChildObservable,
  AsyncChildObservableType,
  ChildObservable,
  isManagerObservable,
  NonEmptyUnknownList,
  SyncChildObservable,
  SyncChildObservableType,
  Wrap,
} from '../types';
import { binarySearch, issueToken, maxDepth } from '../utils';
import { ObservableBaseClass } from './observable-base-class';

const registerChild = <A>(
  child: ChildObservable<A>,
  parents: ChildObservable<A>['parents']
): void => {
  for (const p of parents) {
    p.addChild(child);
  }
  // register this to ancestor SourceObservables
  const rest = parents.slice();
  while (isArrayOfLength1OrMore(rest)) {
    const p = rest.pop();
    if (p !== undefined) {
      p.addDescendantId(child);
      if (!isManagerObservable(p)) {
        // trace back dependency tree
        rest.push(...p.parents);
      }
    }
  }
};

export class AsyncChildObservableClass<
    A,
    Type extends AsyncChildObservableType,
    P extends NonEmptyUnknownList
  >
  extends ObservableBaseClass<A, 'async child', number>
  implements AsyncChildObservable<A, Type, P> {
  readonly type;
  readonly parents;
  private readonly procedure: ChildObservable<unknown>[] = [];

  constructor({
    type,
    parents,
    currentValueInit = Option.none,
  }: {
    type: Type;
    parents: Wrap<P>;
    currentValueInit?: AsyncChildObservable<A, Type>['currentValue'];
  }) {
    super({
      kind: 'async child',
      type,
      depth: 1 + maxDepth(parents),
      currentValueInit: currentValueInit ?? Option.none,
    });
    this.type = type;
    this.parents = parents;
    registerChild(this, parents);
  }

  // overload
  addDescendantId<B>(child: ChildObservable<B>): void {
    if (this._descendantsIdSet.has(child.id)) return;
    this._descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.procedure.map((a) => a.depth),
      child.depth
    );
    this.procedure.splice(insertPos, 0, child);
  }

  startUpdate(nextValue: A): void {
    const token = issueToken();
    this.setNext(nextValue, token);

    this.procedure.forEach((p) => {
      p.tryUpdate(token);
    });
  }

  // overload
  tryComplete(): void {
    // When there is no working parent node
    if (this.parents.every((r) => r.isCompleted)) {
      this.complete();
      return;
    }

    // When there are no child nodes
    if (this._subscribers.size === 0 && this._children.length === 0) {
      this.complete();
    }
  }
}

export class SyncChildObservableClass<
    A,
    Type extends SyncChildObservableType,
    P extends NonEmptyUnknownList
  >
  extends ObservableBaseClass<A, 'sync child', number>
  implements SyncChildObservable<A, Type, P> {
  readonly type;
  readonly parents;

  constructor({
    type,
    parents,
    currentValueInit = Option.none,
  }: {
    type: Type;
    parents: Wrap<P>;
    currentValueInit?: SyncChildObservable<A, Type>['currentValue'];
  }) {
    super({
      kind: 'sync child',
      type,
      depth: 1 + maxDepth(parents),
      currentValueInit: currentValueInit ?? Option.none,
    });
    this.type = type;
    this.parents = parents;
    registerChild(this, parents);
  }

  // overload
  tryComplete(): void {
    // When there is no working parent node
    if (this.parents.every((r) => r.isCompleted)) {
      this.complete();
      return;
    }

    // When there are no child nodes
    if (this._subscribers.size === 0 && this._children.length === 0) {
      this.complete();
    }
  }
}
