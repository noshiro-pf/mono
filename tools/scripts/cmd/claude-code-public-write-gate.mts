// cspell:ignore securit fsmonitor pushd popd fbody Xput

import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// Erased by Node, as a top-level `import type` is; see the header.
import type { UnknownRecord } from 'ts-type-forge';

/**
 * The `PreToolUse` hook `.claude/settings.json` runs before `Bash` and the
 * GitHub MCP tools: it holds every call that publishes text to a public place
 * once, with the review it asks for as the reason, so that the rule in "Private
 * information" in CLAUDE.md reaches the session at the one moment it can act on
 * it — with the text in front of it, before anything leaves.
 *
 * **Whom it is for.** A session that means to keep the rule and would forget
 * it, not one that means to break it: words written to slip past a reading of
 * words (`g''h pr merge 3` or `git pu\sh` with no `$` beside it, `${G%.}`, a
 * glob naming the binary or an option, an alias planted by an earlier call) are
 * out of its reach, and are not chased here, as no list of them closes.
 * What it reads, it reads generously: a call held for nothing costs one repeat,
 * a call let through unread costs a publish.
 *
 * **What it holds.** A GitHub MCP tool that may write (any whose name has no
 * `get`, `list`, `search` or `read` in it) to any repository but the private
 * one, and a `Bash` command that may publish: `git push`, the repository's
 * scripts that push or write to GitHub (`open-pr`, `push-fixed-pr`,
 * `rework-pr done`, `pr-description push` / `create`, `start-issue`,
 * `claim-pr`, `report-unowned-prs`, `unblock-prs`), or a write to GitHub's API
 * (`gh`, `curl`, `wget`, httpie, a script's `fetch`).
 *
 * **Generous on purpose.** Whether a command publishes is decided from its
 * words alone, quoted strings and heredoc bodies included, with no attempt to
 * parse the shell: a parse that misreads one quote, heredoc or wrapper lets a
 * push through unseen, while a word read too generously costs one repeated
 * call. So `grep 'git push' x` is held once too, and so is `grep gh docs/`; a
 * `gh` followed by a group of its own is read by that group and the word after
 * it, so that `gh pr view 3` is not. For the same reason a `Bash` write to the
 * private repository is held like any other: its target cannot be told from a
 * public write's text without parsing the shell. The MCP tools, whose target is
 * a field, are what writes to it without a hold.
 *
 * **Once per text.** The first call is denied; the identical call then passes,
 * which is how the session says it has read what it is about to publish.
 * Identical means the same text: the MCP tool's input, or the command, the body
 * files it names and, for a push, the branches and the commit checked out in
 * each directory the command names. An amend, an edited body or a new commit is
 * held again. The ledger is a file per session under the temporary directory.
 * What this cannot read — a body file, a repository's messages — is named in
 * the reason, for the session to read itself.
 *
 * **A pointer into the private repository is refused every time** — an issue or
 * pull request number of it, a GitHub path into it — in the text the call
 * carries: the MCP tool's input, the command, the body files it names, and the
 * messages of the commits a push sends. Naming the repository as where findings
 * go is fine, and so is a local path to its clone; pointing into it is what
 * tells a reader where to look. Nothing else can be matched here: a list of
 * what else is private would itself be published by sitting in this file.
 *
 * **What a push sends is read only by its messages**: those of the branches and
 * `HEAD` that no remote has yet, in each directory the command names by `cd`,
 * `pushd` or `-C`, from any directory before it. A tag, a commit on no branch (named by hash,
 * `ORIG_HEAD`, `HEAD@{1}`) and a directory given any other way (`bash -c`,
 * `GIT_DIR`) are not read; the reason names the directories that were. Working
 * out which diffs a push publishes means reading the repository's configuration
 * and history the way git would, in whatever directory the command names,
 * before anyone approved it; every reading short of that let something through.
 * The review the hold asks for covers the diffs, and
 * `check:prose:private-pointers`, which runs this file's
 * {@link findPrivatePointers} over every file of the checkout, fails in
 * `check-changed` before the push and in CI on any diff that runs the checks
 * (not one touching `experimental/` alone).
 *
 * **Silent when it cannot read the call** (no JSON, no tool name): exit 0 with
 * nothing printed, so a broken hook never stops a session's work.
 *
 * **Run with `node`, not `tsx`**, for the reasons the header of
 * `claude-code-post-edit.mts` gives: only `node:*` imports at runtime, only
 * erasable syntax.
 */
export const main = async (stdin: string): Promise<number> => {
  const call = readCall(stdin);

  const publication =
    call === undefined ? undefined : await describePublication(call);

  if (call === undefined || publication === undefined) {
    return 0;
  }

  const found = publication.sources
    .map(({ source, text, isMessage, isCommand }) => ({
      source,
      isMessage: isMessage === true,
      isCommand: isCommand === true,
      pointer: findPrivatePointer(text),
    }))
    .find(({ pointer }) => pointer !== undefined);

  if (found?.pointer !== undefined) {
    deny(
      pointerReason(
        found.pointer,
        found.source,
        found.isMessage,
        found.isCommand,
      ),
    );

    return 0;
  }

  const ledger = ledgerPath(call.sessionId);

  if (readLedger(ledger).has(publication.key)) {
    return 0;
  }

  appendLedger(ledger, publication.key);

  deny(reviewReason(publication.what));

  return 0;
};

/**
 * Whether a shell command may publish to GitHub, read from its words (see the
 * header): in any order, but for the words after a `gh`.
 */
export const isPublishingCommand = (command: string): boolean => {
  const words = wordsOf(command);

  const has = (word: string): boolean => words.includes(word);

  const hasAny = (set: ReadonlySet<string>): boolean =>
    words.some((word) => set.has(word));

  return (
    isPushingCommand(words) ||
    hasAny(PNPM_WRITERS) ||
    (has('pr-description') && hasAny(PR_DESCRIPTION_WRITES)) ||
    isGhWrite(command, words) ||
    // Any other client of GitHub's API: `curl`, `wget`, a script's `fetch`, and
    // httpie and its kin (`http`, `xh`, `curlie`), which send a POST for any
    // data item and so are held whatever their method.
    // A variable or a token names it too (`$GITHUB_API_URL/graphql`, `$GH_PAT`,
    // `~/.github-token`, `$(gh auth token)`).
    ((words.some(namesGitHub) || (has('gh') && has('auth') && has('token'))) &&
      (hasWriteMethod(words) ||
        has('--post-data') ||
        has('--post-file') ||
        hasAny(HTTPIE_LIKE) ||
        (has('curl') && words.some((word) => CURL_WRITE_OPTION.test(word)))))
  );
};

