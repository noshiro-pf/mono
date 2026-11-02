import { Result } from 'ts-data-forge';
import { askAndRead, readJson } from './answer-body.mjs';

describe(readJson, () => {
  test('is the value the body holds', async () => {
    assert.deepStrictEqual(
      await readJson(Response.json({ data: null })),
      Result.ok({ data: null }),
    );
  });

  test('says what came back: the status, its type and how much of it', async () => {
    assert.deepStrictEqual(
      await readJson(
        new Response('<html>ü</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }),
      ),
      Result.err(
        'GitHub answered with something that is not JSON (200, text/html; charset=utf-8, 15 bytes).',
      ),
    );
  });

  test('names what was asked for, when there is a name', async () => {
    assert.deepStrictEqual(
      await readJson(new Response(null, { status: 200 }), 'the workflow runs'),
      Result.err(
        'GitHub answered the workflow runs with something that is not JSON (200, no Content-Type, an empty body).',
      ),
    );
  });

  test('says so when the body stops before its end, rather than throwing', async () => {
    assert.deepStrictEqual(
      await readJson(cutShort(), 'the workflow runs'),
      Result.err(
        "GitHub's answer for the workflow runs stopped before its end (200). Check the connection and try again.",
      ),
    );
  });
});

/** A `200` whose body fails while it is read, as a dropped connection does. */
const cutShort = (): Response =>
  new Response(
    new ReadableStream({
      start: (controller) => {
        controller.error(new TypeError('network connection was lost'));
      },
    }),
    { status: 200 },
  );

describe(askAndRead, () => {
  test('asks once more when a 2xx body cannot be read', async () => {
    const { ask, asked } = asking(
      () => new Response(''),
      () => Response.json({ ok: true }),
    );

    const answered = await askAndRead(ask);

    assert.deepStrictEqual(answered?.body, Result.ok({ ok: true }));

    assert.strictEqual(asked(), 2);
  });

  test('says what the second answer was when it cannot be read either', async () => {
    const { ask, asked } = asking(() => new Response(''));

    const answered = await askAndRead(ask, 'the workflow runs');

    assert.deepStrictEqual(
      answered?.body,
      Result.err(
        'GitHub answered the workflow runs with something that is not JSON (200, text/plain;charset=UTF-8, an empty body).',
      ),
    );

    assert.strictEqual(asked(), 2);
  });

  test('tells the second asking it is the second, so it can skip the cache', async () => {
    const mut_again: boolean[] = [];

    await askAndRead((again) => {
      mut_again.push(again);

      return Promise.resolve(new Response(''));
    });

    assert.deepStrictEqual(mut_again, [false, true]);
  });

  test('does not read the body of a refusal', async () => {
    const answered = await askAndRead(() =>
      Promise.resolve(new Response('<html></html>', { status: 502 })),
    );

    assert.strictEqual(answered?.response.bodyUsed, false);
  });

  test('does not ask again after a refusal', async () => {
    const { ask, asked } = asking(() => new Response('', { status: 502 }));

    const answered = await askAndRead(ask);

    assert.strictEqual(answered?.response.status, 502);

    assert.strictEqual(asked(), 1);
  });

  test('keeps the first answer when the second asking cannot reach GitHub', async () => {
    const { ask } = asking(
      () => new Response('', { headers: { 'x-ratelimit-remaining': '42' } }),
      () => {
        throw new TypeError('Load failed');
      },
    );

    const answered = await askAndRead(ask);

    assert.strictEqual(
      answered?.response.headers.get('x-ratelimit-remaining'),
      '42',
    );
  });

  test('is undefined when GitHub cannot be reached', async () => {
    const { ask } = asking(() => {
      throw new TypeError('Load failed');
    });

    assert.isUndefined(await askAndRead(ask));
  });
});

/** An `ask` answering with each of `answers` in turn, the last from then on. */
const asking = (
  ...answers: readonly (() => Response)[]
): Readonly<{ ask: () => Promise<Response>; asked: () => number }> => {
  let mut_asked = 0;

  return {
    ask: async () => {
      const answer = answers[Math.min(mut_asked, answers.length - 1)];

      mut_asked += 1;

      return answer === undefined
        ? Promise.reject(new Error('no answer'))
        : answer();
    },
    asked: () => mut_asked,
  };
};
