import { Result } from 'ts-data-forge';
import {
  attemptedPath,
  parseAttempted,
  serializeAttempted,
} from './attempted.mjs';

const FILE = '/state/run-issue-resolver/o/n.json';

describe(parseAttempted, () => {
  test('each issue left, with its updatedAt or none', () => {
    assert.deepStrictEqual(
      parseAttempted(
        JSON.stringify({
          attempted: { 12: '2026-11-01T00:00:00Z', 13: null, x: null },
        }),
        FILE,
      ),
      Result.ok(
        new Map<number, string | undefined>([
          [12, '2026-11-01T00:00:00Z'],
          [13, undefined],
        ]),
      ),
    );
  });

  test('no file is no record; one that does not parse is the error', () => {
    assert.deepStrictEqual(
      parseAttempted(undefined, FILE),
      Result.ok(new Map<number, string | undefined>()),
    );

    const broken = parseAttempted('{', FILE);

    assert.isTrue(Result.isErr(broken));

    assert.include(broken.value, FILE);

    assert.isTrue(Result.isErr(parseAttempted('{"attempted":1}', FILE)));
  });
});

describe(attemptedPath, () => {
  test('a directory per owner', () => {
    assert.strictEqual(
      attemptedPath('/state', { owner: 'o', name: 'n' }),
      '/state/run-issue-resolver/o/n.json',
    );
  });
});

describe(serializeAttempted, () => {
  test('writes what parseAttempted reads back, v1 byte for byte', () => {
    const record = new Map<number, string | undefined>([
      [12, '2026-11-01T00:00:00Z'],
      [13, undefined],
    ]);

    const text = serializeAttempted(record);

    assert.strictEqual(
      text,
      '{\n  "attempted": {\n    "12": "2026-11-01T00:00:00Z",\n    "13": null\n  }\n}\n',
    );

    assert.deepStrictEqual(parseAttempted(text, FILE), Result.ok(record));
  });
});
