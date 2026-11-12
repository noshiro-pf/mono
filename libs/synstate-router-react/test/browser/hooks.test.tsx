import { act, renderHook } from '@testing-library/react';
import { asSafeInt, Optional } from 'ts-data-forge';
import { routes, setup } from './fixture.js';

describe('hooks', () => {
  test('useRouteMatch follows the match', () => {
    const {
      router,
      bound: { useRouteMatch },
    } = setup('/');

    const { result } = renderHook(useRouteMatch);

    assert.strictEqual(result.current.route, 'home');

    act(() => {
      router.push(routes.settings.href());
    });

    assert.strictEqual(result.current.route, 'settings');
  });

  test('useBranch follows the matched branch, root first', () => {
    const {
      router,
      bound: { useBranch },
    } = setup('/products/3/');

    const { result } = renderHook(useBranch);

    assert.deepStrictEqual<unknown>(result.current, [
      { id: 'products', meta: undefined, href: '/products/' },
      { id: 'products.item', meta: undefined, href: '/products/3/' },
    ]);

    act(() => {
      router.push(routes.settings.href());
    });

    assert.deepStrictEqual<unknown>(result.current, [
      { id: 'settings', meta: undefined, href: '/settings/' },
    ]);
  });

  test('useBlocker holds a navigation while mounted, and proceed lets it go', () => {
    const {
      router,
      bound: { useBlocker },
    } = setup('/settings/');

    const view = renderHook(() =>
      useBlocker(({ to }) => to?.route !== 'settings'),
    );

    assert.strictEqual(view.result.current.status, 'idle');

    act(() => {
      router.push(routes.home.href());
    });

    const blocked = view.result.current;

    assert.isTrue(blocked.status === 'blocked' && blocked.to.route === 'home');

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');

    act(() => {
      blocked.proceed();
    });

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    assert.strictEqual(view.result.current.status, 'idle');

    view.unmount();

    // Unmounted: nothing blocks.
    router.push(routes.settings.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');
  });

  test('useBlocker asks the latest function', () => {
    const {
      router,
      bound: { useBlocker },
    } = setup('/settings/');

    const view = renderHook(
      ({ dirty }: Readonly<{ dirty: boolean }>) => useBlocker(() => dirty),
      { initialProps: { dirty: false } },
    );

    act(() => {
      router.push(routes.home.href());
    });

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    view.rerender({ dirty: true });

    act(() => {
      router.push(routes.settings.href());
    });

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    assert.strictEqual(view.result.current.status, 'blocked');
  });

  test('useAt holds the values of a node the page is at or below', () => {
    const {
      router,
      bound: { useAt },
    } = setup('/');

    const { result } = renderHook(() => useAt(routes.products));

    // Not `assert.isTrue`, whose narrowing would outlive the push below.
    assert.strictEqual(Optional.isNone(result.current), true);

    act(() => {
      router.push(routes.products.item.href({ productId: asSafeInt(3) }));
    });

    const values = result.current;

    assert.isTrue(Optional.isSome(values));

    assert.strictEqual(values.value.search.page, 1);
  });

  test('useIsActive is true at or below the node, or at it alone with exact', () => {
    const {
      router,
      bound: { useIsActive },
    } = setup('/products/3/');

    const below = renderHook(() => useIsActive(routes.products));

    const exact = renderHook(() =>
      useIsActive(routes.products, { exact: true }),
    );

    assert.isTrue(below.result.current);

    assert.isFalse(exact.result.current);

    act(() => {
      router.push(routes.products.href());
    });

    assert.isTrue(exact.result.current);
  });
});
