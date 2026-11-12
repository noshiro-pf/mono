/**
 * What a command opens with: the repository as GitHub names it now, the token,
 * and the context its requests go through ({@link openRepository}); and, for
 * one that reads or writes this account's records, the account the token is
 * ({@link openSession}). A command refuses to go on without what it opens.
 */

import {
  readContextOf,
  readNamedRepository,
  readViewer,
  type ReadContext,
  type RepoRef,
  type Transport,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { messageOf } from './messages.mjs';
import { resolveRepo } from './repository.mjs';
import { resolveToken } from './token.mjs';

/**
 * The repository for `repoOption` (`--repo`) as GitHub names it now, and the
 * context its requests go through, or why there is none: no repository, no
 * token, or a repository GitHub does not answer for. Named now, a write is sent
 * to the repository's own name, not redirected from an old one (a redirected
 * POST is resent as a GET). Asks nothing of the token's account, so a command
 * that needs no records works with a token that cannot read `/user` (an
 * installation's): `pr-description`.
 */
export const openRepository = async (
  repoOption: string | undefined,
  world: SessionWorld,
): Promise<Result<OpenRepository, string>> => {
  const asked = await askedContext(repoOption, world);

  return Result.isErr(asked) ? asked : readNamed(asked.value);
};

/**
 * {@link openRepository}, and the account the token is, or why there is none:
 * what a command opens with that reads or writes records, which are trusted
 * from that account alone.
 */
export const openSession = async (
  repoOption: string | undefined,
  world: SessionWorld,
): Promise<Result<Session, string>> => {
  const asked = await askedContext(repoOption, world);

  if (Result.isErr(asked)) {
    return asked;
  }

  // Together: whose the token is does not depend on the repository's name.
  const [opened, viewer] = await Promise.all([
    readNamed(asked.value),
    readViewer(asked.value),
  ]);

  return Result.isErr(opened)
    ? opened
    : Result.isErr(viewer)
      ? Result.err(`cannot read whose the token is: ${viewer.value.message}`)
      : Result.ok({ ...opened.value, viewer: viewer.value });
};

/** What a session is opened from; a test passes recorded ones. */
export type SessionWorld = Readonly<{
  transport: Transport;
  env: ReadonlyRecord<string, string | undefined>;
  originUrl: () => Promise<string | undefined>;
  manifestUrl: () => Promise<string | undefined>;
  /** `gh auth token`, asked only when the environment holds no token. */
  ghAuthToken: () => Promise<Result<string, string>>;
}>;

export type OpenRepository = Readonly<{
  context: ReadContext;
  /** As GitHub names it now. */
  repo: RepoRef;
  defaultBranch: string;
}>;

export type Session = OpenRepository &
  Readonly<{
    /** The login the token authenticates as; its comments are the records. */
    viewer: string;
  }>;

/** The context by the name the repository was given by, and the token. */
const askedContext = async (
  repoOption: string | undefined,
  world: SessionWorld,
): Promise<Result<ReadContext, string>> => {
  const [repo, token] = await Promise.all([
    resolveRepo(repoOption, world),
    resolveToken(world.env, world.ghAuthToken),
  ]);

  return Result.isErr(repo)
    ? repo
    : Result.isErr(token)
      ? token
      : Result.ok(
          readContextOf({
            transport: world.transport,
            owner: repo.value.owner,
            name: repo.value.name,
            token: token.value,
          }),
        );
};

/** The repository as GitHub names it now, its context and default branch. */
const readNamed = async (
  asked: ReadContext,
): Promise<Result<OpenRepository, string>> => {
  const read = await readNamedRepository(asked);

  if (Result.isErr(read)) {
    return Result.err(messageOf(read.value));
  }

  const context = read.value.named;

  return Result.ok({
    context,
    repo: { owner: context.owner, name: context.name },
    defaultBranch: read.value.defaultBranch,
  });
};
