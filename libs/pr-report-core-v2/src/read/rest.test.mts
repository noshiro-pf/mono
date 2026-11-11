import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { classifyGraphqlErrors, classifyHttp } from './classify.mjs';
import {
  MAX_PAGES,
  nextLinkOf,
  restAllPages,
  restGet,
  restLeadingItems,
  restPagesUntil,
  restWrite,
} from './rest.mjs';
import type {
  HttpAnswer,
  HttpAnswered,
  HttpRequest,
  ReadContext,
  Transport,
} from './transport.mjs';

describe(classifyHttp, () => {
  test('a 2xx is no error', () => {
    assert.isUndefined(classifyHttp('x', answered(200, '{}')));
  });

  test('a rate limit is told from a refusal by its headers', () => {
    assert.strictEqual(
      classifyHttp('x', answered(403, '{}', { 'x-ratelimit-remaining': '0' }))
        ?.kind,
      'rate-limited',
    );

    assert.strictEqual(
      classifyHttp('x', answered(429, '{}', { 'retry-after': '60' }))?.kind,
      'rate-limited',
    );

    assert.deepStrictEqual(
      classifyHttp('the checks of #1', answered(403, '{"message":"nope"}')),
      { kind: 'refused', what: 'the checks of #1', message: '403: nope' },
    );
  });

  test('a 5xx and a timeout pass, a 429 is a rate limit, any other 4xx is refused', () => {
    assert.deepStrictEqual(
      [502, 408, 429, 404].map(
        (code) => classifyHttp('x', answered(code, '{}'))?.kind,
      ),
      ['unavailable', 'unavailable', 'rate-limited', 'refused'],
    );
  });
});

describe(classifyGraphqlErrors, () => {
  test('names each kind the way REST would', () => {
    assert.isUndefined(classifyGraphqlErrors('x', []));

    assert.strictEqual(
      classifyGraphqlErrors('x', [{ type: 'RATE_LIMITED', message: 'slow' }])
        ?.kind,
      'rate-limited',
    );

    assert.strictEqual(
      classifyGraphqlErrors('x', [
        { type: 'NOT_FOUND', message: 'gone' },
        { type: 'FORBIDDEN', message: 'no' },
      ])?.kind,
      'refused',
    );

    assert.strictEqual(
      classifyGraphqlErrors('x', [{ type: undefined, message: '?' }])?.kind,
      'malformed',
    );
  });
});

describe(nextLinkOf, () => {
  test('finds rel="next" among the links', () => {
    assert.strictEqual(
      nextLinkOf(
        '<https://api.github.com/x?page=1>; rel="prev", <https://api.github.com/x?page=3>; rel="next"',
      ),
      'https://api.github.com/x?page=3',
    );

    assert.isUndefined(nextLinkOf('<https://a>; rel="last"'));

    assert.isUndefined(nextLinkOf(undefined));
  });
});

