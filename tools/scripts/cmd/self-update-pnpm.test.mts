// cspell:ignore esac

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compareVersions,
  parseStableVersion,
  selectMaturePnpmVersion,
  type RegistryMetadata,
  type StableVersion,
} from './self-update-pnpm.mjs';

const scriptPath = fileURLToPath(
  new URL('self-update-pnpm.mts', import.meta.url),
);

const hoursPerDay = 24;

const millisecondsPerDay = hoursPerDay * 60 * 60 * 1000;

/** A fixed "now", so that the cases below read as ages. */
const now = Temporal.Instant.from('2026-09-12T00:00:00Z');

const daysAgo = (days: number): string =>
  now.subtract({ hours: days * hoursPerDay }).toString();

const metadata: RegistryMetadata = {
  versions: [
    '12.3.4',
    '12.4.0',
    '12.4.1',
    '12.3.3',
    '13.0.0-alpha.0',
    '11.26.0',
    '12.5.0',
  ],
  time: {
    created: daysAgo(3000),
    modified: daysAgo(1),
    '11.26.0': daysAgo(30),
    '12.3.3': daysAgo(20),
    '12.3.4': daysAgo(10),
    '12.4.0': daysAgo(3),
    '12.4.1': daysAgo(1),
    '13.0.0-alpha.0': daysAgo(40),
    // '12.5.0' deliberately has no publish time.
  },
};

const cutoffDaysAgo = (days: number): number =>
  now.epochMilliseconds - days * millisecondsPerDay;

const v = (major: string, minor: string, patch: string): StableVersion => ({
  major,
  minor,
  patch,
});

describe('selectMaturePnpmVersion', () => {
  test('picks the newest stable version older than the hold', () => {
    const selection = selectMaturePnpmVersion(metadata, cutoffDaysAgo(7));

    assert.deepStrictEqual(selection, {
      target: '12.3.4',
      heldBack: ['12.4.0', '12.4.1', '12.5.0'],
    });
  });

  test('takes latest when everything is old enough', () => {
    const selection = selectMaturePnpmVersion(metadata, cutoffDaysAgo(0));

    assert.deepStrictEqual(selection, {
      target: '12.4.1',
      heldBack: ['12.5.0'],
    });
  });

  test('ignores prereleases even when they are old', () => {
    const selection = selectMaturePnpmVersion(
      { versions: ['13.0.0-alpha.0'], time: metadata.time },
      cutoffDaysAgo(0),
    );

    assert.deepStrictEqual(selection, undefined);
  });

  test('skips a version whose publish time is missing or unreadable', () => {
    const selection = selectMaturePnpmVersion(
      {
        versions: ['12.5.0', '12.6.0', '12.3.4'],
        time: { ...metadata.time, '12.6.0': 'not a date' },
      },
      cutoffDaysAgo(0),
    );

    assert.deepStrictEqual(selection, {
      target: '12.3.4',
      heldBack: ['12.5.0', '12.6.0'],
    });
  });

  test('returns undefined when nothing is old enough', () => {
    const selection = selectMaturePnpmVersion(metadata, cutoffDaysAgo(100));

    assert.deepStrictEqual(selection, undefined);
  });

  test('orders numerically, not lexically', () => {
    const selection = selectMaturePnpmVersion(
      {
        versions: ['9.15.9', '10.2.0', '10.10.0'],
        time: {
          '9.15.9': daysAgo(30),
          '10.2.0': daysAgo(30),
          '10.10.0': daysAgo(30),
        },
      },
      cutoffDaysAgo(0),
    );

    assert.deepStrictEqual(selection, { target: '10.10.0', heldBack: [] });
  });
});

describe('parseStableVersion', () => {
  test('parses x.y.z', () => {
    assert.deepStrictEqual(parseStableVersion('12.4.1'), v('12', '4', '1'));
  });

  test.each(['12.4', '12.4.1-beta.0', 'v12.4.1', 'latest', ''])(
    'rejects %j',
    (version) => {
      assert.deepStrictEqual(parseStableVersion(version), undefined);
    },
  );
});

describe('compareVersions', () => {
  test('compares major, then minor, then patch', () => {
    assert.isBelow(compareVersions(v('9', '15', '9'), v('10', '0', '0')), 0);

    assert.isBelow(compareVersions(v('10', '2', '0'), v('10', '10', '0')), 0);

    assert.isAbove(compareVersions(v('10', '2', '1'), v('10', '2', '0')), 0);

    assert.strictEqual(compareVersions(v('1', '2', '3'), v('1', '2', '3')), 0);
  });
});

describe('self-update-pnpm.mts under node', () => {
  /**
   * The workflow runs this file with plain `node` before `pnpm install`, so
   * what matters is that Node can strip its types and that it reaches nothing
   * in `node_modules`. A fake `pnpm` on `PATH` answers the two queries with
   * publish times anchored on the real clock, and echoes the `self-update` it
   * is asked for, which the script's inherited stdout carries back here.
   */
  test('runs on node alone and self-updates to the newest mature version', () => {
    const realNow = Temporal.Now.instant();

    const realDaysAgo = (days: number): string =>
      realNow.subtract({ hours: days * hoursPerDay }).toString();

    const registryAnswer = JSON.stringify({
      versions: metadata.versions,
      time: {
        '11.26.0': realDaysAgo(30),
        '12.3.3': realDaysAgo(20),
        '12.3.4': realDaysAgo(10),
        '12.4.0': realDaysAgo(3),
        '12.4.1': realDaysAgo(1),
        '13.0.0-alpha.0': realDaysAgo(40),
      },
    });

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-update-pnpm-'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(dir, 'pnpm'),
      [
        '#!/bin/sh',
        'case "$*" in',
        '  "config get minimumReleaseAge") echo 10080 ;;',
        '  "view pnpm versions time --json") cat <<JSON',
        registryAnswer,
        'JSON',
        '  ;;',
        '  self-update*) echo "fake pnpm: $*" ;;',
        '  *) echo "unexpected: $*" >&2; exit 1 ;;',
        'esac',
        '',
      ].join('\n'),
      { mode: 0o755 },
    );

    const stdout = execFileSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${dir}${path.delimiter}${process.env['PATH'] ?? ''}`,
      },
    });

    assert.include(stdout, 'Newest mature pnpm: 12.3.4\n');

    assert.include(
      stdout,
      'Held back by minimumReleaseAge: [12.4.0, 12.4.1, 12.5.0]\n',
    );

    assert.include(stdout, 'fake pnpm: self-update 12.3.4\n');
  });

  test('imports nothing outside node: builtins at runtime', () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = fs.readFileSync(scriptPath, 'utf8');

    // A top-level `import type` is erased by Node and so is allowed; an inline
    // `import { type X }` is not, because it keeps the module load.
    const specifiers = source
      .matchAll(/^import (?!type )[^;]* from '([^']+)';$/gmu)
      .map((m) => m[1])
      .toArray();

    assert.isNotEmpty(specifiers);

    assert.deepStrictEqual(
      specifiers.filter((s) => !(s?.startsWith('node:') ?? false)),
      [],
    );
  });
});
