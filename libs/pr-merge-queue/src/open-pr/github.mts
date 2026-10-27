/** Everything that talks to GitHub or to `git`, and nothing that decides. */

import dedent from 'dedent';
import {
  BLOCKS_RELEASE_LABEL,
  closingKeywordIssuesIn,
  inheritStartAfter,
  isSafeRefName,
  isVersionBranch,
  parseMergeAfter,
  waitsFor,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  git,
  graphql,
  resolveRepo,
  resolveToken,
  rest,
  sh,
  type ApiContext,
} from '../lib/index.mjs';
import {
  PullRequestListResponseSchema,
  PullRequestResponseSchema,
  toPullRequest,
  type PullRequest,
} from './types.mjs';

/**
 * There is a credential and a repository to use it on, and the branch about
 * to be pushed is not the branch everything targets.
 */
export const preflight = async (): Promise<
  Result<
    Readonly<{ api: ApiContext; branch: string; defaultBranch: string }>,
    string
  >
> => {
  const token = await resolveToken();

  if (Result.isErr(token)) {
    return token;
  }

  const repo = await resolveRepo();

  if (Result.isErr(repo)) {
    return repo;
  }

  const api: ApiContext = { repo: repo.value, token: token.value } as const;

  const branch = await readRefName('git rev-parse --abbrev-ref HEAD');

  if (Result.isErr(branch)) {
    return branch;
  }

  if (branch.value === 'HEAD') {
    return Result.err('HEAD is detached; check a branch out first');
  }

  const repository = await rest(
    api,
    'GET',
    '',
    t.record({ default_branch: t.string() }),
  );

  if (Result.isErr(repository)) {
    return Result.err(`cannot read the repository: ${repository.value}`);
  }

  const defaultBranch = repository.value.default_branch;

  if (branch.value === defaultBranch) {
    return Result.err(
      `the current branch is ${branch.value}, which is what pull requests target; make a branch first`,
    );
  }

  return Result.ok({ api, branch: branch.value, defaultBranch });
};

/** The subject of the branch tip, which is the default pull request title. */
export const lastCommitSubject = async (): Promise<Result<string, string>> => {
  const subject = await git('git log -1 --format=%s');

  if (Result.isErr(subject)) {
    return subject;
  }

  const trimmed = subject.value.trim();

  return trimmed === ''
    ? Result.err('the branch tip has no commit subject to use as a title')
    : Result.ok(trimmed);
};

/** Pushes and sets the upstream, so the branch exists to open against. */
export const pushBranch = async (
  branch: string,
): Promise<Result<undefined, string>> => {
  const pushed = await git(`git push -u origin ${sh(branch)}`);

  return Result.isErr(pushed) ? pushed : Result.ok(undefined);
};

/**
 * The open pull request for this branch, or `undefined`.
 *
 * `head` is qualified with the owner. A bare branch name matches the same
 * name on a fork, and this command must not mistake someone else's pull
 * request for its own.
 */