describe(restAllPages, () => {
  test('follows rel="next" to the end, asking 100 a page', async () => {
    const { context, sent } = recorded([
      answered(200, '[1,2]', {
        link: '<https://api.github.com/repos/o/n/items?per_page=100&page=2>; rel="next"',
      }),
      answered(200, '[3]'),
    ]);

    const read = await restAllPages(
      context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), [1, 2, 3]);

    assert.deepStrictEqual(
      sent.map(({ url }) => url),
      [
        'https://api.github.com/repos/o/n/items?per_page=100',
        'https://api.github.com/repos/o/n/items?per_page=100&page=2',
      ],
    );

    assert.strictEqual(sent[0]?.headers['authorization'], 'Bearer token');
  });

  test('follows any other link as GitHub wrote it', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://api.github.com/repos/o/n/elsewhere?page=2>; rel="next"',
      }),
      answered(200, '[2]'),
    ]);

    await restAllPages(context, 'the items', '/items', t.array(t.number()));

    assert.strictEqual(
      sent[1]?.url,
      'https://api.github.com/repos/o/n/elsewhere?page=2',
    );
  });

  test('fails on a next link off GitHub’s API, and sends it nothing', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://elsewhere.example/x?page=2>; rel="next"',
      }),
      answered(200, '[2]'),
    ]);

    const read = await restAllPages(
      context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 1);
  });

  test('sends nothing for a path that is no URL', async () => {
    const { context, sent } = recorded([answered(200, '[1]')]);

    const read = await restAllPages(
      context,
      'the items',
      'https://[bad',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 0);
  });

  test('fails on a next link that is no URL, and sends it nothing', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', { link: '<https://[bad>; rel="next"' }),
    ]);

    const read = await restAllPages(
      context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 1);
  });

  test('fails on a next link that carries credentials, and sends it nothing', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://u:p@api.github.com/repos/o/n/items?page=2>; rel="next"',
      }),
    ]);

    const read = await restAllPages(
      context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 1);
  });

  test('fails on a next link by the repository id that carries credentials', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://u:p@api.github.com/repositories/42/items?page=2>; rel="next"',
      }),
    ]);

    const read = await restAllPages(
      context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 1);
  });

  test('asks the route as it was asked, whatever encoding the link writes', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://api.github.com/repositories/42/rules/branches/release/1.x?per_page=100&page=2>; rel="next"',
      }),
      answered(200, '[2]'),
    ]);

    await restAllPages(
      context,
      'the rules',
      '/rules/branches/release%2F1.x',
      t.array(t.number()),
    );

    assert.strictEqual(
      sent[1]?.url,
      'https://api.github.com/repos/o/n/rules/branches/release%2F1.x?per_page=100&page=2',
    );
  });

  test('asks the next page by the route it read, not the repository id', async () => {
    const { context, sent } = recorded([
      answered(200, '[1]', {
        link: '<https://api.github.com/repositories/42/issues?state=open&per_page=100&page=2>; rel="next"',
      }),
      answered(200, '[2]'),
    ]);

    const read = await restAllPages(
      context,
      'the issues',
      '/issues?state=open',
      t.array(t.number()),
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), [1, 2]);

    assert.deepStrictEqual(
      sent.map(({ url }) => url),
      [
        'https://api.github.com/repos/o/n/issues?state=open&per_page=100',
        'https://api.github.com/repos/o/n/issues?state=open&per_page=100&page=2',
      ],
    );
  });

  test('fails, never cuts short, when a page fails or there are too many', async () => {
    const failing = await restAllPages(
      recorded([
        answered(200, '[1]', {
          link: '<https://api.github.com/p2>; rel="next"',
        }),
        answered(502, 'bad gateway'),
      ]).context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.isTrue(Result.isErr(failing));

    const endless = await restAllPages(
      recorded(
        Array.from({ length: MAX_PAGES + 1 }, () =>
          answered(200, '[1]', {
            link: '<https://api.github.com/next>; rel="next"',
          }),
        ),
      ).context,
      'the items',
      '/items',
      t.array(t.number()),
    );

    assert.strictEqual(
      Result.isErr(endless) ? endless.value.kind : undefined,
      'malformed',
    );
  });
});

describe(restPagesUntil, () => {
  test('stops at the page it needs though that page links off GitHub’s API', async () => {
    const { context, sent } = recorded([
      answered(200, '[1, 2]', {
        link: '<https://elsewhere.example/x?page=2>; rel="next"',
      }),
    ]);

    const read = await restPagesUntil(
      context,
      'the items',
      '/items',
      t.array(t.number()),
      (items) => items.includes(2),
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), [1, 2]);

    assert.strictEqual(sent.length, 1);
  });
});

describe(restLeadingItems, () => {
  const next = { link: '<https://api.github.com/next>; rel="next"' } as const;

  test('asks every page in the media asked for', async () => {
    const { context, sent } = recorded([
      answered(200, '[2]', next),
      answered(200, '[1]'),
    ]);

    await restLeadingItems(
      context,
      'the items',
      '/items',
      t.array(t.number()),
      odd,
      1,
      'full',
    );

    assert.deepStrictEqual(
      sent.map(({ headers }) => headers['accept']),
      ['application/vnd.github.full+json', 'application/vnd.github.full+json'],
    );
  });

  test('reads all it needs though its last page links off GitHub’s API', async () => {
    const { context, sent } = recorded([
      answered(200, '[1, 2]', {
        link: '<https://elsewhere.example/x?page=2>; rel="next"',
      }),
    ]);

    const read = await restLeadingItems(
      context,
      'the items',
      '/items',
      t.array(t.number()),
      () => true,
      1,
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), {
      items: [1],
      complete: false,
    });

    assert.strictEqual(sent.length, 1);
  });

  test('reads pages only until enough items are kept', async () => {
    const { context, sent } = recorded([
      answered(200, '[1,2]', next),
      answered(200, '[3,4,5]', next),
    ]);

    const read = await restLeadingItems(
      context,
      'the items',
      '/items',
      t.array(t.number()),
      odd,
      2,
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), {
      items: [1, 3],
      complete: false,
    });

    assert.strictEqual(sent.length, 2);
  });

  test('complete only once the list has ended', async () => {
    const read = await restLeadingItems(
      recorded([answered(200, '[1,2]', next), answered(200, '[3]')]).context,
      'the items',
      '/items',
      t.array(t.number()),
      odd,
      5,
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), {
      items: [1, 3],
      complete: true,
    });
  });

  test('fails on a list that never ends', async () => {
    const read = await restLeadingItems(
      recorded(Array.from({ length: 200 }, () => answered(200, '[2]', next)))
        .context,
      'the items',
      '/items',
      t.array(t.number()),
      odd,
      1,
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );
  });
});

