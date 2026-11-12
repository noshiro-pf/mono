import { renderStartable } from './render.mjs';

const EMPTY = { fresh: [], left: [], foreign: [], held: [] } as const;

describe(renderStartable, () => {
  test('says a read cut short, and what was listed unsure', () => {
    assert.deepStrictEqual(
      renderStartable({
        survey: EMPTY,
        order: { taken: [], heldBack: [] },
        held: { held: new Map<string, readonly number[]>(), unread: [4] },
        authors: ['me'],
        limit: undefined,
        theme: undefined,
        cutShort: 1000,
        unsure: [9],
      }).split('\n'),
      [
        'No issue to start.',
        "#4: who started them could not be read; counted as another session's.",
        '#9: listed, though part of each could not be read; start-issue refuses one claimed meanwhile.',
        'Only the 1000 most recently updated open issues were read; older ones are not listed.',
      ],
    );
  });
});
