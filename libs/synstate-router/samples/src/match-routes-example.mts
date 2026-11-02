import { defineRoutes, matchRoutes, param } from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('matchRoutes', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      users: { children: { item: { params: { userId: param.string } } } },
    });

    const m = matchRoutes(routes, { pathname: '/users/alice/' });

    assert.isTrue(m.route === 'users.item' && m.params.userId === 'alice');

    assert.isUndefined(matchRoutes(routes, { pathname: '/teams/' }).route);

    // embed-sample-code-ignore-below
  });
}
