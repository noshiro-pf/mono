import { isRecord, Optional } from 'ts-data-forge';
import { routePaths } from './route-paths.mjs';
import { roomPage, routes } from './routes.mjs';

describe('routes', () => {
  test('a room is a search parameter of the rooms page', () => {
    assert.strictEqual(roomPage('abc123'), '/rooms/?id=abc123');
  });

  test('the page of a room as one of its players carries the player too', () => {
    const page = roomPage('abc123', 'bob');

    assert.strictEqual(page, '/rooms/?id=abc123&player-id=bob');

    assert.deepStrictEqual(
      roomOf(page),
      Optional.some({ id: 'abc123', playerId: 'bob' }),
    );
  });

  test('a player name is encoded, and read back as it was', () => {
    assert.deepStrictEqual(
      roomOf(roomPage('abc123', 'アルゴ & co')),
      Optional.some({ id: 'abc123', playerId: 'アルゴ & co' }),
    );
  });

  test('the room is read on the rooms page only', () => {
    assert.isTrue(Optional.isNone(roomOf('/?id=abc123&player-id=p1')));

    assert.deepStrictEqual(
      roomOf('/rooms/'),
      Optional.some({ id: undefined, playerId: undefined }),
    );
  });

  test('the main page is the root and the create page', () => {
    assert.strictEqual(routes.main.href(), '/');

    assert.strictEqual(routes.createRoom.href(), '/create/');
  });

  test('every page but the main one is written out by the build', () => {
    // Every node of the tree, nested ones included, so that a page added later
    // is checked too. The build writes them in any order.
    const pagePaths = pagePathsBelow(routes).filter(
      (href) => href !== routes.main.href(),
    );

    assert.sameMembers(Array.from(routePaths), Array.from(pagePaths));
  });
});

/**
 * A node that is a page. Its `href` takes no arguments in this tree, which has
 * no path params; a node with params would need them.
 */
const isPageNode = (
  value: unknown,
): value is Readonly<{ href: () => string }> =>
  isRecord(value) && typeof value['href'] === 'function';

const roomOf = (
  href: string,
): Optional<
  Readonly<{ id: string | undefined; playerId: string | undefined }>
> => {
  const url = new URL(href, 'https://example.com');

  return Optional.map(
    routes.rooms.matchExact({ pathname: url.pathname, search: url.search }),
    (values) => ({
      id: values.search.id,
      playerId: values.search['player-id'],
    }),
  );
};

/**
 * The href of every page below `node`, at any depth: a node is an object with an
 * `href`, and its children are its other properties. A node with no `href`
 * (`page: false`) is walked through.
 */
const pagePathsBelow = (node: unknown): readonly string[] =>
  isRecord(node)
    ? Object.values(node).flatMap((child) => [
        ...(isPageNode(child) ? [child.href()] : []),
        ...pagePathsBelow(child),
      ])
    : ([] as const);