describe(restGet, () => {
  test('sends nothing for a path that is no URL', async () => {
    const { context, sent } = recorded([answered(200, '1')]);

    const read = await restGet(
      context,
      'the thing',
      'https://[bad',
      t.number(),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 0);
  });

  test('sends nothing to a URL off GitHub’s API', async () => {
    const { context, sent } = recorded([answered(200, '1')]);

    const read = await restGet(
      context,
      'the thing',
      'https://elsewhere.example/thing',
      t.number(),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    assert.strictEqual(sent.length, 0);
  });

  test('no answer at all is unavailable', async () => {
    const read = await restGet(
      recorded([{ kind: 'failed', message: 'reset' }]).context,
      'the thing',
      '/thing',
      t.record({ a: t.number() }),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'unavailable',
    );
  });

  test('an answer of the wrong shape is malformed', async () => {
    const read = await restGet(
      recorded([answered(200, '{"a":"b"}')]).context,
      'the thing',
      '/thing',
      t.record({ a: t.number() }),
    );

    assert.strictEqual(
      Result.isErr(read) ? read.value.kind : undefined,
      'malformed',
    );

    const notJson = await restGet(
      recorded([answered(200, '<html>')]).context,
      'the thing',
      '/thing',
      t.record({ a: t.number() }),
    );

    assert.strictEqual(
      Result.isErr(notJson) ? notJson.value.kind : undefined,
      'malformed',
    );
  });
});

describe(restWrite, () => {
  test('sends the body as JSON, with the token, and decodes the answer', async () => {
    const { context, sent } = recorded([answered(201, '{"id":7}')]);

    const read = await restWrite(
      context,
      'the claim on #5',
      'POST',
      '/issues/5/comments',
      { body: 'hello' },
      t.record({ id: t.number() }),
    );

    assert.deepStrictEqual(Result.unwrapThrow(read), { id: 7 });

    assert.deepStrictEqual(sent, [
      {
        method: 'POST',
        url: 'https://api.github.com/repos/o/n/issues/5/comments',
        headers: {
          accept: 'application/vnd.github+json',
          'x-github-api-version': '2022-11-28',
          'content-type': 'application/json',
          authorization: 'Bearer token',
        },
        body: '{"body":"hello"}',
      },
    ]);
  });

  test('sends no body for undefined, and reads an empty answer as null', async () => {
    const { context, sent } = recorded([answered(204, '')]);

    const read = await restWrite(
      context,
      'the comment',
      'DELETE',
      '/issues/comments/7',
      undefined,
      t.nullType,
    );

    assert.isNull(Result.unwrapThrow(read));

    assert.isUndefined(sent[0]?.body);

    assert.isUndefined(sent[0]?.headers['content-type']);
  });

  test('fails as a read fails, and sends nothing off GitHub’s API', async () => {
    const refused = await restWrite(
      recorded([answered(403, '{"message":"nope"}')]).context,
      'the label',
      'POST',
      '/issues/5/labels',
      { labels: ['x'] },
      t.unknown(),
    );

    assert.strictEqual(
      Result.isErr(refused) ? refused.value.kind : undefined,
      'refused',
    );

    const { context, sent } = recorded([answered(200, '{}')]);

    const off = await restWrite(
      context,
      'the thing',
      'PATCH',
      'https://elsewhere.example/x',
      {},
      t.unknown(),
    );

    assert.isTrue(Result.isErr(off));

    assert.strictEqual(sent.length, 0);
  });
});

const answered = (
  status: number,
  body: string,
  headers: ReadonlyRecord<string, string> = {},
): HttpAnswered => ({ kind: 'answered', status, headers, body }) as const;

/** A transport answering `answers` in order, and the requests it was sent. */
const recorded = (
  answers: readonly HttpAnswer[],
): Readonly<{ context: ReadContext; sent: readonly HttpRequest[] }> => {
  const mut_sent: HttpRequest[] = [];

  const transport: Transport = (request) => {
    const answer = answers[mut_sent.length] ?? {
      kind: 'failed',
      message: 'no answer recorded',
    };

    mut_sent.push(request);

    return Promise.resolve(answer);
  };

  return {
    context: { transport, owner: 'o', name: 'n', token: 'token' },
    sent: mut_sent,
  };
};

const odd = (item: number): boolean => item % 2 === 1;
