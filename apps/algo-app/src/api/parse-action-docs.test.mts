import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { parseActionDocs } from './parse-action-docs.mjs';

describe(parseActionDocs, () => {
  test('reads the actions back with a committed Timestamp, or null while pending', () => {
    const committed = {
      type: 'submitToss',
      timestamp: Timestamp.fromMillis(0),
    } as const;

    const pending = { type: 'cancelToss', timestamp: null } as const;

    assert.deepStrictEqual(
      parseActionDocs([
        { id: 'c', data: () => committed },
        { id: 'p', data: () => pending },
      ]),
      [
        { id: 'c', action: committed },
        { id: 'p', action: pending },
      ],
    );
  });

  test('throws on a timestamp that is not one at all', () => {
    expect(() =>
      parseActionDocs([
        { id: 'x', data: () => ({ type: 'submitToss', timestamp: 0 }) },
      ]),
    ).toThrow();
  });

  test('throws on the server timestamp sentinel, which is only written', () => {
    expect(() =>
      parseActionDocs([
        {
          id: 'x',
          data: () => ({ type: 'submitToss', timestamp: serverTimestamp() }),
        },
      ]),
    ).toThrow('FieldValue timestamp');
  });
});
