// Example: src/promise/promise.mts (createPromise)
import { createPromise, Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
// Create a promise that resolves successfully
const successPromise = createPromise<number, string>((resolve) => {
  setTimeout(() => {
    resolve(42);
  }, 0);
});

const successResult = await successPromise;
assert.ok(Result.isOk(successResult));
if (Result.isOk(successResult)) {
  assert(successResult.value === 42);
}

// Create a promise that rejects with an error
const errorPromise = createPromise<number, string>((_, reject) => {
  setTimeout(() => {
    reject('Something went wrong');
  }, 0);
});

const errorResult = await errorPromise;
assert.ok(Result.isErr(errorResult));
if (Result.isErr(errorResult)) {
  assert(errorResult.value === 'Something went wrong');
}
