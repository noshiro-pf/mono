import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
// A top-level `import type`, which Node erases: see `mature-updates.mts`.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Decides whether a Chrome extension's `package.json` version still has to be
 * sent to the Chrome Web Store, and sends it when it does.
 *
 * ```sh
 * node ./tools/scripts/cmd/submit-chrome-extension.mts \
 *   --extension apps/github-view-defaults-extension \
 *   --zip apps/github-view-defaults-extension/pack/github-view-defaults-extension-0.4.13.zip \
 *   --publisher <publisher id> --item <item id> [--dry-run]
 * ```
 *
 * | decision  | meaning                                                        | exit |
 * | --------- | -------------------------------------------------------------- | ---- |
 * | `submit`  | the version is newer than the published and the pending one    | 0    |
 * | `current` | the store already has this version, published or in review     | 0    |
 * | `wait`    | an older version is in review; nothing is sent                 | 0    |
 * | `refuse`  | the store's version is newer than `package.json`'s             | 1    |
 * | `error`   | the status could not be read, or a response was not understood | 1    |
 *
 * `submit` uploads the zip `packExtensionZip`
 * (`tools/configs/chrome-extension-packaging.mts`) wrote and publishes it with
 * `DEFAULT_PUBLISH` — published once approved, never `skipReview` — unless
 * `--dry-run` is given. A version in review is not cancelled: the next run sends
 * the newer one once that review ends.
 *
 * **Authentication is not this command's.** It reads an OAuth access token for
 * the scope `https://www.googleapis.com/auth/chromewebstore` from
 * `CHROME_WEB_STORE_TOKEN`, put there by the workflow's auth step, and holds no
 * key. The publisher and item ids are not secret (the item's is in its store
 * URL), so they are arguments.
 *
 * **Run with `node`, not `tsx`.** The job that runs it holds the store's
 * credential and must not run the dependency tree's code ("Jobs that hold a
 * key", `.github/workflows/README.md`), so this imports only `node:*` at runtime
 * and uses only erasable syntax, as `mature-updates.mts` does.
 *
 * **The response shapes are the documentation's, not recorded ones** (API v2,
 * as read on 2026-09-28; #3944 records real `fetchStatus` responses). Each is
 * parsed strictly, and anything unexpected ends in `error` naming the field: a
 * wrong guess must fail, not submit.
 */
export const main = async (
  argv: readonly string[],
  io: CommandIo = defaultIo,
): Promise<number> => {
  try {
    return await run(argv, io);
  } catch (error) {
    io.error(`error: ${errorMessage(error)}`);

    return 1;
  }
};

/** What the store holds: the published version and the one in review. */
export type StoreVersions = Readonly<{
  published: string | undefined;
  pending: string | undefined;
}>;

export type Decision = 'submit' | 'current' | 'wait' | 'refuse';

/** The decision, as a function of the three versions alone. */
export const decideSubmission = (
  local: string,
  store: StoreVersions,
): Decision => {
  const newest = maxVersion(store.published, store.pending);

  return newest !== undefined && compareVersions(local, newest) < 0
    ? 'refuse'
    : newest !== undefined && compareVersions(local, newest) === 0
      ? 'current'
      : store.pending === undefined
        ? 'submit'
        : 'wait';
};

/**
 * Whether `version` is one a manifest may carry: one to four dot-separated
 * integers, each 0–65535 without a leading zero.
 */
export const isChromeVersion = (version: string): boolean => {
  const parts = version.split('.');

  return (
    parts.length <= 4 &&
    parts.every(
      (part) =>
        /^(?:0|[1-9]\d*)$/u.test(part) && compareDigits(part, '65535') <= 0,
    )
  );
};

/**
 * Compares two versions part by part as numbers, a missing part counting as 0,
 * so `0.10.0` is newer than `0.9.5`. Both must pass {@link isChromeVersion}.
 */
export const compareVersions = (a: string, b: string): number => {
  const as = a.split('.');

  const bs = b.split('.');

  for (const i of [0, 1, 2, 3] as const) {
    const order = compareDigits(as[i] ?? '0', bs[i] ?? '0');

    if (order !== 0) {
      return order;
    }
  }

  return 0;
};

