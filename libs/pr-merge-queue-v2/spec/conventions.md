<!-- cspell:ignore tmpfs -->

# Conventions — the wire formats

Everything here is read or written by more than one actor: the worker, the
skills, sessions, the Pull Requests Manager page, workflows and people. v2
writes and reads each of them exactly as v1 does. A change to any of them is a
change to every reader at once, so none is changed in v2.

## Labels

Pull request labels:

| label            | meaning                                                                       |
| :--------------- | :---------------------------------------------------------------------------- |
| `merge-queued`   | the author says it is reviewed and may merge; the worker's whole scope        |
| `skip-ci`        | run no checks yet; the check workflows skip, `no-skip-ci-label` holds merging |
| `auto-rebase`    | keep it on the default branch while it waits (honoured only with `skip-ci`)   |
| `blocks-release` | the version pull request waits while this one is open, draft or not           |
| `priority:high`  | picked before unlabelled candidates                                           |
| `priority:low`   | picked after them                                                             |
| `priority:mid`   | read by the page only; the same as no priority to the worker                  |
| `pending`        | read by the page only; the author holds it back                               |

A pull request carrying both `priority:high` and `priority:low` counts as
carrying neither, and the worker's output says so.

Label names are compared case-insensitively, as GitHub compares them (**Changed
in v2**: v1 compared pull request labels exactly and issue labels
case-insensitively).

Issue labels:

| label                                                                   | meaning                                            |
| :---------------------------------------------------------------------- | :------------------------------------------------- |
| `in-progress`                                                           | someone started it (`start-issue`)                 |
| `planned`                                                               | someone means to start it next                     |
| `priority:S`, `:A`, `:B`, `:C`, `:D`, `priority:hold`, `priority:close` | its tier, one per issue (`docs/issue-priority.md`) |
| `duplicate`, `invalid`, `question`, `wontfix`, `pending`                | not handed to `run-issue-resolver`                 |

`issue-closed-labels.yml` takes `in-progress` and `planned` off a closing issue
and releases its claim.

## Declarations in bodies

### `Merge-After:` (pull requests) and `Start-After:` (issues)

- A line matching `^[^\S\n]*merge-after[^\S\n]*:(.*)$`, case-insensitive,
  anywhere in the body; `start-after` likewise. Several lines add up.
- On that line, every match of `(?<![\w./-])#(\d+)\b` names number `N`: not
  after a character that could end a repository name (`other/repo#5` is not
  read), and not followed by a word character (`#12abc` is not read).
  Duplicates are dropped; the result is a set.
