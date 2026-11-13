import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { parseActionDocs } from './parse-action-docs.mjs';

describe(parseActionDocs, () => {
  test('reads the actions back with a committed Timestamp, or null while pending', () => {
    const committed = {
      type: 'submitToss',
      timestamp: Timestamp.fromMillis(0),
    } as const;

    const pending = { type: 'cancelToss', timestamp: null } as const;

    const mut_reported: string[] = [];

    assert.deepStrictEqual(
      parseActionDocs(
        [
          { id: 'c', data: () => committed },
          { id: 'p', data: () => pending },
        ],
        (id) => {
          mut_reported.push(id);
        },
      ),
      [
        { id: 'c', action: committed },
        { id: 'p', action: pending },
      ],
    );

    assert.deepStrictEqual(mut_reported, []);
  });

  test('skips a document that is not an action and reports it, reading the rest (#3285)', () => {
    const mut_reported: string[] = [];

    const committed = {
      type: 'submitToss',
      timestamp: Timestamp.fromMillis(0),
    } as const;

    assert.deepStrictEqual(
      parseActionDocs(
        [
          { id: 'bad-type', data: () => ({ type: 'nope', timestamp: null }) },
          { id: 'c', data: () => committed },
          {
            id: 'bad-timestamp',
            data: () => ({ type: 'submitToss', timestamp: 0 }),
          },
          {
            id: 'sentinel',
            data: () => ({ type: 'submitToss', timestamp: serverTimestamp() }),
          },
        ],
        (id) => {
          mut_reported.push(id);
        },
      ),
      [{ id: 'c', action: committed }],
    );

    assert.deepStrictEqual(mut_reported, [
      'bad-type',
      'bad-timestamp',
      'sentinel',
    ]);
  });
});
