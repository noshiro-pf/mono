import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentReference,
} from 'firebase/firestore';
import { firestorePaths } from '../constants';
import { newRoom } from '../functions';
import { firestore, firestoreRooms } from '../initialize-firebase';
import {
  convertRoomRemoteToRoom,
  convertRoomToRoomRemote,
  fillPlayer,
  keyForOrderingGameActions,
  keyForOrderingPlayerWithId,
  validateGameStateActionArray,
  validatePlayerWithIdArray,
  validateRoomRemote,
  type GameStateAction,
  type Player,
  type PlayerWithId,
  type Room,
  type RoomRemote,
  type ShuffleDef,
} from '../types';

export namespace api {
  export const addPlayer = ({
    roomId,
    playerName,
  }: Readonly<{
    roomId: string;
    playerName: Player['name'];
  }>): Promise<
    Result<
      Readonly<{
        id: string;
        data: Player;
      }>,
      string
    >
  > =>
    Result.fromPromise(
      addDoc(
        collection(firestoreRooms, roomId, firestorePaths.players),
        Obj.merge<Pick<Player, 'name'>, Omit<Player, 'name'>>(
          {
            name: playerName,
          },
          {
            online: true,
            createdAt: serverTimestamp(),
          },
        ),
      ),
    ).then((a) =>
      Result.fold(
        a,
        (docRef) => ({
          id: docRef.id,
          data: fillPlayer(docRef), // FIXME
        }),
        Str.from,
      ),
    );

  export const removePlayer = ({
    roomId,
    playerId,
  }: Readonly<{
    roomId: string;
    playerId: PlayerWithId['id'];
  }>): Promise<Result<void, string>> =>
    Result.fromPromise(
      deleteDoc(doc(firestoreRooms, roomId, firestorePaths.players, playerId)),
    ).then((a) => Result.fold(a, noop, Str.from));

  export const createRoom = async ({
    hostUsername,
    roomPassword,
  }: Readonly<{
    hostUsername: string;
    roomPassword: string | undefined;
  }>): Promise<
    Result<Readonly<{ hostPlayerId: string; room: Room }>, string>
  > => {
    const room = newRoom(roomPassword);

    try {
      const { id: roomId } = await addDoc(
        firestoreRooms,
        convertRoomToRoomRemote(room),
      );

      const result = await addPlayer({ roomId, playerName: hostUsername });

      if (Result.isErr(result)) {
        return Result.err(result.value);
      }

      const { id: hostPlayerId } = result.value;

      return Result.ok({
        hostPlayerId,
        room: Obj.merge<Omit<Room, 'id'>, Pick<Room, 'id'>>(room, {
          id: roomId,
        }),
      });
    } catch (error) {
      return Result.err(Str.from(error));
    }
  };

  export const changeRoomState = (
    roomId: string,
    state: RoomRemote['state'],
  ): Promise<Result<void, unknown>> =>
    Result.fromPromise(
      updateDoc(doc(firestoreRooms, roomId), {
        [firestorePaths.state]: state,
      }),
    );

  export const updateShuffleDef = (
    roomId: string,
    shuffleDef: ShuffleDef,
  ): Promise<Result<void, unknown>> =>
    Result.fromPromise(
      updateDoc(doc(firestoreRooms, roomId), {
        [firestorePaths.shuffleDef]: shuffleDef,
      }),
    );

  export const addAction = (
    roomId: string,
    gameAction: GameStateAction,
  ): Promise<Result<DocumentReference, unknown>> =>
    Result.fromPromise(
      addDoc(
        collection(firestoreRooms, roomId, firestorePaths.actions),
        gameAction,
      ),
    );

  export const getRoomStream = (
    roomId: string,
  ): Readonly<{
    roomStream$: Observable<Result<Room | undefined, readonly string[]>>;
    unsubscribeRoomSnapshot: () => void;
  }> => {
    const roomDoc = doc(firestore, firestorePaths.rooms, roomId);

    const { state: roomStream$, setState: setRoom } = createState<
      Result<Room | undefined, readonly string[]>
    >(Result.ok(undefined));

    const unsubscribe = onSnapshot(roomDoc, (d) => {
      const data = d.data();
      const res = validateRoomRemote(data);

      setRoom(
        Result.map(res, (okValue) => convertRoomRemoteToRoom(okValue, d.id)),
      );
    });

    return {
      roomStream$,
      unsubscribeRoomSnapshot: () => {
        unsubscribe();
      },
    };
  };

  export const getPlayersStream = (
    roomId: string,
  ): Readonly<{
    playersStream$: Observable<
      Result<readonly PlayerWithId[], readonly string[]>
    >;
    unsubscribePlayersSnapshot: () => void;
  }> => {
    const playersColl = query(
      collection(
        firestore,
        firestorePaths.rooms,
        roomId,
        firestorePaths.players,
      ),
      orderBy(keyForOrderingPlayerWithId),
    );

    const { state: playersStream$, setState: setPlayers } = createState<
      Result<readonly PlayerWithId[], readonly string[]>
    >(Result.ok([]));

    const unsubscribe = onSnapshot(playersColl, (q) => {
      const mut_players: unknown[] = [];

      // eslint-disable-next-line unicorn/no-array-for-each
      q.forEach((d) => {
        const data = d.data();
        mut_players.push({ id: d.id, ...data });
      });

      const res = validatePlayerWithIdArray(mut_players);

      setPlayers(res);
    });

    return {
      playersStream$,
      unsubscribePlayersSnapshot: () => {
        unsubscribe();
      },
    };
  };

  export const getActionsStream = (
    roomId: string,
  ): Readonly<{
    gameActionsStream$: Observable<
      Result<readonly GameStateAction[], readonly string[]>
    >;
    unsubscribeActionsSnapshot: () => void;
  }> => {
    const actionsColl = query(
      collection(
        firestore,
        firestorePaths.rooms,
        roomId,
        firestorePaths.actions,
      ),
      orderBy(keyForOrderingGameActions),
    );

    const { state: gameActionsStream$, setState: setGameActions } = createState<
      Result<readonly GameStateAction[], readonly string[]>
    >(Result.ok([]));

    const unsubscribe = onSnapshot(actionsColl, (q) => {
      const mut_actions: unknown[] = [];

      // eslint-disable-next-line unicorn/no-array-for-each
      q.forEach((d) => {
        const data = d.data();
        mut_actions.push(data);
      });

      const res = validateGameStateActionArray(mut_actions);

      setGameActions(res);
    });

    return {
      gameActionsStream$,
      unsubscribeActionsSnapshot: () => {
        unsubscribe();
      },
    };
  };
}
