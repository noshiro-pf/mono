import { ok, recordedTransport, status } from './recorded-transport.mjs';
import { transportCache } from './transport-cache.mjs';
import type { HttpAnswer, HttpRequest } from './transport.mjs';

const SHA = 'a'.repeat(40);

const OTHER = 'b'.repeat(40);

const API = 'https://api.github.com/repos/o/n';

const get = (path: string, token = 'token'): HttpRequest =>
  ({
    method: 'GET',
    url: `${API}${path}`,
    headers: { authorization: `Bearer ${token}` },
    body: undefined,
  }) as const;

const bodyOf = (answer: HttpAnswer): string | undefined =>
  answer.kind === 'answered' ? answer.body : undefined;

describe(transportCache, () => {
  test.each([
    `/commits/${SHA}`,
    `/git/commits/${SHA}`,
    `/compare/${SHA}...${OTHER}`,
    '/check-runs/12/annotations?per_page=100',
  ])('answers %s from what it kept, with no request', async (path) => {
    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}`]: ok({ a: 1 }),
    });

    const cached = transportCache({ revalidate: false })(transport);

    const first = await cached(get(path));

    const second = await cached(get(path));

    assert.strictEqual(sent.length, 1);

    assert.deepStrictEqual(second, first);
  });

  test('asks again for what can change, and keeps nothing of it without revalidation', async () => {
    const path = `/commits/${SHA}/check-runs?filter=all` as const;

    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}&per_page=100`]: [ok({ n: 1 }), ok({ n: 2 })],
    });

    const cached = transportCache({ revalidate: false })(transport);

    await cached(get(`${path}&per_page=100`));

    const second = await cached(get(`${path}&per_page=100`));

    assert.strictEqual(sent.length, 2);

    assert.strictEqual(bodyOf(second), JSON.stringify({ n: 2 }));

    assert.isUndefined(sent[1]?.headers['if-none-match']);
  });

  test('revalidating, sends the ETag it kept and answers a 304 with the body it kept', async () => {
    const path = `/commits/${SHA}/status?per_page=100` as const;

    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}`]: [
        ok(
          { state: 'success' },
          { etag: '"v1"', 'x-ratelimit-remaining': '10' },
        ),
        {
          kind: 'answered',
          status: 304,
          headers: { etag: '"v1"', 'x-ratelimit-remaining': '10' },
          body: '',
        },
      ],
    });

    const cached = transportCache({ revalidate: true })(transport);

    await cached(get(path));

    const second = await cached(get(path));

    assert.strictEqual(sent[1]?.headers['if-none-match'], '"v1"');

    assert.deepStrictEqual(second, {
      kind: 'answered',
      status: 200,
      headers: { etag: '"v1"', 'x-ratelimit-remaining': '10' },
      body: JSON.stringify({ state: 'success' }),
    });
  });

  test('revalidating, takes a changed answer in place of the one it kept', async () => {
    const path = `/commits/${SHA}/status?per_page=100` as const;

    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}`]: [
        ok({ state: 'pending' }, { etag: '"v1"' }),
        ok({ state: 'success' }, { etag: '"v2"' }),
        ok({ state: 'success' }, { etag: '"v2"' }),
      ],
    });

    const cached = transportCache({ revalidate: true })(transport);

    await cached(get(path));

    assert.strictEqual(
      bodyOf(await cached(get(path))),
      JSON.stringify({ state: 'success' }),
    );

    await cached(get(path));

    assert.strictEqual(sent[2]?.headers['if-none-match'], '"v2"');
  });

  test('keeps what one token read apart from another’s', async () => {
    const path = `/commits/${SHA}` as const;

    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}`]: ok({ a: 1 }),
    });

    const cached = transportCache({ revalidate: false })(transport);

    await cached(get(path, 'one'));

    await cached(get(path, 'two'));

    assert.strictEqual(sent.length, 2);
  });

  test('keeps no failure, no error status, and no write', async () => {
    const { transport, sent } = recordedTransport({
      [`/repos/o/n/commits/${SHA}`]: [status(502, 'Bad Gateway'), ok({ a: 1 })],
      [`PATCH /repos/o/n/commits/${OTHER}`]: ok({}),
    });

    const cached = transportCache({ revalidate: true })(transport);

    await cached(get(`/commits/${SHA}`));

    await cached(get(`/commits/${SHA}`));

    const patch: HttpRequest = {
      ...get(`/commits/${OTHER}`),
      method: 'PATCH',
      body: '{}',
    } as const;

    await cached(patch);

    await cached(patch);

    assert.strictEqual(sent.length, 4);
  });

  test('keeps the latest answers only, up to its bound in length', async () => {
    const paths = [SHA, OTHER, 'c'.repeat(40)].map((sha) => `/commits/${sha}`);

    // Ten characters an answer, and room for two.
    const { transport, sent } = recordedTransport(
      Object.fromEntries(
        paths.map((path) => [`/repos/o/n${path}`, ok({ a: 'xx' })]),
      ),
    );

    const cached = transportCache({ revalidate: false, maxLength: 20 })(
      transport,
    );

    for (const path of paths) {
      // eslint-disable-next-line no-await-in-loop -- the order is the point
      await cached(get(path));
    }

    // The first was dropped for the third; the last two are kept.
    await cached(get(paths[2] ?? ''));

    await cached(get(paths[1] ?? ''));

    await cached(get(paths[0] ?? ''));

    assert.strictEqual(sent.length, 4);
  });

  test('keeps nothing of a request that got no answer', async () => {
    const path = `/commits/${SHA}` as const;

    const { transport, sent } = recordedTransport({});

    const cached = transportCache({ revalidate: true })(transport);

    const answer = await cached(get(path));

    await cached(get(path));

    assert.strictEqual(answer.kind, 'failed');

    assert.strictEqual(sent.length, 2);
  });

  test('is shared by every transport it wraps', async () => {
    const path = `/commits/${SHA}` as const;

    const { transport, sent } = recordedTransport({
      [`/repos/o/n${path}`]: ok({ a: 1 }),
    });

    const cache = transportCache({ revalidate: false });

    await cache(transport)(get(path));

    await cache(transport)(get(path));

    assert.strictEqual(sent.length, 1);
  });
});
