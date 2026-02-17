import { Arr } from 'ts-data-forge';
import {
  isManagerObservable,
  type AsyncChildObservable,
  type ChildObservable,
  type InitializedObservable,
  type InitializedSyncChildObservable,
  type KeepInitialValueOperator,
  type NonEmptyUnknownList,
  type Observable,
  type ObservableId,
  type Operator,
  type SyncChildObservable,
  type WithInitialValueOperator,
  type Wrap,
} from '../types/index.mjs';
import { binarySearch, issueUpdaterSymbol, maxDepth } from '../utils/index.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';

const registerChild = <A,>(
  child: ChildObservable<A>,
  parents: ChildObservable<A>['parents'],
): void => {
  for (const p of parents) {
    p.addChild(child);
  }

  // register child to all reachable ManagerObservables
  const mut_rest = Array.from(parents);

  while (Arr.isNonEmpty(mut_rest)) {
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

const tryComplete = <A,>({
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

export class AsyncChildObservableClass<A, const P extends NonEmptyUnknownList>
  extends ObservableBaseClass<A, 'async child', number>
  implements AsyncChildObservable<A, P>
{
  readonly parents;
  #mut_procedure: readonly ChildObservable<unknown>[];
  protected readonly descendantsIdSet: MutableSet<ObservableId>;

  constructor({
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: Readonly<{
    parents: Wrap<P>;
    depth?: number;
    initialValue: ReturnType<AsyncChildObservable<A>['getSnapshot']>;
  }>) {
    super({
      kind: 'async child',
      depth,
      initialValue,
    });

    this.parents = parents;

    this.#mut_procedure = [];

    this.descendantsIdSet = new Set<ObservableId>();

    registerChild(this, parents);
  }

  // overload
  addDescendant<B>(child: ChildObservable<B>): void {
    if (this.descendantsIdSet.has(child.id)) return;

    this.descendantsIdSet.add(child.id);

    const insertPos = binarySearch(
      this.#mut_procedure.map((a) => a.depth),
      child.depth,
    );

    this.#mut_procedure = Arr.toInserted(this.#mut_procedure, insertPos, child);
  }

  startUpdate(nextValue: A): void {
    const updaterSymbol = issueUpdaterSymbol();

    this.setNext(nextValue, updaterSymbol);

    for (const p of this.#mut_procedure) {
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

export class SyncChildObservableClass<A, const P extends NonEmptyUnknownList>
  extends ObservableBaseClass<A, 'sync child', number>
  implements SyncChildObservable<A, P>
{
  readonly parents;

  constructor({
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: Readonly<{
    parents: Wrap<P>;
    depth?: number;
    initialValue: ReturnType<SyncChildObservable<A>['getSnapshot']>;
  }>) {
    super({
      kind: 'sync child',
      depth,
      initialValue,
    });

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
  const P extends NonEmptyUnknownList,
>
  extends SyncChildObservableClass<A, P>
  implements InitializedSyncChildObservable<A, P>
{
  constructor({
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: Readonly<{
    parents: Wrap<P>;
    depth?: number;
    initialValue: ReturnType<InitializedSyncChildObservable<A>['getSnapshot']>;
  }>) {
    super({ parents, depth, initialValue });
  }

  override getSnapshot(): Some<A> {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return super.getCurrentValue() as Some<A>;
  }

  override pipe<B>(
    operator: KeepInitialValueOperator<A, B> | WithInitialValueOperator<A, B>,
  ): InitializedObservable<B>;

  override pipe<B>(operator: Operator<A, B>): Observable<B>;
  override pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      this as unknown as InitializedObservable<A>,
    );
  }
}
