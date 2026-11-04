import { expectType, tp } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { FixedLengthTuple, StrictOmit } from 'ts-type-forge';
import { cardTypeDef } from './card-type.mjs';
import { shuffleDefType } from './shuffle-def.mjs';

const playerCardsTypeDef = t.tuple(
  tp(
    cardTypeDef,
    cardTypeDef,
    cardTypeDef,
    cardTypeDef,
    cardTypeDef,
    cardTypeDef,
  ),
);

const roomStateList = ['not-started', 'playing', 'finished'] as const;

// The players are not a field of the room but its subcollection
// `rooms/{id}/players`, so that each has an id of its own and joining is an
// `addDoc` rather than an update of the room.
const commonRecordTypeDefs = {
  password: t.union([t.string(''), t.undefinedType], {
    defaultType: t.undefinedType,
  }),
  shuffleDef: shuffleDefType,
  state: t.enumType(roomStateList, {
    defaultValue: 'not-started',
  }),
} as const;

const roomRemoteTypeDef = t.record(
  {
    ...commonRecordTypeDefs,
    // firestore が多重配列に対応していないのでオブジェクト化する
    playerCards: t.record({
      p0: playerCardsTypeDef,
      p1: playerCardsTypeDef,
      p2: playerCardsTypeDef,
      p3: playerCardsTypeDef,
    }),
  },
  {
    typeName: 'RoomRemote',
  },
);

export type RoomRemote = t.TypeOf<typeof roomRemoteTypeDef>;

export type Room = StrictOmit<RoomRemote, 'playerCards'> &
  Readonly<{
    id: string;
    playerCards: FixedLengthTuple<4, RoomRemote['playerCards']['p0']>;
  }>;

expectType<(typeof roomStateList)[number], Room['state']>('=');

export type RoomState = Room['state'];

export const assertIsRoomRemote: (a: unknown) => asserts a is RoomRemote =
  roomRemoteTypeDef.assertIs;

export const convertRoomRemoteToRoom = (
  roomRemote: RoomRemote,
  id: string,
): Room =>
  ({
    id,
    password: roomRemote.password,
    shuffleDef: roomRemote.shuffleDef,
    state: roomRemote.state,
    playerCards: [
      roomRemote.playerCards.p0,
      roomRemote.playerCards.p1,
      roomRemote.playerCards.p2,
      roomRemote.playerCards.p3,
    ],
  }) as const;

export const convertRoomToRoomRemote = (
  room: StrictOmit<Room, 'id'>,
): RoomRemote =>
  ({
    password: room.password,
    shuffleDef: room.shuffleDef,
    state: room.state,
    playerCards: {
      p0: room.playerCards[0],
      p1: room.playerCards[1],
      p2: room.playerCards[2],
      p3: room.playerCards[3],
    },
  }) as const;
