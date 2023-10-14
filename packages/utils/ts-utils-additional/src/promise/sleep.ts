/**
 *
 * @param milliSec
 * @returns [Promise, interruptSleepFunction]
 */
export const sleep = (
  milliSec: number,
): readonly [Promise<unknown>, () => void] => {
  let mut_timer: TimerId | undefined = undefined;
  let mut_resolver: ((value: unknown) => void) | undefined = undefined;

  const promise = new Promise((resolve) => {
    mut_resolver = resolve;
    mut_timer = setTimeout(resolve, milliSec);
  });

  const interruptSleep = (): void => {
    clearTimeout(mut_timer);
    mut_resolver?.(undefined);
  };

  return [promise, interruptSleep];
};
