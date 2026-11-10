import { onCleanup } from 'synstate-next';
import type { StrictPick } from 'ts-type-forge';

/**
 * Listens to `type` on `target` until the current owner is disposed: for a
 * target the owner does not create (`window`, `document`), which outlives it.
 * The `this` of `listener` is `unknown`: `target` is any object with the two
 * methods, which need not call it with itself.
 */
export const listenInScope = (
  target: Readonly<
    StrictPick<EventTarget, 'addEventListener' | 'removeEventListener'>
  >,
  type: string,
  listener: (this: unknown, event: Event) => void,
  options?: Readonly<{ capture?: boolean; passive?: boolean }>,
): void => {
  target.addEventListener(type, listener, options);

  onCleanup(() => {
    target.removeEventListener(type, listener, options);
  });
};

/**
 * Returns a function that runs `work` in a microtask, after the update under
 * way and the DOM changes it makes, unless the current owner has been disposed
 * by then: to focus an element a branch mounts, say.
 */
export const createAfterUpdate = (): ((
  work: (this: unknown) => void,
) => void) => {
  const mut_state = { alive: true };

  onCleanup(() => {
    mut_state.alive = false;
  });

  return (work) => {
    queueMicrotask(() => {
      if (mut_state.alive) {
        work();
      }
    });
  };
};
