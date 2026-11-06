import { untracked, type Observable } from '../core/index.mjs';

export const collectToArray = <A,>(
  observable: Observable<A>,
): Promise<readonly A[]> =>
  new Promise<readonly A[]>((resolve) => {
    const mut_buffer: A[] = [];

    // The promise is the subscription's only owner, so no scope that happens to
    // be running may end it before the observable completes.
    untracked(() =>
      observable.subscribe(
        (value) => {
          mut_buffer.push(value);
        },
        () => {
          resolve(mut_buffer);
        },
      ),
    );
  });
