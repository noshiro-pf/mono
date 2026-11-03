/**
 * The last whole report of a repository, kept in the page's IndexedDB database
 * (`settings-db.mts`) for the next tab to show while it reads its own
 * (`ReportCache` in `store/reader.mts`).
 *
 * **Kept per build.** The report is the page's own shape, not GitHub's, and
 * nothing validates it on the way back: a report kept by another build of the
 * page is not read at all, rather than drawn by code that expects another
 * shape. `build` names the sources the build was made from
 * (`PR_MANAGER_BUILD_ID`, which the Vite config writes in), so a deploy that
 * changes them forgets every report kept before it.
 *
 * **Kept per token.** A report is what one token could read, and another token
 * — another account, with less access — is not shown it. The token itself is
 * not kept: a SHA-256 of it is, which is enough to tell it from another and
 * nothing to read with. This holds across tabs, which share the database but
 * not their tokens: a tab still reading with a token replaced in another can
 * write its report, but not have it shown to the new one.
 *
 * Every function here settles, whatever IndexedDB does: a browser that has none
 * or refuses it (a private window can) keeps nothing, which is a page that
 * waits for its first read as it did before.
 */

import { isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReportSource } from './constants.mjs';
import type { LoadedReport } from './load-report.mjs';

export const createReportCache = ({
  source,
  build,
  read,
  write,
  fingerprint = sha256,
}: ReportCacheDeps): ReportCache => {
  const key = reportCacheKey(source);

  /**
   * Every write, chained in the order `save` and `clear` were called, and a
   * `save` dropped once a later call supersedes it: a `save` still hashing its
   * token when `clear` is called would otherwise write after it, and keep the
   * report `clear` was there to forget.
   */
  const mut_writes = { last: Promise.resolve(), calls: 0 };

  const enqueue = (next: () => Promise<void>): void => {
    mut_writes.calls += 1;

    mut_writes.last = mut_writes.last.then(next).catch(() => undefined);
  };

  return {
    load: async (token) => {
      const [kept, tokenHash] = await Promise.all([
        read(key).catch(() => undefined),
        fingerprint(token),
      ]);

      return tokenHash !== undefined && isKeptBy(build, tokenHash, kept)
        ? kept.report
        : undefined;
    },
    save: (report, token) => {
      const hashed = fingerprint(token).catch(() => undefined);

      const call = mut_writes.calls + 1;

      enqueue(async () => {
        const tokenHash = await hashed;

        if (tokenHash !== undefined && call === mut_writes.calls) {
          await write(key, { build, tokenHash, report } satisfies Kept);
        }
      });
    },
    clear: () => {
      enqueue(() => write(key, undefined));
    },
  };
};

/** One key per repository, as GitHub matches names: whatever the case. */
export const reportCacheKey = ({ owner, repo }: ReportSource): string =>
  `report:${owner}/${repo}`.toLowerCase();

export type ReportCache = Readonly<{
  /**
   * The report kept for `token`, or `undefined` where none is, or none this
   * build reads.
   */
  load: (token: string) => Promise<LoadedReport | undefined>;
  /** Keeps `report`, read with `token`. */
  save: (report: LoadedReport, token: string) => void;
  clear: () => void;
}>;

export type ReportCacheDeps = Readonly<{
  source: ReportSource;
  build: string;
  read: (key: string) => Promise<unknown>;
  write: (key: string, value: unknown) => Promise<void>;
  /**
   * What a token is kept as, or `undefined` where it cannot be hashed; the
   * SHA-256 of it unless a test holds it open.
   */
  fingerprint?: (token: string) => Promise<string | undefined>;
}>;

type Kept = Readonly<{
  build: string;
  tokenHash: string;
  report: LoadedReport;
}>;

/**
 * The SHA-256 of `token`, in hex; `undefined` where the browser will not hash
 * (a page served over plain HTTP has no `crypto.subtle`).
 */
const sha256 = async (token: string): Promise<string | undefined> => {
  try {
    const encoder = new TextEncoder();

    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));

    return Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
  } catch {
    return undefined;
  }
};

/**
 * What is kept, as far as it is checked: the report itself is trusted as the
 * shape it was written in, which is the build's that `build` names.
 */
const KeptSchema = t.record({
  build: t.string(),
  tokenHash: t.string(),
  report: t.unknown(),
});

/** Whether `value` is what this build kept for the token hashed to `tokenHash`. */
const isKeptBy = (
  build: string,
  tokenHash: string,
  value: unknown,
): value is Kept => {
  const validated = KeptSchema.validate(value);

  return (
    Result.isOk(validated) &&
    validated.value.build === build &&
    validated.value.tokenHash === tokenHash &&
    isRecord(validated.value.report)
  );
};
