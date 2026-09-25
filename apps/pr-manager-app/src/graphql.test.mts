import { withoutNullNodes } from './graphql.mjs';

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
