import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ReadonlyRecord } from 'ts-type-forge';
import { runFile } from '../lib/child-process.mjs';
import { isChromeExtension } from '../lib/chrome-extensions.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  compareVersions,
  decideSubmission,
  isChromeVersion,
  isExtensionDirectory,
  main,
  parseFetchStatus,
  type CommandIo,
  type FetchInit,
} from './submit-chrome-extension.mjs';

const scriptPath = fileURLToPath(
  new URL('submit-chrome-extension.mts', import.meta.url),
);

describe(decideSubmission, () => {
  test.each([
    ['newer than both', '1.2.0', '1.1.0', undefined, 'submit'],
    ['nothing in the store', '0.1.0', undefined, undefined, 'submit'],
    ['equal to published', '1.1.0', '1.1.0', undefined, 'current'],
    ['equal to pending', '1.2.0', '1.1.0', '1.2.0', 'current'],
    [
      'newer than published, an older one pending',
      '1.3.0',
      '1.1.0',
      '1.2.0',
      'wait',
    ],
    ['older than published', '1.0.0', '1.1.0', undefined, 'refuse'],
    ['older than pending', '1.1.5', '1.1.0', '1.2.0', 'refuse'],
    ['0.10.0 after 0.9.5', '0.10.0', '0.9.5', undefined, 'submit'],
  ] as const)('%s', (_, local, published, pending, expected) => {
    expect(decideSubmission(local, { published, pending })).toBe(expected);
  });
});

describe(compareVersions, () => {
  test.each([
    ['0.10.0', '0.9.5', 1],
    ['1.0', '1.0.0', 0],
    ['1.0.0.1', '1.0', 1],
    ['2', '10', -1],
  ] as const)('%s vs %s', (a, b, sign) => {
    expect(Math.sign(compareVersions(a, b))).toBe(sign);
  });
});

describe(isChromeVersion, () => {
  test.each(['1', '0.4.13', '1.2.3.4', '65535.0'])('%s is one', (version) => {
    assert.isTrue(isChromeVersion(version));
  });

  test.each(['', '1.2.3.4.5', '01.0', '65536', '1.0-beta', 'v1.0'])(
    '%s is not',
    (version) => {
      assert.isFalse(isChromeVersion(version));
    },
  );
});