/** The first pointer into the private repository `text` holds, if any. */
export const findPrivatePointer = (text: string): string | undefined =>
  findPrivatePointers(text)[0]?.pointer;

/**
 * Every pointer into the private repository `read` holds, each as the whole
 * word around it, owner and path included, and the line it starts on. NUL bytes
 * are dropped first, so that UTF-16 text decoded as UTF-8 reads as the text it
 * is. One line is read at a time: a pointer a wrapped paragraph splits
 * (`<it>\n#13`) is not found, as nothing tells a wrapped paragraph from a
 * heading or a list item after it (`## <it>\n#4340 …`), and the hold's review
 * is what reads it.
 */
export const findPrivatePointers = (
  read: string,
): readonly Readonly<{ line: number; pointer: string }>[] => {
  const text = read.replaceAll('\0', '');

  // Most text names no such repository at all.
  if (!/mono-securit/iu.test(text)) {
    return [];
  }

  const lines = text.split(/\r?\n/u);

  return lines.flatMap((line, index) => {
    // Two patterns that find one word report it once.
    const found = new Map<number, string>(
      PRIVATE_POINTERS.flatMap((pattern) =>
        Array.from(line.matchAll(pattern)),
      ).map((match) => wordAround(line, match.index, match[0].length)),
    );

    return Array.from(found.values(), (pointer) => ({
      line: index + 1,
      pointer,
    }));
  });
};

type Call = Readonly<{
  toolName: string;
  toolInput: UnknownRecord;
  cwd: string;
  sessionId: string;
}>;

/** One piece of what a call publishes, and where it came from. */
type Source = Readonly<{
  source: string;
  text: string;
  /** Whether it is a commit message, which a refusal advises on apart. */
  isMessage?: boolean;
  /** Whether it is a Bash call's own text, read generously. */
  isCommand?: boolean;
}>;

type Publication = Readonly<{
  /** What makes two calls the same text, for the ledger. */
  key: string;
  /** Everything the call publishes that can be read here. */
  sources: readonly Source[];
  /** What the call is, for the reason shown to the session. */
  what: string;
}>;

/** One directory a command names, in the repository it is in. */
type Located = Readonly<{
  dir: string;
  /** The git directory the repository's worktrees share. */
  common: string;
  head: string | undefined;
}>;

/** What a push from one repository would send, as far as it was read. */
type Pushed = Readonly<{
  /** The working directory it was read from. */
  dir: string;
  /** The commits checked out and every branch's, for the ledger key. */
  refs: string;
  /**
   * The messages no remote has yet, each with its commit and the refs on it;
   * `undefined` when they could not be read.
   */
  messages:
    | readonly Readonly<{ hash: string; commit: string; text: string }>[]
    | undefined;
  /** Whether {@link MAX_MESSAGES} left older ones unread. */
  isCut: boolean;
}>;

const PRIVATE_OWNER = 'noshiro-pf';

const PRIVATE_REPOSITORY = 'mono-security';

const PRIVATE_FULL_NAME = `${PRIVATE_OWNER}/${PRIVATE_REPOSITORY}` as const;

/**
 * The repository with an issue or pull request number close after it — `#13`,
 * ` #13`, `: #13`, `：#13`, `'s #13`, `＃13`, ` issue 13`, ` pull request #13`,
 * ` issue: #13`, ` の #13`, ` のイシュー #13`, on one line, and after a comma
 * only with the word (`, issue #13`) — one of GitHub's own paths below it
 * (`/issues/13`, `/blob/…`), or a file of it on `raw.githubusercontent.com`.
 * Not after other punctuation or words, nor a
 * comma alone: `` `<it>` (#4340) ``, `<it>, #4340` and `<it> と #4340` name it
 * beside a number of this repository. A known gap: a phrase in between
 * (`<it> に起票した #13`) is not matched either, since one rule for both would
 * take `と #4340` too; the hold's review is what reads it. Not a path of any
 * other name: `~/src/<it>/docs` is a local clone. The `[y]` keeps this file
 * from being a pointer itself.
 */
