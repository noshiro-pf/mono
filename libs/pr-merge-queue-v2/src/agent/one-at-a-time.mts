/**
 * A queue of one: each task given to the function it returns starts once every
 * task given before it has settled, and resolves or rejects as that task does.
 * For work several concurrent callers share a resource for — a file read and
 * written back whole, a repository's refs.
 */
export const oneAtATime = (): (<T>(task: () => Promise<T>) => Promise<T>) => {
  let mut_last: Promise<unknown> = Promise.resolve();

  return async <T,>(task: () => Promise<T>): Promise<T> => {
    const done = mut_last.then(task);

    // A task that threw is its caller's to hear of, not the next one's.
    mut_last = done.catch(() => undefined);

    return done;
  };
};
