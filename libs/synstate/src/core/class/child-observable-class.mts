// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Arr, hasKey, isRecord, type Optional, type Some } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { MutableSet } from 'ts-type-forge';
import type {
  AsyncChildObservable,
  DropInitialValueOperator,
  InitializedObservable,
  InitializedSyncChildObservable,
  KeepInitialValueOperator,
  NonEmptyUnknownList,
  Observable,
  Operator,
  SyncChildObservable,
  WithInitialValueOperator,
  Wrap,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';
import { ManagerObservableClass } from './manager-observable-class.mjs';
import { ObservableBaseClass } from './observable-base-class.mjs';
import {
  toNode,
  type ChildNode,
  type ManagerNode,
} from './observable-node.mjs';
import { runAfterPropagation } from './propagation-state.mjs';

type ChildObservableConfig<A, P extends NonEmptyUnknownList> = Readonly<{
  parents: Wrap<P>;

  /**
   * Defaults to one more than the deepest parent. An update reaches
   * observables in ascending depth, so an observable `tryUpdate` reads with
   * `getSnapshot` without being its child (`withCurrentValueFrom`'s second
   * source) has to be shallower than this one too, or this one reads its value
   * from before the update: pass `1 + Math.max(...)` over both then.
   */
  depth?: number;

  initialValue: Optional<A>;
}>;

/**
 * An observable derived from `parents` that emits, if at all, in the same
 * update as they do (`map`, `filter`, `combine`, …).
 *
 * A subclass overrides `tryUpdate`, and, when it holds something to
 * release, `teardown`; its constructor ends with `this.attach()`, once
 * everything `tryUpdate` and `teardown` read is in place.
 */
export class SyncChildObservableClass<A, const P extends NonEmptyUnknownList>
  extends ObservableBaseClass<A, 'sync child', number>
  implements SyncChildObservable<A, P>
{
  #mut_isAttached: boolean;
  readonly parents: Wrap<P>;
  readonly managers: readonly ManagerNode[];

  constructor({
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: ChildObservableConfig<A, P>) {
    super({
      kind: 'sync child',
      depth,
      initialValue,
    });

    this.parents = parents;

    this.managers = managersOf(parents);

    this.#mut_isAttached = false;
  }

  /**
   * Joins the current scope and registers this observable to its parents
   * and the managers it is reached from. Completed parents never update
   * again, so a child created under them is complete from the start
   * (#2248), as is one its constructor completed; registering it would only
   * leave a reference in each parent.
   */
  protected attach(): void {
    this.adoptIntoCurrentScope();

    if (this.isCompleted || this.parents.every((p) => p.isCompleted)) {
      this.complete();
    } else {
      registerChild(this, this.managers);

      this.#mut_isAttached = true;
    }
  }

  protected override detach(): void {
    if (!this.#mut_isAttached) {
      return;
    }

    this.#mut_isAttached = false;

    unregisterChild(this, this.managers);
  }

  override tryComplete(): void {
    if (shouldComplete(this)) {
      this.complete();
    }
  }

  /**
   * Whether this observable can emit nothing more although some parent is
   * still live, asked whenever a parent completes. `true` completes it then,
   * as all parents completing does (`zip` once a completed source's queue is
   * empty).
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canEmitNoMore(): boolean {
    return false;
  }

  /**
   * Completes this observable once the update now propagating has reached
   * every descendant, so that they see the value just passed on first.
   */
  protected completeAfterPropagation(): void {
    runAfterPropagation(() => {
      this.complete();
    });
  }
}

/**
 * An observable derived from `parents` that may emit later, in an update of
 * its own, through `startUpdate` (`debounce`, `switchMap`). It may also emit
 * synchronously with `setNext`, as a sync child does. A subclass may also
 * override `flush`, to pass on at completion what it still holds.
 */
export class AsyncChildObservableClass<A, const P extends NonEmptyUnknownList>
  extends ManagerObservableClass<A, 'async child', number>
  implements AsyncChildObservable<A, P>
{
  #mut_isAttached: boolean;
  readonly parents: Wrap<P>;

  constructor({
    parents,
    depth = 1 + maxDepth(parents),
    initialValue,
  }: ChildObservableConfig<A, P>) {
    super({
      kind: 'async child',
      depth,
      initialValue,
    });

    this.parents = parents;

    this.#mut_isAttached = false;
  }

  /** See `SyncChildObservableClass.attach`. */
  protected attach(): void {
    this.adoptIntoCurrentScope();

    if (this.isCompleted || this.parents.every((p) => p.isCompleted)) {
      this.complete();
    } else {
      registerChild(this, managersOf(this.parents));

      this.#mut_isAttached = true;
    }
  }

  protected override detach(): void {
    if (!this.#mut_isAttached) {
      return;
    }

    this.#mut_isAttached = false;

    unregisterChild(this, managersOf(this.parents));
  }

  override tryComplete(): void {
    if (shouldComplete(this)) {
      this.complete();
    }
  }

  /** See `SyncChildObservableClass.canEmitNoMore`. */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canEmitNoMore(): boolean {
    return false;
  }

  /** See `SyncChildObservableClass.completeAfterPropagation`. */
  protected completeAfterPropagation(): void {
    runAfterPropagation(() => {
      this.complete();
    });
  }
}

/**
 * A sync child that always holds a value: a subclass passes a `Some` as its
 * `initialValue`. It differs from its base only in the types of
 * `getSnapshot` and `pipe`.
 */
export class InitializedSyncChildObservableClass<
  A,
  const P extends NonEmptyUnknownList,
>
  extends SyncChildObservableClass<A, P>
  implements InitializedSyncChildObservable<A, P>
{
  override getSnapshot(): Some<A> {
    // `initialValue` is a `Some`, and `setNext` only ever stores a `Some`.
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    return super.getSnapshot() as Some<A>;
  }

  override pipe<B>(
    operator: KeepInitialValueOperator<A, B> | WithInitialValueOperator<A, B>,
  ): InitializedObservable<B>;

  override pipe<B>(operator: DropInitialValueOperator<A, B>): Observable<B>;

  override pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(this);
  }
}

/* helpers */

/**
 * Called by a parent that has completed: whether no live parent is left, or
 * no value can come from the live ones.
 */
const shouldComplete = (
  child: ChildNode & Readonly<{ canEmitNoMore: () => boolean }>,
): boolean =>
  !child.isCompleted &&
  (child.parents.every((p) => p.isCompleted) || child.canEmitNoMore());

/** Registers a child to its parents and to `managers`. */
const registerChild = (
  child: ChildNode,
  managers: readonly ManagerNode[],
): void => {
  if (checksCircularDependency) {
    detectCircularDependency(child);
  }

  for (const p of child.parents) {
    toNode(p).addChild(child);
  }

  for (const m of managers) {
    m.addDescendant(child);
  }
};

/**
 * Undoes {@link registerChild} for a completed child: its parents forget it,
 * and every manager it registered to stops propagating updates to it.
 * Without this a completed node stayed reachable for as long as its root
 * lived, and ran its `tryUpdate` on every update (#2134).
 */
const unregisterChild = (
  child: ChildNode,
  managers: readonly ManagerNode[],
): void => {
  for (const p of child.parents) {
    toNode(p).deleteChild(child);
  }

  for (const m of managers) {
    m.deleteDescendant(child);
  }
};

/**
 * The managers the descendants of `parents` register to, shared with the
 * parent when there is one.
 */
const managersOf = (
  parents: readonly Observable<unknown>[],
): readonly ManagerNode[] =>
  Arr.isFixedLengthArray(1, parents)
    ? toNode(parents[0]).managers
    : Array.from(new Set(parents.flatMap((p) => toNode(p).managers)));

const isDevelopmentProcess = (): boolean => {
  const proc: unknown = Reflect.get(globalThis, 'process');

  return (
    isRecord(proc) &&
    hasKey(proc, 'env') &&
    isRecord(proc.env) &&
    (!hasKey(proc.env, 'NODE_ENV') || proc.env.NODE_ENV !== 'production')
  );
};

/**
 * Whether {@link registerChild} checks for a circular dependency: everywhere
 * but in a process whose `NODE_ENV` is `production`. A child's parents exist
 * before it and cannot be changed afterwards, so only code that rewrites an
 * observable's readonly `parents` can make a cycle, while the walk over every
 * ancestor is paid on every creation. Where there is no `process` (a browser
 * bundle) the check is off.
 */
export const checksCircularDependency: boolean = isDevelopmentProcess();

/**
 * Detects circular dependencies by walking the full ancestor chain of the
 * child's parents and checking whether the child already appears among them.
 *
 * @throws {Error} if a circular dependency is detected
 */
const detectCircularDependency = (child: ChildNode): void => {
  const mut_visited = new Set<Observable<unknown>>();

  const mut_inPath = new Set<Observable<unknown>>([
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    child as Observable<unknown>,
  ]);

  for (const parent of child.parents) {
    if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
      // A programming error (invariant violation), not a recoverable
      // failure. `panic` marks the error it throws, so the `Result` /
      // `AsyncResult` boundaries rethrow it rather than turning an invariant
      // violation into an `Err` a caller might handle (Sumi D-48 / D-53).
      panic(
        'Circular dependency detected in observable graph: a child observable cannot be its own ancestor.',
      );
    }
  }
};

const hasCircularDependencyFrom = (
  node: Observable<unknown>,
  mut_visited: MutableSet<Observable<unknown>>,
  mut_inPath: MutableSet<Observable<unknown>>,
): boolean => {
  if (mut_inPath.has(node)) {
    return true;
  }

  if (mut_visited.has(node)) {
    return false;
  }

  mut_visited.add(node);

  mut_inPath.add(node);

  if (node.kind !== 'root') {
    for (const parent of node.parents) {
      if (hasCircularDependencyFrom(parent, mut_visited, mut_inPath)) {
        return true;
      }
    }
  }

  mut_inPath.delete(node);

  return false;
};
