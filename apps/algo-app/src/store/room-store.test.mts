// cspell:ignore FFFD
import { Result } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import type { RoomApi } from '../api/index.mjs';
import { roomPage } from '../constants/index.mjs';
import { newRoom } from '../functions/index.mjs';
import type { GameStateActionFromDb, Player, Room } from '../types/index.mjs';
import {
  createRoomStore,
  type CreatedRoom,
  type RoomStore,
} from './room-store.mjs';

describe(createRoomStore, () => {
  test('watches the room the id names once started, and the next one instead', () => {
    const { store, api } = setup();

    store.start();

    store.setRoomId('a');

    assert.deepStrictEqual(api.watching(), ['room:a', 'actions:a']);

    const roomA = roomWithId('a');

    api.emitRoom('a', roomA);

    assert.strictEqual(store.room.getSnapshot().value, roomA);

    const mut_received: (readonly GameStateActionFromDb[])[] = [];

    store.actionsFromDb.subscribe((actions) => {
      mut_received.push(actions);
    });

    api.emitActions('a', []);

    assert.deepStrictEqual(mut_received, [[]]);

    store.setRoomId('b');

    assert.deepStrictEqual(api.watching(), ['room:b', 'actions:b']);
  });

  test('watches an id set before it started', () => {
    const { store, api } = setup();

    store.setRoomId('a');

    assert.deepStrictEqual(api.watching(), []);

    store.start();

    assert.deepStrictEqual(api.watching(), ['room:a', 'actions:a']);
  });

  test('stop ends the watches and listens to no further id', () => {
    const { store, api } = setup();

    const stopStore = store.start();

    store.setRoomId('a');

    stopStore();

    assert.deepStrictEqual(api.watching(), []);

    store.setRoomId('b');

    assert.deepStrictEqual(api.watching(), []);
  });

  test('setMyName names the player, as a page opened as that player does', () => {
    const { store } = setup();

    assert.isUndefined(store.myName.getSnapshot().value);

    store.setMyName('bob');

    assert.strictEqual(store.myName.getSnapshot().value, 'bob');
  });

  test("createRoom saves a room with the player in it, and answers with it and the creator's name", async () => {
    const { store, api } = setup();

    const mut_responses: CreatedRoom[] = [];

    store.createRoom.response.subscribe((created) => {
      mut_responses.push(created);
    });

    const pending = store.createRoom.dispatch({
      username: 'alice',
      password: 'secret',
    });

    assert.isTrue(store.createRoom.isWaitingResponse.getSnapshot().value);

    const [added] = api.addedRooms;

    assert.isDefined(added);

    assert.strictEqual(added.room.password, 'secret');

    assert.deepStrictEqual(added.room.players, [
      { name: 'alice', online: true },
    ]);

    added.resolve('new-id');

    const result = await pending;

    assert.isTrue(Result.isOk(result));

    const res = result.value;

    assert.strictEqual(res.id, 'new-id');

    // With the creator's name, so that they open the room as the player they
    // already are, not on its join form.
    assert.deepStrictEqual(mut_responses, [{ room: res, myName: 'alice' }]);

    assert.strictEqual(store.myName.getSnapshot().value, 'alice');

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);

    assert.isFalse(store.createRoom.hasFailed.getSnapshot().value);
  });

  test('createRoom names the creator in a form the room page URL can carry', async () => {
    const { store, api } = setup();

    const mut_responses: CreatedRoom[] = [];

    store.createRoom.response.subscribe((created) => {
      mut_responses.push(created);
    });

    // A lone surrogate, as half of a pasted emoji leaves.
    const pending = store.createRoom.dispatch({
      username: 'alice\u{D83D}',
      password: undefined,
    });

    const [added] = api.addedRooms;

    assert.isDefined(added);

    assert.deepStrictEqual(added.room.players, [
      { name: 'alice\u{FFFD}', online: true },
    ]);

    added.resolve('new-id');

    await pending;

    assert.deepStrictEqual(
      mut_responses.map((created) => created.myName),
      ['alice\u{FFFD}'],
    );

    assert.strictEqual(store.myName.getSnapshot().value, 'alice\u{FFFD}');

    // What Root opens, which throws on a name that is not well-formed.
    assert.strictEqual(
      roomPage('new-id', mut_responses[0]?.myName),
      '/rooms/?id=new-id&player-id=alice%EF%BF%BD',
    );
  });

  test('createRoom that fails stops waiting, says so, and can be tried again', async () => {
    const { store, api } = setup();

    const mut_responses: CreatedRoom[] = [];

    store.createRoom.response.subscribe((created) => {
      mut_responses.push(created);
    });

    const pending = store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    const error = new Error('resource-exhausted');

    const [failed] = api.addedRooms;

    assert.isDefined(failed);

    failed.reject(error);

    const result = await pending;

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(result.value, error);

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);

    assert.isTrue(store.createRoom.hasFailed.getSnapshot().value);

    assert.deepStrictEqual(mut_responses, []);

    assert.isUndefined(store.myName.getSnapshot().value);

    const retried = store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    assert.isFalse(store.createRoom.hasFailed.getSnapshot().value);

    assert.isTrue(store.createRoom.isWaitingResponse.getSnapshot().value);

    const retriedRoom = api.addedRooms[1];

    assert.isDefined(retriedRoom);

    retriedRoom.resolve('new-id');

    const result2 = await retried;

    assert.isTrue(Result.isOk(result2));

    assert.deepStrictEqual(mut_responses, [
      { room: result2.value, myName: 'alice' },
    ]);

    assert.strictEqual(store.myName.getSnapshot().value, 'alice');
  });

  test('createRoom whose save throws instead of rejecting fails the same way', async () => {
    const error = new Error('invalid-argument');

    const { api } = fakeApi();

    const store = createRoomStore({
      api: {
        ...api,
        addRoom: () => {
          throw error;
        },
      },
    });

    const mut_responses: CreatedRoom[] = [];

    store.createRoom.response.subscribe((created) => {
      mut_responses.push(created);
    });

    const result = await store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(result.value, error);

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);

    assert.isTrue(store.createRoom.hasFailed.getSnapshot().value);

    assert.deepStrictEqual(mut_responses, []);

    assert.isUndefined(store.myName.getSnapshot().value);
  });

  test('joinRoom adds the player to the room and takes the name', async () => {
    const { store, api } = watchingRoom(['alice']);

    const pending = store.joinRoom.dispatch('a', 'bob');

    assert.isTrue(store.joinRoom.isWaitingResponse.getSnapshot().value);

    assert.isUndefined(store.myName.getSnapshot().value);

    const [added] = api.addedPlayers;

    assert.isDefined(added);

    assert.strictEqual(added.roomId, 'a');

    assert.deepStrictEqual(added.player, { name: 'bob', online: true });

    added.resolve();

    assert.deepStrictEqual(await pending, Result.ok('bob'));

    assert.strictEqual(store.myName.getSnapshot().value, 'bob');

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });

  test('joinRoom joins by the name with the spaces at its ends taken off (#2616)', async () => {
    const { store, api } = watchingRoom(['alice']);

    const pending = store.joinRoom.dispatch('a', '  bob ');

    api.addedPlayers[0]?.resolve();

    assert.deepStrictEqual(await pending, Result.ok('bob'));

    assert.deepStrictEqual(api.addedPlayers[0]?.player, {
      name: 'bob',
      online: true,
    });
  });

  test('joinRoom fails, and takes no name, when the player could not be added (#2616)', async () => {
    const { store, api } = watchingRoom(['alice']);

    const pending = store.joinRoom.dispatch('a', 'bob');

    api.addedPlayers[0]?.reject(new Error('offline'));

    assert.deepStrictEqual(await pending, Result.err('addFailed'));

    assert.isUndefined(store.myName.getSnapshot().value);

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });

  test.each([
    [
      'a room that already has four players',
      ['p', 'q', 'r', 's'],
      'bob',
      'roomFull',
    ],
    ['a name already in the room', ['alice', 'bob'], 'bob', 'nameTaken'],
    [
      'a name already in the room, once trimmed',
      ['alice', 'bob'],
      ' bob ',
      'nameTaken',
    ],
    ['a name that is blank once trimmed', ['alice'], ' \t', 'nameBlank'],
  ] as const)(
    'joinRoom refuses %s, adding no one and taking no name (#2616)',
    async (_case, players, name, reason) => {
      const { store, api } = watchingRoom(players);

      assert.deepStrictEqual(
        await store.joinRoom.dispatch('a', name),
        Result.err(reason),
      );

      assert.deepStrictEqual(api.addedPlayers, []);

      assert.isUndefined(store.myName.getSnapshot().value);
    },
  );

  test('a room id with no document is a missing room, which joinRoom refuses (#2616)', async () => {
    const { store, api } = setup();

    store.start();

    store.setRoomId('gone');

    assert.isFalse(store.isRoomMissing.getSnapshot().value);

    api.emitRoom('gone', undefined);

    assert.isTrue(store.isRoomMissing.getSnapshot().value);

    assert.deepStrictEqual(
      await store.joinRoom.dispatch('gone', 'bob'),
      Result.err('roomMissing'),
    );

    assert.deepStrictEqual(api.addedPlayers, []);
  });

  test('a room that appears is no longer missing', () => {
    const { store, api } = setup();

    store.start();

    store.setRoomId('a');

    api.emitRoom('a', undefined);

    api.emitRoom('a', roomWithId('a'));

    assert.isFalse(store.isRoomMissing.getSnapshot().value);
  });
});

