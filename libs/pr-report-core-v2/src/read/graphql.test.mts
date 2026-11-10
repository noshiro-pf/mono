import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { Read } from '../snapshot/index.mjs';
import { readRepositoryFactsGraphql } from './graphql-repository.mjs';
import { graphqlRead } from './graphql.mjs';
import { ok, recordedTransport, status } from './recorded-transport.mjs';
import type { ReadContext } from './transport.mjs';

type Routes = Parameters<typeof recordedTransport>[0];

const contextOf = (recorded: Routes): ReadContext =>
  ({
    transport: recordedTransport(recorded).transport,
    owner: 'o',
    name: 'n',
    token: 'token',
  }) as const;

const read = async (answer: Routes[string]): Promise<Read<unknown>> =>
  graphqlRead(
    contextOf({ 'graphql:query Q': answer }),
    'the thing',
    'query Q { a }',
    {},
    t.record({ a: t.number() }),
  );

const kindOf = (result: Read<unknown>): string | undefined =>
  Result.isErr(result) ? result.value.kind : undefined;

describe(graphqlRead, () => {
  test('decodes `data`, sending the owner and name as variables', async () => {
    const { transport, sent } = recordedTransport({
      'graphql:query Q': ok({ data: { a: 1 } }),
    });

    const answer = await graphqlRead(
      { transport, owner: 'o', name: 'n', token: 'token' },
      'the thing',
      'query Q { a }',
      { first: 20 },
      t.record({ a: t.number() }),
    );

    assert.deepStrictEqual(answer, Result.ok({ a: 1 }));

    assert.deepStrictEqual(JSON.parse(sent[0]?.body ?? ''), {
      query: 'query Q { a }',
      variables: { owner: 'o', name: 'n', first: 20 },
    });

    assert.strictEqual(sent[0]?.headers['authorization'], 'Bearer token');
  });

  test('names each failure', async () => {
    assert.strictEqual(
      kindOf(
        await read(
          ok({ data: null, errors: [{ type: 'RATE_LIMITED', message: 'x' }] }),
        ),
      ),
      'rate-limited',
    );

    // Partial data beside an error is dropped.
    assert.strictEqual(
      kindOf(
        await read(
          ok({ data: { a: 1 }, errors: [{ type: 'NOT_FOUND', message: 'x' }] }),
        ),
      ),
      'refused',
    );

    assert.strictEqual(
      kindOf(await read(ok({ errors: [{ message: 'syntax' }] }))),
      'malformed',
    );

    assert.strictEqual(
      kindOf(await read(ok({ data: { a: 'b' } }))),
      'malformed',
    );

    assert.strictEqual(
      kindOf(await read(status(502, 'bad gateway'))),
      'unavailable',
    );

    assert.strictEqual(
      kindOf(await read({ kind: 'failed', message: 'reset' })),
      'unavailable',
    );
  });
});

describe(readRepositoryFactsGraphql, () => {
  const repository = {
    nameWithOwner: 'o/m',
    defaultBranchRef: { name: 'main', target: { oid: 'f'.repeat(40) } },
    codeOwners: null,
    queueLabel: null,
  } as const;

  test('reads the facts, a missing CODEOWNERS or label as none', async () => {
    const facts = Result.unwrapThrow(
      await readRepositoryFactsGraphql(
        contextOf({
          'graphql:query Repository(': ok({
            data: { viewer: { login: 'me' }, repository },
          }),
        }),
      ),
    );

    assert.deepStrictEqual(facts, {
      repo: { owner: 'o', name: 'm' },
      defaultBranch: 'main',
      defaultBranchTip: 'f'.repeat(40),
      viewer: Result.ok('me'),
      codeOwners: Result.ok(undefined),
      hasQueueLabel: Result.ok(false),
    });
  });

  test('no default branch is no snapshot', async () => {
    const facts = await readRepositoryFactsGraphql(
      contextOf({
        'graphql:query Repository(': ok({
          data: {
            viewer: { login: 'me' },
            repository: { ...repository, defaultBranchRef: null },
          },
        }),
      }),
    );

    assert.isTrue(Result.isErr(facts));
  });
});
