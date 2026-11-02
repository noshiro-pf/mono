import { emulatorEndpoints } from './emulator-mode.mjs';

const ports = { auth: 9099, firestore: 5002, functions: 5001 } as const;

describe(emulatorEndpoints, () => {
  test('reaches the emulators on the host the page was opened from', () => {
    assert.deepStrictEqual(emulatorEndpoints('true', 'localhost', ports), {
      authUrl: 'http://localhost:9099',
      firestore: { host: 'localhost', port: 5002 },
      functions: { host: 'localhost', port: 5001 },
    });

    assert.deepStrictEqual(emulatorEndpoints('true', '192.168.0.10', ports), {
      authUrl: 'http://192.168.0.10:9099',
      firestore: { host: '192.168.0.10', port: 5002 },
      functions: { host: '192.168.0.10', port: 5001 },
    });
  });

  test('is off unless the variable is exactly true', () => {
    assert.isUndefined(emulatorEndpoints(undefined, 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('false', 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('', 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('TRUE', 'localhost', ports));
  });
});
