import { Result } from 'ts-data-forge';
import {
  askGraphql,
  withoutNullNodes,
  type Fetch,
  type GraphqlRequest,
} from './graphql.mjs';

describe(withoutNullNodes, () => {
  test('drops the nodes a token may not see, at any depth', () => {
    assert.deepStrictEqual(
      withoutNullNodes({
        repository: {
          merged: {
            nodes: [
              {
                number: 2022,
                closingIssuesReferences: { nodes: [null, { number: 1 }] },
              },
              null,
            ],
          },
        },
      }),
      {
        repository: {
          merged: {
            nodes: [
              {
                number: 2022,
                closingIssuesReferences: { nodes: [{ number: 1 }] },
              },
            ],
          },
        },
      },
    );
  });

  test('leaves every other null where it is', () => {
    assert.deepStrictEqual(
      withoutNullNodes({ ruleset: null, list: [null, 1], author: null }),
      { ruleset: null, list: [null, 1], author: null },
    );
  });
});

describe(askGraphql, () => {
  test('asks once more when a 2xx answer is not JSON', async () => {
    const { fetchImpl, asked } = answering(
      '',
      JSON.stringify({ data: { viewer: { login: 'noshiro-pf' } } }),
    );

    const { result } = await askGraphql(request(fetchImpl));

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(asked(), 2);
  });

  test('says what came back when the second answer is not JSON either', async () => {
    const { fetchImpl, asked } = answering('<html></html>');

    const { result } = await askGraphql(request(fetchImpl));

    assert.deepStrictEqual(
      result,
      Result.err(
        'GitHub answered the Viewer query with something that is not JSON (200, text/html, 13 bytes).',
      ),
    );

    assert.strictEqual(asked(), 2);
  });

  test('asks once more when a 2xx body stops before its end', async () => {
    let mut_asked = 0;

    const fetchImpl: Fetch = () => {
      mut_asked += 1;

      return Promise.resolve(
        mut_asked === 1
          ? new Response(
              new ReadableStream({
                start: (controller) => {
                  controller.error(
                    new TypeError('network connection was lost'),
                  );
                },
              }),
            )
          : Response.json({ data: { viewer: { login: 'noshiro-pf' } } }),
      );
    };

    const { result } = await askGraphql(request(fetchImpl));

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(mut_asked, 2);
  });

  // A query GitHub gave up on is answered without a CORS header, which the
  // browser rejects exactly as it rejects a lost connection.
  test('names the query it could not get an answer to', async () => {
    const { result } = await askGraphql(request(unreachable));

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'Could not reach the GitHub API for the Viewer query',
    );

    assert.include(result.value, 'did not finish it in time');
  });

  test('does not ask again for JSON that is not an object', async () => {
    const { fetchImpl, asked } = answering('null');

    const { result } = await askGraphql(request(fetchImpl));

    assert.deepStrictEqual(
      result,
      Result.err('GitHub answered with JSON that is not an object.'),
    );

    assert.strictEqual(asked(), 1);
  });
});

const unreachable: Fetch = () => {
  throw new TypeError('Failed to fetch');
};

const request = (fetchImpl: Fetch): GraphqlRequest =>
  ({
    query: 'query Viewer { viewer { login } }',
    variables: {},
    token: 'token',
    fetchImpl,
  }) as const;

/** Answers `200` with each body in turn, the last one from then on. */
const answering = (
  ...bodies: readonly string[]
): Readonly<{ fetchImpl: Fetch; asked: () => number }> => {
  let mut_asked = 0;

  return {
    fetchImpl: () => {
      const body = bodies[Math.min(mut_asked, bodies.length - 1)] ?? '';

      mut_asked += 1;

      return Promise.resolve(
        new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
      );
    },
    asked: () => mut_asked,
  };
};
