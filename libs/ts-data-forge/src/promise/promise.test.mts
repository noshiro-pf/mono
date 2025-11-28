import { expectType } from '../expect-type.mjs';
import { Result } from '../functional/index.mjs';
import { createPromise } from './promise.mjs';

describe(createPromise, () => {
  test('resolves to Result.ok when executor resolves', async () => {
    const resultPromise = createPromise<number, Error>((resolve) => {
      resolve(42);
    });

    expectType<typeof resultPromise, Promise<Result<number, Error>>>('=');

    const result = await resultPromise;

    assert.isTrue(Result.isOk(result));

    if (Result.isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  test('resolves to Result.err when executor rejects', async () => {
    const rejection = new Error('boom');

    const result = await createPromise<number, Error>((_resolve, reject) => {
      reject(rejection);
    });

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      expect(result.value).toBe(rejection);
    }
  });

  test('supports non-Error rejection reasons', async () => {
    const result = await createPromise<string, string>((_resolve, reject) => {
      reject('failure');
    });

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      expectType<typeof result.value, string>('=');

      expect(result.value).toBe('failure');
    }
  });
});
