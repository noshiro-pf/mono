import * as fs from 'node:fs/promises';
import { issuePriorityLabel } from 'pr-report-core';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  log,
  resolveApiContext,
  rest,
  restAllPages,
  type ApiContext,
} from '../lib/index.mjs';
import { readConfig } from '../unblock-prs/index.mjs';
import {
  changedParts,
  checkDescription,
  descriptionKindOf,
  readableDescription,
  splitDescription,
  type DescriptionKind,
} from './body.mjs';
import type {
  Command,
  CreateCommand,
  PushCommand,
  SimilarCommand,
} from './options.mjs';
import {
  DUPLICATE_THRESHOLD,
  duplicateSuspects,
  similarIssues,
  type OpenIssueText,
  type ScoredIssue,
} from './similar.mjs';

/**
 * Runs one `pr-description` command (`./README.md`). A pull request's description
 * and an issue's are the same field of the same object to the REST API, so
 * every command takes either.
 */
export const runDescription = async (
  command: Command,
): Promise<Result<string, string>> => {
  const config = await readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const heading = config.value?.translation;

  switch (command.kind) {
    case 'check':
      return check(
        command.file,
        heading,
        command.issue ? 'issue' : 'pull-request',
      );

    case 'read':
    case 'pull':
    case 'push':
    case 'create':
    case 'similar': {
      const api = await resolveApiContext(command.repo);

      if (Result.isErr(api)) {
        return api;
      }

      switch (command.kind) {
        case 'read':
          return readDescription(api.value, command.number, heading);

        case 'pull':
          return pull(api.value, command.number, command.file, heading);

        case 'push':
          return push(api.value, command, heading);

        case 'create':
          return create(api.value, command, heading);

        case 'similar':
          return similar(api.value, command);
      }
    }
  }
};

/**
 * Why `body` may not be posted, or `undefined` when it may: with a translation
 * heading configured, a body whose halves do not mirror each other, or that has
 * a trailer or a `## Review` out of its place (`./body.mts`); what is a trailer
 * depends on whether `body` is an issue's or a pull request's.
 * `open-pr --body-file` asks the same before it pushes.
 */
export const descriptionProblems = (
  body: string,
  heading: string | undefined,
  kind: DescriptionKind,
): string | undefined => {
  if (heading === undefined) {
    return undefined;
  }

  const parts = splitDescription(body, heading);

  if (Result.isErr(parts)) {
    return parts.value;
  }

  const problems = checkDescription(parts.value, kind);

  return Arr.isNonEmpty(problems)
    ? `the description is not laid out as the original, its translation, then the trailers:\n${problems.map((p) => `- ${p}`).join('\n')}`
    : undefined;
};

/** The file a pulled description's original state is kept in. */
export const pulledPath = (file: string): string => `${file}.pulled` as const;

/** GitHub keeps what its editor sent, CRLF included. */
const lf = (text: string): string => text.replaceAll('\r\n', '\n');

const readText = async (path: string): Promise<Result<string, string>> => {
  const text = await Result.fromPromise(
    // The path is one the operator typed; there is no literal to use here.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path, 'utf8'),
  );

  return Result.isErr(text)
    ? Result.err(`cannot read ${path}: ${unknownToString(text.value)}`)
    : Result.ok(text.value);
};

const writeText = async (
  path: string,
  text: string,
): Promise<Result<undefined, string>> => {
  const written = await Result.fromPromise(
    // The path is one the operator typed; there is no literal to use here.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(path, text, 'utf8'),
  );

  return Result.isErr(written)
    ? Result.err(`cannot write ${path}: ${unknownToString(written.value)}`)
    : Result.ok(undefined);
};

/**
 * The description of `#number`, and whether it is a pull request's: the issues
 * route answers both, and says which by `pull_request`.
 */
const readBody = async (
  api: ApiContext,
  number: number,
): Promise<
  Result<Readonly<{ body: string; kind: DescriptionKind }>, string>
> => {
  const issue = await rest(
    api,
    'GET',
    `/issues/${number}`,
    t.record({
      body: t.union([t.string(), t.nullType]),
      pull_request: t.optional(t.record({})),
    }),
  );

  return Result.isErr(issue)
    ? Result.err(`cannot read #${number}: ${issue.value}`)
    : Result.ok({
        body: lf(issue.value.body ?? ''),
        kind: descriptionKindOf(issue.value),
      });
};

