// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding. A scope is a class for the reason the observables are (see
// `ScopeClass` below), so those four rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import type { ObservableBase, Scope } from '../types/index.mjs';
import {
  getCurrentScopeInternals,
  runWithScope,
  type ScopeInternals,
  type ScopeMember,
  type ScopeSubscription,
} from '../utils/index.mjs';

/**
 * Creates a {@link Scope}. Observables created synchronously inside
 * `scope.run(body)` belong to it, and `scope.dispose()` disposes them without
 * completing the shared observables they were derived from. A `subscribe` made
 * there belongs to it too, and `dispose()` unsubscribes it first, before the
 * child scopes, the cleanups and the owned observables. An update or a
 * completion runs in no scope, whichever scope wrote the value or completed the
 * observable, so a subscriber that subscribes on hearing it does so in none.
 *
 * With `parent`, the new scope is disposed together with it; without one it
 * stands alone and lives until its own `dispose()`. A parent that is already
 * disposed gives a scope that is born disposed, with a warning.
 *
 * With `after`, every observable derived in the scope (and in its child scopes)
 * updates after `after` in an update that reaches both, however few steps it is
 * from the source. A switch that mounts a branch in the scope when `after`
 * changes passes it, so that the switch, hearing `after`, disposes a branch
 * that no longer applies before the branch computes the value that rules it
 * out. It orders one update only: an `after` that emits in an update of its own
 * (`debounce`, `switchMap`) is not ahead of what the source's update reaches
 * first. A subscription made in the branch directly to the source still hears
 * the value when the source emits.
 *
 * Intended for authors of libraries built on synstate rather than for
 * application code; state defined at module level belongs to no scope and lives
 * as long as the page.
 *
 * `run` and `dispose` read the scope they are called on, so call them on it
 * (`scope.dispose()`) rather than taking them off it.
 *
 * @param parent - The scope whose disposal also disposes the new one
 * @param options - `after`: the observable that what the scope derives updates
 *   after
 * @returns The new scope
 */
export const createScope = (
  parent?: Scope,
  options?: Readonly<{ after?: ObservableBase<unknown> }>,
): Scope =>
  new ScopeClass(
    parent instanceof ScopeClass ? parent : undefined,
    options?.after === undefined ? 0 : options.after.depth + 1,
  );

/**
 * Returns the scope whose `run` is executing, or `undefined` outside every
 * `run` and inside {@link untracked}.
 *
 * To put work that runs later (after an `await`, in a callback) into the
 * current scope, take it here while still synchronous and wrap the later work
 * in its `run`.
 *
 * @returns The current scope, if any
 */
export const getCurrentScope = (): Scope | undefined =>
  getCurrentScopeInternals();

/**
 * Registers `cleanup` to be called when the current scope is disposed. Cleanups
 * run after the scope's subscriptions have ended and the child scopes are
 * disposed, and before the owned observables are disposed, newest first.
 *
 * Outside every scope it warns and registers nothing.
 *
 * @param cleanup - The function to call
 */
export const onScopeDispose = (cleanup: () => void): void => {
  const current = getCurrentScopeInternals();

  if (current === undefined) {
    console.warn(
      'synstate: onScopeDispose() was called outside any scope; the cleanup will never run.',
    );

    return;
  }

  current.addCleanup(cleanup);
};

/**
 * Calls `body` with no current scope and returns what it returns, so that the
 * observables it creates and the subscriptions it makes belong to no scope and
 * outlive the surrounding one.
 *
 * @param body - The function to call
 * @returns What `body` returns
 */
export const untracked = <R,>(body: () => R): R =>
  runWithScope(undefined, body);

/**
 * A scope is created for every row and branch of a UI, so creating one has to
 * be cheap. It used to be a set of closures with a `Set` of children, a `Set`
 * of owned observables and a record in a `WeakMap`; it is now one object whose
 * methods live on the prototype and whose lists are arrays made when the first
 * entry arrives.
 *
 * Whatever leaves a list on its own (a child scope disposed by itself, an
 * observable that completed) is not looked up and spliced out: it only counts
 * itself gone, and once at least half of a list is gone the list is rebuilt
 * from what is left. Disposal walks the lists newest first, as before.
 *
 * The class itself is not exported; `createScope` is the way to make one.
 */
class ScopeClass implements ScopeInternals {
  readonly #parent: ScopeClass | undefined;
  // Pushed to in place: a scope gains children, cleanups and nodes one at a
  // time, and copying the list for each would make a big scope quadratic.
  // @sumi-expect-error readonly/require-readonly-type
  #mut_children: ScopeClass[] | undefined;
  #mut_goneChildren: number;
  // @sumi-expect-error readonly/require-readonly-type
  #mut_cleanups: (() => void)[] | undefined;
  // @sumi-expect-error readonly/require-readonly-type
  #mut_nodes: ScopeMember[] | undefined;
  #mut_goneNodes: number;
  // @sumi-expect-error readonly/require-readonly-type
  #mut_subscriptions: ScopeSubscription[] | undefined;
  #mut_goneSubscriptions: number;
  #mut_isDisposed: boolean;
  readonly depthFloor: number;