/**
 * Reads a `fetchStatus` body: the newest `crxVersion` of the published revision
 * and of the submitted one. A submitted revision is pending while it is in
 * review or staged, counts as published once it is published, and is passed
 * over once rejected or cancelled; `ITEM_STATE_UNSPECIFIED` is an error, since
 * it says none of these.
 */
export const parseFetchStatus = (body: unknown): Parsed<StoreVersions> => {
  if (!isObject(body)) {
    return err('the fetchStatus response is not an object.');
  }

  const published = readRevision(body, 'publishedItemRevisionStatus');

  if (!published.ok) {
    return published;
  }

  const submitted = readRevision(body, 'submittedItemRevisionStatus');

  if (!submitted.ok) {
    return submitted;
  }

  const { value: submittedRevision } = submitted;

  if (submittedRevision?.state === 'ITEM_STATE_UNSPECIFIED') {
    return err(
      'submittedItemRevisionStatus.state is "ITEM_STATE_UNSPECIFIED", which says neither in review nor ended.',
    );
  }

  return ok({
    published: maxVersion(
      published.value?.version,
      submittedRevision !== undefined &&
        publishedStates.has(submittedRevision.state)
        ? submittedRevision.version
        : undefined,
    ),
    pending:
      submittedRevision !== undefined &&
      pendingStates.has(submittedRevision.state)
        ? submittedRevision.version
        : undefined,
  });
};

/**
 * Whether `directory` is a Chrome extension: one with `public/manifest.json`.
 * `isChromeExtension` in `tools/scripts/lib/chrome-extensions.mts` says the
 * same, and cannot be imported here (it is not loadable under plain `node`).
 */
export const isExtensionDirectory = (directory: string): boolean =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the directory the command was asked about.
  fs.existsSync(path.resolve(directory, 'public', 'manifest.json'));

/** What the command reaches outside itself, so that a test can stand in. */
export type CommandIo = Readonly<{
  fetch: (url: string, init: FetchInit) => Promise<Response>;
  env: Partial<ReadonlyRecord<string, string>>;
  sleep: (milliseconds: number) => Promise<void>;
  log: (line: string) => void;
  error: (line: string) => void;
}>;

export type FetchInit = Readonly<{
  method: 'GET' | 'POST';
  headers: ReadonlyRecord<string, string>;
  body?: string | Blob;
}>;

type Parsed<T> = Readonly<
  { ok: true; value: T } | { ok: false; error: string }
>;

type UploadState =
  | 'UPLOAD_STATE_UNSPECIFIED'
  | 'SUCCEEDED'
  | 'IN_PROGRESS'
  | 'FAILED'
  | 'NOT_FOUND';

type CommandLine = Readonly<{
  extension: string;
  zip: string;
  publisher: string;
  item: string;
  dryRun: boolean;
}>;

type StoreApi = Readonly<{
  fetchStatus: () => Promise<Parsed<StoreVersions>>;
  fetchUploadState: () => Promise<Parsed<UploadState>>;
  upload: (zipPath: string) => Promise<Parsed<unknown>>;
  publish: () => Promise<Parsed<unknown>>;
}>;

const usage =
  'Usage: node submit-chrome-extension.mts --extension <package dir> --zip <path> --publisher <id> --item <id> [--dry-run]';

const apiOrigin = 'https://chromewebstore.googleapis.com';

const uploadPollMilliseconds = 3000;

/** `ItemState`, as the documentation lists it. */
const itemStates: ReadonlySet<unknown> = new Set<unknown>([
  'ITEM_STATE_UNSPECIFIED',
  'PENDING_REVIEW',
  'STAGED',
  'PUBLISHED',
  'PUBLISHED_TO_TESTERS',
  'REJECTED',
  'CANCELLED',
]);

/** The item states of a revision waiting to be published. */
const pendingStates: ReadonlySet<string> = new Set<string>([
  'PENDING_REVIEW',
  'STAGED',
]);

