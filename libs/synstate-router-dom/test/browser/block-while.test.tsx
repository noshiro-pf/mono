import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import { routes, setup } from './fixture.js';

describe('blockWhile', () => {
  test('blocks leaving while the observable holds true, except where told', () => {
    const {
      router,
      bound: { blockWhile },
    } = setup('/settings/');

    const [dirty, setDirty] = createState(false);

    const blocker = blockWhile(dirty, ({ to }) => to?.route === 'drafts');

    router.push(routes.home.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );

    setDirty(true);

    router.push(routes.settings.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );

    assert.strictEqual(
      Optional.unwrap(blocker.state.getSnapshot()).status,
      'blocked',
    );

    // Let through by `except`.
    router.push(routes.drafts.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'drafts',
    );

    // The move that went through drops the one held.
    assert.strictEqual(
      Optional.unwrap(blocker.state.getSnapshot()).status,
      'idle',
    );

    blocker.dispose();

    router.push(routes.home.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );

    router.dispose();
  });
});
