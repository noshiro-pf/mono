/* eslint-disable vitest/no-restricted-vi-methods */

import { debounce } from './debounce-function.mjs';

describe(debounce, () => {
  // eslint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    vi.useFakeTimers();
  });

  // eslint-disable-next-line vitest/no-hooks
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should delay the execution of the function', () => {
    const func = vi.fn();

    // eslint-disable-next-line @typescript-eslint/strict-void-return
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);

    expect(func).toHaveBeenCalledOnce();
  });

  test('should only execute the function once after multiple rapid calls', () => {
    const func = vi.fn();

    // eslint-disable-next-line @typescript-eslint/strict-void-return
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();

    debouncedFunc();

    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledOnce();
  });

  test('should pass the arguments to the original function', () => {
    const func = vi.fn((_a: number, _b: string) => {});

    const debouncedFunc = debounce(func, 100);

    debouncedFunc(1, 'test');

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledWith(1, 'test');
  });

  test('should use the latest arguments from the last call', () => {
    const func = vi.fn((_a: number, _b: string) => {});

    const debouncedFunc = debounce(func, 100);

    debouncedFunc(1, 'a');

    debouncedFunc(2, 'b');

    debouncedFunc(3, 'c');

    vi.advanceTimersByTime(100);

    expect(func).toHaveBeenCalledExactlyOnceWith(3, 'c');
  });
});
