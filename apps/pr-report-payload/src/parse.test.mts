import { Result } from 'ts-data-forge';
import {
  parsePayload,
  parseRunLog,
  serializePayload,
  serializeRunLog,
} from './parse.mjs';
import { PAYLOAD_VERSION, type PrReportPayload } from './payload.mjs';
import { RUN_LOG_VERSION, type UnblockPrsLog } from './run-log.mjs';

const payload: PrReportPayload = {
  version: PAYLOAD_VERSION,
  repo: { owner: 'noshiro-pf', name: 'mono' },
  generatedAt: '2026-09-21T08:00:00Z',
  generatedAtEpochMs: 1_758_441_600_000,
  authenticated: true,
  required: ['code-check-result'],
  summary: { open: 1, queued: 0, draft: 0, failing: 0, behind: 0 },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  mergedWithinDays: 7,
} as const;

const log: UnblockPrsLog = { version: RUN_LOG_VERSION, runs: [] } as const;

describe('the report file', () => {
  test('round-trips', () => {
    const read = parsePayload(serializePayload(payload));

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, payload);
  });

  // One line, because the file is only ever read by a program and the
  // payload is already 22 KB before any indentation is added to it.
  test('is written as one line', () => {
    assert.isFalse(serializePayload(payload).includes('\n'));
  });

  // The file is fetched over the network and could be anything: a proxy's
  // error page, a truncated body, GitHub's own 404 envelope.
  test('says so when it is not JSON at all', () => {
    const read = parsePayload('<html>Not Found</html>');

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('not JSON'));
  });

  test('says which version it found, and which one it reads', () => {
    const read = parsePayload(
      JSON.stringify({ ...payload, version: PAYLOAD_VERSION + 1 }),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes(`version ${PAYLOAD_VERSION + 1}`));

    assert.isTrue(read.value.includes(`version ${PAYLOAD_VERSION}`));
  });

  // Checked before the schema is, so that a payload from another age is
  // reported as that rather than as a field of the wrong type.
  test('takes a missing version as a version problem', () => {
    const read = parsePayload(JSON.stringify({ repo: payload.repo }));

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('no version'));
  });

  test('rejects the right version with the wrong shape', () => {
    const read = parsePayload(
      JSON.stringify({ version: PAYLOAD_VERSION, summary: 'lots' }),
    );

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('shape'));
  });

  // A field a newer report carries and this reader has no use for is not a
  // reason to take the page down.
  test('accepts a field it does not know about', () => {
    const read = parsePayload(
      JSON.stringify({ ...payload, somethingNewer: true }),
    );

    assert.isTrue(Result.isOk(read));

    expect(read.value.generatedAt).toBe(payload.generatedAt);
  });

  // The JSON arrives as the whole body of a file, and `git` is entitled to
  // add a trailing newline to one.
  test('accepts a trailing newline', () => {
    assert.isTrue(Result.isOk(parsePayload(`${serializePayload(payload)}\n`)));
  });
});

describe('the run log file', () => {
  test('round-trips', () => {
    const read = parseRunLog(serializeRunLog(log));

    assert.isTrue(Result.isOk(read));

    assert.deepStrictEqual(read.value, log);
  });

  // The two files are told apart by the words their failures use, because a
  // page shows both and "the report is not JSON" about the log would send a
  // reader to the wrong place.
  test('says "log" rather than "report" when it fails', () => {
    const read = parseRunLog('nonsense');

    assert.isTrue(Result.isErr(read));

    assert.isTrue(read.value.includes('log'));

    assert.isFalse(read.value.includes('report'));
  });
});
