// cspell:ignore FFFD
import { Optional, Result } from 'ts-data-forge';
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

    assert.strictEqual(Optional.unwrap(store.room.getSnapshot()), roomA);

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

    assert.isUndefined(Optional.unwrap(store.myName.getSnapshot()));

    store.setMyName('bob');

    assert.strictEqual(Optional.unwrap(store.myName.getSnapshot()), 'bob');
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

    assert.isTrue(
      Optional.unwrap(store.createRoom.isWaitingResponse.getSnapshot()),
    );

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

    assert.strictEqual(Optional.unwrap(store.myName.getSnapshot()), 'alice');

    assert.isFalse(
      Optional.unwrap(store.createRoom.isWaitingResponse.getSnapshot()),
    );

    assert.isFalse(Optional.unwrap(store.createRoom.hasFailed.getSnapshot()));
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

    assert.strictEqual(
      Optional.unwrap(store.myName.getSnapshot()),
      'alice\u{FFFD}',
    );

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

    assert.isFalse(
      Optional.unwrap(store.createRoom.isWaitingResponse.getSnapshot()),
    );

    assert.isTrue(Optional.unwrap(store.createRoom.hasFailed.getSnapshot()));

    assert.deepStrictEqual(mut_responses, []);

    assert.isUndefined(Optional.unwrap(store.myName.getSnapshot()));

    const retried = store.createRoom.dispatch({
      username: 'alice',
      password: undefined,
    });

    assert.isFalse(Optional.unwrap(store.createRoom.hasFailed.getSnapshot()));

    assert.isTrue(
      Optional.unwrap(store.createRoom.isWaitingResponse.getSnapshot()),
    );

    const retriedRoom = api.addedRooms[1];

    assert.isDefined(retriedRoom);

    retriedRoom.resolve('new-id');

    const result2 = await retried;

    assert.isTrue(Result.isOk(result2));

    assert.deepStrictEqual(mut_responses, [
      { room: result2.value, myName: 'alice' },
    ]);

    assert.strictEqual(Optional.unwrap(store.myName.getSnapshot()), 'alice');
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

    assert.isFalse(
      Optional.unwrap(store.createRoom.isWaitingResponse.getSnapshot()),
    );

    assert.isTrue(Optional.unwrap(store.createRoom.hasFailed.getSnapshot()));

    assert.deepStrictEqual(mut_responses, []);

    assert.isUndefined(Optional.unwrap(store.myName.getSnapshot()));
  });

  test('joinRoom adds the player to the room and takes the name', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    assert.isTrue(
      Optional.unwrap(store.joinRoom.isWaitingResponse.getSnapshot()),
    );

    assert.isUndefined(Optional.unwrap(store.myName.getSnapshot()));

    const [added] = api.addedPlayers;

    assert.isDefined(added);

    assert.strictEqual(added.roomId, 'a');

    assert.deepStrictEqual(added.player, { name: 'bob', online: true });

    added.resolve();

    await pending;

    assert.strictEqual(Optional.unwrap(store.myName.getSnapshot()), 'bob');

    assert.isFalse(
      Optional.unwrap(store.joinRoom.isWaitingResponse.getSnapshot()),
    );
  });

  test('joinRoom takes the name even when the player could not be added', async () => {
    const { store, api } = setup();

    const pending = store.joinRoom.dispatch('a', 'bob');

    api.addedPlayers[0]?.reject(new Error('offline'));

    await pending;

    assert.strictEqual(Optional.unwrap(store.myName.getSnapshot()), 'bob');

    assert.isFalse(
      Optional.unwrap(store.joinRoom.isWaitingResponse.getSnapshot()),
    );
  });
});

type FakeApi = Readonly<{
  api: RoomApi;
  /** What is watched now, as `room:<id>` and `actions:<id>`. */
  watching: () => readonly string[];
  emitRoom: (roomId: string, room: Room) => void;
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
  const mut_roomWatchers = new Map<string, (room: Room) => void>();

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
