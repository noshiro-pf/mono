/**
 * `pr-description`: reads and writes a description written twice, the original
 * and its translation, keeping the halves mirrored (`spec/commands.md`,
 * `pr-description`). The rules are `pr-report-core-v2`'s
 * (`conventions/description.mts`); this runs them against GitHub and files.
 */

import {
  changedParts,
  createIssue,
  descriptionProblems,
  DUPLICATE_THRESHOLD,
  duplicateSuspects,
  issueTierLabel,
  lfOnly,
  readableDescription,
  readDescription,
  readOpenIssueTexts,
  similarIssues,
  splitDescription,
  writeDescription,
  type DescriptionKind,
  type ReadContext,
  type ScoredIssue,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { Config } from '../../config/index.mjs';
import {
  messageOf,
  notWritten,
  openRepository,
  type SessionWorld,
} from '../../github/index.mjs';
import type {
  CheckCommand,
  CreateCommand,
  DescriptionCommand,
  PullCommand,
  PushCommand,
  ReadCommand,
  SimilarCommand,
} from './options.mjs';

/** What was done, or why nothing was. */
export const prDescription = async (
  command: DescriptionCommand,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  const config = await world.readConfig();

  if (Result.isErr(config)) {
    return config;
  }

  const rules: Rules = {
    heading: config.value?.translation,
    openingHeading: config.value?.openingHeading,
  } as const;

  if (command.kind === 'check') {
    return check(command, rules, world);
  }

  // Opened by each command when it first asks GitHub, after what it can tell
  // locally. No record is read, so the token's account is not asked (an
  // installation token cannot answer it).
  const open = async (): Promise<Result<ReadContext, string>> =>
    Result.map(
      await openRepository(command.repo, world),
      ({ context }) => context,
    );

  switch (command.kind) {
    case 'read':
      return read(open, command, rules, world);

    case 'pull':
      return pull(open, command, rules, world);

    case 'push':
      return push(open, command, rules, world);

    case 'create':
      return create(open, command, rules, world);

    case 'similar':
      return similar(open, command);
  }
};

/** The file a pulled description's original state is kept in. */
export const pulledPath = (file: string): string => `${file}.pulled` as const;

export type DescriptionWorld = SessionWorld &
  Readonly<{
    readConfig: () => Promise<Result<Config | undefined, string>>;
    readText: (path: string) => Promise<Result<string, string>>;
    writeText: (
      path: string,
      text: string,
    ) => Promise<Result<undefined, string>>;
    /** A line said to the operator beside the result. */
    log: (line: string) => void;
  }>;

/** What `.github/unblock-prs.json` asks of a description. */
type Rules = Readonly<{
  heading: string | undefined;
  openingHeading: string | undefined;
}>;

/** Opens the repository, when a command first asks GitHub. */
type Open = () => Promise<Result<ReadContext, string>>;

const readFrom = async (
  context: ReadContext,
  number: number,
): Promise<Result<Readonly<{ body: string; kind: DescriptionKind }>, string>> =>
  Result.mapErr(await readDescription(context, number), messageOf);

const check = async (
  { file, issue }: CheckCommand,
  { heading, openingHeading }: Rules,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  if (heading === undefined) {
    return Result.err(
      'no translation heading in .github/unblock-prs.json: there is nothing to check a description against',
    );
  }

  const body = await world.readText(file);

  if (Result.isErr(body)) {
    return body;
  }

  const kind = issue ? 'issue' : 'pull-request';

  const problems = descriptionProblems(
    body.value,
    heading,
    kind,
    openingHeading,
  );

  return problems === undefined
    ? Result.ok(
        `${file}: the original and its translation mirror each other, the deferred findings give their reasons${openingHeading === undefined || kind === 'issue' ? '' : `, and the original opens with "## ${openingHeading}"`}`,
      )
    : Result.err(`${file}: ${problems}`);
};

const read = async (
  open: Open,
  { number }: ReadCommand,
  { heading }: Rules,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  const context = await open();

  if (Result.isErr(context)) {
    return context;
  }

  const found = await readFrom(context.value, number);

  if (heading === undefined || Result.isErr(found)) {
    return Result.map(found, ({ body }) => body);
  }

  const parts = splitDescription(found.value.body, heading);

  if (Result.isErr(parts)) {
    // Printed in full rather than refused: a reader needs the text, and one
    // written before the convention, or by a person, has nothing to leave out.
    world.log(`#${number}: ${parts.value}; printed in full`);

    return Result.ok(found.value.body);
  }

  return Result.ok(readableDescription(parts.value, heading));
};

/**
 * Why `pull` may not write `file`, or `undefined` when it may: an edit there
 * that was never pushed, which a pull (the one a refused push asks for) would
 * silently discard.
 */
const pendingEdit = async (
  file: string,
  world: DescriptionWorld,
): Promise<string | undefined> => {
  const current = await world.readText(file);

  if (Result.isErr(current)) {
    return undefined;
  }

  const pulled = await world.readText(pulledPath(file));

  return Result.isOk(pulled) && lfOnly(pulled.value) === lfOnly(current.value)
    ? undefined
    : `${file} holds an edit that was not pushed; move it aside, pull into a new file, and make the edit again there`;
};

const pull = async (
  open: Open,
  { number, file }: PullCommand,
  { heading, openingHeading }: Rules,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  // Local, and so before any request.
  const pending = await pendingEdit(file, world);

  if (pending !== undefined) {
    return Result.err(pending);
  }

  const context = await open();

  if (Result.isErr(context)) {
    return context;
  }

  const found = await readFrom(context.value, number);

  if (Result.isErr(found)) {
    return found;
  }

  const { body, kind } = found.value;

  for (const path of [file, pulledPath(file)]) {
    // eslint-disable-next-line no-await-in-loop -- the second is the record of the first
    const written = await world.writeText(path, body);

    if (Result.isErr(written)) {
      return written;
    }
  }

  const problems = descriptionProblems(body, heading, kind, openingHeading);

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
  open: Open,
  { number, file, wordingOnly }: PushCommand,
  { heading, openingHeading }: Rules,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  const edited = await world.readText(file);

  if (Result.isErr(edited)) {
    return edited;
  }

  const pulled = await world.readText(pulledPath(file));

  if (Result.isErr(pulled)) {
    return Result.err(
      `${pulledPath(file)} is missing: push writes back what pull saved; run pr-description pull ${number} --file ${file} first`,
    );
  }

  const context = await open();

  if (Result.isErr(context)) {
    return context;
  }

  const found = await readFrom(context.value, number);

  if (Result.isErr(found)) {
    return found;
  }

  const { body, kind } = found.value;

  // Another writer (`open-pr --merge-before`, a person) got there first, and
  // writing over it would silently drop what they wrote.
  if (body !== lfOnly(pulled.value)) {
    return Result.err(
      `#${number} changed on GitHub since it was pulled; pull it again and make the edit on what is there now`,
    );
  }

  // After the read: "unchanged" also says the copy is GitHub's still.
  if (lfOnly(edited.value) === lfOnly(pulled.value)) {
    return Result.ok(`#${number}: unchanged, nothing written`);
  }

  const problems = descriptionProblems(
    edited.value,
    heading,
    kind,
    openingHeading,
  );

  if (problems !== undefined) {
    return Result.err(`${file}: ${problems}`);
  }

  const lopsided =
    heading === undefined || wordingOnly
      ? undefined
      : lopsidedEdit(pulled.value, edited.value, heading, kind);

  if (lopsided !== undefined) {
    return Result.err(`${file}: ${lopsided}`);
  }

  const written = await writeDescription(context.value, number, edited.value);

  if (Result.isErr(written)) {
    return Result.err(notWritten(written.value));
  }

  // What GitHub now holds, so that a second edit pushes without a second pull.
  const recorded = await world.writeText(pulledPath(file), edited.value);

  return Result.isErr(recorded)
    ? Result.err(
        `#${number}: description written, but ${recorded.value}; pull again before the next edit`,
      )
    : Result.ok(`#${number}: description written`);
};

/** One line of `similar`'s list, and of `create`'s refusal. */
const listed = ({ number, title, url, score, keywords }: ScoredIssue): string =>
  [
    `- #${number} (${score.toFixed(2)}) ${title}`,
    ...(Arr.isNonEmpty(keywords) ? [`names ${keywords.join(', ')}`] : []),
    url,
  ].join(' · ');

const create = async (
  open: Open,
  command: CreateCommand,
  { heading }: Rules,
  world: DescriptionWorld,
): Promise<Result<string, string>> => {
  const body = await world.readText(command.file);

  if (Result.isErr(body)) {
    return body;
  }

  // An issue's description is asked for no opening section.
  const problems = descriptionProblems(body.value, heading, 'issue', undefined);

  if (problems !== undefined) {
    return Result.err(`${command.file}: ${problems}`);
  }

  const context = await open();

  if (Result.isErr(context)) {
    return context;
  }

  const issues = await readOpenIssueTexts(context.value);

  if (Result.isErr(issues)) {
    return Result.err(messageOf(issues.value));
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

  const created = await createIssue(context.value, {
    title: command.title,
    body: body.value,
    labels: Arr.toPushed(command.labels, issueTierLabel(command.priority)),
  });

  return Result.isErr(created)
    ? Result.err(notWritten(created.value))
    : Result.ok(`#${created.value.number}: ${created.value.url}`);
};

const similar = async (
  open: Open,
  command: SimilarCommand,
): Promise<Result<string, string>> => {
  const context = await open();

  if (Result.isErr(context)) {
    return context;
  }

  const issues = await readOpenIssueTexts(context.value);

  if (Result.isErr(issues)) {
    return Result.err(messageOf(issues.value));
  }

  const found = similarIssues(command, issues.value);

  return Result.ok(
    Arr.isNonEmpty(found)
      ? found.map(listed).join('\n')
      : 'No open issue has a close title or names a keyword.',
  );
};
