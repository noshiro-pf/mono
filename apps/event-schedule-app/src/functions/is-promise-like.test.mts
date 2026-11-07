import { isPromiseLike } from './is-promise-like.mjs';

describe(isPromiseLike, () => {
  // `then` is on `Promise.prototype`, not the promise itself (#2905).
  test('is true for a native promise', () => {
    assert.isTrue(isPromiseLike(Promise.resolve()));
  });

  test('is true for a thenable whose then is its own', () => {
    // A thenable is what the guard is for.
    // oxlint-disable-next-line unicorn/no-thenable
    assert.isTrue(isPromiseLike({ then: () => undefined }));
  });

  test.each([
    { name: 'undefined', value: undefined },
    { name: 'null', value: null },
    { name: 'a number', value: 1 },
    { name: 'an object without then', value: {} },
    // Not a thenable, which is what this case is about.
    // oxlint-disable-next-line unicorn/no-thenable
    { name: 'an object whose then is not a function', value: { then: 1 } },
  ] as const)('is false for $name', ({ value }) => {
    assert.isFalse(isPromiseLike(value));
  });
});
