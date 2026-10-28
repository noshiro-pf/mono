import { routePaths, routes } from './route-paths.mjs';
import { getRoomId, roomPage } from './routes.mjs';

describe('routes', () => {
  test('a room is a query parameter of the rooms page', () => {
    assert.strictEqual(roomPage('abc123'), '/rooms/?id=abc123');
  });

  test('the room is read from the query, on the rooms page only', () => {
    const query = new URLSearchParams('id=abc123&player-id=p1');

    assert.strictEqual(getRoomId('/rooms/', query), 'abc123');

    assert.isUndefined(getRoomId('/', query));

    assert.isUndefined(getRoomId('/rooms/', new URLSearchParams('')));
  });

  test('every page is a fixed path, each written out by the build', () => {
    assert.deepStrictEqual(routePaths, [
      `${routes.createRoom}/`,
      `${routes.rooms}/`,
    ]);
  });
});
