import { serverTimestamp, Timestamp } from 'firebase/firestore';
import { assertIsGameStateAction } from './game-state-action.mjs';

describe(assertIsGameStateAction, () => {
  const action = { type: 'submitToss' } as const;

  test('accepts the server timestamp sentinel an action is written with', () => {
    expect(() => {
      assertIsGameStateAction({ ...action, timestamp: serverTimestamp() });
    }).not.toThrow();
  });

  test('accepts the Timestamp an action is read back with once committed', () => {
    expect(() => {
      assertIsGameStateAction({ ...action, timestamp: Timestamp.now() });
    }).not.toThrow();
  });

  test('accepts the null an action is read back with while its timestamp is pending', () => {
    expect(() => {
      assertIsGameStateAction({ ...action, timestamp: null });
    }).not.toThrow();
  });

  test.each([undefined, 0, '2026-11-03', {}])(
    'rejects a timestamp that is none of these (%s)',
    (timestamp) => {
      expect(() => {
        assertIsGameStateAction({ ...action, timestamp });
      }).toThrow();
    },
  );
});
