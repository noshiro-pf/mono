import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readLinkedClosingIssuesGraphql } from './graphql-merged.mjs';
import { ok, recordedTransport } from './recorded-transport.mjs';

const node = (
  number: number,
  repository = 'o/n',
): ReadonlyRecord<string, unknown> =>
  ({
    number,
    title: `issue ${number}`,
    url: `https://github.com/${repository}/issues/${number}`,
    state: number === 9 ? ('OPEN' as const) : ('CLOSED' as const),
    repository: { nameWithOwner: repository },
  }) as const;

describe(readLinkedClosingIssuesGraphql, () => {
  test('reads the issues GitHub links to each pull request, this repository’s alone, in one query', async () => {
    const { transport, sent } = recordedTransport({
      'graphql:query MergedClosingIssues(': ok({
        data: {
          repository: {
            p0: {
              closingIssuesReferences: {
                totalCount: 3,
                nodes: [node(7), node(9), node(8, 'o/other')],
              },
            },
            // A number that is no pull request.
            p1: null,
          },
        },
      }),
    });

    const read = await readLinkedClosingIssuesGraphql(
      { transport, owner: 'o', name: 'n', token: 'token' },
      [5, 6],
    );

    assert.deepStrictEqual(Array.from(Result.unwrapThrow(read)), [
      [
        5,
        [
          {
            number: 7,
            title: 'issue 7',
            url: 'https://github.com/o/n/issues/7',
            state: 'closed',
          },
          {
            number: 9,
            title: 'issue 9',
            url: 'https://github.com/o/n/issues/9',
            state: 'open',
          },
        ],
      ],
      [6, []],
    ]);

    assert.strictEqual(sent.length, 1);

    assert.include(
      sent[0]?.body ?? '',
      '"variables":{"owner":"o","name":"n","n0":5,"n1":6}',
    );
  });

  test('fails on a pull request linked to more issues than it reads', async () => {
    const read = await readLinkedClosingIssuesGraphql(
      {
        transport: recordedTransport({
          'graphql:query MergedClosingIssues(': ok({
            data: {
              repository: {
                p0: {
                  closingIssuesReferences: { totalCount: 60, nodes: [node(7)] },
                },
              },
            },
          }),
        }).transport,
        owner: 'o',
        name: 'n',
        token: 'token',
      },
      [5],
    );

    assert.isTrue(Result.isErr(read));
  });

  test('reads nothing for no pull request', async () => {
    const { transport, sent } = recordedTransport({});

    const read = await readLinkedClosingIssuesGraphql(
      { transport, owner: 'o', name: 'n', token: 'token' },
      [],
    );

    assert.strictEqual(Result.unwrapThrow(read).size, 0);

    assert.strictEqual(sent.length, 0);
  });
});
