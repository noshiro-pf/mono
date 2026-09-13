// cspell:ignore esac Unshifted

import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
import { Arr, isNonNullObject } from 'ts-data-forge';
import { type ReadonlyRecord, type StrictPick } from 'ts-type-forge';
import {
  compareVersions,
  parseActionPinLine,
  parseStableVersion,
  renderActionPin,
  selectMaturePnpmVersion,
  selectMatureRelease,
  type RegistryMetadata,
  type Release,
  type StableVersion,
} from './mature-updates.mjs';

const scriptPath = fileURLToPath(
  new URL('mature-updates.mts', import.meta.url),
);

const hoursPerDay = 24;

const millisecondsPerDay = hoursPerDay * 60 * 60 * 1000;

/** A fixed "now", so that the cases below read as ages. */
const now = Temporal.Instant.from('2026-09-12T00:00:00Z');

const daysAgo = (days: number): string =>
  now.subtract({ hours: days * hoursPerDay }).toString();

const cutoffDaysAgo = (days: number): number =>
  now.epochMilliseconds - days * millisecondsPerDay;

const v = (major: string, minor: string, patch: string): StableVersion => ({
  major,
  minor,
  patch,
});

const sha = (fill: string): string => fill.repeat(40);

/**
 * A fake `pnpm` on `PATH`: answers the hold and the registry query, and echoes
 * a `self-update` instead of doing it. The echo reaches the script's stdout,
 * which the caller captures.
 */
const installFakePnpm = (dir: string, registryAnswer: string): void => {
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
};

/**
 * Asynchronous on purpose: the `actions` test serves the fake GitHub API from
 * this very process, and a synchronous spawn would block the event loop that
 * has to answer the script's requests.
 */
const runScript = async (
  args: readonly string[],
  options: Readonly<{
    cwd: string;
    binDir: string;
    env?: ReadonlyRecord<string, string>;
  }>,
): Promise<string> => {
  const { stdout } = await util.promisify(execFile)(
    process.execPath,
    Arr.toUnshifted(scriptPath)(args),
    {
      cwd: options.cwd,
      encoding: 'utf8',
      env: {
        ...process.env,
        ...options.env,
        PATH: `${options.binDir}${path.delimiter}${process.env['PATH'] ?? ''}`,
      },
    },
  );

  return stdout;
};

describe('pnpm', () => {
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

  test('runs on node alone and self-updates to the newest mature version', async () => {
    const realNow = Temporal.Now.instant();

    const realDaysAgo = (days: number): string =>
      realNow.subtract({ hours: days * hoursPerDay }).toString();

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mature-updates-pnpm-'));

    installFakePnpm(
      dir,
      JSON.stringify({
        versions: metadata.versions,
        time: {
          '11.26.0': realDaysAgo(30),
          '12.3.3': realDaysAgo(20),
          '12.3.4': realDaysAgo(10),
          '12.4.0': realDaysAgo(3),
          '12.4.1': realDaysAgo(1),
          '13.0.0-alpha.0': realDaysAgo(40),
        },
      }),
    );

    const stdout = await runScript(['pnpm'], { cwd: dir, binDir: dir });

    assert.include(stdout, 'Newest mature pnpm: 12.3.4\n');

    assert.include(
      stdout,
      'Held back by minimumReleaseAge: [12.4.0, 12.4.1, 12.5.0]\n',
    );

    assert.include(stdout, 'fake pnpm: self-update 12.3.4\n');
  });
});

