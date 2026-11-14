import {
  act,
  fireEvent,
  render,
  screen as testScreen,
} from '@testing-library/react';
import * as React from 'react';
import { externalHref } from 'synstate-router';
import { Optional } from 'ts-data-forge';
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'settings',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'settings',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'settings',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
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

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
  });
});