describe(parseFetchStatus, () => {
  test('a fetchStatus body gives the published and the pending version', () => {
    expect(parseFetchStatus(statusBody('1.1.0', '1.2.0'))).toStrictEqual({
      ok: true,
      value: { published: '1.1.0', pending: '1.2.0' },
    });
  });

  test('an item with neither revision has no version', () => {
    expect(parseFetchStatus({ itemId: 'item' })).toStrictEqual({
      ok: true,
      value: { published: undefined, pending: undefined },
    });
  });

  test('a rejected or cancelled submission is not pending', () => {
    for (const state of ['REJECTED', 'CANCELLED']) {
      expect(
        parseFetchStatus({
          ...statusBody('1.1.0', undefined),
          submittedItemRevisionStatus: revision(state, '1.2.0'),
        }),
      ).toStrictEqual({
        ok: true,
        value: { published: '1.1.0', pending: undefined },
      });
    }
  });

  test('a published submission counts as published, not pending', () => {
    for (const state of ['PUBLISHED', 'PUBLISHED_TO_TESTERS']) {
      expect(
        parseFetchStatus({
          ...statusBody('1.0.0', undefined),
          submittedItemRevisionStatus: revision(state, '1.1.0'),
        }),
      ).toStrictEqual({
        ok: true,
        value: { published: '1.1.0', pending: undefined },
      });
    }
  });

  test('a staged submission is pending', () => {
    expect(
      parseFetchStatus({
        submittedItemRevisionStatus: revision('STAGED', '1.1.0'),
      }),
    ).toStrictEqual({
      ok: true,
      value: { published: undefined, pending: '1.1.0' },
    });
  });

  test('an unspecified submission state is an error', () => {
    const parsed = parseFetchStatus({
      submittedItemRevisionStatus: revision('ITEM_STATE_UNSPECIFIED', '1.1.0'),
    });

    assert.isFalse(parsed.ok);

    expect(parsed.error).toContain('ITEM_STATE_UNSPECIFIED');
  });

  test('the newest channel is the version', () => {
    expect(
      parseFetchStatus({
        publishedItemRevisionStatus: {
          state: 'PUBLISHED',
          distributionChannels: [
            { crxVersion: '1.1.0' },
            { crxVersion: '1.0.9' },
          ],
        },
      }),
    ).toStrictEqual({
      ok: true,
      value: { published: '1.1.0', pending: undefined },
    });
  });

  test.each([
    [
      'a renamed version field',
      {
        publishedItemRevisionStatus: {
          state: 'PUBLISHED',
          distributionChannels: [{ version: '1.1.0' }],
        },
      },
      'publishedItemRevisionStatus.distributionChannels[0].crxVersion is missing',
    ],
    [
      'a missing state',
      {
        submittedItemRevisionStatus: {
          distributionChannels: [{ crxVersion: '1.1.0' }],
        },
      },
      'submittedItemRevisionStatus.state is missing',
    ],
    [
      'an unknown state',
      { submittedItemRevisionStatus: revision('IN_REVIEW', '1.1.0') },
      'submittedItemRevisionStatus.state is "IN_REVIEW"',
    ],
    [
      'no channels',
      {
        publishedItemRevisionStatus: {
          state: 'PUBLISHED',
          distributionChannels: [],
        },
      },
      'publishedItemRevisionStatus.distributionChannels is []',
    ],
  ] as const)('%s is an error that names the field', (_, body, message) => {
    const parsed = parseFetchStatus(body);

    assert.isFalse(parsed.ok);

    expect(parsed.error).toContain(message);
  });
});

describe(isExtensionDirectory, () => {
  test('agrees with isChromeExtension on every app', async () => {
    const appsDir = path.resolve(projectRootPath, 'apps');

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's apps/.
    const names = fs.readdirSync(appsDir);

    const apps = names.map((name) => `apps/${name}` as const);

    const extensions = apps.filter((app) =>
      isExtensionDirectory(path.resolve(projectRootPath, app)),
    );

    // An extension exists, so a reader that finds none fails here.
    assert.isNotEmpty(extensions);

    const judged = await Promise.all(
      apps.map(async (app) => ((await isChromeExtension(app)) ? app : '')),
    );

    expect(extensions).toStrictEqual(judged.filter((app) => app !== ''));
  });
});