- **Lines inside fenced code blocks are not read.** A fence opens on a line of
  three or more backticks or tildes after **any** indentation
  (``^[^\S\n]*(`{3,}|~{3,})``, wider than CommonMark's three spaces) — a backtick
  fence whose info string holds a backtick is inline code, not a fence — and
  closes on a line of at least as many of the same character with nothing after
  them.
- `Merge-After:` on an issue is not read; the page and `pr-report` point it out
  as a slip. `Start-After:` on a pull request is not read.
- The version pull request's body is never read for `Merge-After:`: its body is
  rewritten on every push to the base.
- GitHub's issue dependencies ("blocked by") count as `Start-After:` does. Only
  this repository's count, and they are asked for unless the issue's summary
  says none (**Changed in v2**: an absent summary was taken for none).

### `Merges before #A, …` (written by `open-pr --merge-before`)

``Merges before #A, whose `Merge-After:` names this one.``, under the
`Merge-After:` line B's body opens with, or else its first line. Prose for
people; nothing reads it as a declaration. Only that line is read as it, so that
a person's sentence starting the same way stays theirs. A second run rewrites it
rather than adding another, naming its own and, in the line's order, those named
before that still name B and that B does not merge after; and `pr-description`
does not count it as an edit of the original (**Changed in v2**: v1 set aside
any line starting `Merges before #`).

### Closing issues

The issues a pull request closes are:

- GitHub's `closingIssuesReferences`, where GraphQL is read (it lists only for a
  pull request into the default branch);
- **and** the closing keywords GitHub recognized in the body, read from the
  rendered body: each `<span class="issue-keyword">` followed by a link whose
  `data-hovercard-type` is `issue` and whose `data-url` is this repository's
  issue. A body cannot forge the mark, because GitHub strips `class` from
  written HTML.
- Over REST as over GraphQL: every REST read of a pull request's body asks for
  its rendering too, with `application/vnd.github.full+json` (**Changed in v2**:
  v1's `pr-report` read the text, outside fenced code, without GraphQL). An
  answer without the `body_html` key fails to decode; a null one is GitHub's for
  a null body and closes nothing.

Only this repository's issues count, in first-appearance order, each once. The
owner and name in an issue URL are compared case-insensitively.

### Two-language descriptions

Where `.github/unblock-prs.json` names `translation.heading` (here `日本語`), a
pull request or issue description is:

1. the original, which tools read;
2. a `## <heading>` line, then the translation, its headings the original's one
   level down in the same order;
3. from the first `---` line after it, the trailers: `Start-After:`,
   `Claude-Session:`, and in a pull request the closing keywords.

The rules a write must pass are `commands.md` "`pr-description`".

- `## Review` (`^##\s+Review\b`) heads the review section; the first one in the
  body is the one read, and its first line states the level and the rounds
  (`commands.md`, "`pr-description`").
- `Claude-Session:` (`^[^\S\n]*claude-session[^\S\n]*:`, case-insensitive) names
  the session that opened it.

## Branch names

- **The version pull request** is the one from `changeset-release/<default
branch>`. The branch is its only stable handle.
- **A queue layer** is `queue/pr-<N>` (`N` without leading zeros). Its one
  commit carries, as its last such line, the trailer
  `Queue-Layer: <N> <40-hex head>`: the pull request and the head the layer was
  built from.
- **A branch name the worker acts on** matches `^[\w./+-]+$` and does not start
  with `-`; a queued pull request whose branch does not is reported, never acted
  on.
- **A stack** is read from bases alone: a pull request whose base is the head
  branch of exactly one other open pull request of this repository (not a
  fork's) is stacked on it.

## Comment records

Each record is the **first line** of a comment, a hidden HTML comment, followed
by prose for people that nothing reads back. Three rules hold for all of them:

- **Only comments the reader's own account wrote count** (`viewerDidAuthor` over
  GraphQL, the token's login over REST). The repository is public; anyone can
  post the same first line.
- **One comment per pull request or issue and kind, edited in place.** Of
  several, the oldest is the one, so two writers at once read back the same
  answer. Nothing is deleted: a newer comment beside the record is never read as
  one. A read-back that fails, or names no record or a newer one (it lags),
  settles nothing, and the command says how a rerun or a release settles the
  comment it wrote, which may be the record.
- **The most recent 100 comments are searched** (`RECORD_COMMENT_SCAN`); a
  record older than that is not found, and a new one is posted.

SHAs are always the full 40 hex digits. Instants are UTC to the second,
`YYYY-MM-DDTHH:MM:SSZ`; GitHub's may carry a fraction of a second. An instant
naming no real date or time (`2026-02-30`, `24:00`) is unreadable, and a record
dated by one does not hold (**Changed in v2**: v1 counted it out field by
field).

### Set-aside (written by the worker)

```text
<!-- unblock-prs:set-aside reason=<reason> head=<sha> base=<sha> -->

<prose>

- [ ] Retry: tick this box and the next survey tries this pull request again.
```

- `reason` matches `[a-z][a-z-]*`; the reasons v2 writes are those of
  `decisions.md` "Set-aside reasons". A reason the reader does not know is read
  as a record, and its owner is `none`.
- **The retry box is the last line only**: `^[-*] \[(?<mark>[ xX])\] Retry:`;
  ticked is any mark but a space. A box elsewhere in the prose is not it.
- **Resolved** is the first line `<!-- unblock-prs:set-aside resolved -->`, then
  one line of prose saying why. The worker rewrites a standing comment to this
  rather than deleting it.
- **Moving the base** rewrites only `base=` on the first line, keeping the rest
  of the comment, the box included (a conflict still there after the base
  moved).

### Claim on a pull request (written by `claim-pr`)

```text
<!-- unblock-prs:claim head=<sha> by=<claimant> at=<instant> -->

<prose>
```

- `claimant` is `[^\s>]+`: a session URL or any word unique to the claimant.
- Released: `<!-- unblock-prs:claim released -->` then prose.
- **It holds while the head is the claimed one, from 5 minutes before `at`
  (clock skew) until 120 minutes after.**

### Claim on an issue (written by `start-issue`)

```text
<!-- start-issue:claim state=<planned|started> by=<claimant> at=<instant> -->

<prose>
```

- Released: `<!-- start-issue:claim released -->` then prose.
- A `started` claim holds until released. A `planned` one lapses 24 hours after
  `at`. Both count from 5 minutes before `at`.

### Unowned pull request report (written by `report-unowned-prs`)

An issue whose body contains `<!-- unblock-prs:unowned pr=<N> -->`, titled
`unblock-prs: #<N> is in the queue with no owner`, labelled `priority:A`. One
open issue per pull request.

## Commit statuses and checks the queue relies on

- `no-skip-ci-label`, a commit status `skip-ci-label.yml` sets `pending` while
  `skip-ci` is on. It is required, and it is what holds a pull request whose
  every check skipped.
- Every check workflow triggers on `labeled` and `unlabeled` and skips its jobs
  while `skip-ci` is on.
- A `CODEOWNERS` line `# enforced-by: <context>` says a required check enforces
  the file instead of the ruleset (`decisions.md` "Review holds").

## Local state

Under `~/.local/state/unblock-prs/`, always (not the OS temp directory, often a
tmpfs the pnpm store cannot hard-link across; not under a `.git`, `.cache`,
`dist`, `build` or `out` segment, which `fix:fmt:diff` skips):

- the worktrees of the worker, the auto-fix and every unattended session;
- `run-issue-resolver/<owner>/<name>.json`, the issues sessions left
  (`{ "attempted": { "<N>": "<instant>" | null } }`);
- **new in v2**: `worker/<owner>/<name>.json`, the worker's memory (`worker.md`
  "Memory").
