import { routePaths, routes } from './route-paths.mjs';
import { getParams, getRoomId, roomPage } from './routes.mjs';

describe('routes', () => {
  test('a room is a query parameter of the rooms page', () => {
    assert.strictEqual(roomPage('abc123'), '/rooms/?id=abc123');
  });

  test('the page of a room as one of its players carries the player too', () => {
    const page = roomPage('abc123', 'bob');

    assert.strictEqual(page, '/rooms/?id=abc123&player-id=bob');

    const query = new URLSearchParams(page.slice(page.indexOf('?')));

    assert.strictEqual(getRoomId('/rooms/', query), 'abc123');

    assert.strictEqual(getParams(query).playerId, 'bob');
  });

  test('a player name is encoded, and read back as it was', () => {
    const page = roomPage('abc123', 'アルゴ & co');

    const query = new URLSearchParams(page.slice(page.indexOf('?')));

    assert.strictEqual(getParams(query).playerId, 'アルゴ & co');
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
