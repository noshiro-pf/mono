import { Result } from 'ts-data-forge';
import {
  convertRoomRemoteToRoom,
  validateRoomRemote,
  type Room,
} from '../types/index.mjs';

/**
 * The room the document `rooms/{id}` holds, `undefined` when there is none, or
 * what is wrong with one that is not a room — said rather than thrown, since a
 * throw out of a snapshot callback stops every later snapshot.
 */
export const parseRoomDoc = (
  id: string,
  data: unknown,
): Result<Room | undefined, string> => {
  if (data === undefined) {
    return Result.ok(undefined);
  }

  const checked = validateRoomRemote(data);

  return Result.isOk(checked)
    ? Result.ok(convertRoomRemoteToRoom(checked.value, id))
    : Result.err(`rooms/${id} is not a room: ${checked.value}`);
};
