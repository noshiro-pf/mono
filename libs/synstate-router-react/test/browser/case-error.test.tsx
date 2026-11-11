import { act, render } from '@testing-library/react';
import { asSafeInt, isNonNullObject } from 'ts-data-forge';
import type { CaseErrorProps } from '../../src/index.mjs';
import { routes, setup } from './fixture.js';

/** The product ids whose page throws while rendering. */
const mut_broken = new Set<number>();

const Item = ({ productId }: Readonly<{ productId: number }>): string => {
  if (mut_broken.has(productId)) {
    throw new Error(`product ${productId.toString()} failed`);
  }

  return `product ${productId.toString()}`;
};

const messageOf = (error: unknown): string => {
  const message: unknown = isNonNullObject(error)
    ? Reflect.get(error, 'message')
    : undefined;

  return typeof message === 'string' ? message : 'error';
};

const ErrorView = ({ error, retry }: CaseErrorProps): React.JSX.Element => (
  <p>
    {messageOf(error)}
    <button type="button" onClick={retry}>
      retry
    </button>
  </p>
);

const draw = (
  Routes: ReturnType<typeof setup>['bound']['Routes'],
): ReturnType<typeof render> =>
  render(
    <section>
      <h1>layout</h1>
      <Routes
        cases={{
          home: () => 'home',
          products: () => 'products',
          'products.new': undefined,
          'products.item': (values) => (
            <Item productId={values.params.productId} />
          ),
          settings: () => 'settings',
          drafts: undefined,
        }}
        error={ErrorView}
      />
    </section>,
  );

/**
 * Runs `body` with `console.error` silenced: React reports a caught render
 * error there too.
 */
const quietly = (body: () => void): void => {
  vi.stubGlobal('console', { ...console, error: vi.fn() });

  try {
    mut_broken.clear();

    body();
  } finally {
    // cspell:disable-next-line
    vi.unstubAllGlobals();
  }
};

const shown = (
  view: ReturnType<typeof render>,
  text: string | RegExp,
): boolean => view.queryByText(text) !== null;

describe('Routes error', () => {
  test('draws error in place of a case that throws, leaving what is around Routes', () => {
    quietly(() => {
      mut_broken.add(1);

      const {
        bound: { Routes },
      } = setup('/products/1/');

      const view = draw(Routes);

      assert.isTrue(shown(view, 'layout'));

      assert.isTrue(shown(view, /product 1 failed/u));

      view.unmount();
    });
  });

  test('is cleared by a navigation to another route or other params', () => {
    quietly(() => {
      mut_broken.add(1);

      const {
        router,
        bound: { Routes },
      } = setup('/products/1/');

      const view = draw(Routes);

      assert.isTrue(shown(view, /product 1 failed/u));

      act(() => {
        router.push(routes.products.item.href({ productId: asSafeInt(2) }));
      });

      assert.isTrue(shown(view, 'product 2'));

      mut_broken.add(3);

      act(() => {
        router.push(routes.products.item.href({ productId: asSafeInt(3) }));
      });

      assert.isTrue(shown(view, /product 3 failed/u));

      act(() => {
        router.push(routes.settings.href());
      });

      assert.isTrue(shown(view, 'settings'));

      view.unmount();
    });
  });

  test('retry draws the case again', () => {
    quietly(() => {
      mut_broken.add(1);

      const {
        bound: { Routes },
      } = setup('/products/1/');

      const view = draw(Routes);

      mut_broken.delete(1);

      act(() => {
        view.getByText('retry').click();
      });

      assert.isTrue(shown(view, 'product 1'));

      view.unmount();
    });
  });
});
