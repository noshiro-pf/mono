// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding. A scope is a class for the reason the observables are (see
// `ScopeClass` below), so those four rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import type { Scope } from '../types/index.mjs';
import {
  getCurrentScopeInternals,
  runWithScope,
  type ScopeInternals,
  type ScopeMember,
} from '../utils/index.mjs';

/**
 * Creates a {@link Scope}. Observables created synchronously inside
 * `scope.run(body)` belong to it, and `scope.dispose()` disposes them without
 * completing the shared observables they were derived from.
 *
 * With `parent`, the new scope is disposed together with it; without one it
 * stands alone and lives until its own `dispose()`. A parent that is already
 * disposed gives a scope that is born disposed, with a warning.
 *
 * Intended for authors of libraries built on synstate rather than for
 * application code; state defined at module level belongs to no scope and
 * lives as long as the page.
 *
 * `run` and `dispose` read the scope they are called on, so call them on it
 * (`scope.dispose()`) rather than taking them off it.
 *
 * @param parent - The scope whose disposal also disposes the new one
 * @returns The new scope
 */
export const createScope = (parent?: Scope): Scope =>
  new ScopeClass(parent instanceof ScopeClass ? parent : undefined);

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
 * run after the child scopes are disposed and before the owned observables
 * are, newest first.
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
 * observables it creates belong to no scope and outlive the surrounding one.
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
 * methods live on the prototype and whose lists are arrays made when the
 * first entry arrives.
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
  #mut_isDisposed: boolean;

  constructor(parent: ScopeClass | undefined) {
    this.#parent = parent;

    this.#mut_children = undefined;

    this.#mut_goneChildren = 0;

    this.#mut_cleanups = undefined;

    this.#mut_nodes = undefined;

    this.#mut_goneNodes = 0;

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

    // Set first: the children, cleanups and nodes below call back into this
    // scope (`childGone`, `release`), which has nothing to do once it is
    // disposing everything anyway.
    this.#mut_isDisposed = true;

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
