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
  let mut_timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Args): void => {
    clearTimeout(mut_timeoutId);

    mut_timeoutId = setTimeout(() => {
      func(...args);
    }, waitMilliseconds);
  };
};
