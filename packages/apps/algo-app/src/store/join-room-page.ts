import { api } from '../api';
import { Routes } from '../constants';
import { type Room } from '../types';
import { DB } from './database';
import { QueryParams } from './query-params';
import { router } from './router';

const { state: isWaitingResponse$, setState: setIsWaitingResponse } =
  createState<boolean>(false);

const joinRoom = async ({
  roomId,
  playerName,
}: Readonly<{
  roomId: string;
  playerName: string;
}>): Promise<Result<void, string>> => {
  setIsWaitingResponse(true);

  const res = await api.addPlayer({ roomId, playerName });

  if (Result.isErr(res)) {
    return res;
  }

  const { id } = res.value;

  QueryParams.setPlayerId(id);
  router.push(Routes.routes.roomWithPlayerId(roomId, id));

  setIsWaitingResponse(false);

  return Result.ok(undefined);
};

const { state: roomPassword$, setState: setRoomPassword } =
  createState<string>('');

const { state: username$, setState: setUsername } = createState<string>('');

const { state: showPasswordError$, setState: setShowPasswordError } =
  createState<boolean>(false);

const onPasswordInput: preact.JSX.GenericEventHandler<HTMLInputElement> = (
  ev,
) => {
  setRoomPassword(ev.currentTarget.value);
};

const onUsernameInput: preact.JSX.GenericEventHandler<HTMLInputElement> = (
  ev,
) => {
  setUsername(ev.currentTarget.value);
};

const mut_subscribedValues: {
  room: Room | undefined;
  roomPassword: string;
  username: string;
} = {
  room: undefined,
  roomPassword: '',
  username: '',
};

const onJoinRoomButtonClick = (): void => {
  const room = mut_subscribedValues.room;
  const roomPassword = mut_subscribedValues.roomPassword;
  const username = mut_subscribedValues.username;

  if (room === undefined) return;
  if (room.password !== '' && room.password !== roomPassword) {
    setShowPasswordError(true);
    return;
  }
  joinRoom({ roomId: room.id, playerName: username }).catch(console.error);
};

roomPassword$.subscribe((a) => {
  mut_subscribedValues.roomPassword = a;
});

username$.subscribe((a) => {
  mut_subscribedValues.username = a;
});

DB.room$.subscribe((a) => {
  mut_subscribedValues.room = a;
});

export const JoinRoom = {
  isWaitingResponse$,
  roomPassword$,
  username$,
  showPasswordError$,
  onPasswordInput,
  onUsernameInput,
  onJoinRoomButtonClick,
};
