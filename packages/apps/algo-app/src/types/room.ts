import type { PermutationString } from '@noshiro/ts-utils-additional';
import type { Card } from './card-type';
import { isCard } from './card-type';
import type { Player } from './player';
import { isPlayer } from './player';

export type RoomRemote = DeepReadonly<{
  password: string | undefined;
  players: Player[];
  shuffleDef: PermutationString<'0123'>;
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  state: 'not-started' | 'playing' | 'finished';
  // firestore が多重配列に対応していないのでオブジェクト化する
  playerCards: {
    p0: ArrayOfLength<6, Card>;
    p1: ArrayOfLength<6, Card>;
    p2: ArrayOfLength<6, Card>;
    p3: ArrayOfLength<6, Card>;
  };
}>;

export type Room = DeepReadonly<{
  id: string;
  password: string | undefined;
  players: Player[];
  shuffleDef: PermutationString<'0123'>;
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  state: 'not-started' | 'playing' | 'finished';
  playerCards: ArrayOfLength<4, ArrayOfLength<6, Card>>;
}>;

const roomStateList = ['not-started', 'playing', 'finished'] as const;
assertType<TypeEq<typeof roomStateList[number], Room['state']>>();

export const assertIsRoomRemote: (
  data: unknown
) => asserts data is RoomRemote = (data) => {
  if (!isRecord(data)) {
    throw new Error('is not a record');
  }

  if (
    !Obj.hasKeyValue(
      data,
      'password',
      (v): v is RoomRemote['password'] => isString(v) || isUndefined(v)
    )
  ) {
    throw new Error('hasKeyValue failed for password');
  }

  if (
    !Obj.hasKeyValue(
      data,
      'players',
      (v): v is RoomRemote['players'] => Arr.isArray(v) && v.every(isPlayer)
    )
  ) {
    throw new Error('hasKeyValue failed for players');
  }

  if (
    !Obj.hasKeyValue(
      data,
      'shuffleDef',
      (v): v is RoomRemote['shuffleDef'] =>
        isString(v) && /^[0-3]{4}$/gu.test(v)
    )
  ) {
    throw new Error('hasKeyValue failed for shuffleDef');
  }

  if (
    !Obj.hasKeyValue(
      data,
      'state',
      (v): v is RoomRemote['state'] =>
        isString(v) && Arr.includes(roomStateList, v)
    )
  ) {
    throw new Error('hasKeyValue failed for state');
  }

  if (
    !Obj.hasKeyValue(data, 'playerCards', (v): v is RoomRemote['playerCards'] =>
      // Arr.isArray(v) &&
      // isArrayOfLength4(v) &&
      // v.every(
      //   (a) => Arr.isArray(a) && isArrayOfLength6(a) && a.every(isCard)
      // )
      {
        const checkFn = (a: unknown): a is RoomRemote['playerCards']['p0'] =>
          Arr.isArray(a) && Arr.isArrayOfLength6(a) && a.every(isCard);

        return (
          isRecord(v) &&
          Obj.hasKeyValue(v, 'p0', checkFn) &&
          Obj.hasKeyValue(v, 'p1', checkFn) &&
          Obj.hasKeyValue(v, 'p2', checkFn) &&
          Obj.hasKeyValue(v, 'p3', checkFn)
        );
      }
    )
  ) {
    throw new Error('hasKeyValue failed for playerCards');
  }

  assertType<TypeExtends<typeof data, RoomRemote>>();
  assertType<TypeExtends<RoomRemote, typeof data>>();
};

export const convertRoomRemoteToRoom = (
  roomRemote: RoomRemote,
  id: string
): Room => ({
  id,
  password: roomRemote.password,
  players: roomRemote.players,
  shuffleDef: roomRemote.shuffleDef,
  state: roomRemote.state,
  playerCards: [
    roomRemote.playerCards.p0,
    roomRemote.playerCards.p1,
    roomRemote.playerCards.p2,
    roomRemote.playerCards.p3,
  ] as const,
});

export const convertRoomToRoomRemote = (
  room: StrictOmit<Room, 'id'>
): RoomRemote => ({
  password: room.password,
  players: room.players,
  shuffleDef: room.shuffleDef,
  state: room.state,
  playerCards: {
    p0: room.playerCards[0],
    p1: room.playerCards[1],
    p2: room.playerCards[2],
    p3: room.playerCards[3],
  },
});
