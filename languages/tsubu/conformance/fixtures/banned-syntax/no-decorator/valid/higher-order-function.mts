const withLogging =
  <A extends readonly unknown[], R>(
    original: (...args: A) => R,
  ): ((...args: A) => R) =>
  (...args) => {
    console.log('called');
    return original(...args);
  };

export const loggedSum = withLogging((a: number, b: number) => a + b);
