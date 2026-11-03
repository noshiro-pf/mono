import {
  findExposedEmulatorHosts,
  isFirebaseConfig,
} from './check-firebase-emulator-hosts.mjs';

const config = (
  json: unknown,
  file = 'apps/task-manager/firebase.json',
): Parameters<typeof findExposedEmulatorHosts>[0][number] =>
  ({ file, text: JSON.stringify(json) }) as const;

describe(findExposedEmulatorHosts, () => {
  test('accepts a firebase.json with no emulators', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config({ firestore: { rules: 'firestore.rules' } }),
      ]),
      [],
    );
  });

  test('accepts emulators that declare no host', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config({
          emulators: {
            auth: { port: 9199 },
            firestore: { port: 8180 },
            ui: { enabled: true, port: 4100 },
            singleProjectMode: true,
          },
        }),
      ]),
      [],
    );
  });

  test('accepts every loopback host', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config({
          emulators: {
            auth: { host: 'localhost', port: 9099 },
            firestore: { host: '127.0.0.1', port: 5002 },
            hosting: { host: '::1', port: 5000 },
          },
        }),
      ]),
      [],
    );
  });

  test('names each emulator listening on every interface', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config(
          {
            emulators: {
              auth: { host: '0.0.0.0', port: 9099 },
              firestore: { host: 'localhost', port: 5002 },
              ui: { enabled: true, host: '0.0.0.0', port: 4000 },
            },
          },
          'apps/event-schedule-app/firebase.json',
        ),
      ]),
      [
        'apps/event-schedule-app/firebase.json: emulators.auth.host is "0.0.0.0".',
        'apps/event-schedule-app/firebase.json: emulators.ui.host is "0.0.0.0".',
      ],
    );
  });

  test('names loopback forms that do not start everywhere', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config({
          emulators: { auth: { host: '127.0.0.2' }, ui: { host: '[::1]' } },
        }),
      ]),
      [
        'apps/task-manager/firebase.json: emulators.auth.host is "127.0.0.2".',
        'apps/task-manager/firebase.json: emulators.ui.host is "[::1]".',
      ],
    );
  });

  test('names a LAN address and a host that is not a string', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        config({
          emulators: {
            auth: { host: '192.168.1.10' },
            firestore: { host: 0 },
          },
        }),
      ]),
      [
        'apps/task-manager/firebase.json: emulators.auth.host is "192.168.1.10".',
        'apps/task-manager/firebase.json: emulators.firestore.host is 0.',
      ],
    );
  });

  test('reports a file that is not JSON', () => {
    assert.deepStrictEqual(
      findExposedEmulatorHosts([
        { file: 'apps/task-manager/firebase.json', text: '{' },
      ]),
      ['apps/task-manager/firebase.json: not valid JSON.'],
    );
  });
});

describe(isFirebaseConfig, () => {
  test('selects every tracked firebase.json outside docs/ and experimental/', () => {
    assert.deepStrictEqual(
      [
        'apps/task-manager/firebase.json',
        'docs/reveal-slides/chain-rule/firebase.json',
        'experimental/packages/apps/event-schedule-app/firebase.json',
        'apps/task-manager/firebase.json.bak',
        'apps/task-manager/my-firebase.json',
        'firebase.json',
      ].filter(isFirebaseConfig),
      ['apps/task-manager/firebase.json', 'firebase.json'],
    );
  });
});