const check = async (
  file: string,
  heading: string | undefined,
  kind: DescriptionKind,
): Promise<Result<string, string>> => {
  if (heading === undefined) {
    return Result.err(
      'no translation heading in .github/unblock-prs.json: there is nothing to check a description against',
    );
  }

  const body = await readText(file);

  if (Result.isErr(body)) {
    return body;
  }

  const problems = descriptionProblems(body.value, heading, kind);

  return problems === undefined
    ? Result.ok(`${file}: the original and its translation mirror each other`)
    : Result.err(`${file}: ${problems}`);
};

const readDescription = async (
  api: ApiContext,
  number: number,
  heading: string | undefined,
): Promise<Result<string, string>> => {
  const read = await readBody(api, number);

  if (Result.isErr(read)) {
    return read;
  }

  const { body } = read.value;

  if (heading === undefined) {
    return Result.ok(body);
  }

  const parts = splitDescription(body, heading);

  if (Result.isErr(parts)) {
    // Read in full rather than refused: what a reader needs is the text, and a
    // description written before the convention, or by a person, has no
    // translation to leave out.
    log(`#${number}: ${parts.value}; printed in full`);

    return Result.ok(body);
  }

  return Result.ok(readableDescription(parts.value, heading));
};

/**
 * Why `pull` may not write `file`, or `undefined` when it may: an edit there
 * that was never pushed, which a pull — the one a refused push asks for — would
 * silently discard.
 */
const pendingEdit = async (file: string): Promise<string | undefined> => {
  const current = await readText(file);

  if (Result.isErr(current)) {
    return undefined;
  }

  const pulled = await readText(pulledPath(file));

  return Result.isOk(pulled) && lf(pulled.value) === lf(current.value)
    ? undefined
    : `${file} holds an edit that was not pushed; move it aside, pull into a new file, and make the edit again there`;
};

const pull = async (
  api: ApiContext,
  number: number,
  file: string,
  heading: string | undefined,
): Promise<Result<string, string>> => {
  const read = await readBody(api, number);

  if (Result.isErr(read)) {
    return read;
  }

  const { body, kind } = read.value;

  const pending = await pendingEdit(file);

  if (pending !== undefined) {
    return Result.err(pending);
  }

  for (const path of [file, pulledPath(file)]) {
    const written = await writeText(path, body);

    if (Result.isErr(written)) {
      return written;
    }
  }

  const problems = descriptionProblems(body, heading, kind);

  return Result.ok(
    [
      `#${number}: written to ${file}${heading === undefined ? '' : `; edit the original and the translation under "## ${heading}" together`}, then:`,
      `  pr-description push ${number} --file ${file}`,
      ...(problems === undefined
        ? []
        : ['', `As it stands, push would refuse it: ${problems}`]),
    ].join('\n'),
  );
};

/**
 * Why an edit changed one half and not the other, or `undefined` when it did
 * not. A description pulled without a translation has none to compare with, so
 * adding one is never lopsided.
 */
const lopsidedEdit = (
  before: string,
  after: string,
  heading: string,
  kind: DescriptionKind,
): string | undefined => {
  const was = splitDescription(before, heading);

  const is = splitDescription(after, heading);

  if (Result.isErr(was) || Result.isErr(is)) {
    return undefined;
  }

  const changed = changedParts(was.value, is.value, kind);

  return changed.original === changed.translation
    ? undefined
    : `the ${changed.original ? 'original' : 'translation'} changed and the ${changed.original ? 'translation' : 'original'} did not; make the same change in both, or pass --wording-only for a change of wording that changes no meaning`;
};

