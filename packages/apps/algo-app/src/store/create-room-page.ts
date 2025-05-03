import { api } from '../api';
import { Routes } from '../constants';
import { type Room } from '../types';
import { QueryParams } from './query-params';
import { router } from './router';

const { state: isWaitingResponse$, setState: setIsWaitingResponse } =
  createState<boolean>(false);

const createRoom = async (
  payload: Readonly<{
    hostUsername: string;
    roomPassword: string | undefined;
  }>,
): Promise<Result<Room, string>> => {
  setIsWaitingResponse(true);

  const res = await api.createRoom(payload);

  if (Result.isErr(res)) {
    return res;
  }

  const { room, hostPlayerId } = res.value;

  QueryParams.setPlayerId(hostPlayerId);
  router.push(Routes.routes.roomWithPlayerId(room.id, hostPlayerId));

  setIsWaitingResponse(false);

  return Result.ok(room);
};

const { state: roomPassword$, setState: setRoomPassword } =
  createState<string>('');

const { state: hostUsername$, setState: setHostUsername } =
  createState<string>('');

const onPasswordInput: preact.JSX.GenericEventHandler<HTMLInputElement> = (
  ev,
) => {
  setRoomPassword(ev.currentTarget.value);
};

const onUsernameInput: preact.JSX.GenericEventHandler<HTMLInputElement> = (
  ev,
) => {
  setHostUsername(ev.currentTarget.value);
};

const mut_subscribedValues: {
  roomPassword: string;
  hostUsername: string;
} = {
  roomPassword: '',
  hostUsername: '',
};

const onCreateRoomButtonClick = (): void => {
  createRoom({
    roomPassword: mut_subscribedValues.roomPassword,
    hostUsername: mut_subscribedValues.hostUsername,
  }).catch(console.error);
};

roomPassword$.subscribe((a) => {
  mut_subscribedValues.roomPassword = a;
});

hostUsername$.subscribe((a) => {
  mut_subscribedValues.hostUsername = a;
});

export const CreateRoom = {
  isWaitingResponse$,
  roomPassword$,
  hostUsername$,
  onPasswordInput,
  onUsernameInput,
  onCreateRoomButtonClick,
};
