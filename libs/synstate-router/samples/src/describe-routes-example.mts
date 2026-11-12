import { defineRoutes, describeRoutes, param } from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('describeRoutes', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      users: { children: { item: { params: { userId: param.string } } } },
    });

    assert.deepStrictEqual(
      describeRoutes(routes).map(({ id, pattern }) => `${id} ${pattern}`),
      ['home /', 'users /users', 'users.item /users/:userId'],
    );

    // embed-sample-code-ignore-below
  });
}