describe('actions', () => {
  const release = (
    tag: string,
    publishedDaysAgo: number | undefined,
    flags?: Readonly<Partial<StrictPick<Release, 'draft' | 'prerelease'>>>,
  ): Release => ({
    tag,
    publishedAt:
      publishedDaysAgo === undefined ? undefined : daysAgo(publishedDaysAgo),
    draft: flags?.draft ?? false,
    prerelease: flags?.prerelease ?? false,
  });

  const checkoutReleases: readonly Release[] = [
    release('v7.0.3', 1),
    release('v8.0.0', 30),
    release('v7.0.2', 20),
    release('v7.1.0-rc.1', 40, { prerelease: true }),
    release('v7.9.9', 60, { draft: true }),
    release('v7.0.1', 60),
    release('v6.1.0', 5),
    release('v9.0.0', 2),
  ];

  describe('selectMatureRelease', () => {
    test('moves within the major to the newest release older than the hold', () => {
      const selection = selectMatureRelease(
        checkoutReleases,
        'v7.0.1',
        cutoffDaysAgo(7),
      );

      assert.deepStrictEqual(selection, {
        target: 'v7.0.2',
        heldBack: ['v7.0.3'],
        majorsWaiting: ['8', '9'],
      });
    });

    test('stays put when every newer same-major release is too young', () => {
      const selection = selectMatureRelease(
        checkoutReleases,
        'v7.0.2',
        cutoffDaysAgo(7),
      );

      assert.deepStrictEqual(selection, {
        target: undefined,
        heldBack: ['v7.0.3'],
        majorsWaiting: ['8', '9'],
      });
    });

    test('never crosses a major, however old it is', () => {
      const selection = selectMatureRelease(
        checkoutReleases,
        'v7.0.3',
        cutoffDaysAgo(0),
      );

      assert.deepStrictEqual(selection, {
        target: undefined,
        heldBack: [],
        majorsWaiting: ['8', '9'],
      });
    });

    test('skips drafts, prereleases and releases without a publish time', () => {
      const selection = selectMatureRelease(
        [
          release('v7.0.5', 60, { draft: true }),
          release('v7.0.4', 60, { prerelease: true }),
          release('v7.0.3', undefined),
          release('v7.0.2', 60),
        ],
        'v7.0.1',
        cutoffDaysAgo(7),
      );

      assert.deepStrictEqual(selection, {
        target: 'v7.0.2',
        heldBack: ['v7.0.3'],
        majorsWaiting: [],
      });
    });

    test('accepts tags without the v prefix', () => {
      const selection = selectMatureRelease(
        [release('1.2.4', 30), release('1.2.3', 60)],
        '1.2.3',
        cutoffDaysAgo(7),
      );

      assert.deepStrictEqual(selection, {
        target: '1.2.4',
        heldBack: [],
        majorsWaiting: [],
      });
    });
  });

  describe('parseActionPinLine / renderActionPin', () => {
    test('round-trips a pinned line, subpath included', () => {
      const line = `      - uses: owner/tool/sub/path@${sha('a')} # v1.2.3`;

      const pin = parseActionPinLine(line);

      assert.deepStrictEqual(pin, {
        prefix: '      - uses: ',
        repo: 'owner/tool',
        subpath: '/sub/path',
        sha: sha('a'),
        tag: 'v1.2.3',
      });

      assert.strictEqual(pin === undefined ? '' : renderActionPin(pin), line);
    });

    test.each([
      '        uses: ./.github/workflows/check-gates.yml',
      '        uses: actions/checkout@v7',
      `        uses: actions/checkout@${sha('a')}`,
      `        uses: actions/checkout@${sha('a')} # main`,
      '        uses: write',
    ])('leaves %j alone', (line) => {
      assert.deepStrictEqual(parseActionPinLine(line), undefined);
    });
  });

  test('runs on node alone and rewrites the mature pins in place', async () => {
    const realNow = Temporal.Now.instant();

    const realDaysAgo = (days: number): string =>
      realNow.subtract({ hours: days * hoursPerDay }).toString();

    const dir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mature-updates-actions-'),
    );

    const workflowsDir = path.join(dir, '.github', 'workflows');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(workflowsDir, { recursive: true });

    const workflow = path.join(workflowsDir, 'ci.yml');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      workflow,
      [
        'jobs:',
        '  build:',
        '    steps:',
        `      - uses: actions/checkout@${sha('1')} # v7.0.1`,
        `      - uses: pnpm/action-setup@${sha('2')} # v6.1.0`,
        `      - uses: owner/tool/sub/path@${sha('3')} # v1.2.3`,
        '      - uses: ./.github/workflows/check-gates.yml',
        `      - uses: actions/checkout@${sha('1')} # v7.0.1`,
        '',
      ].join('\n'),
    );

    installFakePnpm(dir, '{}');

    const releasesByRepo: ReadonlyRecord<string, readonly unknown[]> = {
      'actions/checkout': [
        { tag_name: 'v7.0.3', published_at: realDaysAgo(1) },
        { tag_name: 'v8.0.0', published_at: realDaysAgo(30) },
        { tag_name: 'v7.0.2', published_at: realDaysAgo(20) },
        { tag_name: 'v7.0.1', published_at: realDaysAgo(60) },
      ],
      'pnpm/action-setup': [
        {
          tag_name: 'v6.2.0-beta.1',
          published_at: realDaysAgo(40),
          prerelease: true,
        },
        { tag_name: 'v6.1.0', published_at: realDaysAgo(8) },
      ],
      'owner/tool': [
        { tag_name: 'v1.2.4', published_at: realDaysAgo(30) },
        { tag_name: 'v1.2.3', published_at: realDaysAgo(90) },
      ],
    };

    const commitShaByTag: ReadonlyRecord<string, string> = {
      'actions/checkout@v7.0.2': sha('b'),
      'owner/tool@v1.2.4': sha('c'),
    };

    const mut_requests: string[] = [];

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost');

      mut_requests.push(`${req.headers.authorization ?? ''} ${url.pathname}`);

      const releases = /^\/repos\/([^/]+\/[^/]+)\/releases$/u.exec(
        url.pathname,
      );

      const commit = /^\/repos\/([^/]+\/[^/]+)\/commits\/([^/]+)$/u.exec(
        url.pathname,
      );

      if (releases?.[1] !== undefined) {
        const page = url.searchParams.get('page');

        res.setHeader('content-type', 'application/json');

        res.end(
          JSON.stringify(
            page === '1' ? (releasesByRepo[releases[1]] ?? []) : [],
          ),
        );

        return;
      }

      if (commit?.[1] !== undefined && commit[2] !== undefined) {
        const answer = commitShaByTag[`${commit[1]}@${commit[2]}`];

        res.writeHead(answer === undefined ? 404 : 200);

        res.end(answer ?? 'no such tag');

        return;
      }

      res.writeHead(404);

      res.end('unexpected route');
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });

    try {
      const address = server.address();

      const port = isNonNullObject(address) ? address.port : 0;

      const stdout = await runScript(['actions'], {
        cwd: dir,
        binDir: dir,
        env: {
          GITHUB_API_URL: `http://127.0.0.1:${port}`,
          GH_TOKEN: 'fake-token',
        },
      });

      assert.include(
        stdout,
        'actions/checkout: v7.0.1 -> v7.0.2 (held back by minimumReleaseAge: [v7.0.3]; majors waiting for a human: [8])\n',
      );

      assert.include(
        stdout,
        'pnpm/action-setup: v6.1.0 unchanged (held back by minimumReleaseAge: []; majors waiting for a human: [])\n',
      );

      assert.include(stdout, 'Moved 3 action pin(s).\n');

      assert.strictEqual(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFileSync(workflow, 'utf8'),
        [
          'jobs:',
          '  build:',
          '    steps:',
          `      - uses: actions/checkout@${sha('b')} # v7.0.2`,
          `      - uses: pnpm/action-setup@${sha('2')} # v6.1.0`,
          `      - uses: owner/tool/sub/path@${sha('c')} # v1.2.4`,
          '      - uses: ./.github/workflows/check-gates.yml',
          `      - uses: actions/checkout@${sha('b')} # v7.0.2`,
          '',
        ].join('\n'),
      );

      // One releases query per distinct pin, one commit lookup per move, all
      // authenticated.
      assert.deepStrictEqual(mut_requests.toSorted(), [
        'Bearer fake-token /repos/actions/checkout/commits/v7.0.2',
        'Bearer fake-token /repos/actions/checkout/releases',
        'Bearer fake-token /repos/owner/tool/commits/v1.2.4',
        'Bearer fake-token /repos/owner/tool/releases',
        'Bearer fake-token /repos/pnpm/action-setup/releases',
      ]);
    } finally {
      server.closeAllConnections();

      server.close();
    }
  });
});

describe('shared', () => {
  test('parseStableVersion parses x.y.z and nothing else', () => {
    assert.deepStrictEqual(parseStableVersion('12.4.1'), v('12', '4', '1'));

    for (const rejected of ['12.4', '12.4.1-beta.0', 'v12.4.1', 'latest', '']) {
      assert.deepStrictEqual(parseStableVersion(rejected), undefined);
    }
  });

  test('compareVersions compares major, then minor, then patch, numerically', () => {
    assert.isBelow(compareVersions(v('9', '15', '9'), v('10', '0', '0')), 0);

    assert.isBelow(compareVersions(v('10', '2', '0'), v('10', '10', '0')), 0);

    assert.isAbove(compareVersions(v('10', '2', '1'), v('10', '2', '0')), 0);

    assert.strictEqual(compareVersions(v('1', '2', '3'), v('1', '2', '3')), 0);
  });

  test('the script imports nothing outside node: builtins at runtime', () => {
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
