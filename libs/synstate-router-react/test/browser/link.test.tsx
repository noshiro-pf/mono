import {
  act,
  fireEvent,
  render,
  screen as testScreen,
} from '@testing-library/react';
import * as React from 'react';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  externalHref,
  historyState,
  type Router,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { createReactRouter } from '../../src/index.mjs';
import { nextTask, routes, setup } from './fixture.js';

/**
 * Whether the router took the last click: a click it leaves would make the test
 * page itself navigate, so it is stopped here, after React has seen it.
 * Each test reads it right after a click of its own.
 */
const mut_lastClick: { prevented: boolean | undefined } = {
  prevented: undefined,
};

document.addEventListener('click', (clickEvent) => {
  mut_lastClick.prevented = clickEvent.defaultPrevented;

  clickEvent.preventDefault();
});

describe('Link', () => {
  test('writes the URL below the base path and routes a plain click', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { getByRole } = render(
      <Link to={routes.settings.href()}>{'settings'}</Link>,
    );

    const anchor = getByRole('link');

    assert.strictEqual(anchor.getAttribute('href'), '/settings/');

    act(() => {
      fireEvent.click(anchor);
    });

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');
  });

  test.each([
    ['a ctrl-click', { ctrlKey: true }],
    ['a meta-click', { metaKey: true }],
    ['a shift-click', { shiftKey: true }],
    ['an alt-click', { altKey: true }],
    ['a middle click', { button: 1 }],
  ] as const)('leaves %s to the browser', (_, init) => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    render(<Link to={routes.settings.href()}>{'settings'}</Link>);

    act(() => {
      fireEvent.click(testScreen.getByRole('link'), init);
    });

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');
  });

  test('leaves target="_blank" and download to the browser', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    render(
      <>
        <Link to={routes.settings.href()} target="_blank">
          {'new tab'}
        </Link>
        <Link to={routes.settings.href()} download>
          {'download'}
        </Link>
      </>,
    );

    act(() => {
      fireEvent.click(testScreen.getByText('new tab'));
    });

    assert.strictEqual(mut_lastClick.prevented, false);

    act(() => {
      fireEvent.click(testScreen.getByText('download'));
    });

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');
  });

  test('routes a click on an element inside the link (#2954)', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    render(
      <Link to={routes.settings.href()}>
        <span data-testid="icon">{'⚙'}</span>
      </Link>,
    );

    act(() => {
      fireEvent.click(testScreen.getByTestId('icon'));
    });

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');
  });

  test('replaces the entry for a link to the current URL (#2956)', async () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    render(<Link to={routes.settings.href()}>{'settings'}</Link>);

    act(() => {
      fireEvent.click(testScreen.getByRole('link'));
    });

    act(() => {
      fireEvent.click(testScreen.getByRole('link'));
    });

    router.back();

    await act(nextTask);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');
  });

  test('makes a fragment of the current page a fragment navigation (#3033)', () => {
    const {
      router,
      browser,
      bound: { Link },
    } = setup('/settings/');

    render(<Link to={routes.settings.href({ hash: 'team' })}>{'team'}</Link>);

    act(() => {
      fireEvent.click(testScreen.getByRole('link'));
    });

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(browser.url().hash, '#team');

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');
  });

  test('leaves an external URL to the browser and writes it as given', () => {
    const {
      bound: { Link },
    } = setup('/');

    render(<Link to={externalHref('https://example.com/docs')}>{'docs'}</Link>);

    const anchor = testScreen.getByRole('link');

    assert.strictEqual(anchor.getAttribute('href'), 'https://example.com/docs');

    act(() => {
      fireEvent.click(anchor);
    });

    assert.strictEqual(mut_lastClick.prevented, false);
  });

  test('passes a ref on to the anchor', () => {
    const {
      bound: { Link },
    } = setup('/');

    const ref = React.createRef<HTMLAnchorElement>();

    render(
      <Link ref={ref} to={routes.settings.href()}>
        {'settings'}
      </Link>,
    );

    assert.instanceOf(ref.current, HTMLAnchorElement);
  });

  test('does not route a click its own onClick prevented', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    render(
      <Link
        to={routes.settings.href()}
        onClick={(clickEvent) => {
          clickEvent.preventDefault();
        }}
      >
        {'settings'}
      </Link>,
    );

    act(() => {
      fireEvent.click(testScreen.getByRole('link'));
    });

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');
  });

  test('replace routes without adding an entry', async () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    router.push(routes.products.href());

    render(
      <Link to={routes.settings.href()} replace>
        {'settings'}
      </Link>,
    );

    act(() => {
      fireEvent.click(testScreen.getByRole('link'));
    });

    router.back();

    await act(nextTask);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');
  });
});

/** Routes whose `checkout` page declares a history state (#3859). */
const stateRoutes = defineRoutes({
  home: { segment: '' },
  checkout: {
    state: historyState.custom<number>({
      decode: (raw) =>
        typeof raw === 'number' ? Optional.some(raw) : Optional.none,
      encode: (step) => step,
    }),
  },
});

type StateRouter = Router<typeof stateRoutes>;

/** A router on {@link stateRoutes}, at the test page's origin. */
const stateSetup = (): StateRouter => {
  const start = new URL('/', globalThis.location.origin);

  return createRouter(stateRoutes, {
    browser: createMemoryBrowser(start.href),
  });
};

const checkoutStep = (router: StateRouter): number | undefined => {
  const m = router.match.getSnapshot().value;

  return m.route === 'checkout' ? m.state : undefined;
};

describe('Link with a history state', () => {
  test('opens the page with it, and back and forward restore it', async () => {
    const router = stateSetup();

    const { Link } = createReactRouter(router);

    const { getByRole, unmount } = render(
      <Link state={3} to={stateRoutes.checkout.href()}>
        {'checkout'}
      </Link>,
    );

    act(() => {
      fireEvent.click(getByRole('link'));
    });

    assert.strictEqual(checkoutStep(router), 3);

    act(() => {
      router.push(stateRoutes.home.href());

      router.back();
    });

    await nextTask();

    assert.strictEqual(checkoutStep(router), 3);

    unmount();
  });
});
