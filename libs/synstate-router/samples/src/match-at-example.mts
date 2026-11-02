import { defineRoutes, matchAt, matchRoutes, param } from 'synstate-router';
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('matchAt', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      users: { children: { item: { params: { userId: param.string } } } },
    });

    const m = matchRoutes(routes, { pathname: '/users/alice/' });

    assert.deepStrictEqual(
      matchAt(routes.users, m),
      Optional.some({ params: {}, search: {} }),
    );

    assert.deepStrictEqual(
      matchAt(routes.users.item, m),
      Optional.some({ params: { userId: 'alice' }, search: {} }),
    );

    // embed-sample-code-ignore-below
  });
}
