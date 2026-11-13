import { Arr, Result } from 'ts-data-forge';
import {
  validateGameStateActionFromDb,
  type ActionRecord,
  type GameStateActionFromDb,
} from '../types/index.mjs';

/**
 * The actions of a snapshot of `rooms/{id}/actions`, as `d.data()` reads them
 * back, each with its document's id. A document that is not an action (one an
 * older client wrote, or one edited by hand) is passed to `onInvalid` and left
 * out, so that it does not stop the room's moves from reaching its players.
 * The game merges actions by id, so one left out shifts nothing else.
 */
export const parseActionDocs = (
  docs: readonly Readonly<{ id: string; data: () => unknown }>[],
  onInvalid: (id: string, reason: string) => void,
): readonly ActionRecord<GameStateActionFromDb>[] =>
  Arr.generate(function* () {
    for (const d of docs) {
      const checked = validateGameStateActionFromDb(d.data());

      if (Result.isOk(checked)) {
        yield { id: d.id, action: checked.value };
      } else {
        onInvalid(d.id, checked.value);
      }
    }
  });
