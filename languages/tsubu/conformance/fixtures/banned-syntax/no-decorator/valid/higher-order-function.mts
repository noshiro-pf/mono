const withLogging =
  <A extends readonly unknown[], R>(
    fn: (...args: A) => R,
  ): ((...args: A) => R) =>
  (...args) => {
    console.log('called');
    return fn(...args);
  };

export const loggedSum = withLogging((a: number, b: number) => a + b);
