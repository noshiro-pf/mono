/**
 * Which repository a command acts on (`spec/commands.md`): `--repo`, else
 * `origin`, else the root `package.json`. `origin` before the manifest, because
 * a fork's checkout names the fork there and the upstream in the manifest; the
 * manifest is for a checkout whose `origin` names no GitHub repository, such as
 * a container's proxy remote.
 */

import type { RepoRef } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';

/** `owner/name`, as `--repo` takes it. */
export const parseRepoRef = (raw: string): Result<RepoRef, string> => {
  const match = REPO_REF.exec(raw.trim());

  const owner = match?.groups?.['owner'];

  const name = match?.groups?.['name'];

  return owner === undefined ||
    name === undefined ||
    !isSegment(owner) ||
    !isSegment(name)
    ? Result.err(`--repo must be owner/name, got ${JSON.stringify(raw)}`)
    : Result.ok({ owner, name });
};

/**
 * The GitHub repository a remote URL names, in any of the forms git writes:
 * `https://github.com/o/n(.git)` with or without credentials before the host,
 * `git@github.com:o/n(.git)` with any user or none, `ssh://git@github.com/o/n(.git)`, and
 * `git+https://…` as a manifest writes it. Any other host names none.
 */
export const repoOfUrl = (url: string): RepoRef | undefined => {
  const trimmed = url.trim();

  // `git@github.com:o/n`, the form `git clone` over SSH writes, with any user
  // (an organization's SSH certificate names its own) or none.
  const withoutUser = trimmed.replace(/^[\w.-]+@/u, '');

  const path = withoutUser.toLowerCase().startsWith(SCP_HOST)
    ? withoutUser.slice(SCP_HOST.length)
    : pathOnGitHub(trimmed.replace(/^git\+/u, ''));

  if (path === undefined) {
    return undefined;
  }

  const parts = path
    .replace(/\/$/u, '')
    .replace(/\.git$/u, '')
    .split('/');

  if (!Arr.isFixedLengthArray(2, parts)) {
    return undefined;
  }

  const [owner, name] = parts;

  return isSegment(owner) && isSegment(name) ? { owner, name } : undefined;
};

/**
 * The repository, from the first of the three that names one. The two read from
 * disk are passed in as thunks, so that neither is read when `--repo` is given.
 */
export const resolveRepo = async (
  option: string | undefined,
  sources: Readonly<{
    originUrl: () => Promise<string | undefined>;
    manifestUrl: () => Promise<string | undefined>;
  }>,
): Promise<Result<RepoRef, string>> => {
  if (option !== undefined) {
    return parseRepoRef(option);
  }

  const origin = await sources.originUrl();

  const fromOrigin = origin === undefined ? undefined : repoOfUrl(origin);

  if (fromOrigin !== undefined) {
    return Result.ok(fromOrigin);
  }

  const manifest = await sources.manifestUrl();

  const fromManifest = manifest === undefined ? undefined : repoOfUrl(manifest);

  return fromManifest === undefined
    ? Result.err(
        'cannot tell which repository this is: origin is not a GitHub remote, and the root package.json names none; pass --repo owner/name',
      )
    : Result.ok(fromManifest);
};

const REPO_REF = /^(?<owner>[\w.-]+)\/(?<name>[\w.-]+)$/u;

const SEGMENT = /^[\w.-]+$/u;

const SCP_HOST = 'github.com:';

const SCHEMES: ReadonlySet<string> = new Set<string>([
  'https:',
  'http:',
  'ssh:',
  'git:',
]);

/**
 * An owner or a name: `.` and `..` are not, because a URL would resolve them to
 * another path.
 */
const isSegment = (segment: string): boolean =>
  SEGMENT.test(segment) && segment !== '.' && segment !== '..';

/** The path of a URL on github.com, whatever credentials it carries. */
const pathOnGitHub = (url: string): string | undefined => {
  const parsed = Result.fromThrowable(() => new URL(url));

  return Result.isOk(parsed) &&
    SCHEMES.has(parsed.value.protocol) &&
    parsed.value.hostname === 'github.com'
    ? parsed.value.pathname.replace(/^\//u, '')
    : undefined;
};
