import * as t from '@noshiro/io-ts';
import { cardTypeDef } from './card-type';
import { playerTypeDef } from './player';
import { shuffleDefType } from './shuffle-def';

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

const commonRecordTypeDefs = {
  password: t.union([t.string(''), t.undefinedType], {
    defaultType: t.undefinedType,
  }),
  shuffleDef: shuffleDefType,
  players: t.array(playerTypeDef),
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

export const roomTypeDef = t.record(
  {
    ...commonRecordTypeDefs,
    id: t.string(''),
    playerCards: t.tuple(
      tp(
        playerCardsTypeDef,
        playerCardsTypeDef,
        playerCardsTypeDef,
        playerCardsTypeDef,
      ),
    ),
  },
  {
    typeName: 'Room',
  },
);

export type RoomRemote = t.TypeOf<typeof roomRemoteTypeDef>;

export type Room = t.TypeOf<typeof roomTypeDef>;

expectType<(typeof roomStateList)[number], Room['state']>('=');

export const validateRoomRemote = roomRemoteTypeDef.validate;

export const convertRoomRemoteToRoom = (
  roomRemote: RoomRemote,
  id: string,
): Room => ({
  id,
  password: roomRemote.password,
  shuffleDef: roomRemote.shuffleDef,
  state: roomRemote.state,
  playerCards: tp(
    roomRemote.playerCards.p0,
    roomRemote.playerCards.p1,
    roomRemote.playerCards.p2,
    roomRemote.playerCards.p3,
  ),
  players: roomRemote.players,
});

export const convertRoomToRoomRemote = (
  room: Omit<Room, 'id'>,
): RoomRemote => ({
  password: room.password,
  shuffleDef: room.shuffleDef,
  state: room.state,
  playerCards: {
    p0: room.playerCards[0],
    p1: room.playerCards[1],
    p2: room.playerCards[2],
    p3: room.playerCards[3],
  },
  players: room.players,
});
