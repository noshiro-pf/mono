import { act, renderHook } from '@testing-library/preact';
import { asSafeInt, Optional } from 'ts-data-forge';
import { routes, setup } from './fixture.js';

describe('hooks', () => {
  test('useRouteMatch follows the match', async () => {
    const {
      router,
      bound: { useRouteMatch },
    } = setup('/');

    const { result } = renderHook(useRouteMatch);

    assert.strictEqual(result.current.route, 'home');

    await act(() => {
      router.push(routes.settings.href());
    });

    assert.strictEqual(result.current.route, 'settings');
  });

  test('useAt holds the values of a node the page is at or below', async () => {
    const {
      router,
      bound: { useAt },
    } = setup('/');

    const { result } = renderHook(() => useAt(routes.products));

    // Not `assert.isTrue`, whose narrowing would outlive the push below.
    assert.strictEqual(Optional.isNone(result.current), true);

    await act(() => {
      router.push(routes.products.item.href({ productId: asSafeInt(3) }));
    });

    const values = result.current;

    assert.isTrue(Optional.isSome(values));

    assert.strictEqual(Optional.unwrap(values).search.page, 1);
  });

  test('useIsActive is true at or below the node, or at it alone with exact', async () => {
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

    await act(() => {
      router.push(routes.products.href());
    });

    assert.isTrue(exact.result.current);
  });
});
