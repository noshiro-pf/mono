import type { MutableSet } from 'ts-type-forge';
import type { Scope } from '../types/index.mjs';
import {
  getCurrentScopeInternals,
  runWithScope,
  type ScopeInternals,
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
 * @param parent - The scope whose disposal also disposes the new one
 * @returns The new scope
 */
export const createScope = (parent?: Scope): Scope => {
  const mut_children: MutableSet<Scope> = new Set();

  let mut_cleanups: (() => void)[] = [];

  const mut_nodes: MutableSet<Readonly<{ dispose: () => void }>> = new Set();

  const parentInternals =
    parent === undefined ? undefined : mut_internalsOf.get(parent);

  let mut_isDisposed = false;

  const dispose = (): void => {
    if (mut_isDisposed) {
      return;
    }

    mut_isDisposed = true;

    // Copied first: a child scope leaves `mut_children` as it is disposed, and
    // a node leaves `mut_nodes` as it completes.
    for (const child of Array.from(mut_children).toReversed()) {
      child.dispose();
    }

    for (const cleanup of mut_cleanups.toReversed()) {
      cleanup();
    }

    mut_cleanups = [];

    for (const node of Array.from(mut_nodes).toReversed()) {
      node.dispose();
    }

    mut_nodes.clear();

    parentInternals?.detachChild(scope);
  };

  const run = <R,>(body: () => R): R => {
    if (mut_isDisposed) {
      console.warn(
        'synstate: run() was called on a disposed scope; what it creates belongs to no scope.',
      );

      return runWithScope(undefined, body);
    }

    return runWithScope(internals, body);
  };

  const scope: Scope = { run, dispose } as const;

  const internals: ScopeInternals = {
    scope,

    adopt: (node) => {
      mut_nodes.add(node);

      return () => {
        mut_nodes.delete(node);
      };
    },

    addCleanup: (cleanup) => {
      mut_cleanups.push(cleanup);
    },
  } as const;

  mut_internalsOf.set(scope, {
    addChild: (child) => {
      mut_children.add(child);
    },
    detachChild: (child) => {
      mut_children.delete(child);
    },
    isDisposed: () => mut_isDisposed,
  });

  if (parentInternals !== undefined) {
    if (parentInternals.isDisposed()) {
      console.warn(
        'synstate: createScope() was given a disposed parent; the new scope is born disposed.',
      );

      mut_isDisposed = true;
    } else {
      parentInternals.addChild(scope);
    }
  }

  return scope;
};

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
  getCurrentScopeInternals()?.scope;

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

type ScopeRecord = Readonly<{
  addChild: (child: Scope) => void;
  detachChild: (child: Scope) => void;
  isDisposed: () => boolean;
}>;

/** The internal side of every scope `createScope` made, by its public face. */
const mut_internalsOf = new WeakMap<Scope, ScopeRecord>();
