import { fetchTransport } from './fetch-transport.mjs';

const request = {
  method: 'GET',
  url: 'https://api.github.com/x',
  headers: { authorization: 'Bearer t' },
  body: undefined,
} as const;

describe(fetchTransport, () => {
  test('any status is an answer, its header names lower case', async () => {
    const transport = fetchTransport(() =>
      Promise.resolve(
        new Response('{"message":"nope"}', {
          status: 404,
          headers: { 'X-RateLimit-Remaining': '9' },
        }),
      ),
    );

    assert.deepStrictEqual(await transport(request), {
      kind: 'answered',
      status: 404,
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'x-ratelimit-remaining': '9',
      },
      body: '{"message":"nope"}',
    });
  });

  test('no answer at all is failed, not a rejection', async () => {
    const transport = fetchTransport(() =>
      Promise.reject(new TypeError('fetch failed')),
    );

    const answer = await transport(request);

    assert.strictEqual(answer.kind, 'failed');
  });

  test('sends the method, headers and body it is given', async () => {
    const mut_seen: RequestInit[] = [];

    const transport = fetchTransport((_url, init) => {
      if (init !== undefined) {
        mut_seen.push(init);
      }

      return Promise.resolve(new Response('{}'));
    });

    await transport({ ...request, method: 'POST', body: '{"q":1}' });

    await transport(request);

    assert.deepStrictEqual(
      mut_seen.map(({ method, body, redirect }) => [method, body, redirect]),
      [
        ['POST', '{"q":1}', 'manual'],
        [request.method, undefined, 'follow'],
      ],
    );
  });
});