/** The item states of a revision the store serves. */
const publishedStates: ReadonlySet<string> = new Set<string>([
  'PUBLISHED',
  'PUBLISHED_TO_TESTERS',
]);

const uploadStates: ReadonlySet<unknown> = new Set<UploadState>([
  'UPLOAD_STATE_UNSPECIFIED',
  'SUCCEEDED',
  'IN_PROGRESS',
  'FAILED',
  'NOT_FOUND',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ok = <T,>(value: T): Parsed<T> => ({ ok: true, value }) as const;

const err = (error: string): Readonly<{ ok: false; error: string }> =>
  ({ ok: false, error }) as const;

const isObject = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const describe = (value: unknown): string =>
  value === undefined ? 'missing' : JSON.stringify(value);

const errorMessage = (error: unknown): string =>
  isObject(error) && typeof error['message'] === 'string'
    ? error['message']
    : describe(error);

/** Digit strings without leading zeros, compared as numbers. */
const compareDigits = (a: string, b: string): number =>
  a.length !== b.length ? a.length - b.length : a < b ? -1 : a > b ? 1 : 0;

const maxVersion = (
  a: string | undefined,
  b: string | undefined,
): string | undefined =>
  a === undefined ? b : b === undefined || compareVersions(a, b) >= 0 ? a : b;

const isUploadState = (value: unknown): value is UploadState =>
  uploadStates.has(value);

const isItemState = (value: unknown): value is string =>
  typeof value === 'string' && itemStates.has(value);

const parseUploadState = (
  body: unknown,
  field: 'lastAsyncUploadState' | 'uploadState',
): Parsed<UploadState> => {
  const state = isObject(body) ? body[field] : undefined;

  return isUploadState(state)
    ? ok(state)
    : err(`${field} is ${describe(state)}, not an upload state.`);
};

/** A revision status: its state and the newest `crxVersion` of its channels. */
const readRevision = (
  body: ReadonlyRecord<string, unknown>,
  field: 'publishedItemRevisionStatus' | 'submittedItemRevisionStatus',
): Parsed<Readonly<{ state: string; version: string }> | undefined> => {
  const revision = body[field];

  if (revision === undefined) {
    return ok(undefined);
  }

  if (!isObject(revision)) {
    return err(`${field} is ${describe(revision)}, not an object.`);
  }

  const state = revision['state'];

  if (!isItemState(state)) {
    return err(`${field}.state is ${describe(state)}, not an item state.`);
  }

  const channels = revision['distributionChannels'];

  if (!Array.isArray(channels) || channels.length === 0) {
    return err(
      `${field}.distributionChannels is ${describe(channels)}, not a non-empty array.`,
    );
  }

  let mut_newest: string | undefined = undefined;

  for (const [i, channel] of channels.entries()) {
    const version: unknown = isObject(channel)
      ? channel['crxVersion']
      : undefined;

    if (typeof version !== 'string' || !isChromeVersion(version)) {
      return err(
        `${field}.distributionChannels[${i.toString()}].crxVersion is ${describe(version)}, not a version.`,
      );
    }

    mut_newest = maxVersion(mut_newest, version);
  }

  return mut_newest === undefined
    ? err(`${field} has no version.`)
    : ok({ state, version: mut_newest });
};

const storeApi = ({
  io,
  token,
  publisher,
  item,
}: Readonly<{
  io: CommandIo;
  token: string;
  publisher: string;
  item: string;
}>): StoreApi => {
  // Both ids passed `isId`, so they need no escaping.
  const itemPath = `publishers/${publisher}/items/${item}` as const;

  const request = async (
    name: string,
    url: string,
    init: Readonly<{
      method: 'GET' | 'POST';
      body?: string | Blob;
      contentType?: string;
    }>,
  ): Promise<Parsed<unknown>> => {
    const response = await io.fetch(url, {
      method: init.method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(init.contentType === undefined
          ? {}
          : { 'content-type': init.contentType }),
      },
      ...(init.body === undefined ? {} : { body: init.body }),
    });

    const text = await response.text();

    if (!response.ok) {
      return err(
        `${name} answered ${response.status.toString()}: ${text.slice(0, 500)}`,
      );
    }

    try {
      return ok(JSON.parse(text));
    } catch {
      return err(`${name} answered with a body that is not JSON.`);
    }
  };

  const fetchStatusBody = async (): Promise<Parsed<unknown>> =>
    request('fetchStatus', `${apiOrigin}/v2/${itemPath}:fetchStatus`, {
      method: 'GET',
    });

  return {
    fetchStatus: async () => {
      const body = await fetchStatusBody();

      return body.ok ? parseFetchStatus(body.value) : body;
    },

    fetchUploadState: async () => {
      const body = await fetchStatusBody();

      return body.ok
        ? parseUploadState(body.value, 'lastAsyncUploadState')
        : body;
    },

    upload: async (zipPath) =>
      request('upload', `${apiOrigin}/upload/v2/${itemPath}:upload`, {
        method: 'POST',
        body: await fs.openAsBlob(zipPath),
        contentType: 'application/zip',
      }),

    publish: async () =>
      request('publish', `${apiOrigin}/v2/${itemPath}:publish`, {
        method: 'POST',
        body: JSON.stringify({ publishType: 'DEFAULT_PUBLISH' }),
        contentType: 'application/json',
      }),
  };
};

/** Polls `lastAsyncUploadState` until the upload has ended, ten times at most. */
const waitForUpload = async (
  api: StoreApi,
  first: Parsed<UploadState>,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<Parsed<undefined>> => {
  let mut_state = first;

  for (const attempt of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const) {
    if (!mut_state.ok) {
      return mut_state;
    }

    if (mut_state.value === 'SUCCEEDED') {
      return ok(undefined);
    }

    if (attempt === 11 || mut_state.value !== 'IN_PROGRESS') {
      return err(
        mut_state.value === 'IN_PROGRESS'
          ? 'the upload was still IN_PROGRESS after ten checks.'
          : `the upload ended as ${mut_state.value}.`,
      );
    }

    await sleep(uploadPollMilliseconds * attempt);

    mut_state = await api.fetchUploadState();
  }

  return err('the upload was not waited for.');
};

/** Uploads, waits for an asynchronous upload, then publishes. */
const submit = async ({
  api,
  zipPath,
  version,
  sleep,
}: Readonly<{
  api: StoreApi;
  zipPath: string;
  version: string;
  sleep: (milliseconds: number) => Promise<void>;
}>): Promise<Parsed<string>> => {
  const uploaded = await api.upload(zipPath);

  if (!uploaded.ok) {
    return uploaded;
  }

  const uploadVersion = isObject(uploaded.value)
    ? uploaded.value['crxVersion']
    : undefined;

  if (uploadVersion !== undefined && uploadVersion !== version) {
    return err(
      `upload's crxVersion is ${describe(uploadVersion)}, not ${version}.`,
    );
  }

  const settled = await waitForUpload(
    api,
    parseUploadState(uploaded.value, 'uploadState'),
    sleep,
  );

  if (!settled.ok) {
    return settled;
  }

  const published = await api.publish();

  if (!published.ok) {
    return published;
  }

  const state = isObject(published.value)
    ? published.value['state']
    : undefined;

  // Rejected, cancelled or unspecified is not a submission, whatever the status.
  return typeof state === 'string' &&
    (pendingStates.has(state) || publishedStates.has(state))
    ? ok(state)
    : err(
        `publish's state is ${describe(state)}, not one of a submitted or published item.`,
      );
};

/** A store id: letters, digits, `-` and `_`, so it goes into a path as is. */
const isId = (id: string): boolean => /^[\w-]+$/u.test(id);

const parseCommandLine = (argv: readonly string[]): CommandLine | string => {
  try {
    const { values } = util.parseArgs({
      args: argv.slice(2),
      options: {
        extension: { type: 'string' },
        zip: { type: 'string' },
        publisher: { type: 'string' },
        item: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
      },
      strict: true,
      allowPositionals: false,
    });

    const { extension, zip, publisher, item } = values;

    if (
      extension === undefined ||
      zip === undefined ||
      publisher === undefined ||
      item === undefined
    ) {
      return 'error: --extension, --zip, --publisher and --item are required.';
    }

    return !isId(publisher) || !isId(item)
      ? 'error: --publisher and --item take an id of letters, digits, - and _.'
      : { extension, zip, publisher, item, dryRun: values['dry-run'] };
  } catch (error) {
    return `error: ${errorMessage(error)}`;
  }
};

const readJson = (file: string): Parsed<unknown> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file of the extension the command was asked about.
    return ok(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (error) {
    return err(`${file} could not be read: ${errorMessage(error)}`);
  }
};

/**
 * The extension's name and version, after checking that the directory is an
 * extension and that the zip is the one `packExtensionZip` names after them.
 */
const readLocalExtension = (
  extension: string,
  zip: string,
): Parsed<Readonly<{ name: string; version: string }>> => {
  if (!isExtensionDirectory(extension)) {
    return err(
      `${extension} has no public/manifest.json, so it is not a Chrome extension.`,
    );
  }

  const manifest = readJson(path.resolve(extension, 'package.json'));

  if (!manifest.ok) {
    return manifest;
  }

  const name = isObject(manifest.value) ? manifest.value['name'] : undefined;

  const version = isObject(manifest.value)
    ? manifest.value['version']
    : undefined;

  if (typeof name !== 'string' || typeof version !== 'string') {
    return err(`${extension}/package.json has no string name and version.`);
  }

  if (!isChromeVersion(version)) {
    return err(
      `${extension}/package.json's version ${version} is not one a Chrome manifest may carry.`,
    );
  }

  // A zip of another version would be uploaded as this one.
  if (path.basename(zip) !== `${name}-${version}.zip`) {
    return err(
      `${zip} is not ${name}-${version}.zip, the zip pack writes for this version.`,
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the zip the command was given.
  return !fs.existsSync(zip)
    ? err(`${zip} does not exist; run the extension's pack script first.`)
    : ok({ name, version });
};

const run = async (argv: readonly string[], io: CommandIo): Promise<number> => {
  const args = parseCommandLine(argv);

  if (typeof args === 'string') {
    io.error(`${args}\n${usage}`);

    return 2;
  }

  const local = readLocalExtension(args.extension, args.zip);

  if (!local.ok) {
    io.error(`error: ${local.error}`);

    return 1;
  }

  const { name, version } = local.value;

  const token = io.env['CHROME_WEB_STORE_TOKEN'];

  if (token === undefined || token === '') {
    io.error('error: CHROME_WEB_STORE_TOKEN is not set.');

    return 1;
  }

  const api = storeApi({
    io,
    token,
    publisher: args.publisher,
    item: args.item,
  });

  const status = await api.fetchStatus();

  if (!status.ok) {
    io.error(`error: ${status.error}`);

    return 1;
  }

  const decision = decideSubmission(version, status.value);

  io.log(
    `${name} ${version}: ${decision} (published ${status.value.published ?? 'none'}, pending ${status.value.pending ?? 'none'})`,
  );

  switch (decision) {
    case 'current':
    case 'wait':
      return 0;

    case 'refuse':
      io.error(
        `error: the store has a newer version than package.json's ${version}.`,
      );

      return 1;

    case 'submit': {
      if (args.dryRun) {
        io.log('--dry-run: nothing sent.');

        return 0;
      }

      const submitted = await submit({
        api,
        zipPath: args.zip,
        version,
        sleep: io.sleep,
      });

      if (!submitted.ok) {
        io.error(`error: ${submitted.error}`);

        return 1;
      }

      io.log(`Submitted ${version}; the store says ${submitted.value}.`);

      return 0;
    }
  }
};

const defaultIo: CommandIo = {
  fetch: async (url, init) => fetch(url, init),
  env: process.env,
  sleep: async (milliseconds) =>
    new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    }),
  log: (line) => {
    console.log(line);
  },
  error: (line) => {
    console.error(line);
  },
} as const;

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: this runs where no
 * package may be loaded (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  process.exit(await main(process.argv));
}
