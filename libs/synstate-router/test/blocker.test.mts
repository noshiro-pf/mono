import { createState } from 'synstate';
import { Arr, asSafeInt } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
  type BlockerState,
  type NavigationAttempt,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  form: { search: { tab: search.string() } },
  products: { children: { item: { params: { productId: param.int } } } },
});

type Routes = typeof routes;

const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const setup = (
  url: string = 'https://example.com/form/',
): Readonly<{
  router: ReturnType<typeof createRouter<Routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
}> => {
  const browser = createMemoryBrowser(url);

  return { browser, router: createRouter(routes, { browser }) };
};

const statusOf = (state: BlockerState<Routes>): string =>
  state.status === 'blocked'
    ? (`blocked → ${state.to.route ?? 'not found'}` as const)
    : 'idle';

describe('router.block', () => {
  test('holds a push while it blocks, leaving the match and the history', () => {
    const { router, browser } = setup();

    const mut_attempts: NavigationAttempt<Routes>[] = [];

    const blocker = router.block((attempt) => {
      mut_attempts.push(attempt);

      return true;
    });

    router.push(routes.home.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'form');

    assert.strictEqual(browser.url().pathname, '/form/');

    assert.deepStrictEqual(
      mut_attempts.map(({ from, to }) => [from.route, to?.route]),
      [['form', 'home']],
    );

    assert.strictEqual(
      statusOf(blocker.state.getSnapshot().value),
      'blocked → home',
    );

    blocker.dispose();

    router.dispose();
  });

  test('proceed makes the held navigation, and reset drops it', () => {
    const { router, browser } = setup();

    const blocker = router.block(() => true);

    router.push(routes.home.href());

    const blocked = blocker.state.getSnapshot().value;

    assert.isTrue(blocked.status === 'blocked');

    blocked.proceed();

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    assert.strictEqual(statusOf(blocker.state.getSnapshot().value), 'idle');

    router.push(routes.form.href());

    const again = blocker.state.getSnapshot().value;

    assert.isTrue(again.status === 'blocked');

    again.reset();

    assert.strictEqual(browser.url().pathname, '/');

    assert.strictEqual(statusOf(blocker.state.getSnapshot().value), 'idle');

    router.dispose();
  });

  test('asks with the destination, so it can let some moves through', () => {
    const { router } = setup();

    // Another tab of the same form is not leaving it.
    const blocker = router.block(({ to }) => to?.route !== 'form');

    router.setSearch(routes.form, () => ({ tab: 'b' }));

    assert.strictEqual(statusOf(blocker.state.getSnapshot().value), 'idle');

    assert.strictEqual(
      router.location.getSnapshot().value.search.get('tab'),
      'b',
    );

    router.replace(routes.products.item.href({ productId: asSafeInt(1) }));

    assert.strictEqual(
      statusOf(blocker.state.getSnapshot().value),
      'blocked → products.item',
    );

    router.dispose();
  });

  test('holds setSearch and follow too', async () => {
    const { router } = setup();

    const blocker = router.block(() => true);

    assert.isTrue(router.setSearch(routes.form, () => ({ tab: 'x' })));

    assert.isNull(router.location.getSnapshot().value.search.get('tab'));

    const [href$, setHref] = createState(routes.form.href());

    router.follow(href$);

    setHref(routes.home.href());

    await Promise.resolve();

    assert.strictEqual(router.match.getSnapshot().value.route, 'form');

    assert.strictEqual(
      statusOf(blocker.state.getSnapshot().value),
      'blocked → home',
    );

    router.dispose();
  });

  test('a blocked back restores the entry and leaves the match unchanged after popstate', async () => {
    const { router, browser } = setup('https://example.com/');

    router.push(routes.form.href());

    const mut_seen: (string | undefined)[] = [];

    router.match.subscribe((m) => {
      mut_seen.push(m.route);
    });

    const blocker = router.block(() => true);

    router.back();

    // The browser has moved; the router moves it back.
    await nextTask();

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/form/');

    assert.deepStrictEqual(mut_seen, ['form']);

    const blocked = blocker.state.getSnapshot().value;

    assert.isTrue(blocked.status === 'blocked' && blocked.to.route === 'home');

    blocked.proceed();

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/');

    assert.deepStrictEqual(mut_seen, ['form', 'home']);

    router.dispose();
  });

  test('a second back while the first is undone is asked about too', async () => {
    const { router, browser } = setup('https://example.com/');

    router.push(routes.form.href());

    router.push(routes.form.href({ search: { tab: 'b' } }));

    const mut_asked: (string | undefined)[] = [];

    const blocker = router.block(({ to }) => {
      mut_asked.push(to?.route);

      return true;
    });

    router.back();

    router.back();

    await nextTask();

    await nextTask();

    await nextTask();

    // Each press was asked about, and the page stays.
    assert.isTrue(Arr.isMinLengthArray(2, mut_asked));

    assert.strictEqual(router.match.getSnapshot().value.route, 'form');

    assert.strictEqual(browser.url().search, '?tab=b');

    assert.strictEqual(blocker.state.getSnapshot().value.status, 'blocked');

    router.dispose();
  });

  test('a blocked forward is restored as well', async () => {
    const { router, browser } = setup('https://example.com/');

    router.push(routes.form.href());

    router.back();

    await nextTask();

    const blocker = router.block(() => true);

    router.forward();

    await nextTask();

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/');

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    assert.strictEqual(
      statusOf(blocker.state.getSnapshot().value),
      'blocked → form',
    );

    router.dispose();
  });

  test('blocks unloading the document while it blocks', () => {
    const { router, browser } = setup();

    const [dirty, setDirty] = createState(true);

    const blocker = router.block(
      ({ to }) => to !== undefined || dirty.getSnapshot().value,
    );

    assert.isTrue(browser.unload());

    setDirty(false);

    assert.isFalse(browser.unload());

    setDirty(true);

    blocker.dispose();

    // No blocker is listening any more.
    assert.isFalse(browser.unload());

    router.dispose();
  });

  test('dispose of the blocker, or of the router, lets every navigation through', () => {
    const { router } = setup();

    const blocker = router.block(() => true);

    blocker.dispose();

    router.push(routes.home.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    const other = router.block(() => true);

    router.dispose();

    assert.strictEqual(statusOf(other.state.getSnapshot().value), 'idle');
  });

  test('a move that goes through drops the one held', () => {
    const { router } = setup();

    const blocker = router.block(({ to }) => to?.route === 'home');

    router.push(routes.home.href());

    assert.strictEqual(blocker.state.getSnapshot().value.status, 'blocked');

    router.push(routes.products.item.href({ productId: asSafeInt(2) }));

    assert.strictEqual(router.match.getSnapshot().value.route, 'products.item');

    assert.strictEqual(blocker.state.getSnapshot().value.status, 'idle');

    router.dispose();
  });

  test('a push to where the location already is asks nothing', () => {
    const { router } = setup();

    const mut_asked = { count: 0 };

    router.block(() => {
      mut_asked.count += 1;

      return true;
    });

    router.replace(routes.form.href());

    assert.strictEqual(mut_asked.count, 0);

    router.dispose();
  });
});
