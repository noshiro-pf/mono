/**
 * Where the two payloads live, which is the whole of what the writers and the
 * reader have to agree about.
 *
 * **A branch each, holding one JSON file, force-pushed as a single orphan
 * commit.** Not an issue, which is what this used to be: an issue is a thing
 * people read and subscribe to, and a repository that uses two of them as a
 * database has two fewer issues for what issues are for. Not a release, which
 * would put machine output at the top of a page this repository publishes npm
 * packages from. Not a Project and not the wiki, which cannot be read from a
 * browser at all — the wiki has no REST API, and the GraphQL that Projects
 * requires refuses an anonymous caller outright, which would have made the
 * page's optional token mandatory.
 *
 * **One writer each, which is why there are two branches rather than one.**
 * `pr-report.yml` writes the report from a workflow; `unblock-prs` writes the
 * log from somebody's terminal. Each force-pushes a fresh orphan commit, so
 * its branch is one commit holding one file and the repository does not grow
 * a history of every report it has ever produced. Two writers doing that to
 * one branch would delete each other's file.
 *
 * **The reader reads the contents API, and it behaves the way the page
 * needs**, all measured from a `noshiro-pf.github.io` origin: the answer
 * carries `Access-Control-Allow-Origin` and exposes `ETag` and the
 * `X-RateLimit-*` headers to scripts, `If-None-Match` gets a `304` that does
 * the same, and `?ref=` takes a branch. The `ETag` is the blob's SHA, so it
 * changes exactly when the file's content does. Its `Cache-Control` is
 * `max-age=60`, which is what the issues it replaces sent too.
 *
 * Nothing watches these branches: every `push:` trigger in
 * `.github/workflows/` names `main`, and the rulesets under `repo-settings/`
 * cover `main` and `archive/**`. A push here starts nothing and is refused by
 * nothing.
 */

/** Written by `.github/workflows/pr-report.yml`. */
export const REPORT_BRANCH = 'data/pr-report';

export const REPORT_PATH = 'pr-report.json';

/** Written by `pnpm run unblock-prs`, on the machine it is run from. */
export const RUN_LOG_BRANCH = 'data/unblock-prs-log';

export const RUN_LOG_PATH = 'unblock-prs-log.json';

export type DataFile = Readonly<{ branch: string; path: string }>;

export const REPORT_FILE: DataFile = {
  branch: REPORT_BRANCH,
  path: REPORT_PATH,
} as const;

export const RUN_LOG_FILE: DataFile = {
  branch: RUN_LOG_BRANCH,
  path: RUN_LOG_PATH,
} as const;

/**
 * Where to ask GitHub for one of them.
 *
 * `vnd.github.raw` rather than the default, which answers a JSON envelope
 * with the file base64 inside it: the envelope is bigger than the file, and
 * decoding base64 in a browser to reach JSON is two steps where there can be
 * one. The `ETag` is the same either way.
 */
export const contentsRoute = (
  apiRoot: string,
  owner: string,
  repo: string,
  file: DataFile,
): string => {
  const query = new URLSearchParams({ ref: file.branch });

  return `${apiRoot}/repos/${owner}/${repo}/contents/${file.path}?${query.toString()}`;
};

/** Where a person can go and look at it, which is what a 404 should offer. */
export const browseUrl = (
  owner: string,
  repo: string,
  file: DataFile,
): string =>
  `https://github.com/${owner}/${repo}/blob/${file.branch}/${file.path}`;