const push = async (
  api: ApiContext,
  command: PushCommand,
  heading: string | undefined,
): Promise<Result<string, string>> => {
  const { number, file, wordingOnly } = command;

  const edited = await readText(file);

  if (Result.isErr(edited)) {
    return edited;
  }

  const pulled = await readText(pulledPath(file));

  if (Result.isErr(pulled)) {
    return Result.err(
      `${pulledPath(file)} is missing: push writes back what pull saved; run pr-description pull ${number} --file ${file} first`,
    );
  }

  const current = await readBody(api, number);

  if (Result.isErr(current)) {
    return current;
  }

  const { body, kind } = current.value;

  if (body !== lf(pulled.value)) {
    // Another writer — `open-pr --merge-before`, a person — got there first,
    // and writing over it would silently drop what they wrote.
    return Result.err(
      `#${number} changed on GitHub since it was pulled; pull it again and make the edit on what is there now`,
    );
  }

  if (lf(edited.value) === lf(pulled.value)) {
    return Result.ok(`#${number}: unchanged, nothing written`);
  }

  const problems = descriptionProblems(edited.value, heading, kind);

  if (problems !== undefined) {
    return Result.err(`${file}: ${problems}`);
  }

  if (heading !== undefined && !wordingOnly) {
    const lopsided = lopsidedEdit(pulled.value, edited.value, heading, kind);

    if (lopsided !== undefined) {
      return Result.err(`${file}: ${lopsided}`);
    }
  }

  const updated = await rest(api, 'PATCH', `/issues/${number}`, t.unknown(), {
    body: { body: edited.value },
  });

  if (Result.isErr(updated)) {
    return Result.err(`cannot write #${number}: ${updated.value}`);
  }

  // What GitHub now holds, so that a second edit pushes without a second pull.
  const recorded = await writeText(pulledPath(file), edited.value);

  return Result.isErr(recorded)
    ? recorded
    : Result.ok(`#${number}: description written`);
};

/** One line of `similar`'s list, and of `create`'s refusal. */
const listed = ({ number, title, url, score, keywords }: ScoredIssue): string =>
  [
    `- #${number} (${score.toFixed(2)}) ${title}`,
    ...(Arr.isNonEmpty(keywords) ? [`names ${keywords.join(', ')}`] : []),
    url,
  ].join(' · ');

/** The open issues, without the pull requests the same route answers. */
const readOpenIssues = async (
  api: ApiContext,
): Promise<Result<readonly OpenIssueText[], string>> => {
  const read = await restAllPages(api, '/issues', OpenIssuesSchema, {
    query: { state: 'open' },
  });

  return Result.isErr(read)
    ? Result.err(`cannot read the open issues: ${read.value}`)
    : Result.ok(
        read.value
          .filter((issue) => descriptionKindOf(issue) === 'issue')
          .map(({ number, title, body, html_url: url }) => ({
            number,
            title,
            body: lf(body ?? ''),
            url,
          })),
      );
};

const create = async (
  api: ApiContext,
  command: CreateCommand,
  heading: string | undefined,
): Promise<Result<string, string>> => {
  const body = await readText(command.file);

  if (Result.isErr(body)) {
    return body;
  }

  const problems = descriptionProblems(body.value, heading, 'issue');

  if (problems !== undefined) {
    return Result.err(`${command.file}: ${problems}`);
  }

  const issues = await readOpenIssues(api);

  if (Result.isErr(issues)) {
    return issues;
  }

  const suspects = duplicateSuspects(
    command.title,
    issues.value,
    command.notDuplicates,
  );

  if (Arr.isNonEmpty(suspects)) {
    return Result.err(
      [
        `refused: ${suspects.length === 1 ? 'an open issue has' : `${suspects.length} open issues have`} a title close to this one (${DUPLICATE_THRESHOLD} or more):`,
        ...suspects.map(listed),
        '',
        'Read each. Where one is this problem, add to it instead of filing another;',
        'where none is, file again with --not-duplicate <number> for each.',
      ].join('\n'),
    );
  }

  const created = await rest(
    api,
    'POST',
    '/issues',
    t.record({ number: t.number(), html_url: t.string() }),
    {
      body: {
        title: command.title,
        body: body.value,
        labels: Arr.toPushed(
          command.labels,
          issuePriorityLabel(command.priority),
        ),
      },
    },
  );

  return Result.isErr(created)
    ? Result.err(`cannot create the issue: ${created.value}`)
    : Result.ok(`#${created.value.number}: ${created.value.html_url}`);
};

const similar = async (
  api: ApiContext,
  command: SimilarCommand,
): Promise<Result<string, string>> => {
  const issues = await readOpenIssues(api);

  if (Result.isErr(issues)) {
    return issues;
  }

  const found = similarIssues(command, issues.value);

  return Result.ok(
    Arr.isNonEmpty(found)
      ? found.map(listed).join('\n')
      : 'No open issue has a close title or names a keyword.',
  );
};

/** The `pull_request` key is what tells a pull request apart in the answer. */
const OpenIssuesSchema = t.array(
  t.record({
    number: t.number(),
    title: t.string(),
    body: t.union([t.string(), t.nullType]),
    html_url: t.string(),
    pull_request: t.optional(t.record({})),
  }),
);
