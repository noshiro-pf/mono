import { createState } from 'synstate';
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

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    setDirty(true);

    router.push(routes.settings.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    assert.strictEqual(blocker.state.getSnapshot().value.status, 'blocked');

    // Let through by `except`.
    router.push(routes.drafts.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'drafts');

    // The move that went through drops the one held.
    assert.strictEqual(blocker.state.getSnapshot().value.status, 'idle');

    blocker.dispose();

    router.push(routes.home.href());

    assert.strictEqual(router.match.getSnapshot().value.route, 'home');

    router.dispose();
  });
});
