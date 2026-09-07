const acquire = (): Disposable => ({ [Symbol.dispose]: (): void => {} });

export const run = (): void => {
  // @sumi-expect banned-syntax/no-using
  using resource = acquire();

  console.log(resource);
};
