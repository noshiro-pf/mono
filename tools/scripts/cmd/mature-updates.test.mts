// cspell:ignore esac Unshifted

import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
import {
  Arr,
  asUint32,
  hasKey,
  isNonNullObject,
  isRecord,
} from 'ts-data-forge';
import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';
import type { ReleaseBinaryPin } from '../lib/release-binaries.mjs';
import {
  compareVersions,
  parseActionPinLine,
  parseStableVersion,
  releaseLine,
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

const v = (major: string, minor: string, patch: string): StableVersion =>
  ({
    major,
    minor,
    patch,
  }) as const;

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
  } as const;

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
  ): Release =>
    ({
      tag,
      publishedAt:
        publishedDaysAgo === undefined ? undefined : daysAgo(publishedDaysAgo),
      draft: flags?.draft ?? false,
      prerelease: flags?.prerelease ?? false,
      assets: [],
    }) as const;

  const checkoutReleases: readonly Release[] = [
    release('v7.0.3', 1),
    release('v8.0.0', 30),
    release('v7.0.2', 20),
    release('v7.1.0-rc.1', 40, { prerelease: true }),
    release('v7.9.9', 60, { draft: true }),
    release('v7.0.1', 60),
    release('v6.1.0', 5),
    release('v9.0.0', 2),
  ] as const;

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
        linesWaiting: ['8', '9'],
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
        linesWaiting: ['8', '9'],
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
        linesWaiting: ['8', '9'],
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
        linesWaiting: [],
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
        linesWaiting: [],
      });
    });
  });

  describe('parseActionPinLine / renderActionPin', () => {
    test('round-trips a pinned line, subpath included', () => {
      const line =
        `      - uses: owner/tool/sub/path@${sha('a')} # v1.2.3` as const;

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

    // A composite action carries pins as well, and a workflow that uses it
    // carries none of them: a pin read only from `.github/workflows/` would
    // never move again, and nothing would say so.
    const actionDir = path.join(dir, '.github', 'actions', 'setup');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(actionDir, { recursive: true });

    const action = path.join(actionDir, 'action.yml');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      action,
      [
        'runs:',
        '  using: composite',
        '  steps:',
        '    - name: Install pnpm',
        `      uses: pnpm/action-setup@${sha('2')} # v6.1.0`,
        '    - name: Set up Node.js',
        `      uses: actions/setup-node@${sha('4')} # v7.0.0`,
        '',
      ].join('\n'),
    );

    // Not an action: only an `action.yml` is read under `.github/actions/`.
    const notes = path.join(actionDir, 'notes.yml');

    const notesText = `pin: actions/setup-node@${sha('4')} # v7.0.0\n` as const;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(notes, notesText);

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
      'actions/setup-node': [
        { tag_name: 'v7.0.1', published_at: realDaysAgo(10) },
        { tag_name: 'v7.0.0', published_at: realDaysAgo(90) },
      ],
    } as const;

    const commitShaByTag: ReadonlyRecord<string, string> = {
      'actions/checkout@v7.0.2': sha('b'),
      'owner/tool@v1.2.4': sha('c'),
      'actions/setup-node@v7.0.1': sha('d'),
    } as const;

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
        'actions/checkout: v7.0.1 -> v7.0.2 (held back by minimumReleaseAge: [v7.0.3]; newer lines waiting for a human: [8])\n',
      );

      assert.include(
        stdout,
        'pnpm/action-setup: v6.1.0 unchanged (held back by minimumReleaseAge: []; newer lines waiting for a human: [])\n',
      );

      assert.include(stdout, 'Moved 4 action pin(s).\n');

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

      assert.strictEqual(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFileSync(action, 'utf8'),
        [
          'runs:',
          '  using: composite',
          '  steps:',
          '    - name: Install pnpm',
          `      uses: pnpm/action-setup@${sha('2')} # v6.1.0`,
          '    - name: Set up Node.js',
          `      uses: actions/setup-node@${sha('d')} # v7.0.1`,
          '',
        ].join('\n'),
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      assert.strictEqual(fs.readFileSync(notes, 'utf8'), notesText);

      // One releases query per distinct pin — `pnpm/action-setup` is in both
      // files and asked about once — one commit lookup per move, all
      // authenticated.
      assert.deepStrictEqual(mut_requests.toSorted(), [
        'Bearer fake-token /repos/actions/checkout/commits/v7.0.2',
        'Bearer fake-token /repos/actions/checkout/releases',
        'Bearer fake-token /repos/actions/setup-node/commits/v7.0.1',
        'Bearer fake-token /repos/actions/setup-node/releases',
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

const binaryRelease = (tag: string, publishedDaysAgo: number): Release =>
  ({
    tag,
    publishedAt: daysAgo(publishedDaysAgo),
    draft: false,
    prerelease: false,
    assets: [],
  }) as const;

describe('release-binaries', () => {
  describe('selectMatureRelease with releaseLine', () => {
    test('treats a 0.x minor as the major: 0.11.x moves, 0.12 waits', () => {
      const selection = selectMatureRelease(
        [
          binaryRelease('v0.12.0', 30),
          binaryRelease('v0.11.2', 3),
          binaryRelease('v0.11.1', 20),
          binaryRelease('v0.11.0', 60),
          binaryRelease('v1.0.0', 30),
        ],
        'v0.11.0',
        cutoffDaysAgo(7),
        releaseLine,
      );

      assert.deepStrictEqual(selection, {
        target: 'v0.11.1',
        heldBack: ['v0.11.2'],
        linesWaiting: ['0.12', '1'],
      });
    });

    test('never moves a 0.0.x on its own', () => {
      const selection = selectMatureRelease(
        [binaryRelease('v0.0.4', 30), binaryRelease('v0.0.3', 60)],
        'v0.0.3',
        cutoffDaysAgo(7),
        releaseLine,
      );

      assert.deepStrictEqual(selection, {
        target: undefined,
        heldBack: [],
        linesWaiting: ['0.0.4'],
      });
    });

    test('moves a 1.x within its major, as the action pins do', () => {
      const selection = selectMatureRelease(
        [
          binaryRelease('v2.0.0', 30),
          binaryRelease('v1.8.0', 30),
          binaryRelease('v1.7.12', 60),
        ],
        'v1.7.12',
        cutoffDaysAgo(7),
        releaseLine,
      );

      assert.deepStrictEqual(selection, {
        target: 'v1.8.0',
        heldBack: [],
        linesWaiting: ['2'],
      });
    });
  });

  test('runs on node alone and rewrites the version and the digests in place', async () => {
    const realNow = Temporal.Now.instant();

    const realDaysAgo = (days: number): string =>
      realNow.subtract({ hours: days * hoursPerDay }).toString();

    const dir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'mature-updates-release-binaries-'),
    );

    const configDir = path.join(dir, 'tools', 'configs');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(configDir, { recursive: true });

    const configPath = path.join(configDir, 'release-binaries.json');

    const pin = (
      repository: string,
      version: string,
      digest: string,
    ): ReleaseBinaryPin =>
      ({
        repository,
        version,
        binary: 'tool',
        assets: {
          'linux-x64': {
            name: 'tool_{version}_linux_amd64.tar.gz',
            sha256: digest.repeat(64),
          },
          'darwin-arm64': {
            name: 'tool_{version}_darwin_arm64.tar.gz',
            sha256: digest.repeat(64),
          },
        },
      }) as const;

    // A key the file does not define survives a move: JSON has no comments,
    // so a note is a field, and a rewrite must not drop it.
    const moves = (version: string, digest: string) => {
      const base = pin('owner/moves', version, digest);

      return {
        ...base,
        note: 'kept',
        assets: {
          ...base.assets,
          'linux-x64': { ...base.assets['linux-x64'], note: 'kept too' },
        },
      } as const;
    };

    const before = {
      moves: moves('1.2.3', '1'),
      zero: pin('owner/zero', '0.11.0', '2'),
      undigested: pin('owner/undigested', '1.0.0', '3'),
      unshipped: pin('owner/unshipped', '1.0.0', '4'),
      reuploaded: pin('owner/reuploaded', '1.0.0', '5'),
      fallback: pin('owner/fallback', '1.0.0', '6'),
      untagged: pin('owner/untagged', '1.0.0', '8'),
    } as const;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(configPath, `${JSON.stringify(before, undefined, 2)}\n`);

    installFakePnpm(dir, '{}');

    const assets = (
      version: string,
      digest: string,
      uploadedDaysAgo = 30,
    ): unknown =>
      [
        {
          name: `tool_${version}_linux_amd64.tar.gz`,
          digest: `sha256:${digest.repeat(64)}`,
          updated_at: realDaysAgo(uploadedDaysAgo),
        },
        {
          name: `tool_${version}_darwin_arm64.tar.gz`,
          digest: `sha256:${digest.repeat(64)}`,
          updated_at: realDaysAgo(30),
        },
        {
          name: `tool_${version}_windows_amd64.zip`,
          digest: 'sha256:00',
          updated_at: realDaysAgo(30),
        },
      ] as const;

    const releasesByRepo: ReadonlyRecord<string, readonly unknown[]> = {
      'owner/moves': [
        { tag_name: 'v1.3.0', published_at: realDaysAgo(1), assets: [] },
        {
          tag_name: 'v1.2.5',
          published_at: realDaysAgo(20),
          assets: assets('1.2.5', 'a'),
        },
        {
          tag_name: 'v1.2.3',
          published_at: realDaysAgo(90),
          assets: assets('1.2.3', '1'),
        },
      ],
      'owner/zero': [
        {
          tag_name: 'v0.12.0',
          published_at: realDaysAgo(30),
          assets: assets('0.12.0', 'b'),
        },
        {
          tag_name: 'v0.11.0',
          published_at: realDaysAgo(90),
          assets: assets('0.11.0', '2'),
        },
      ],
      // Mature and in range, but one asset has no digest to pin.
      'owner/undigested': [
        {
          tag_name: 'v1.0.1',
          published_at: realDaysAgo(30),
          assets: [
            {
              name: 'tool_1.0.1_linux_amd64.tar.gz',
              digest: `sha256:${'c'.repeat(64)}`,
            },
            { name: 'tool_1.0.1_darwin_arm64.tar.gz', digest: null },
          ],
        },
        {
          tag_name: 'v1.0.0',
          published_at: realDaysAgo(90),
          assets: assets('1.0.0', '3'),
        },
      ],
      // Mature and in range, but without the darwin-arm64 asset at all.
      'owner/unshipped': [
        {
          tag_name: 'v1.0.1',
          published_at: realDaysAgo(30),
          assets: [
            {
              name: 'tool_1.0.1_linux_amd64.tar.gz',
              digest: `sha256:${'d'.repeat(64)}`,
              updated_at: realDaysAgo(30),
            },
          ],
        },
      ],
      // The newest mature release re-uploaded a file yesterday; the one
      // before it is taken instead of nothing.
      'owner/fallback': [
        {
          tag_name: 'v1.0.2',
          published_at: realDaysAgo(60),
          assets: assets('1.0.2', 'f', 1),
        },
        {
          tag_name: 'v1.0.1',
          published_at: realDaysAgo(60),
          assets: assets('1.0.1', '7'),
        },
      ],
      // Mature, but tagged without the `v` the download URL is built with.
      'owner/untagged': [
        {
          tag_name: '1.0.1',
          published_at: realDaysAgo(60),
          assets: assets('1.0.1', '9'),
        },
      ],
      // Published long ago, with one file uploaded yesterday.
      'owner/reuploaded': [
        {
          tag_name: 'v1.0.1',
          published_at: realDaysAgo(60),
          assets: assets('1.0.1', 'e', 1),
        },
      ],
    } as const;

    const mut_requests: string[] = [];

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://localhost');

      mut_requests.push(`${req.headers.authorization ?? ''} ${url.pathname}`);

      const releases = /^\/repos\/([^/]+\/[^/]+)\/releases$/u.exec(
        url.pathname,
      );

      if (releases?.[1] === undefined) {
        res.writeHead(404);

        res.end('unexpected route');

        return;
      }

      res.setHeader('content-type', 'application/json');

      res.end(
        JSON.stringify(
          url.searchParams.get('page') === '1'
            ? (releasesByRepo[releases[1]] ?? [])
            : [],
        ),
      );
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve);
    });

    try {
      const address = server.address();

      const port = isNonNullObject(address) ? address.port : 0;

      const stdout = await runScript(['release-binaries'], {
        cwd: dir,
        binDir: dir,
        env: {
          GITHUB_API_URL: `http://127.0.0.1:${port}`,
          GH_TOKEN: 'fake-token',
        },
      });

      assert.include(
        stdout,
        'moves (owner/moves): v1.2.3 -> v1.2.5 (held back by minimumReleaseAge: [v1.3.0]; newer lines waiting for a human: [])\n',
      );

      assert.include(
        stdout,
        'zero (owner/zero): v0.11.0 unchanged (held back by minimumReleaseAge: []; newer lines waiting for a human: [0.12])\n',
      );

      assert.include(
        stdout,
        '::warning::undigested: v1.0.1 has no SHA-256 digest for tool_1.0.1_darwin_arm64.tar.gz; not taken.\n',
      );

      assert.include(
        stdout,
        '::warning::unshipped: v1.0.1 has no asset named tool_1.0.1_darwin_arm64.tar.gz; not taken.\n',
      );

      assert.include(
        stdout,
        'reuploaded: tool_1.0.1_linux_amd64.tar.gz of v1.0.1 was uploaded after the cutoff; not taken.\nreuploaded (owner/reuploaded): v1.0.0 unchanged (held back by minimumReleaseAge: [v1.0.1]; ',
      );

      assert.include(
        stdout,
        'fallback: tool_1.0.2_linux_amd64.tar.gz of v1.0.2 was uploaded after the cutoff; not taken.\nfallback (owner/fallback): v1.0.0 -> v1.0.1 (held back by minimumReleaseAge: [v1.0.2]; ',
      );

      assert.include(stdout, 'Moved 2 release-binary pin(s).\n');

      assert.deepStrictEqual(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        JSON.parse(fs.readFileSync(configPath, 'utf8')),
        {
          ...before,
          moves: moves('1.2.5', 'a'),
          fallback: pin('owner/fallback', '1.0.1', '7'),
        },
      );

      assert.deepStrictEqual(mut_requests.toSorted(), [
        'Bearer fake-token /repos/owner/fallback/releases',
        'Bearer fake-token /repos/owner/moves/releases',
        'Bearer fake-token /repos/owner/reuploaded/releases',
        'Bearer fake-token /repos/owner/undigested/releases',
        'Bearer fake-token /repos/owner/unshipped/releases',
        'Bearer fake-token /repos/owner/untagged/releases',
        'Bearer fake-token /repos/owner/zero/releases',
      ]);
    } finally {
      server.closeAllConnections();

      server.close();

      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('release-binaries --to', () => {
  // Every step spawns `node`, a dozen in all, which outlasts the default 5 s
  // on a loaded runner.
  test(
    'moves the one tool named to the version given, across its line, under the same hold',
    { timeout: 30_000 },
    async () => {
      const realNow = Temporal.Now.instant();

      const realDaysAgo = (days: number): string =>
        realNow.subtract({ hours: days * hoursPerDay }).toString();

      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mature-updates-to-'));

      const configDir = path.join(dir, 'tools', 'configs');

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(configDir, { recursive: true });

      const configPath = path.join(configDir, 'release-binaries.json');

      const pin = (
        repository: string,
        version: string,
        digest: string,
      ): ReleaseBinaryPin =>
        ({
          repository,
          version,
          binary: 'tool',
          assets: {
            'linux-x64': {
              name: 'tool_{version}_linux_amd64.tar.gz',
              sha256: digest.repeat(64),
            },
          },
        }) as const;

      const before = {
        jump: pin('owner/jump', '1.7.12', '1'),
        // Has a mature release on its line, which a `--to` for another tool
        // must leave alone.
        other: pin('owner/other', '1.0.0', '2'),
      } as const;

      const beforeText = `${JSON.stringify(before, undefined, 2)}\n` as const;

      installFakePnpm(dir, '{}');

      const release = (
        tag: string,
        publishedDaysAgo: number,
        digest: string,
        extra: ReadonlyRecord<string, unknown> = {},
      ): unknown =>
        ({
          tag_name: tag,
          published_at: realDaysAgo(publishedDaysAgo),
          assets: [
            {
              name: `tool_${tag.slice(1)}_linux_amd64.tar.gz`,
              digest: `sha256:${digest.repeat(64)}`,
              updated_at: realDaysAgo(publishedDaysAgo),
            },
          ],
          ...extra,
        }) as const;

      const releasesByRepo: ReadonlyRecord<string, readonly unknown[]> = {
        'owner/jump': [
          release('v2.1.0', 2, 'b'),
          release('v2.0.1', 30, 'c', { prerelease: true }),
          release('v2.0.0', 30, 'a'),
          release('v1.9.0', 30, 'e', { draft: true }),
          release('v1.8.0', 60, 'f', {
            assets: [
              {
                name: 'tool_1.8.0_linux_amd64.tar.gz',
                digest: `sha256:${'f'.repeat(64)}`,
                updated_at: realDaysAgo(1),
              },
            ],
          }),
          release('v1.7.12', 90, '1'),
          release('v1.7.11', 120, '0'),
          release('v1.6.0', 200, '6', { published_at: null }),
        ],
        'owner/other': [release('v1.0.1', 30, 'd'), release('v1.0.0', 90, '2')],
      } as const;

      const mut_requests: string[] = [];

      const server = http.createServer((req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');

        mut_requests.push(url.pathname);

        const byTag =
          /^\/repos\/([^/]+\/[^/]+)\/releases\/tags\/([^/]+)$/u.exec(
            url.pathname,
          );

        const found =
          byTag?.[1] === undefined
            ? undefined
            : (releasesByRepo[byTag[1]] ?? []).find(
                (candidate) =>
                  isRecord(candidate) && candidate['tag_name'] === byTag[2],
              );

        // GitHub has no tag route for a draft either.
        if (
          found === undefined ||
          (isRecord(found) && found['draft'] === true)
        ) {
          res.writeHead(404);

          res.end('{"message":"Not Found"}');

          return;
        }

        res.setHeader('content-type', 'application/json');

        res.end(JSON.stringify(found));
      });

      await new Promise<void>((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
      });

      try {
        const address = server.address();

        const port = isNonNullObject(address) ? address.port : 0;

        const run = (to: string): Promise<string> =>
          // With the `--` that `pnpm run … -- --to` forwards.
          runScript(['release-binaries', '--', '--to', to], {
            cwd: dir,
            binDir: dir,
            env: {
              GITHUB_API_URL: `http://127.0.0.1:${port}`,
              GH_TOKEN: 'fake-token',
            },
          });

        /** What a run that must fail printed on stderr, once it has failed. */
        const runFailing = async (to: string): Promise<string> => {
          try {
            await run(to);
          } catch (error: unknown) {
            return isRecord(error) &&
              hasKey(error, 'stderr') &&
              typeof error.stderr === 'string'
              ? error.stderr
              : '';
          }

          throw new Error(`release-binaries --to ${to} passed`);
        };

        const readPins = (): unknown =>
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          JSON.parse(fs.readFileSync(configPath, 'utf8'));

        for (const [to, message] of [
          [
            'jump@2.1.0',
            'jump: v2.1.0 was published after the cutoff; not taken.',
          ],
          ['jump@2.0.1', 'jump: v2.0.1 is a draft or a prerelease; not taken.'],
          [
            'jump@1.6.0',
            'jump: v1.6.0 has no publication time to hold it to; not taken.',
          ],
          [
            'jump@1.9.0',
            'jump: owner/jump has no published release v1.9.0, or cannot be read.',
          ],
          [
            'jump@1.8.0',
            'jump: tool_1.8.0_linux_amd64.tar.gz of v1.8.0 was uploaded after the cutoff; not taken.',
          ],
          [
            'jump@3.0.0',
            'jump: owner/jump has no published release v3.0.0, or cannot be read.',
          ],
          [
            'nope@1.0.0',
            'tools/configs/release-binaries.json pins no tool named "nope".',
          ],
          [
            'jump@2.0',
            'Usage: node mature-updates.mts release-binaries [--to <tool>@<x.y.z>]',
          ],
        ] as const) {
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.writeFileSync(configPath, beforeText);

          assert.include(await runFailing(to), message);

          assert.deepStrictEqual(readPins(), before);
        }

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(configPath, beforeText);

        const firstRequest = mut_requests.length;

        const stdout = await run('jump@2.0.0');

        assert.include(stdout, 'jump (owner/jump): v1.7.12 -> v2.0.0 (--to)\n');

        assert.include(stdout, 'Moved 1 release-binary pin(s).\n');

        assert.deepStrictEqual(readPins(), {
          ...before,
          jump: pin('owner/jump', '2.0.0', 'a'),
        });

        assert.deepStrictEqual(Arr.skip(mut_requests, asUint32(firstRequest)), [
          '/repos/owner/jump/releases/tags/v2.0.0',
        ]);

        // The same version again rewrites nothing, and says so.
        assert.include(
          await run('jump@2.0.0'),
          'jump (owner/jump): v2.0.0 unchanged (--to)\n',
        );

        // A digest that differs on the same version is refused: the upload
        // was replaced, which is reported rather than re-pinned.
        const replacedPins = {
          ...before,
          jump: pin('owner/jump', '2.0.0', '9'),
        } as const;

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(
          configPath,
          `${JSON.stringify(replacedPins, undefined, 2)}\n`,
        );

        assert.include(
          await runFailing('jump@2.0.0'),
          `jump: the linux-x64 asset of v2.0.0 is ${'a'.repeat(64)}, not the pinned digest; not re-pinned. Either the version was edited by hand without its digests (put back the version last pinned, then use --to), or the file was uploaded again, which is worth reporting.`,
        );

        assert.deepStrictEqual(readPins(), replacedPins);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.writeFileSync(
          configPath,
          `${JSON.stringify({ ...before, jump: pin('owner/jump', '2.0.0', 'a') }, undefined, 2)}\n`,
        );

        // And back down, below the current pin and its line.
        assert.include(
          await run('jump@1.7.11'),
          'jump (owner/jump): v2.0.0 -> v1.7.11 (--to)\n',
        );

        assert.deepStrictEqual(readPins(), {
          ...before,
          jump: pin('owner/jump', '1.7.11', '0'),
        });
      } finally {
        server.closeAllConnections();

        server.close();

        fs.rmSync(dir, { recursive: true, force: true });
      }
    },
  );
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
