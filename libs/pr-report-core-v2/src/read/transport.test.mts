import { transportCache } from './transport-cache.mjs';
import {
  CONCURRENT_REQUESTS,
  type HttpAnswer,
  limitConcurrency,
  readContextOf,
  type Transport,
} from './transport.mjs';

describe(limitConcurrency, () => {
  test('keeps at most the limit in flight, and answers every request', async () => {
    let mut_inFlight = 0;

    let mut_most = 0;

    const slow: Transport = async () => {
      mut_inFlight += 1;

      mut_most = Math.max(mut_most, mut_inFlight);

      await new Promise((resolve) => {
        setTimeout(resolve, 1);
      });

      mut_inFlight -= 1;

      return ANSWER;
    };

    const limited = limitConcurrency(slow, 3);

    const answers = await Promise.all(
      Array.from({ length: 10 }, async () =>
        limited({ method: 'GET', url: 'u', headers: {}, body: undefined }),
      ),
    );

    assert.strictEqual(answers.length, 10);

    assert.strictEqual(mut_most, 3);
  });

  test('a request that throws frees its place', async () => {
    const limited = limitConcurrency(throwing, 1);

    const request = {
      method: 'GET',
      url: 'u',
      headers: {},
      body: undefined,
    } as const;

    await expect(limited(request)).rejects.toThrow('boom');

    await expect(limited(request)).rejects.toThrow('boom');
  });

  test('refuses a limit no request could pass', () => {
    expect(() => limitConcurrency(throwing, 0)).toThrow(RangeError);
  });
});

describe(readContextOf, () => {
  test('holds the transport to the limit', () => {
    const context = readContextOf({
      transport: throwing,
      owner: 'o',
      name: 'n',
      token: undefined,
    });

    assert.notStrictEqual(context.transport, throwing);

    assert.strictEqual(context.owner, 'o');
  });

  test('answers what the cache kept while the limit is full', async () => {
    const url =
      `https://api.github.com/repos/o/n/commits/${'a'.repeat(40)}` as const;

    const mut_release: (() => void)[] = [];

    let mut_sent = 0;

    // Answers at once the first time, then holds every request until released.
    const held: Transport = async () => {
      mut_sent += 1;

      if (mut_sent === 1) {
        return ANSWER;
      }

      await new Promise<void>((resolve) => {
        mut_release.push(resolve);
      });

      return ANSWER;
    };

    const context = readContextOf({
      transport: held,
      owner: 'o',
      name: 'n',
      token: undefined,
      cache: transportCache({ revalidate: false }),
    });

    const get = (path: string): Parameters<Transport>[0] =>
      ({ method: 'GET', url: path, headers: {}, body: undefined }) as const;

    await context.transport(get(url));

    // Every place taken.
    const waiting = Array.from(
      { length: CONCURRENT_REQUESTS },
      async (_, index) =>
        context.transport(
          get(`https://api.github.com/repos/o/n/issues/${index}`),
        ),
    );

    assert.deepStrictEqual(await context.transport(get(url)), ANSWER);

    for (const release of mut_release) {
      release();
    }

    await Promise.all(waiting);
  });
});

const ANSWER: HttpAnswer = {
  kind: 'answered',
  status: 200,
  headers: {},
  body: '{}',
} as const;

const throwing: Transport = () => Promise.reject(new Error('boom'));
