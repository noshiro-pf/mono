import packageJson from '../../package.json' with { type: 'json' };
import {
  emulatorEndpoints,
  emulatorProjectId,
  firebaseAppOptions,
} from './emulator-mode.mjs';

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

describe(emulatorProjectId, () => {
  test('is a demo- project id, which firebase-tools never sends to production', () => {
    assert.isTrue(emulatorProjectId.startsWith('demo-'));
  });

  test.each(['emulators', 'check:e2e:emulators'] as const)(
    '`%s` runs the emulators under it',
    (script) => {
      // Written one way only, `--project <id>`, once, among the flags before
      // the quoted command `emulators:exec` runs (which may have a `--project`
      // of its own): firebase-tools takes the last one given.
      const [flags = ''] = packageJson.scripts[script].split('"', 1);

      assert.include(flags, ` --project ${emulatorProjectId} `);

      assert.lengthOf(
        flags.match(/(?:^|\s)(?:--project|-P)(?=[\s=]|$)/gu) ?? [],
        1,
      );
    },
  );
});

describe(firebaseAppOptions, () => {
  const config = { apiKey: 'key', projectId: 'event-schedule-app' } as const;

  test("names the emulators' project to the emulators", () => {
    assert.deepStrictEqual(
      firebaseAppOptions(config, emulatorEndpoints('true', 'localhost', ports)),
      { apiKey: 'key', projectId: emulatorProjectId },
    );
  });

  test('keeps the real project otherwise', () => {
    assert.strictEqual(firebaseAppOptions(config, undefined), config);
  });
});