type FakeApi = Readonly<{
  api: RoomApi;
  /** What is watched now, as `room:<id>` and `actions:<id>`. */
  watching: () => readonly string[];
  emitRoom: (roomId: string, room: Room | undefined) => void;
  emitActions: (
    roomId: string,
    actions: readonly GameStateActionFromDb[],
  ) => void;
  addedRooms: readonly Readonly<{
    room: StrictOmit<Room, 'id'>;
    resolve: (id: string) => void;
    reject: (error: unknown) => void;
  }>[];
  addedPlayers: readonly Readonly<{
    roomId: string;
    player: Player;
    resolve: () => void;
    reject: (error: unknown) => void;
  }>[];
}>;

const fakeApi = (): FakeApi => {
  const mut_roomWatchers = new Map<string, (room: Room | undefined) => void>();

  const mut_actionWatchers = new Map<
    string,
    (actions: readonly GameStateActionFromDb[]) => void
  >();

  const mut_addedRooms: FakeApi['addedRooms'][number][] = [];

  const mut_addedPlayers: FakeApi['addedPlayers'][number][] = [];

  return {
    api: {
      addRoom: (added) => {
        const { promise, resolve, reject } = Promise.withResolvers<string>();

        mut_addedRooms.push({ room: added, resolve, reject });

        return promise;
      },
      addPlayer: (roomId, player) => {
        const { promise, resolve, reject } = Promise.withResolvers<undefined>();

        mut_addedPlayers.push({
          roomId,
          player,
          resolve: () => {
            resolve(undefined);
          },
          reject,
        });

        return promise;
      },
      addAction: () => Promise.resolve(),
      watchRoom: (roomId, onChange) => {
        mut_roomWatchers.set(roomId, onChange);

        return () => {
          mut_roomWatchers.delete(roomId);
        };
      },
      watchActions: (roomId, onChange) => {
        mut_actionWatchers.set(roomId, onChange);

        return () => {
          mut_actionWatchers.delete(roomId);
        };
      },
    },
    watching: () => [
      ...Array.from(mut_roomWatchers.keys(), (id) => `room:${id}`),
      ...Array.from(mut_actionWatchers.keys(), (id) => `actions:${id}`),
    ],
    emitRoom: (roomId, emitted) => {
      mut_roomWatchers.get(roomId)?.(emitted);
    },
    emitActions: (roomId, actions) => {
      mut_actionWatchers.get(roomId)?.(actions);
    },
    addedRooms: mut_addedRooms,
    addedPlayers: mut_addedPlayers,
  };
};

const setup = (): Readonly<{ store: RoomStore; api: FakeApi }> => {
  const api = fakeApi();

  return { store: createRoomStore({ api: api.api }), api } as const;
};

const roomWithId = (id: string): Room =>
  ({
    ...newRoom(undefined, { name: 'alice', online: true }),
    id,
  }) as const;

/** A store started on room `a`, which holds a player of each of `names`. */
const watchingRoom = (
  names: readonly string[],
): Readonly<{ store: RoomStore; api: FakeApi }> => {
  const { store, api } = setup();

  store.start();

  store.setRoomId('a');

  api.emitRoom('a', {
    ...roomWithId('a'),
    players: names.map((name) => ({ name, online: true })),
  });

  return { store, api };
};
