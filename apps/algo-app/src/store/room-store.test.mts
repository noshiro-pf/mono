// cspell:ignore FFFD
import { Timestamp } from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import type { StrictOmit } from 'ts-type-forge';
import type { RoomApi } from '../api/index.mjs';
import { newRoom } from '../functions/index.mjs';
import type {
  GameStateActionFromDb,
  PlayerWithId,
  Room,
} from '../types/index.mjs';
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

    assert.deepStrictEqual(api.watching(), [
      'room:a',
      'players:a',
      'actions:a',
    ]);

    const roomA = roomWithId('a');

    api.emitRoom('a', roomA);

    assert.strictEqual(store.room.getSnapshot().value, roomA);

    const players = [playerWithId('p1', 'alice')];

    api.emitPlayers('a', players);

    assert.strictEqual(store.players.getSnapshot().value, players);

    const mut_received: (readonly GameStateActionFromDb[])[] = [];

    store.actionsFromDb.subscribe((actions) => {
      mut_received.push(actions);
    });

    api.emitActions('a', []);

    assert.deepStrictEqual(mut_received, [[]]);

    store.setRoomId('b');

    assert.deepStrictEqual(api.watching(), [
      'room:b',
      'players:b',
      'actions:b',
    ]);
  });

  test('watches an id set before it started', () => {
    const { store, api } = setup();

    store.setRoomId('a');

    assert.deepStrictEqual(api.watching(), []);

    store.start();

    assert.deepStrictEqual(api.watching(), [
      'room:a',
      'players:a',
      'actions:a',
    ]);
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

  test('setMyPlayerId says which player this page is, as a page opened as one does', () => {
    const { store } = setup();

    assert.isUndefined(store.myPlayerId.getSnapshot().value);

    store.setMyPlayerId('p1');

    assert.strictEqual(store.myPlayerId.getSnapshot().value, 'p1');
  });

  test('createRoom saves a room, adds its creator as its first player, and answers with both', async () => {
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

    added.resolve('new-id');

    await flush();

    const [host] = api.addedPlayers;

    assert.isDefined(host);

    assert.strictEqual(host.roomId, 'new-id');

    assert.strictEqual(host.playerName, 'alice');

    host.resolve('host-id');

    const result = await pending;

    assert.isTrue(Result.isOk(result));

    const res = result.value;

    assert.strictEqual(res.id, 'new-id');

    // With the creator's player id, so that they open the room as the player
    // they already are, not on its join form.
    assert.deepStrictEqual(mut_responses, [
      { room: res, myPlayerId: 'host-id' },
    ]);

    assert.strictEqual(store.myPlayerId.getSnapshot().value, 'host-id');

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);

    assert.isFalse(store.createRoom.hasFailed.getSnapshot().value);
  });

  test('createRoom saves the name in a form UTF-8 can hold', async () => {
    const { store, api } = setup();

    // A lone surrogate, as half of a pasted emoji leaves.
    const pending = store.createRoom.dispatch({
      username: 'alice\u{D83D}',
      password: undefined,
    });

    api.addedRooms[0]?.resolve('new-id');

    await flush();

    const [host] = api.addedPlayers;

    assert.isDefined(host);

    assert.strictEqual(host.playerName, 'alice\u{FFFD}');

    host.resolve('host-id');

    await pending;
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

    assert.isUndefined(store.myPlayerId.getSnapshot().value);

    const retried = store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    assert.isFalse(store.createRoom.hasFailed.getSnapshot().value);

    assert.isTrue(store.createRoom.isWaitingResponse.getSnapshot().value);

    api.addedRooms[1]?.resolve('new-id');

    await flush();

    api.addedPlayers[0]?.resolve('host-id');

    const result2 = await retried;

    assert.isTrue(Result.isOk(result2));

    assert.deepStrictEqual(mut_responses, [
      { room: result2.value, myPlayerId: 'host-id' },
    ]);
  });

  test('createRoom whose creator cannot be added fails the same way', async () => {
    const { store, api } = setup();

    const pending = store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    api.addedRooms[0]?.resolve('new-id');

    await flush();

    api.addedPlayers[0]?.reject(new Error('offline'));

    const result = await pending;

    assert.isTrue(Result.isErr(result));

    assert.isTrue(store.createRoom.hasFailed.getSnapshot().value);

    assert.isUndefined(store.myPlayerId.getSnapshot().value);
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

    const result = await store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(result.value, error);

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);

    assert.isTrue(store.createRoom.hasFailed.getSnapshot().value);

    assert.isUndefined(store.myPlayerId.getSnapshot().value);
  });

  test('joinRoom adds the player to the room and takes the id it was given', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    assert.isTrue(store.joinRoom.isWaitingResponse.getSnapshot().value);

    assert.isUndefined(store.myPlayerId.getSnapshot().value);

    const [added] = api.addedPlayers;

    assert.isDefined(added);

    assert.strictEqual(added.roomId, 'a');

    assert.strictEqual(added.playerName, 'bob');

    added.resolve('bob-id');

    const result = await pending;

    assert.deepStrictEqual(result, Result.ok('bob-id'));

    assert.strictEqual(store.myPlayerId.getSnapshot().value, 'bob-id');

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });

  test('joinRoom that could not add the player has no id to go on as', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    api.addedPlayers[0]?.reject(new Error('offline'));

    const result = await pending;

    assert.isTrue(Result.isErr(result));

    assert.isUndefined(store.myPlayerId.getSnapshot().value);

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });
});

type FakeApi = Readonly<{
  api: RoomApi;
  /** What is watched now, as `room:<id>`, `players:<id>` and `actions:<id>`. */
  watching: () => readonly string[];
  emitRoom: (roomId: string, room: Room) => void;
  emitPlayers: (roomId: string, players: readonly PlayerWithId[]) => void;
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
    playerName: string;
    resolve: (playerId: string) => void;
    reject: (error: unknown) => void;
  }>[];
}>;

const fakeApi = (): FakeApi => {
  const mut_roomWatchers = new Map<string, (room: Room) => void>();

  const mut_playerWatchers = new Map<
    string,
    (players: readonly PlayerWithId[]) => void
  >();

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
      addPlayer: (roomId, playerName) => {
        const { promise, resolve, reject } = Promise.withResolvers<string>();

        mut_addedPlayers.push({ roomId, playerName, resolve, reject });

        return promise;
      },
      removePlayer: () => Promise.resolve(),
      updateRoomState: () => Promise.resolve(),
      updateShuffleDef: () => Promise.resolve(),
      addAction: () => Promise.resolve(),
      watchRoom: (roomId, onChange) => {
        mut_roomWatchers.set(roomId, onChange);

        return () => {
          mut_roomWatchers.delete(roomId);
        };
      },
      watchPlayers: (roomId, onChange) => {
        mut_playerWatchers.set(roomId, onChange);

        return () => {
          mut_playerWatchers.delete(roomId);
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
      ...Array.from(mut_playerWatchers.keys(), (id) => `players:${id}`),
      ...Array.from(mut_actionWatchers.keys(), (id) => `actions:${id}`),
    ],
    emitRoom: (roomId, emitted) => {
      mut_roomWatchers.get(roomId)?.(emitted);
    },
    emitPlayers: (roomId, players) => {
      mut_playerWatchers.get(roomId)?.(players);
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

/** Lets the promises settled so far run their continuations. */
const flush = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const roomWithId = (id: string): Room =>
  ({
    ...newRoom(undefined),
    id,
  }) as const;

const playerWithId = (id: string, name: string): PlayerWithId =>
  ({
    id,
    name,
    online: true,
    createdAt: Timestamp.fromMillis(0),
  }) as const;
