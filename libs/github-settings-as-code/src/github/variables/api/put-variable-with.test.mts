import { putVariableWith } from './put-variable-with.mjs';

/** What the API was asked, and an `update` that answers as `updateAnswer` says. */
const apiAnswering = (
  updateAnswer: 'ok' | Readonly<{ status: number }>,
): Readonly<{
  api: Parameters<typeof putVariableWith>[0];
  calls: readonly string[];
}> => {
  const mut_calls: string[] = [];

  return {
    api: {
      update: ({ name }) => {
        mut_calls.push(`PATCH ${name}`);

        return updateAnswer === 'ok'
          ? Promise.resolve()
          : Promise.reject(
              Object.assign(new Error('request failed'), updateAnswer),
            );
      },
      create: ({ name }) => {
        mut_calls.push(`POST ${name}`);

        return Promise.resolve();
      },
    },
    calls: mut_calls,
  };
};

describe(putVariableWith, () => {
  test('updates a variable that exists, whatever the list said', async () => {
    const { api, calls } = apiAnswering('ok');

    await putVariableWith(api, { name: 'FOO', value: '1' });

    assert.deepStrictEqual(calls, ['PATCH FOO']);
  });

  test('creates a variable the update does not find', async () => {
    const { api, calls } = apiAnswering({ status: 404 });

    await putVariableWith(api, { name: 'FOO', value: '1' });

    assert.deepStrictEqual(calls, ['PATCH FOO', 'POST FOO']);
  });

  test('stops on any other failure of the update, creating nothing', async () => {
    const { api, calls } = apiAnswering({ status: 403 });

    await expect(
      putVariableWith(api, { name: 'FOO', value: '1' }),
    ).rejects.toThrow('request failed');

    assert.deepStrictEqual(calls, ['PATCH FOO']);
  });
});
