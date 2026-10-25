import { emulatorEndpoints } from './emulator-mode.mjs';

const ports = { auth: 9299, firestore: 8280 } as const;

describe(emulatorEndpoints, () => {
  test('reaches the emulators on the host the page was opened from', () => {
    assert.deepStrictEqual(emulatorEndpoints('true', 'localhost', ports), {
      authUrl: 'http://localhost:9299',
      firestore: { host: 'localhost', port: 8280 },
    });

    assert.deepStrictEqual(emulatorEndpoints('true', '192.168.0.10', ports), {
      authUrl: 'http://192.168.0.10:9299',
      firestore: { host: '192.168.0.10', port: 8280 },
    });
  });

  test('is off unless the variable is exactly true', () => {
    assert.isUndefined(emulatorEndpoints(undefined, 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('false', 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('', 'localhost', ports));

    assert.isUndefined(emulatorEndpoints('TRUE', 'localhost', ports));
  });
});
