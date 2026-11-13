import {
  assertIsGameStateActionFromDb,
  type ActionRecord,
  type GameStateActionFromDb,
} from '../types/index.mjs';

/**
 * The actions of a snapshot of `rooms/{id}/actions`, as `d.data()` reads them
 * back, each with its document's id. Throws on a document that is not one.
 */
export const parseActionDocs = (
  docs: readonly Readonly<{ id: string; data: () => unknown }>[],
): readonly ActionRecord<GameStateActionFromDb>[] =>
  docs.map((d) => {
    const data = d.data();

    assertIsGameStateActionFromDb(data);

    return { id: d.id, action: data };
  });