  constructor(parent: ScopeClass | undefined, depthFloor: number) {
    this.#parent = parent;

    this.depthFloor = Math.max(parent?.depthFloor ?? 0, depthFloor);

    this.#mut_children = undefined;

    this.#mut_goneChildren = 0;

    this.#mut_cleanups = undefined;

    this.#mut_nodes = undefined;

    this.#mut_goneNodes = 0;

    this.#mut_subscriptions = undefined;

    this.#mut_goneSubscriptions = 0;

    this.#mut_isDisposed = false;

    if (parent !== undefined) {
      if (parent.#mut_isDisposed) {
        console.warn(
          'synstate: createScope() was given a disposed parent; the new scope is born disposed.',
        );

        this.#mut_isDisposed = true;
      } else if (parent.#mut_children === undefined) {
        parent.#mut_children = [this];
      } else {
        parent.#mut_children.push(this);
      }
    }
  }

  /** Called by a child scope that was disposed on its own. */
  #childGone(): void {
    const children = this.#mut_children;

    if (children === undefined) {
      return;
    }

    this.#mut_goneChildren += 1;

    if (!isMostlyGone(this.#mut_goneChildren, children.length)) {
      return;
    }

    this.#mut_children = children.filter((c) => !c.#mut_isDisposed);

    this.#mut_goneChildren = 0;
  }

  get isDisposed(): boolean {
    return this.#mut_isDisposed;
  }

  run<R>(body: () => R): R {
    if (this.#mut_isDisposed) {
      console.warn(
        'synstate: run() was called on a disposed scope; what it creates belongs to no scope.',
      );

      return runWithScope(undefined, body);
    }

    return runWithScope(this, body);
  }

  dispose(): void {
    if (this.#mut_isDisposed) {
      return;
    }

    // Set first: the subscriptions, children and nodes below call back into
    // this scope (`childGone`, `release`), which has nothing to do once it is
    // disposing everything anyway.
    this.#mut_isDisposed = true;

    // First, so that what the children and the cleanups do on the way out (a
    // value a cleanup writes, an owned observable completing) is not heard by
    // the subscriptions this scope is ending.
    const subscriptions = this.#mut_subscriptions;

    if (subscriptions !== undefined) {
      this.#mut_subscriptions = undefined;

      for (let mut_i = subscriptions.length - 1; mut_i >= 0; mut_i -= 1) {
        const subscription = subscriptions[mut_i];

        if (subscription !== undefined && !subscription.isEnded) {
          subscription.end();
        }
      }
    }

    const children = this.#mut_children;

    if (children !== undefined) {
      this.#mut_children = undefined;

      for (let mut_i = children.length - 1; mut_i >= 0; mut_i -= 1) {
        children[mut_i]?.dispose();
      }
    }

    const cleanups = this.#mut_cleanups;

    if (cleanups !== undefined) {
      this.#mut_cleanups = undefined;

      for (let mut_i = cleanups.length - 1; mut_i >= 0; mut_i -= 1) {
        cleanups[mut_i]?.();
      }
    }

    const nodes = this.#mut_nodes;

    if (nodes !== undefined) {
      this.#mut_nodes = undefined;

      for (let mut_i = nodes.length - 1; mut_i >= 0; mut_i -= 1) {
        nodes[mut_i]?.dispose();
      }
    }

    if (this.#parent !== undefined) {
      this.#parent.#childGone();
    }
  }

  adopt(node: ScopeMember): void {
    if (this.#mut_nodes === undefined) {
      this.#mut_nodes = [node];
    } else {
      this.#mut_nodes.push(node);
    }
  }

  release(): void {
    const nodes = this.#mut_nodes;

    if (nodes === undefined) {
      return;
    }

    this.#mut_goneNodes += 1;

    if (!isMostlyGone(this.#mut_goneNodes, nodes.length)) {
      return;
    }

    this.#mut_nodes = nodes.filter((n) => !n.isCompleted);

    this.#mut_goneNodes = 0;
  }

  adoptSubscription(subscription: ScopeSubscription): void {
    if (this.#mut_isDisposed) {
      subscription.end();

      return;
    }

    if (this.#mut_subscriptions === undefined) {
      this.#mut_subscriptions = [subscription];
    } else {
      this.#mut_subscriptions.push(subscription);
    }
  }

  subscriptionGone(): void {
    const subscriptions = this.#mut_subscriptions;

    if (subscriptions === undefined) {
      return;
    }

    this.#mut_goneSubscriptions += 1;

    if (!isMostlyGone(this.#mut_goneSubscriptions, subscriptions.length)) {
      return;
    }

    this.#mut_subscriptions = subscriptions.filter((s) => !s.isEnded);

    this.#mut_goneSubscriptions = 0;
  }

  addCleanup(cleanup: () => void): void {
    if (this.#mut_cleanups === undefined) {
      this.#mut_cleanups = [cleanup];
    } else {
      this.#mut_cleanups.push(cleanup);
    }
  }
}

/**
 * Whether a list is worth rebuilding: at least half of it is gone, and enough
 * of it that the rebuild is paid for by the entries it drops.
 */
const isMostlyGone = (gone: number, length: number): boolean =>
  gone >= minGoneToCompact && gone * 2 >= length;

const minGoneToCompact = 16;