export const findOpenPullRequest = async (
  api: ApiContext,
  branch: string,
): Promise<Result<PullRequest | undefined, string>> => {
  const listed = await rest(
    api,
    'GET',
    '/pulls',
    PullRequestListResponseSchema,
    {
      query: {
        state: 'open',
        per_page: '1',
        head: `${api.repo.owner}:${branch}`,
      },
    },
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const [found] = listed.value;

  // `noUncheckedIndexedAccess` makes this `… | undefined`, which is the
  // answer: there is one open pull request for the branch, or none.
  return Result.ok(found === undefined ? undefined : toPullRequest(found));
};

/**
 * The open pull request whose branch `base` is, when a new one is to be
 * stacked on it: exactly one, from this repository. Anything else is not a
 * stack `unblock-prs` or the reports would recognize, and is refused rather
 * than opened.
 */
export const findStackParent = async (
  api: ApiContext,
  base: string,
): Promise<Result<number, string>> => {
  const listed = await rest(
    api,
    'GET',
    '/pulls',
    PullRequestListResponseSchema,
    {
      query: {
        state: 'open',
        per_page: '2',
        head: `${api.repo.owner}:${base}`,
      },
    },
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const [parent, second] = listed.value;

  return parent === undefined
    ? Result.err(
        `${base} is neither the default branch nor the branch of an open pull request; a stacked pull request targets the branch of the one below it`,
      )
    : second === undefined
      ? Result.ok(parent.number)
      : Result.err(
          `${base} is the branch of more than one open pull request (#${parent.number}, #${second.number}), so which one this is stacked on cannot be told`,
        );
};

/**
 * Whether the branch contains the tip of `base`, as a layer stacked on it
 * has to: one that does not shows the layer below's old commits in its diff.
 */
export const containsBase = async (
  base: string,
): Promise<Result<undefined, string>> => {
  const fetched = await git(
    `git fetch --quiet origin ${sh(`+refs/heads/${base}:refs/remotes/origin/${base}`)}`,
  );

  if (Result.isErr(fetched)) {
    return Result.err(`cannot fetch ${base}: ${fetched.value}`);
  }

  const contained = await git(
    `git merge-base --is-ancestor ${sh(`origin/${base}`)} HEAD`,
  );

  return Result.isErr(contained)
    ? Result.err(
        `the branch does not contain the tip of ${base}; rebase it onto origin/${base} first, or its diff will carry that layer's old commits`,
      )
    : Result.ok(undefined);
};

export const viewPullRequest = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await rest(
    api,
    'GET',
    `/pulls/${prNumber}`,
    PullRequestResponseSchema,
  );

  return Result.isErr(viewed) ? viewed : Result.ok(toPullRequest(viewed.value));
};

/**
 * Creates it ready for review — never a draft, because `unblock-prs` passes a
 * draft over, and queueing a pull request is meant to be `merge-queued` and
 * nothing else.
 */
export const createPullRequest = async ({
  api,
  branch,
  base,
  title,
  body,
}: Readonly<{
  api: ApiContext;
  branch: string;
  base: string;
  title: string;
  body: string;
}>): Promise<Result<number, string>> => {
  const created = await rest(
    api,
    'POST',
    '/pulls',
    t.record({ number: t.number() }),
    { body: { head: branch, base, title, body, draft: false } },
  );

  return Result.isErr(created) ? created : Result.ok(created.value.number);
};

/**
 * What the issues the pull request closes start after, as open pull
 * requests it should merge after (`pr-report-core`'s `inheritStartAfter`),
 * less what its body or `alsoDeclared` — the layer it is stacked on — already
 * says. The readers derive the same each time they read, so this is the
 * body stating it, as it states a stack.
 *
 * Closing issues are read from the keywords GitHub marked in the body, which
 * it marks whatever the base; one linked by hand in the sidebar is not seen.
 */
export const missingInheritedOrder = async (
  api: ApiContext,
  prNumber: number,
  alsoDeclared: readonly number[],
): Promise<
  Result<Readonly<{ body: string; missing: readonly number[] }>, string>
> => {
  const viewed = await rest(api, 'GET', `/pulls/${prNumber}`, BodiesSchema, {
    withBodyHtml: true,
  });

  if (Result.isErr(viewed)) {
    return viewed;
  }

  const body = viewed.value.body ?? '';

  const closes = closingKeywordIssuesIn(api.repo, viewed.value.body_html ?? '');

  const mut_startAfter = new Map<number, readonly number[]>();

  for (const issue of closes) {
    const read = await rest(api, 'GET', `/issues/${issue}`, IssueSchema);

    if (Result.isErr(read)) {
      return read;
    }

    // A closed issue holds nothing, and a pull request declares no start.
    if (read.value.state !== 'open' || read.value.pull_request !== undefined) {
      continue;
    }

    const blockedBy = await blockedByOf(api, issue, read.value);

    if (Result.isErr(blockedBy)) {
      return blockedBy;
    }

    mut_startAfter.set(issue, waitsFor(read.value.body ?? '', blockedBy.value));
  }

  if (!Array.from(mut_startAfter.values()).some(Arr.isNonEmpty)) {
    return Result.ok({ body, missing: [] });
  }

  const open = await rest(api, 'GET', '/pulls', BodiesListSchema, {
    query: { state: 'open', per_page: '100' },
    withBodyHtml: true,
  });

  if (Result.isErr(open)) {
    return open;
  }

  const others = open.value.filter(({ number }) => number !== prNumber);

  const inherited = inheritStartAfter({
    pulls: Arr.toUnshifted({
      number: prNumber,
      closes: Array.from(mut_startAfter.keys()),
    })(
      others.map(({ number, body_html: html }) => ({
        number,
        closes: closingKeywordIssuesIn(api.repo, html ?? ''),
      })),
    ),
    startAfterOf: mut_startAfter,
    openIssues: new Set<number>(),
  });

  const declared = new Set(parseMergeAfter(body).concat(alsoDeclared));

  return Result.ok({
    body,
    missing: (inherited.get(prNumber)?.mergeAfter ?? []).filter(
      (number) => !declared.has(number),
    ),
  });
};

/**
 * The body of `prNumber`, to have a `Merge-After:` written into it for
 * `--merge-before`: an open pull request, and not the version pull request,
 * whose body `changesets/action` rewrites on every push to the default
 * branch — `blocks-release`, on this one, is how the release is held.
 */
export const readSuccessor = async (
  api: ApiContext,
  prNumber: number,
  defaultBranch: string,
): Promise<Result<string, string>> => {
  const read = await rest(api, 'GET', `/pulls/${prNumber}`, SuccessorSchema);

  if (Result.isErr(read)) {
    return Result.err(`cannot read #${prNumber}: ${read.value}`);
  }

  const { state, body, head } = read.value;

  return state !== 'open'
    ? Result.err(
        `#${prNumber} is ${state}; --merge-before names an open pull request`,
      )
    : isVersionBranch(head.ref, defaultBranch)
      ? Result.err(
          `#${prNumber} is the version pull request, whose body is rewritten on every push; label this one ${BLOCKS_RELEASE_LABEL} instead`,
        )
      : Result.ok(body ?? '');
};

const SuccessorSchema = t.record({
  state: t.string(),
  body: t.union([t.string(), t.nullType]),
  head: t.record({ ref: t.string() }),
});

export const updateBody = async (
  api: ApiContext,
  prNumber: number,
  body: string,
): Promise<Result<undefined, string>> => {
  const updated = await rest(api, 'PATCH', `/pulls/${prNumber}`, t.unknown(), {
    body: { body },
  });

  return Result.isErr(updated) ? updated : Result.ok(undefined);
};

const BodiesSchema = t.record({
  number: t.number(),
  body: t.union([t.string(), t.nullType]),
  body_html: t.optional(t.union([t.string(), t.nullType])),
});

const BodiesListSchema = t.array(BodiesSchema);

/** An issue, or a pull request, which the issues route answers for too. */
const IssueSchema = t.record({
  state: t.string(),
  body: t.union([t.string(), t.nullType]),
  pull_request: t.optional(t.record({})),
  /** How many issues block it; absent where GitHub does not send it. */
  issue_dependencies_summary: t.optional(
    t.record({ total_blocked_by: t.number() }),
  ),
});

/**
 * This repository's issues GitHub records as blocking `issue`, read as its
 * `Start-After:` is (`waitsFor`); asked only when its summary says there are
 * any.
 */
const blockedByOf = async (
  api: ApiContext,
  issue: number,
  read: t.TypeOf<typeof IssueSchema>,
): Promise<Result<readonly number[], string>> => {
  if ((read.issue_dependencies_summary?.total_blocked_by ?? 0) === 0) {
    return Result.ok([]);
  }

  const listed = await rest(
    api,
    'GET',
    `/issues/${issue}/dependencies/blocked_by`,
    t.array(t.record({ number: t.number(), repository_url: t.string() })),
    { query: { per_page: '100' } },
  );

  const own =
    `https://api.github.com/repos/${api.repo.owner}/${api.repo.name}`.toLowerCase();

  return Result.map(listed, (blocking) =>
    blocking
      .filter(({ repository_url: url }) => url.toLowerCase() === own)
      .map(({ number }) => number),
  );
};

/**
 * GraphQL: the REST API cannot take a pull request out of draft. The one
 * GraphQL call this command makes, and only for a pull request someone
 * opened as a draft before running it.
 */
export const markReady = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(
    api,
    dedent`
      mutation ($id: ID!) {
        markPullRequestReadyForReview(input: { pullRequestId: $id }) {
          clientMutationId
        }
      }
    `,
    { id: nodeId },
  );

const readRefName = async (
  command: string,
): Promise<Result<string, string>> => {
  const read = await git(command);

  if (Result.isErr(read)) {
    return Result.err(`${command} failed: ${read.value}`);
  }

  const name = read.value.trim();

  return isSafeRefName(name)
    ? Result.ok(name)
    : Result.err(`unexpected branch name: ${JSON.stringify(name)}`);
};