describe(main, () => {
  let mut_root = '';

  beforeEach(() => {
    mut_root = fs.mkdtempSync(path.join(os.tmpdir(), 'submit-chrome-ext-'));

    writeFile(path.join(mut_root, 'ext', 'public', 'manifest.json'), '{}');

    writeFile(
      path.join(mut_root, 'ext', 'package.json'),
      JSON.stringify({ name: 'ext', version: '1.2.0' }),
    );

    writeFile(path.join(mut_root, 'ext-1.2.0.zip'), 'zip bytes');
  });

  afterEach(() => {
    fs.rmSync(mut_root, { recursive: true, force: true });
  });

  const argv = (...extra: readonly string[]): readonly string[] =>
    [
      'node',
      scriptPath,
      '--extension',
      path.join(mut_root, 'ext'),
      '--zip',
      path.join(mut_root, 'ext-1.2.0.zip'),
      '--publisher',
      'publisher',
      '--item',
      'item',
      ...extra,
    ] as const;

  test.each([
    ['submit', statusBody('1.1.0', undefined), 0],
    ['current', statusBody('1.2.0', undefined), 0],
    ['wait', statusBody('1.0.0', '1.1.0'), 0],
    ['refuse', statusBody('1.3.0', undefined), 1],
  ] as const)(
    '--dry-run prints %s and sends nothing',
    async (decision, status, exitCode) => {
      const store = fakeStore({ status });

      expect(await main(argv('--dry-run'), store.io)).toBe(exitCode);

      expect(store.log.join('\n')).toContain(`ext 1.2.0: ${decision}`);

      expect(store.requests).toStrictEqual(['GET fetchStatus']);
    },
  );

  test('--dry-run prints error for a status it cannot read', async () => {
    const store = fakeStore({ status: { publishedItemRevisionStatus: 1 } });

    expect(await main(argv('--dry-run'), store.io)).toBe(1);

    expect(store.errors.join('\n')).toContain(
      'error: publishedItemRevisionStatus is 1, not an object.',
    );
  });

  test('submit uploads and then publishes with DEFAULT_PUBLISH', async () => {
    const store = fakeStore({ status: statusBody('1.1.0', undefined) });

    expect(await main(argv(), store.io)).toBe(0);

    expect(store.requests).toStrictEqual([
      'GET fetchStatus',
      'POST upload',
      'POST publish {"publishType":"DEFAULT_PUBLISH"}',
    ]);

    expect(store.uploads).toStrictEqual(['zip bytes']);
  });

  test('an asynchronous upload is waited for before publishing', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      uploadState: 'IN_PROGRESS',
      laterUploadStates: ['IN_PROGRESS', 'SUCCEEDED'],
    });

    expect(await main(argv(), store.io)).toBe(0);

    expect(store.requests).toStrictEqual([
      'GET fetchStatus',
      'POST upload',
      'GET fetchStatus',
      'GET fetchStatus',
      'POST publish {"publishType":"DEFAULT_PUBLISH"}',
    ]);
  });

  test('a failed upload makes no publish and exits 1', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      uploadStatusCode: 400,
    });

    expect(await main(argv(), store.io)).toBe(1);

    expect(store.requests).toStrictEqual(['GET fetchStatus', 'POST upload']);

    expect(store.errors.join('\n')).toContain('upload answered 400');
  });

  test('an upload that ends FAILED makes no publish and exits 1', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      uploadState: 'FAILED',
    });

    expect(await main(argv(), store.io)).toBe(1);

    expect(store.requests).toStrictEqual(['GET fetchStatus', 'POST upload']);
  });

  test('a publish the store answers REJECTED exits 1', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      publishState: 'REJECTED',
    });

    expect(await main(argv(), store.io)).toBe(1);

    expect(store.errors.join('\n')).toContain('"REJECTED"');
  });

  test('an upload still in progress after ten checks exits 1', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      uploadState: 'IN_PROGRESS',
      laterUploadStates: Array.from({ length: 10 }, () => 'IN_PROGRESS'),
    });

    expect(await main(argv(), store.io)).toBe(1);

    expect(store.errors.join('\n')).toContain(
      'still IN_PROGRESS after ten checks',
    );

    expect(store.requests).not.toContain(
      'POST publish {"publishType":"DEFAULT_PUBLISH"}',
    );
  });

  test('a missing token exits 1 before any request', async () => {
    const store = fakeStore({
      status: statusBody('1.1.0', undefined),
      env: {},
    });

    expect(await main(argv('--dry-run'), store.io)).toBe(1);

    expect(store.requests).toStrictEqual([]);

    expect(store.errors.join('\n')).toContain('CHROME_WEB_STORE_TOKEN');
  });

  test('a directory without public/manifest.json is refused', async () => {
    fs.rmSync(path.join(mut_root, 'ext', 'public'), { recursive: true });

    const store = fakeStore({ status: statusBody('1.1.0', undefined) });

    expect(await main(argv('--dry-run'), store.io)).toBe(1);

    expect(store.requests).toStrictEqual([]);

    expect(store.errors.join('\n')).toContain('not a Chrome extension');
  });

  test('a zip of another version is refused', async () => {
    const store = fakeStore({ status: statusBody('1.1.0', undefined) });

    const args = argv('--dry-run').map((arg) =>
      arg.endsWith('ext-1.2.0.zip') ? arg.replace('1.2.0', '1.1.0') : arg,
    );

    expect(await main(args, store.io)).toBe(1);

    expect(store.requests).toStrictEqual([]);
  });
});

