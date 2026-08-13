/**
 * Creates a debounced function that delays invoking `func` until after `waitMilliseconds`
 * have elapsed since the last time the debounced function was invoked.
 *
 * @template F The type of the function to debounce.
 * @param func The function to debounce.
 * @param waitMilliseconds The number of milliseconds to delay.
 * @returns The new debounced function.
 */
export const debounce = <Args extends readonly unknown[]>(
  func: (...args: Args) => void,
  waitMilliseconds: number,
): ((...args: Args) => void) => {
  // Not `ReturnType<typeof setTimeout>`: with both the DOM and Node
  // declarations in scope that resolves to `unknown`, which `clearTimeout`
  // will not take. Naming what `clearTimeout` accepts says the same thing and
  // stays true in either environment.
  let mut_timeoutId: Parameters<typeof clearTimeout>[0];

  return (...args: Args): void => {
    clearTimeout(mut_timeoutId);

    mut_timeoutId = setTimeout(() => {
      func(...args);
    }, waitMilliseconds);
  };
};
