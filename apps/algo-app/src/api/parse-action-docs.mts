import {
  assertIsGameStateActionFromDb,
  type GameStateActionFromDb,
} from '../types/index.mjs';

/**
 * The actions of a snapshot of `rooms/{id}/actions`, as `d.data()` reads them
 * back. Throws on a document that is not one.
 */
export const parseActionDocs = (
  docs: readonly Readonly<{ data: () => unknown }>[],
): readonly GameStateActionFromDb[] =>
  docs.map((d) => {
    const data = d.data();

    assertIsGameStateActionFromDb(data);

    return data;
  });
