import {
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
});

const ANSWER: HttpAnswer = {
  kind: 'answered',
  status: 200,
  headers: {},
  body: '{}',
} as const;

const throwing: Transport = () => Promise.reject(new Error('boom'));
