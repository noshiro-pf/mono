/**
 * A unit of ownership: the observables created while {@link Scope.run} is
 * running belong to the scope, and {@link Scope.dispose} releases them all at
 * once. Create one with `createScope`.
 *
 * For authors of libraries built on synstate (a UI binding mounts and unmounts
 * by scope); application code that defines its state at module level does not
 * need it.
 */
export type Scope = Readonly<{
  /**
   * Calls `body` with this scope as the current one and returns what it
   * returns. Only what `body` creates synchronously joins the scope: by the time
   * code after an `await` or in a callback runs, `run` has already returned.
   *
   * On a disposed scope it warns, still calls `body`, and nothing created there
   * belongs to any scope.
   */
  run: <R>(body: () => R) => R;

  /**
   * Disposes the child scopes (newest first), calls the functions registered
   * with `onScopeDispose` (newest first), disposes the owned observables
   * (newest first) and leaves the parent scope. Calling it again does nothing.
   */
  dispose: () => void;
}>;
