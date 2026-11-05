import { createState, map } from 'synstate';
import { constant } from 'synstate-dom';
import { externalHref, type ExternalHref, type Href } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';
import { mountInto, nextTask, routes, setup } from './fixture.js';

/**
 * Whether the router took the last click: a click it leaves would make the test
 * page itself navigate, so it is stopped here, after the link has seen it. Each
 * test reads it right after a click of its own.
 */
const mut_lastClick: { prevented: boolean | undefined } = {
  prevented: undefined,
};

document.addEventListener('click', (clickEvent) => {
  mut_lastClick.prevented = clickEvent.defaultPrevented;

  clickEvent.preventDefault();
});

/** Clicks `target` as a person does, with `init` laid over a plain click. */
const click = (target: Element, init: Readonly<MouseEventInit> = {}): void => {
  target.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      ...init,
    }),
  );
};

const anchorIn = (container: Element): HTMLAnchorElement => {
  const anchor = container.querySelector('a');

  assert.isNotNull(anchor);

  return anchor;
};

describe('Link', () => {
  test('writes the URL below the base path and routes a plain click', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link to={routes.settings.href()}>{constant('settings')}</Link>
    ));

    const anchor = anchorIn(container);

    assert.strictEqual(anchor.getAttribute('href'), '/settings/');

    click(anchor);

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');

    unmount();
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

    const { container, unmount } = mountInto(() => (
      <Link to={routes.settings.href()}>{constant('settings')}</Link>
    ));

    click(anchorIn(container), init);

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('leaves target="_blank" and download to the browser', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <>
        <Link target={constant('_blank')} to={routes.settings.href()}>
          {constant('new tab')}
        </Link>
        <Link download={constant('')} to={routes.settings.href()}>
          {constant('download')}
        </Link>
      </>
    ));

    const [newTab, download] = container.querySelectorAll('a');

    assert.isDefined(newTab);

    assert.isDefined(download);

    click(newTab);

    assert.strictEqual(mut_lastClick.prevented, false);

    click(download);

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('routes a click on an element inside the link (#2954)', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link to={routes.settings.href()}>
        <span>{constant('⚙')}</span>
      </Link>
    ));

    const icon = container.querySelector('span');

    assert.isNotNull(icon);

    click(icon);

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');

    unmount();
  });

  test('replaces the entry for a link to the current URL (#2956)', async () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link to={routes.settings.href()}>{constant('settings')}</Link>
    ));

    click(anchorIn(container));

    click(anchorIn(container));

    router.back();

    await nextTask();

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('makes a fragment of the current page a fragment navigation (#3033)', () => {
    const {
      router,
      browser,
      bound: { Link },
    } = setup('/settings/');

    const { container, unmount } = mountInto(() => (
      <Link to={routes.settings.href({ hash: 'team' })}>
        {constant('team')}
      </Link>
    ));

    click(anchorIn(container));

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(browser.url().hash, '#team');

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');

    unmount();
  });

  test('leaves an external URL to the browser and writes it as given', () => {
    const {
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link to={externalHref('https://example.com/docs')}>
        {constant('docs')}
      </Link>
    ));

    const anchor = anchorIn(container);

    assert.strictEqual(anchor.getAttribute('href'), 'https://example.com/docs');

    click(anchor);

    assert.strictEqual(mut_lastClick.prevented, false);

    unmount();
  });

  test('leaves an external URL of this origin to the browser too', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link to={externalHref(`${location.origin}/settings/`)}>
        {constant('settings, loaded again')}
      </Link>
    ));

    click(anchorIn(container));

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('follows a `to` that changes', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const [to$, setTo] = createState<Href | ExternalHref>(
      routes.settings.href(),
    );

    const { container, unmount } = mountInto(() => (
      <Link to={to$}>{constant('link')}</Link>
    ));

    const anchor = anchorIn(container);

    setTo(routes.products.item.href({ productId: asSafeInt(5) }));

    assert.strictEqual(anchor.getAttribute('href'), '/products/5/');

    click(anchor);

    assert.strictEqual(router.match.getSnapshot().value.route, 'products.item');

    setTo(externalHref('https://example.com/'));

    assert.strictEqual(anchor.getAttribute('href'), 'https://example.com/');

    click(anchor);

    assert.strictEqual(mut_lastClick.prevented, false);

    unmount();
  });

  test('reads an observable `to` when clicked', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const [external$, setExternal] = createState(false);

    const { container, unmount } = mountInto(() => (
      <Link
        to={external$.pipe(
          map((external) =>
            external
              ? externalHref(`${location.origin}/settings/`)
              : routes.settings.href(),
          ),
        )}
      >
        {constant('settings')}
      </Link>
    ));

    const anchor = anchorIn(container);

    // The destination changed after the Link was mounted, to the same page as an
    // ExternalHref: the click reads it and leaves it to the browser.
    setExternal(true);

    click(anchor);

    assert.strictEqual(mut_lastClick.prevented, false);

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    setExternal(false);

    click(anchor);

    assert.strictEqual(mut_lastClick.prevented, true);

    assert.strictEqual(router.match.getSnapshot().value.route, 'settings');

    unmount();
  });

  test('does not route a click its own onClick prevented', () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <Link
        to={routes.settings.href()}
        onClick={(clickEvent) => {
          clickEvent.preventDefault();
        }}
      >
        {constant('settings')}
      </Link>
    ));

    click(anchorIn(container));

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('replace routes without adding an entry', async () => {
    const {
      router,
      bound: { Link },
    } = setup('/');

    router.push(routes.products.href());

    const { container, unmount } = mountInto(() => (
      <Link replace to={routes.settings.href()}>
        {constant('settings')}
      </Link>
    ));

    click(anchorIn(container));

    router.back();

    await nextTask();

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    unmount();
  });

  test('passes a ref on to the anchor', () => {
    const {
      bound: { Link },
    } = setup('/');

    const mut_refs: HTMLAnchorElement[] = [];

    const { unmount } = mountInto(() => (
      <Link
        ref={(anchor) => {
          mut_refs.push(anchor);
        }}
        to={routes.settings.href()}
      >
        {constant('settings')}
      </Link>
    ));

    assert.strictEqual(mut_refs.length, 1);

    assert.instanceOf(mut_refs[0], HTMLAnchorElement);

    unmount();
  });
});
