import { type Observable } from '../core/index.mjs';

export const collectToArray = <A,>(
  observable: Observable<A>,
): Promise<readonly A[]> =>
  new Promise<readonly A[]>((resolve) => {
    const mut_buffer: A[] = [];

    observable.subscribe(
      (value) => {
        mut_buffer.push(value);
      },
      () => {
        resolve(mut_buffer);
      },
    );
  });