const PRIVATE_POINTERS: readonly RegExp[] = [
  // A number after `#`, written after the name, a word for one (` issue #13`)
  // or for many (` issues #2`). The alternatives are ordered so that no
  // parenthesis touches Japanese, which `check:prose:japanese-parentheses`
  // would take for prose.
  /mono-securit[y](?:['’]s)?[ \t\u{3000}:：]{0,2}の?[ \t\u{3000}]?(?:[,，、]?[ \t\u{3000}]?(?:issues?|イシュー|課題|プルリクエスト|プルリク|pull[ \t\u{3000}]?requests?|pulls?|PRs?)[ \t\u{3000}:：]{0,2}|)[#＃]\d/giu,
  // A number with no `#`, only after a word for one (`issue 13`, `PR 13`,
  // `pull request 13`, `イシュー 13`), and none a shell's redirection follows
  // (`>`, `</dev/`): `issues 2.` of a list, `PRs 3 days later` and
  // `<clone> issue 2> /dev/null` are none, `issue 13</li>` is one. Not after
  // `pull` alone, which is git's as often: `git -C <clone> pull 0<in` names no
  // issue 0.
  /mono-securit[y](?:['’]s)?[ \t\u{3000}:：]{0,2}の?[ \t\u{3000}]?[,，、]?[ \t\u{3000}]?(?:issue|イシュー|課題|プルリクエスト|プルリク|pull[ \t\u{3000}]?request|PR)[ \t\u{3000}:：]{0,2}\d(?!\d*(?:>|<\/dev\/))/giu,
  // A GitHub path below it.
  /mono-securit[y]\/(?:issues|pulls?|runs|attestations|activity|blob|blame|edit|tree|contents|commits?|compare|security|discussions|wiki|actions|releases|projects|milestones?|labels|tags|branches|settings|raw|archive|graphs|network|pulse|deployments|packages)\b/giu,
  // A commit of it, as GitHub links `<owner>/<repo>@<sha>`.
  /mono-securit[y]@[\da-f]{7}/giu,
  // A file of it as served raw.
  /raw\.githubusercontent\.com\/[\w.-]+\/mono-securit[y]\/[\w.-]/giu,
] as const;

/**
 * A redirection's or a substitution's file shaped as a tag or a type argument
 * of a body is (`<li>`, `</b>`, `` `<button>` ``, `Promise<string>`): a word
 * alone. Read like any other, it is named as unread only when it is not there.
 */
const TAG_SHAPED = /^\/?[a-z][\w-]*>?$/iu;

/** Characters that end a word, for the generous reading of a command. */
const WORD_BREAK = /[\s'"`;&|()<>{}$\\=,]+/u;

/** The repository's scripts that push the branch themselves. */
const PNPM_PUSHERS: ReadonlySet<string> = new Set<string>([
  'open-pr',
  'push-fixed-pr',
]);

/** The repository's scripts that write comments, labels or issues. */
const PNPM_WRITERS: ReadonlySet<string> = new Set<string>([
  'start-issue',
  'claim-pr',
  'report-unowned-prs',
  'unblock-prs',
]);

const PR_DESCRIPTION_WRITES: ReadonlySet<string> = new Set<string>([
  'push',
  'create',
]);

/** `gh` subcommands that only read: any other is held. */
const GH_READS: ReadonlySet<string> = new Set<string>([
  'view',
  'list',
  'status',
  'diff',
  'checks',
  'checkout',
  'clone',
  'watch',
  'download',
  'get',
  'verify',
  'item-list',
  'field-list',
]);

/** What {@link shellWordsOf} puts where a simple command ends. */
const SEPARATOR = '\u{1}';

/** `gh`'s groups, read wherever a `gh` before them stands. */
const GH_GROUPS: ReadonlySet<string> = new Set<string>([
  'agent-task',
  'alias',
  'api',
  'attestation',
  'auth',
  'browse',
  'cache',
  'codespace',
  'completion',
  'config',
  'extension',
  'gist',
  'gpg-key',
  'issue',
  'label',
  'org',
  'pr',
  'project',
  'release',
  'repo',
  'ruleset',
  'run',
  'search',
  'secret',
  'ssh-key',
  'status',
  'variable',
  'workflow',
]);

/** Runners that give `gh` its arguments from elsewhere. */
const GH_FEEDERS: ReadonlySet<string> = new Set<string>([
  'xargs',
  'parallel',
  '-exec',
  '-execdir',
]);

/** `gh` groups that only read, or touch nothing but this machine. */
const GH_TOP_READS: ReadonlySet<string> = new Set<string>([
  'auth',
  'browse',
  'completion',
  'config',
  'search',
  'status',
]);

/**
 * An option that makes `gh api` send a body, and so a POST without `--method`:
 * `-f`, `-F`, `--field`, `--raw-field`, `--input`, written alone or with its
 * value on it (`-fbody=x`, `--field=body=x`).
 */
const GH_API_WRITE_OPTION = /^(?:-[fF]|--(?:raw-)?field\b|--input\b)/u;

/**
 * An option that makes `curl` send a body: `-d`, `-F`, `-T` anywhere in a
 * cluster of short ones (`-sSd`, `-d@b.json`), and the long ones (`--data`,
 * `--data-ascii`, `--json`, `--form`, `--upload-file`). A method is
 * {@link hasWriteMethod}'s.
 */
const CURL_WRITE_OPTION =
  /^(?:-[a-zA-Z]*[dFT]|--(?:data\b|json\b|form\b|upload-file\b))/u;

const HTTP_WRITE_METHODS: ReadonlySet<string> = new Set<string>([
  'POST',
  'PATCH',
  'PUT',
  'DELETE',
]);

/**
 * A word naming GitHub or its API: a host (`api.github.com`,
 * `github.example.com`), an API path (`repos/`, `api/graphql`, `api/v3`), a
 * word with `github` in it, as a variable or a file holding a token does
 * (`$GITHUB_API_URL`, `$GITHUB_PAT`, `~/.github-token`), or one with `gh_` in
 * it (`$GH_HOST`, `$INPUT_GH_TOKEN`). Not the `.github/` directory or a source
 * file (`github.mts`); a variable of Actions' own is {@link namesGitHub}'s.
 */
const GITHUB_API =
  /(?<!(?:^|\/)\.)github(?!\/|\.(?:m?[jt]sx?|md|json|ya?ml)\b)|(?<=(?:^|\/)\.)github(?=[\w-])|github\.(?:com|[\w-]+\.[\w.-]+)|(?<![a-z\d])gh_\w|repos\/|api\/(?:graphql|v3)/iu;

/**
 * The variables Actions sets that name no API (`$GITHUB_OUTPUT`,
 * `$GITHUB_SHA`), by what follows `GITHUB_`. Not `GITHUB_EVENT_PATH`, whose
 * file holds issue and pull request text, nor `GITHUB_SERVER_URL`, a host.
 */
const ACTIONS_VARIABLES: ReadonlySet<string> = new Set<string>([
  'output',
  'env',
  'path',
  'step_summary',
  'workspace',
  'state',
  'sha',
  'ref',
  'ref_name',
  'ref_type',
  'head_ref',
  'base_ref',
  'event_name',
  'run_id',
  'run_number',
  'run_attempt',
  'job',
  'action',
  'action_path',
  'actor',
  'triggering_actor',
  'retention_days',
  'workflow',
]);

/** Clients that send a POST whenever a command gives them data. */
const HTTPIE_LIKE: ReadonlySet<string> = new Set<string>([
  'http',
  'https',
  'httpie',
  'xh',
  'xhs',
  'curlie',
]);

/**
 * Options whose next word is a file whose content a command publishes. Kept
 * apart from {@link CURL_WRITE_OPTION} and {@link GH_API_WRITE_OPTION}, which
 * ask another question, whether a `curl` / `gh api` call sends a body at all:
 * `-d x` sends one and names no file, `--body-file` is no `curl` option. A
 * `curl` / `gh api` option that sends a file belongs in both.
 */
const FILE_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--file',
  '--body-file',
  '--input',
  '-F',
  // wget's.
  '--post-file',
]);

/**
 * `curl`'s upload options, read as files only in a command that runs `curl`:
 * `gh … -T` names a template.
 */
const CURL_FILE_OPTIONS: ReadonlySet<string> = new Set<string>([
  '-T',
  '--upload-file',
]);

const READ_PARTS: ReadonlySet<string> = new Set<string>([
  'get',
  'list',
  'search',
  'read',
]);

/** `$(cat d.md)`, `$(< d.md)`, `` `cat d.md` ``: a body read from a file. */
const FILE_READ_SUBSTITUTION =
  /(?:\$\(|`)\s*(?:cat\s+|<\s*)([^\s)`;&|]+)\s*(?:\)|`)/gu;

/** `< d.md`, and not `<<`, `<<<` or `<(`. */
const INPUT_REDIRECT = /(?<![<\d])<(?![<(])\s*([^\s;&|<>()]+)/gu;

/**
 * How many directories a command names are read, at most, in each of
 * {@link directoriesOf}'s two readings: the session's and the latest others
 * found.
 */
const MAX_DIRECTORIES = 12;

/** The commands whose next word is a directory to work in. */
const DIRECTORY_COMMANDS: ReadonlySet<string> = new Set<string>([
  'cd',
  'pushd',
]);

/** How large a named body file may be and still be read. */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

/** How long one `git` call may take before it is given up. */
const GIT_TIMEOUT_MS = 5000;

/** How many commit messages of a push are read, at most. */
const MAX_MESSAGES = 100;

/**
 * Separators for `git log` output, new on every run, so that no message can
 * contain one. Only parsed text goes into the ledger key, never these.
 */
const COMMIT_START = `<<commit-${randomUUID()}>>` as const;

const MESSAGE_START = `<<message-${randomUUID()}>>` as const;

/**
 * Options every `git` call here runs with. `rev-parse`, `for-each-ref` and a
 * `log` of messages alone run nothing a repository configures, a downloaded one
 * included, save `core.fsmonitor` and a signature check, both turned off.
 */
const GIT_SAFETY = [
  '-c',
  'core.fsmonitor=false',
  '-c',
  'log.showSignature=false',
] as const;

/**
 * The words a command's text is made of, with nothing parsed but a `\` that
 * continues a line, joined as the shell joins it (`git pu\` / `sh`); a path
 * also gives its last part, so `/usr/bin/git` is `git` too.
 */
const wordsOf = (text: string): readonly string[] =>
  text
    .replaceAll('\\\n', '')
    .split(WORD_BREAK)
    .filter((word) => word !== '')
    .flatMap((word) =>
      word.includes('/') && !word.endsWith('/')
        ? [word, word.slice(word.lastIndexOf('/') + 1)]
        : [word],
    );

/** `git … push`, and not `git stash push`. */
const isGitPush = (words: readonly string[]): boolean =>
  words.includes('git') &&
  words.some((word, index) => word === 'push' && words[index - 1] !== 'stash');

/** A command that may push: `git push`, or a script that pushes for it. */
const isPushingCommand = (words: readonly string[]): boolean =>
  isGitPush(words) ||
  words.some((word) => PNPM_PUSHERS.has(word)) ||
  (words.includes('rework-pr') && words.includes('done'));

/**
 * A write method named in any spelling: as a word (`-X POST`, `--method=patch`),
 * or on `-X` at the end of a cluster of short options (`-sXPOST`, `-iXput`),
 * for `curl` and `gh api` alike.
 */
const hasWriteMethod = (words: readonly string[]): boolean =>
  words.some(
    (word) =>
      HTTP_WRITE_METHODS.has(word.toUpperCase()) ||
      /^-[a-z]*X(?:POST|PATCH|PUT|DELETE)$/iu.test(word),
  );

/** Whether a word names GitHub or its API ({@link GITHUB_API}). */
const namesGitHub = (word: string): boolean => {
  // `$GITHUB_WORKSPACE/x.json` and `${GITHUB_SHA::7}` name the variable alone.
  const [variable, name = ''] =
    /^github_([a-z_]+)(?![a-z_])/iu.exec(word) ?? [];

  return variable !== undefined && ACTIONS_VARIABLES.has(name.toLowerCase())
    ? GITHUB_API.test(word.slice(variable.length))
    : GITHUB_API.test(word);
};

/**
 * The words a command's text is made of, with {@link SEPARATOR} where a simple
 * command may end (`;`, `&`, `|`, a line's end that no `\` continues). Quotes
 * are not read: a quoted `|` ends a simple command too.
 */
const shellWordsOf = (command: string): readonly string[] =>
  command
    // A `\` continues the line with nothing between, as the shell reads it.
    .replaceAll('\\\n', '')
    .replaceAll(/[;&|\n]/gu, () => ` ${SEPARATOR} `)
    .split(/[\s'"`()<>{}$\\,]+/u)
    .filter((word) => word !== '');

/**
 * Whether the words after a `gh` (`own`) write, `isFed` words from elsewhere as
 * well (`xargs gh`, `find … -exec gh`, a glob such as `gh *`; see
 * {@link isGhWrite}). Those that are no options, nor an option's value
 * (`-R o/r`, `--label release`), are read: each group {@link GH_GROUPS} knows
 * among them with the word after it as its subcommand, wherever the `gh` stands
 * (`sudo -u bot gh pr merge 3`, `bash -c "gh …"`) and whatever comes first
 * (`gh -R o/r pr merge 3`). With no group it knows, any such word holds it (an
 * extension, an alias, or prose: `grep gh docs/` is held once too), as does
 * being `isFed` its words elsewhere. Not `gh` alone or `gh --version`.
 */
const readsAsGhWrite = (
  own: readonly string[],
  words: readonly string[],
  isFed: boolean,
): boolean => {
  const named = own.filter(
    (next, at) =>
      !next.startsWith('-') &&
      // `{} +` of `find -exec` names nothing.
      /\w/u.test(next) &&
      !(at > 0 && own[at - 1] !== '--' && /^-[^=]*$/u.test(own[at - 1] ?? '')),
  );

  // `gh help pr` and `gh version` read.
  if (named[0] === 'help' || named[0] === 'version') {
    return false;
  }

  const groups = named.flatMap((group, at) =>
    GH_GROUPS.has(group) ? [{ group, sub: named[at + 1] }] : [],
  );

  return groups.length === 0
    ? isFed || named.length > 0
    : groups.some(
        ({ group, sub }) =>
          !GH_TOP_READS.has(group) &&
          (group === 'api'
            ? // The whole command's words, as a quoted `|` (`--jq '.a | .b'`)
              // ends no simple command, and any it may be given elsewhere.
              words.some((next) => GH_API_WRITE_OPTION.test(next)) ||
              hasWriteMethod(words) ||
              isFed
            : // `gh label clone` copies another repository's labels in.
              (group === 'label' && sub === 'clone') ||
              sub === undefined ||
              !GH_READS.has(sub)),
      );
};

/**
 * Whether a `gh` the command runs writes: `gh api` with a body or a write
 * method, `gh label clone`, or a subcommand of any other group that is not a
 * read (`gh pr create`, `gh secret set`, `gh workflow run`; not `gh run view`),
 * or a `gh` given its words elsewhere (`xargs gh`, a glob: `gh *`).
 *
 * A command that names `gh` and has a `$` or a backquote anywhere, its quotes,
 * `\` and line continuations taken out, is held whole: the `gh` may run under
 * another name (`G=gh; $G …`, `G+=gh`, `for G in gh`, `G=g''h`) or be given
 * words of its own (`gh api x $FLAGS`, `gh $(cat args)`), which no reading of
 * words tells. Read generously, so that `gh pr view $N` and `echo $PATH | grep
 * gh` are held once too; sessions here run no `gh` (CLAUDE.md).
 *
 * Every group {@link GH_GROUPS} knows among the words after the `gh` in its
 * simple command, no option's value, is read with the word after it as its
 * subcommand. A `gh` followed by any other word (an extension, an alias) is
 * held wherever it stands, prose included: telling a reader of its words from a
 * runner of them is a list that fails open where it is short, while holding
 * prose costs one repeated call.
 */
const isGhWrite = (command: string, words: readonly string[]): boolean => {
  const plain = command.replaceAll('\\\n', '').replaceAll(/['"\\]/gu, '');

  // Not `--author=gh-actions` nor `gh.mts`; `${X:-gh}` and `alias g=gh` too.
  if (/(?<![\w.])gh(?![\w.-])/u.test(plain) && /[$`]|\balias\b/u.test(plain)) {
    return true;
  }

  const shellWords = shellWordsOf(command);

  return shellWords.some((word, index) => {
    // `gh`, or a path ending in it (`/usr/local/bin/gh`, `./gh`).
    if (word !== 'gh' && !word.endsWith('/gh')) {
      return false;
    }

    // The words after it in its own simple command.
    const after = shellWords.slice(index + 1);

    const end = after.indexOf(SEPARATOR);

    const own = after.slice(0, end === -1 ? after.length : end);

    // Given its words elsewhere: `xargs gh`, `find … -exec gh`, a glob
    // (`gh *`). A `$` beside it (`gh "$@"`) is held above.
    const start = shellWords.lastIndexOf(SEPARATOR, index) + 1;

    const isFed =
      own.some((next) => /^[*?[\]]+$/u.test(next)) ||
      shellWords.slice(start, index).some((earlier) => GH_FEEDERS.has(earlier));

    return readsAsGhWrite(own, words, isFed);
  });
};

/** The whole word a match of `length` at `index` is in, and where it starts. */
const wordAround = (
  text: string,
  index: number,
  length: number,
): readonly [start: number, word: string] => {
  const start =
    Math.max(
      ...Array.from(' \t(<[`\'"', (boundary) =>
        text.lastIndexOf(boundary, index),
      ),
    ) + 1;

  const ends = Array.from(' \t)>]`\'"', (boundary) =>
    text.indexOf(boundary, index + length),
  ).filter((at) => at !== -1);

  return [
    start,
    text.slice(start, ends.length === 0 ? text.length : Math.min(...ends)),
  ];
};

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const readText = (file: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file the published command names, or the ledger.
    return fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
};

const isDirectory = (dir: string): boolean => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory the command names.
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Whether a file is a regular one no larger than {@link MAX_FILE_BYTES}: a
 * device, a FIFO or a huge file would hold the hook past its timeout.
 */
const isSmallRegularFile = (file: string): boolean => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file the published command names.
    const stats = fs.statSync(file);

    return stats.isFile() && stats.size <= MAX_FILE_BYTES;
  } catch {
    return false;
  }
};

const readCall = (stdin: string): Call | undefined => {
  const input = parseJson(stdin);

  if (!isObject(input)) {
    return undefined;
  }

  const toolName = input['tool_name'];

  const toolInput = input['tool_input'];

  const cwd = input['cwd'];

  const sessionId = input['session_id'];

  return typeof toolName === 'string' && isObject(toolInput)
    ? {
        toolName,
        toolInput,
        cwd: typeof cwd === 'string' ? cwd : process.cwd(),
        sessionId: typeof sessionId === 'string' ? sessionId : 'unknown',
      }
    : undefined;
};

const digest = (parts: readonly string[]): string =>
  createHash('sha256').update(parts.join('\0')).digest('hex');

const collectStrings = (value: unknown): readonly string[] =>
  typeof value === 'string'
    ? ([value] as const)
    : Array.isArray(value)
      ? value.flatMap(collectStrings)
      : isObject(value)
        ? Object.values(value).flatMap(collectStrings)
        : ([] as const);

/** Items as code, for the reason: `` `a`, `b` ``. */
const list = (items: readonly string[]): string =>
  items.map((item) => `\`${item}\``).join(', ');

/**
 * A GitHub MCP tool that may write: any whose name has no `get`, `list`,
 * `search` or `read` among its parts (`get_me`, `actions_list`, `issue_read`).
 */
const isGitHubWriteTool = (toolName: string): boolean => {
  const parts = toolName.replace(/^mcp__.*__/u, '').split('_');

  // `mcp__github__…`, `mcp__claude_ai_GitHub__…`: a server is named freely.
  return (
    toolName.startsWith('mcp__') &&
    toolName.toLowerCase().includes('github') &&
    parts.every((part) => !READ_PARTS.has(part.toLowerCase()))
  );
};

const describeToolWrite = (call: Call): Publication | undefined => {
  const owner = call.toolInput['owner'];

  const repo = call.toolInput['repo'];

  const target =
    `${typeof owner === 'string' ? owner : '?'}/${typeof repo === 'string' ? repo : '?'}` as const;

  return target.toLowerCase() === PRIVATE_FULL_NAME
    ? undefined
    : {
        key: digest([call.toolName, JSON.stringify(call.toolInput)]),
        sources: [
          {
            source: 'the tool input',
            text: collectStrings(call.toolInput).join('\n'),
          },
        ],
        what: `${call.toolName.replace(/^mcp__.*__/u, '')} on ${target}`,
      };
};

/**
 * A path word as the shell would hand it on: `$NAME` / `${NAME}` from the
 * environment, `~` as the home directory, resolved against `cwd`. `undefined`
 * for one this cannot know: `cd -`, an unset variable, a substitution, and
 * anything else a `$` is left in.
 */
const expandPath = (word: string, cwd: string): string | undefined => {
  const unset = word
    .matchAll(/\$\{?(\w+)\}?/gu)
    .some((match) => process.env[match[1] ?? ''] === undefined);

  const expanded = word
    .replaceAll(
      /\$\{?(\w+)\}?/gu,
      (_, name?: string) => process.env[name ?? ''] ?? '',
    )
    .replace(/^~(?=\/|$)/u, () => os.homedir());

  return word === '' ||
    word === '-' ||
    unset ||
    expanded.includes('$') ||
    word.includes('`')
    ? undefined
    : path.resolve(cwd, expanded);
};

/**
 * The words of a command split on whitespace, quotes and parentheses alone, so
 * that `(cd x && …)` starts with `cd` and an option keeps its `=`.
 */
const plainWordsOf = (command: string): readonly string[] =>
  command.split(/[\s'"`()]+/u).filter((word) => word !== '');

/**
 * The words a `cd` / `pushd` / `-C` may name a directory with, read two ways
 * and both kept: as the shell would split them, a quoted string one word
 * (`-C "a b"`), and split on quotes too, so that an apostrophe a heredoc's text
 * leaves unpaired hides no `cd` after it.
 */
const directoryWordsOf = (command: string): readonly (readonly string[])[] =>
  [
    Array.from(
      command.matchAll(/'[^']*'|"(?:[^"\\]|\\.)*"|[^\s'";&|()]+/gu),
      ([word]) => word.replace(/^(['"])(.*)\1$/su, '$2'),
    ),
    plainWordsOf(command.replaceAll(/[;&|]/gu, ' ')),
  ] as const;

/**
 * Every directory a command may work in, read generously: the session's, and
 * each word after `cd`, `pushd` or `-C`, resolved from every directory found
 * before it as well as the session's. Which of them the shell is in when it
 * pushes is not worked out — subshells, `pushd` / `popd`, a `cd` inside a
 * quoted message — since a directory read needlessly only adds messages to
 * read, and one that is no repository is skipped. The session's and the latest
 * others found, {@link MAX_DIRECTORIES} at most in each of the two readings.
 */
const directoriesOf = (command: string, cwd: string): readonly string[] => {
  // Each reading starts from the session's directory alone; a directory that
  // does not exist is no place a `cd` can lead from, which keeps the candidates
  // from multiplying. Each reading is bounded on its own, so that a directory
  // only one of them finds is not crowded out by the other's: the session's and
  // 2 × (MAX_DIRECTORIES − 1) others at most, MAX_DIRECTORIES in all when, as
  // usually, they agree. Each is located with a few quick `git` calls; the
  // history is read once per repository they are in.
  const found = directoryWordsOf(command).flatMap((words) =>
    words.reduce<readonly string[]>(
      (seen, word, index) =>
        (DIRECTORY_COMMANDS.has(words[index - 1] ?? '') &&
          !word.startsWith('-') &&
          !word.startsWith('+')) ||
        words[index - 1] === '-C'
          ? Array.from(
              new Set<string>([
                ...seen,
                ...seen
                  .map((base) => expandPath(word, base))
                  .filter((dir) => dir !== undefined)
                  .filter(isDirectory),
              ]),
              // Bounded as it grows, the session's and the latest kept: a push
              // comes after the `cd` that leads to it.
            ).filter(
              (dir, at, all) =>
                dir === cwd || at >= all.length - (MAX_DIRECTORIES - 1),
            )
          : seen,
      [cwd],
    ),
  );

  return [cwd, ...new Set<string>(found.filter((dir) => dir !== cwd))];
};

/** The files one simple command names by its options (see {@link namedFiles}). */
const fileOptionsOf = (segment: string): readonly string[] => {
  const words = plainWordsOf(segment.replaceAll(/[<>]/gu, ' '));

  const isCurl = wordsOf(segment).includes('curl');

  return words.flatMap((word, index): readonly string[] => {
    const at = word.indexOf('@');

    const equals = word.indexOf('=');

    const previous = words[index - 1];

    const next = words[index + 1];

    // `-sST`, and not `-XPUT`: an `X` takes the rest of its cluster as the
    // method.
    const isFileOption =
      FILE_OPTIONS.has(word) ||
      (isCurl &&
        (CURL_FILE_OPTIONS.has(word) || /^-[a-zA-WYZ]*T$/u.test(word)));

    // `--data-urlencode name@file`, and not `q=a@b`, which is content.
    const isUrlencodedFile =
      (previous === '--data-urlencode' ||
        word.startsWith('--data-urlencode=')) &&
      !word
        .slice(0, at)
        .replace(/^--data-urlencode=/u, '')
        .includes('=');

    return at !== -1 &&
      // `@b.json`, `body=@d.md`, and a short option cluster that ends in one
      // taking a value (`-d@b.json`, `-sSd@b.json`, `-F@x`).
      (at === 0 ||
        isUrlencodedFile ||
        word[at - 1] === '=' ||
        /^-[a-zA-WYZ]*[dF]$/u.test(word.slice(0, at)))
      ? [word.slice(at + 1)]
      : equals !== -1 && FILE_OPTIONS.has(word.slice(0, equals))
        ? [word.slice(equals + 1)]
        : // `-Tb.json`, `-sSTb.json`: the file written onto the cluster.
          isCurl && /^-[a-zA-WYZ]*T./u.test(word)
          ? [word.slice(word.indexOf('T') + 1)]
          : next !== undefined &&
              next !== '' &&
              isFileOption &&
              (next === '-' || !next.startsWith('-')) &&
              !next.includes('=')
            ? [next]
            : [];
  });
};

/**
 * The files a command names as the body it sends: after one of
 * {@link FILE_OPTIONS} or a short cluster ending in `-T` (`-sST b.json`),
 * written onto one of them (`--file=./d.md`, `-Tb.json`), every `@file`
 * (`-d @b.json`, `-F body=@d.md`, `-sSd@b.json`, `--data-urlencode name@f`), a
 * file read into a substitution (`--body "$(cat d.md)"`, `$(< d.md)`) and one
 * redirected to standard input (`< d.md`). As written, before any expansion;
 * `-` is standard input, which cannot be read here.
 */
const namedFiles = (
  command: string,
): readonly Readonly<{ file: string; isTagShaped: boolean }>[] => {
  // One simple command at a time, so that `curl`'s options are read as its own
  // only where it runs: `gh … -T` beside it names a template. A line continued
  // with `\` is one command.
  const byOption = command
    .replaceAll(/\\\r?\n/gu, ' ')
    .split(/[;&|\n]+/u)
    .flatMap(fileOptionsOf);

  const byRedirect = [
    ...Array.from(
      command.matchAll(FILE_READ_SUBSTITUTION),
      (match) => match[1] ?? '',
    ),
    ...Array.from(command.matchAll(INPUT_REDIRECT), (match) => match[1] ?? ''),
  ] as const;

  // Each file once, tag-shaped only if every place names it so.
  const mut_named = new Map<string, boolean>();

  for (const [found, isTagShaped] of [
    ...byOption.map((file) => [file, false] as const),
    ...byRedirect.map((file) => [file, TAG_SHAPED.test(file)] as const),
  ]) {
    const file = found.replace(/>$/u, '').replaceAll(/^['"]|['"]$/gu, '');

    // A name of punctuation alone is code a pattern caught, no file.
    if (file === '-' || /\w/u.test(file)) {
      mut_named.set(file, isTagShaped && (mut_named.get(file) ?? true));
    }
  }

  return Array.from(mut_named, ([file, isTagShaped]) => ({
    file,
    isTagShaped,
  }));
};

/** A named file's content in each directory that has it, by its path there. */
const readNamedFile = (
  file: string,
  dirs: readonly string[],
): readonly Readonly<{ resolved: string; content: string }>[] =>
  // Every directory's, since which one the shell is in is not worked out; each
  // by its own path, so that a refusal names the one it read.
  Array.from(
    new Set<string>(
      dirs
        .map((dir) => expandPath(file, dir))
        .filter((resolved) => resolved !== undefined),
    ),
  )
    .filter(isSmallRegularFile)
    .flatMap((resolved) => {
      const content = readText(resolved);

      return content === undefined ? [] : [{ resolved, content }];
    });

/**
 * Git's output in `cwd`, or `undefined` when it fails or takes too long, run
 * with {@link GIT_SAFETY}. `execFile` with a callback rather than
 * `tools/scripts/lib/child-process.mts`, which this file cannot import (see the
 * header).
 */
const readGit = (
  cwd: string,
  args: readonly string[],
): Promise<string | undefined> =>
  new Promise((resolve) => {
    const child = execFile(
      'git',
      [...GIT_SAFETY, ...args],
      {
        cwd,
        encoding: 'utf8',
        timeout: GIT_TIMEOUT_MS,
        // A hundred long messages may pass the default megabyte.
        maxBuffer: 64 * 1024 * 1024,
      },
      (error, stdout) => {
        resolve(error === null ? stdout : undefined);
      },
    );

    // Nothing is written to git; an open stdin would only be something to wait
    // on.
    child.stdin?.end();
  });

/**
 * Where one directory a command names stands: the repository it is in, by the
 * git directory its worktrees share, and the commit it has checked out.
 * `undefined` for a directory in no repository.
 */
const locate = async (dir: string): Promise<Located | undefined> => {
  const [common, head] = await Promise.all([
    readGit(dir, ['rev-parse', '--path-format=absolute', '--git-common-dir']),
    readGit(dir, ['rev-parse', '--verify', '--quiet', 'HEAD']),
  ]);

  return common === undefined
    ? undefined
    : { dir, common: common.trim(), head: head?.trim() };
};

/**
 * What a push from one repository may send: the messages of the commits its
 * branches and the worktrees named have checked out that no remote has, at most
 * {@link MAX_MESSAGES}. Read once for the repository, from `dir`, the first of
 * its directories the command names: a working directory, where `git` runs
 * whatever `safe.bareRepository` says. `heads` are what its named worktrees
 * have checked out.
 */
const readPushed = async (
  dir: string,
  heads: readonly string[],
): Promise<Pushed> => {
  const [refs, log] = await Promise.all([
    // Branches are the repository's, the same from any of its worktrees.
    readGit(dir, ['for-each-ref', '--format=%(objectname)', 'refs/heads']),
    // Not the tags, which a fetch brings in already published, nor a commit the
    // command names by hash, which may be one an amend has just replaced:
    // either would refuse a push for a message it does not send.
    readGit(dir, [
      'log',
      `--format=${COMMIT_START}%H %h %D${MESSAGE_START}%B`,
      // One more than is read, to know whether any was left out.
      `--max-count=${MAX_MESSAGES + 1}`,
      ...heads,
      '--branches',
      '--not',
      '--remotes',
    ]),
  ]);

  const messages = log
    ?.split(COMMIT_START)
    .filter((entry) => entry !== '')
    .map((entry) => {
      const at = entry.indexOf(MESSAGE_START);

      const [hash = '', ...shown] = entry
        .slice(0, Math.max(at, 0))
        .trim()
        .split(' ');

      return {
        hash,
        commit: shown.join(' '),
        text: entry.slice(at + MESSAGE_START.length),
      };
    });

  return {
    dir,
    refs: `${heads.join('\n')}\n${refs ?? ''}`,
    messages: messages?.slice(0, MAX_MESSAGES),
    isCut: (messages?.length ?? 0) > MAX_MESSAGES,
  };
};

const describeCommand = async (
  call: Call,
): Promise<Publication | undefined> => {
  const command = call.toolInput['command'];

  if (typeof command !== 'string' || !isPublishingCommand(command)) {
    return undefined;
  }

  const dirs = directoriesOf(command, call.cwd);

  const words = wordsOf(command);

  // What a push sends changes with its commits, in whichever directory the
  // command pushes from, and so does what was reviewed. Each repository is read
  // once, however many of its directories and worktrees are named.
  const locating: readonly (Located | undefined)[] = isPushingCommand(words)
    ? await Promise.all(dirs.map(locate))
    : ([] as const);

  const located = locating.filter((found) => found !== undefined);

  // The first directory named in each repository, read with what all of its
  // named worktrees have checked out.
  const firsts = located.filter(
    (found, index) =>
      located.findIndex(({ common }) => common === found.common) === index,
  );

  const pushed = await Promise.all(
    firsts.map(({ dir, common }) =>
      readPushed(
        dir,
        Array.from(
          new Set(
            located.flatMap((found) =>
              found.common === common && found.head !== undefined
                ? [found.head]
                : [],
            ),
          ),
        ),
      ),
    ),
  );

  const unreadMessages = pushed.filter(
    ({ messages }) => messages === undefined,
  );

  const cutMessages = pushed.filter(({ isCut }) => isCut);

  const files = namedFiles(command).map(({ file, isTagShaped }) => ({
    file,
    isTagShaped,
    read: readNamedFile(file, dirs),
  }));

  // A tag of a body (`<li>`) that is no file here is not one.
  const unreadable = files.filter(
    ({ read, isTagShaped }) => read.length === 0 && !isTagShaped,
  );

  const notes = [
    // A directory git refuses (`safe.directory`) is found in no repository.
    ...(isPushingCommand(words) && located.length === 0
      ? ([
          'whose repository this hook could not find, so the commit messages it sends were not read (read them yourself)',
        ] as const)
      : ([] as const)),
    ...(pushed.length === 0
      ? ([] as const)
      : ([
          `sending the commits of ${list(pushed.map(({ dir }) => dir))} that no remote has (read them with \`git log -p\` from the branch's upstream, or from \`origin/main\` for a new branch)`,
        ] as const)),
    ...(unreadMessages.length === 0
      ? ([] as const)
      : ([
          `whose commit messages in ${list(unreadMessages.map(({ dir }) => dir))} this hook could not read (read them yourself)`,
        ] as const)),
    ...(cutMessages.length === 0
      ? ([] as const)
      : ([
          `of which this hook read only the newest ${MAX_MESSAGES} messages in ${list(cutMessages.map(({ dir }) => dir))} (read the rest yourself)`,
        ] as const)),
    ...(unreadable.length === 0
      ? ([] as const)
      : ([
          `with ${list(unreadable.map(({ file }) => (file === '-' ? 'standard input' : file)))}, which this hook could not read (read it yourself)`,
        ] as const)),
  ] as const;

  return {
    key: digest([
      command,
      ...pushed.flatMap(({ dir, refs, messages }) => [
        dir,
        refs,
        // The full hash, not the shown one: the refs on a commit move on a
        // fetch, and its abbreviation grows with the repository; neither is new
        // text.
        ...(messages ?? [{ hash: '\0', commit: '', text: '' }]).flatMap(
          ({ hash, text }) => [hash, text],
        ),
      ]),
      ...files.flatMap(({ file, read }) => [
        file,
        ...(read.length === 0
          ? ['\0']
          : read.flatMap(({ resolved, content }) => [resolved, content])),
      ]),
    ]),
    sources: [
      { source: 'the command', text: command, isCommand: true },
      ...files.flatMap(({ read }) =>
        read.map(({ resolved, content }) => ({
          source: `the file \`${resolved}\``,
          text: content,
        })),
      ),
      ...pushed.flatMap(({ dir, messages }) =>
        (messages ?? []).map(({ commit, text }) => ({
          // `abc1234 HEAD -> main, topic`: the commit and the refs on it, so
          // that a branch no push will send can be told and dealt with.
          source: `the message of commit \`${commit}\` in \`${dir}\`, which no remote has yet,`,
          isMessage: true,
          text,
        })),
      ),
    ],
    what:
      notes.length === 0
        ? `\`${command}\``
        : `\`${command}\`, ${notes.join('; ')},`,
  };
};

const describePublication = async (
  call: Call,
): Promise<Publication | undefined> =>
  call.toolName === 'Bash'
    ? describeCommand(call)
    : isGitHubWriteTool(call.toolName)
      ? describeToolWrite(call)
      : undefined;

const reviewReason = (what: string): string =>
  [
    `Held once for review: ${what} may publish to a public place. noshiro-pf/mono is public, and so is everything around it: commits and their diffs, pull request and issue text, comments, reviews, noshiro-pf/mono-screenshots.`,
    '',
    'Re-read every line it publishes (for a push, the commits named above; for a body file, the file) and take out anything only a private source holds:',
    `- a private repository's name, paths, issue or pull request numbers, or contents (${PRIVATE_FULL_NAME} may be named as where findings go, never pointed into or quoted);`,
    "- the internals of the user's employer, clients or other private work: projects, hosts, URLs, people, data;",
    '- credentials, tokens, personal data, or what was said in a private conversation;',
    `- a security finding about this repository, which goes to ${PRIVATE_FULL_NAME} instead.`,
    '',
    'Then run the same call again, unchanged: an identical call passes. A changed one is held once more. A command held that publishes nothing (the words are read generously) is run again the same way. See "Private information" in CLAUDE.md.',
  ].join('\n');

const pointerReason = (
  pointer: string,
  source: string,
  isMessage: boolean,
  isCommand: boolean,
): string =>
  `Refused: ${source} points into the private repository (\`${pointer}\`). A public reader learns where to look, and nothing published can be taken back. Remove the pointer and say what the change does here; repeating the call does not pass it.${isMessage ? ' A commit message is read from every local branch, and from HEAD however it is checked out, that no remote has, so one this push leaves alone refuses it too: reword that commit, or delete the branch (or check out another commit) if it will never be pushed.' : ''}${isCommand ? ' Only if this command publishes nothing (its words are read generously) may the text go into a file written with the Write tool instead; a command that publishes it publishes the pointer, however it is spelled.' : ''} To write to the private repository itself, use the GitHub MCP tools with it as \`owner\` / \`repo\`, which this hook leaves alone, and name its issues there as a bare \`#N\`. See "Private information" in CLAUDE.md.` as const;

const deny = (reason: string): void => {
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })}\n`,
  );
};

const ledgerPath = (sessionId: string): string =>
  path.join(
    os.tmpdir(),
    'claude-public-write-gate',
    `${sessionId.replaceAll(/[^\w-]/gu, '_')}.txt`,
  );

const readLedger = (file: string): ReadonlySet<string> =>
  new Set<string>(
    (readText(file) ?? '').split('\n').filter((line) => line !== ''),
  );

const appendLedger = (file: string, key: string): void => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the ledger under the temporary directory.
    fs.mkdirSync(path.dirname(file), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the ledger under the temporary directory.
    fs.appendFileSync(file, `${key}\n`);
  } catch {
    // Not writable: the call is held every time, which is the safe side.
  }
};

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: this runs with `node`
 * alone (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  process.exit(await main(fs.readFileSync(0, 'utf8')));
}
