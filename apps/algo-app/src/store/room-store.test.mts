import type { StrictOmit } from 'ts-type-forge';
import type { RoomApi } from '../api/index.mjs';
import { newRoom } from '../functions/index.mjs';
import type { GameStateAction, Player, Room } from '../types/index.mjs';
import { createRoomStore, type RoomStore } from './room-store.mjs';

describe(createRoomStore, () => {
  test('watches the room the id names once started, and the next one instead', () => {
    const { store, api } = setup();

    store.start();

    store.setRoomId('a');

    assert.deepStrictEqual(api.watching(), ['room:a', 'actions:a']);

    const roomA = roomWithId('a');

    api.emitRoom('a', roomA);

    assert.strictEqual(store.room.getSnapshot().value, roomA);

    const mut_received: (readonly GameStateAction[])[] = [];

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

  test('createRoom saves a room with the player in it, and answers with its id', async () => {
    const { store, api } = setup();

    const mut_responses: Room[] = [];

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

    const res = await pending;

    assert.strictEqual(res.id, 'new-id');

    assert.deepStrictEqual(mut_responses, [res]);

    assert.strictEqual(store.myName.getSnapshot().value, 'alice');

    assert.isFalse(store.createRoom.isWaitingResponse.getSnapshot().value);
  });

  test('joinRoom adds the player to the room and takes the name', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    assert.isTrue(store.joinRoom.isWaitingResponse.getSnapshot().value);

    assert.isUndefined(store.myName.getSnapshot().value);

    const [added] = api.addedPlayers;

    assert.isDefined(added);

    assert.strictEqual(added.roomId, 'a');

    assert.deepStrictEqual(added.player, { name: 'bob', online: true });

    added.resolve();

    await pending;

    assert.strictEqual(store.myName.getSnapshot().value, 'bob');

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });

  test('joinRoom takes the name even when the player could not be added', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    api.addedPlayers[0]?.reject(new Error('offline'));

    await pending;

    assert.strictEqual(store.myName.getSnapshot().value, 'bob');

    assert.isFalse(store.joinRoom.isWaitingResponse.getSnapshot().value);
  });
});

type FakeApi = Readonly<{
  api: RoomApi;
  /** What is watched now, as `room:<id>` and `actions:<id>`. */
  watching: () => readonly string[];
  emitRoom: (roomId: string, room: Room) => void;
  emitActions: (roomId: string, actions: readonly GameStateAction[]) => void;
  addedRooms: readonly Readonly<{
    room: StrictOmit<Room, 'id'>;
    resolve: (id: string) => void;
  }>[];
  addedPlayers: readonly Readonly<{
    roomId: string;
    player: Player;
    resolve: () => void;
    reject: (error: unknown) => void;
  }>[];
}>;

const setup = (): Readonly<{ store: RoomStore; api: FakeApi }> => {
  const api = fakeApi();

  return { store: createRoomStore({ api: api.api }), api } as const;
};

const fakeApi = (): FakeApi => {
  const mut_roomWatchers = new Map<string, (room: Room) => void>();

  const mut_actionWatchers = new Map<
    string,
    (actions: readonly GameStateAction[]) => void
  >();

  const mut_addedRooms: FakeApi['addedRooms'][number][] = [];

  const mut_addedPlayers: FakeApi['addedPlayers'][number][] = [];

  return {
    api: {
      addRoom: (added) => {
        const { promise, resolve } = Promise.withResolvers<string>();

        mut_addedRooms.push({ room: added, resolve });

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

const roomWithId = (id: string): Room =>
  ({
    ...newRoom(undefined, { name: 'alice', online: true }),
    id,
  }) as const;