describe('under plain node', () => {
  test('loads, and exits 2 with the usage on a missing argument', async () => {
    const result = await runFile(process.execPath, [scriptPath, '--dry-run'], {
      env: { PATH: process.env['PATH'] ?? '' },
    });

    expect(result.status).toBe(2);

    expect(result.stderr).toContain('Usage: node submit-chrome-extension.mts');
  });
});

const writeFile = (file: string, text: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file under the test's temporary directory.
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file under the test's temporary directory.
  fs.writeFileSync(file, text);
};

const revision = (
  state: string,
  version: string,
): Readonly<{
  state: string;
  distributionChannels: readonly Readonly<{
    deployPercentage: number;
    crxVersion: string;
  }>[];
}> =>
  ({
    state,
    distributionChannels: [{ deployPercentage: 100, crxVersion: version }],
  }) as const;

/** The `fetchStatus` body as the API v2 documentation describes it. */
const statusBody = (
  published: string | undefined,
  pending: string | undefined,
): ReadonlyRecord<string, unknown> =>
  ({
    name: 'publishers/publisher/items/item',
    itemId: 'item',
    ...(published === undefined
      ? {}
      : { publishedItemRevisionStatus: revision('PUBLISHED', published) }),
    ...(pending === undefined
      ? {}
      : { submittedItemRevisionStatus: revision('PENDING_REVIEW', pending) }),
  }) as const;

const json = (body: unknown, code = 200): Response =>
  Response.json(body, { status: code });

const fakeStore = ({
  status,
  uploadState = 'SUCCEEDED',
  laterUploadStates = [],
  uploadStatusCode = 200,
  publishState = 'PENDING_REVIEW',
  env = { CHROME_WEB_STORE_TOKEN: 'token' },
}: Readonly<{
  status: ReadonlyRecord<string, unknown>;
  uploadState?: string;
  laterUploadStates?: readonly string[];
  uploadStatusCode?: number;
  publishState?: string;
  env?: CommandIo['env'];
}>): Readonly<{
  io: CommandIo;
  requests: readonly string[];
  uploads: readonly string[];
  log: readonly string[];
  errors: readonly string[];
}> => {
  const mut_requests: string[] = [];

  const mut_uploads: string[] = [];

  const mut_log: string[] = [];

  const mut_errors: string[] = [];

  let mut_statusCalls = 0;

  const answer = async (url: string, init: FetchInit): Promise<Response> => {
    expect(init.headers['authorization']).toBe('Bearer token');

    if (url.endsWith(':fetchStatus')) {
      mut_requests.push(`${init.method} fetchStatus`);

      const later = laterUploadStates[mut_statusCalls - 1];

      mut_statusCalls += 1;

      return json(
        later === undefined
          ? status
          : { ...status, lastAsyncUploadState: later },
      );
    }

    if (url.endsWith(':upload')) {
      mut_requests.push(`${init.method} upload`);

      assert.isTrue(url.includes('/upload/v2/'));

      assert.instanceOf(init.body, Blob);

      mut_uploads.push(await init.body.text());

      return json(
        { itemId: 'item', crxVersion: '1.2.0', uploadState },
        uploadStatusCode,
      );
    }

    if (url.endsWith(':publish')) {
      const body = typeof init.body === 'string' ? init.body : 'not a string';

      mut_requests.push(`${init.method} publish ${body}`);

      return json({ itemId: 'item', state: publishState });
    }

    throw new Error(`unexpected request ${url}`);
  };

  return {
    io: {
      env,
      fetch: answer,
      sleep: async () => {},
      log: (line) => {
        mut_log.push(line);
      },
      error: (line) => {
        mut_errors.push(line);
      },
    },
    requests: mut_requests,
    uploads: mut_uploads,
    log: mut_log,
    errors: mut_errors,
  };
};
