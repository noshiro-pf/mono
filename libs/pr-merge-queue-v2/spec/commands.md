<!-- cspell:ignore unlabel -->

# Commands

Every command keeps its v1 name, options and exit codes. Unless a command says
otherwise:

- **Token**: `GH_TOKEN`, then `GITHUB_TOKEN`, then `gh auth token`; refused
  without one. **Repository**: `--repo`, else `origin`, else the root
  `package.json`.
- **Proxy**: Node's `fetch` reads `HTTPS_PROXY` only once told to (without it
  the request bypasses the proxy and fails as `401 Bad credentials`). The
  command tells it with `http.setGlobalProxyFromEnv()` where Node has it (25.4
  and later); an older Node is told only from outside, by
  `NODE_USE_ENV_PROXY=1`, which the root script of each command is to set.
- **GraphQL** is refused by a Claude Code session's proxy, so every command a
  session runs reads REST only, through the REST reader, and writes by GraphQL
  only where REST has no equivalent (drafts, auto-merge), saying so plainly when
  that step is refused. The worker and the page read GraphQL.
- **Comments are trusted only from the token's own account.**
- `--dry-run` prints the steps and writes nothing. It makes the checks a run
  makes before its first write, and exits 1, with the reason, when one refuses
  or cannot be made. `-h`, `--help` prints the usage. Exit 0 on success, 1 on a
  refusal or failure, with the reason.
- **Idempotent**: each step is skipped when it is already done, so a run that
  failed half way is finished by running it again.

## `open-pr`

Pushes the current branch, opens its pull request **ready for review**, adds
`skip-ci` then `auto-rebase` (in that order, so the `labeled` run finds the
checks held). Never merges, never adds `merge-queued`, **never arms
auto-merge**.

| option               | default                 | meaning                                           |
| :------------------- | :---------------------- | :------------------------------------------------ |
| `--title <text>`     | the last commit subject | the title                                         |
| `--body-file <path>` | the trailer, or empty   | the body                                          |
| `--base <branch>`    | the default branch      | the target; another open pull request's stacks it |
| `--merge-after <n>`  |                         | declare a predecessor; repeatable                 |
| `--merge-before <n>` |                         | write this one into `<n>`'s `Merge-After:`        |
| `--dry-run`          |                         | print the steps                                   |

- Refuses on the default branch, on a detached HEAD, without a credential.
- **A body file** is checked by `pr-description`'s rules before anything is
  pushed, where `translation.heading` is configured.
- **`--base` another pull request's branch**: exactly one open pull request must
  be from it, and the branch must contain `origin/<base>`'s tip; the layer below
  goes first on the `Merge-After:` line at the top of the body.
- **An existing pull request** keeps its title and body (and says so), is taken
  on its own base when no `--base` is given, and gets only the `Merge-After:`
  numbers this run declares that it does not name yet. One open against another
  base than `--base` is refused before pushing. A draft is marked ready.
- **Closing issues' order**: after the pull request exists, the open pull
  requests the `Start-After:` (and "blocked by") of the issues it closes name —
  an open issue named standing for the open pull requests closing it — are added
  to the top `Merge-After:` line.
- **`--merge-before <A>`**: refused before pushing when A is not open, is the
  version pull request, or is one this merges after (its stack included). After
  B exists, B's own `Merge-After:` (and what its closing issues add) is checked
  for A; naming A stops before A is written. Otherwise A's `Merge-After:` line
  gets B (or one is written at the top), unless it names B already, and B's body
  then carries the `Merges before` line, under its `Merge-After:` line or at the
  top.
- **Changed in v2**: one open already is listed again after the push; one closed
  meanwhile stops the run before it is labelled or written into, and one that
  cannot be listed is taken as it was. The labels go on as soon as the pull
  request exists, before a draft is marked ready and before any body is written,
  so that a run failing in between leaves it held; two open pull requests from
  the branch are refused rather than the first taken; and the open pull requests
  the closing issues' order is looked for among are read to the list's end,
  where v1 read the first hundred. The `Merges before` line goes into B's body
  once every A names B, so that a run refused before then leaves no line saying
  they do, and goes into a
  B open already too.

## `pr-description`

Reads and writes a description written twice (original and translation), keeping
the halves mirrored.

```text
pr-description read <n>                         # translation left out
pr-description pull <n> --file <f>              # save to edit, and <f>.pulled
pr-description push <n> --file <f> [--wording-only]
pr-description check --file <f> [--issue]
pr-description similar --title <t> [--keyword <k>]...
pr-description create --title <t> --file <f> --priority <S|A|B|C|D|hold> [--label <l>]... [--not-duplicate <n>]...
```

A body is refused by `push`, `create`, `check` and `open-pr --body-file` when:

- the `## <heading>` line is missing or there twice, or a half is empty;
- the translation's headings are not the original's one level down, in order (an
  original opening under no heading lets the translation add one);
- a `#N` is in one half only (not counting code, tables, declarations, nor a
  pull request's closing keywords);
- the translation's fenced code blocks are not the original's, one for one, in
  order and unchanged but for their indentation (so either half reads on its
  own; #3814);
- the translation holds a table, an image, or a `Merge-After:` line;
- either half holds a trailer (`Start-After:`, `Claude-Session:`, a pull
  request's closing keyword): trailers go after the `---` rule. In an issue a
  closing keyword is prose (`push` asks GitHub which the number is);
- the original has more than one `## Review` (suffixed ones included), or the
  translation has one (its section is `### レビュー`);
- the original's `## Review` does not open with the review line, the level and
  the total of rounds in digits (see "Review line" below), going on only after
  `.`, `,`, `;` or `:`;
- an item under a `**Deferred**` line of `## Review` does not open with
  `(predates)`, `(another change)` or `(too large)`, or the line has neither
  items nor `none`;
- a `Merge-After:` or `Start-After:` line outside code fences, the trailers
  included, names no `#N` (a URL, `owner/repo#N` or a bare number is not read),
  or a line meant as one is no declaration line: its key behind a list marker
  (`-`, `+`, `*`, a number, a task box) or emphasis, or emphasis between the key
  and its colon. A quote, inline code, a heading, link text, strikethrough, a
  full-width colon and a flag (`--merge-after`) are left alone.
  Checked without `translation.heading` too, by `check` as well (#3925);
- with `pullRequestDescription.openingHeading` set, a pull request's original
  does not open with `## <openingHeading>`, declarations, the `--merge-before`
  note and HTML comments aside (#3814). Issues are not asked.

Review line, one of:

```text
`/code-review high`, 3 rounds.
Review at `high`, 2 rounds.
Self-review at `high`, 1 round.
```

`pull` refuses to write over an edit in `<f>` that was never pushed, and warns
when the description as pulled would be refused. `push` also refuses when the
description changed on GitHub since the `pull`, and when one half changed and
the other did not (trailing spaces, blank-line runs and the `Merge-After:` line
do not count); `--wording-only` lets one half change alone. `push` refreshes
`<f>.pulled`.

`create` needs `--priority`, refuses a `priority:` `--label` and `close`, and
refuses while an open issue's title is close to the new one
(`DUPLICATE_THRESHOLD`), listing them, unless each is named with
`--not-duplicate`. `similar` lists open issues with a close title and those
naming a `--keyword` as written.

A number that answers as another repository's (an issue transferred away) is
refused, since a push would land there (**Changed in v2**: v1 followed the
redirect). The command does not ask whose the token is, so an installation's
token serves.

Without `translation.heading`: `read` prints whole, `push`, `create` and `check`
check only the `Merge-After:` and `Start-After:` lines; `push` still refuses a
description changed since the `pull`.

## `pr-report`

Reads every open pull request and prints a report; writes nothing, so it runs
with a read-only token or none (anonymous: 60 requests an hour, closing issues
from body keywords only, and the report says so).

```text
pr-report [--format terminal|markdown|json] [--repo <o/n>]
          [--merged-days <n>=7] [--merged-limit <n>=20] [--issues-limit <n>=30]
```

Sections: the merge order as a forest (`stacked on #N`, `after #N
(Start-After)`, `#N (issue) not done`), cycles named apart; per pull request its
closing issues, labels, auto-merge only when armed, the verdict over the
required contexts with each named (`stale red:` under `paused`), ahead/behind
its base; the recently merged; the open issues (most recently updated first,
`+` on a full list) with their start state, what their `Start-After:` names and
where each stands, and a misplaced `Merge-After:` pointed out. **New in v2**
(#3233): each `in-progress` / `planned` issue shows its claimant and the
claim's age.

It fails, naming what, when more than `MAX_OPEN_PULLS` are open, or when any
pull request's checks or statuses cannot be read.

**`--format json`** is `PrReport` with each entry also carrying `reported` (an
object), `setAside` and `claim` (`{ commentId, says, applies }`, absent when
none) and `owner` (`{ owner, reason }`, absent off the queue or when comments
could not be read). The skill reads it; its shape does not change.

## `claim-pr`

```text
claim-pr <n> --by <claimant> [--release] [--repo <owner/name>]
```

(**New in v2**: `--repo`.)

Writes (or renews) the claim comment, then reads back after a pause: of two
writing at once, the oldest claim comment wins and the other exits 1. Refused
when the owner is not `skill`, or someone else's claim holds. `--release`
rewrites it as released, and a number that names no pull request is refused.
(**New in v2**: a closed pull request is released too, where v1 refused it, for
one reopened would find the claim holding again.)

## `push-fixed-pr`

```text
push-fixed-pr <n> --by <claimant> --head <commit>
```

Refused unless the owner is `skill` and the holding claim is `--by`'s, and, on a
`generatedBranches` branch set aside `rebase-failed`, when the commit is a
hand-resolved conflict (it names `rebuild` instead). Puts `skip-ci` on if it is
not, pushes `<commit>` leased against the claimed head, and carries the stacked
layers along (skipping one a claim holds on, the claimant's own included, which
a restack would end, and one whose comments cannot be read, a claim on it
unknown; for the claimant's own it prints the
`git rebase --onto <target> <the head below as read> <its head>` to move it by:
the target exact when the push moved the layer below, a placeholder when it did
not, and none when the layer below is the claimant's too, whose own push prints
it), with the worker's own push and restack code.
(**New in v2**: a fork's branch is refused, as the worker never pushes to one.)

## `rework-pr`

```text
rework-pr start [--dry-run]
rework-pr done (--requeue | --review) [--dry-run]
```

On the current branch's pull request. Both refuse one someone claimed, or one
set aside for a skill (that is `claim-pr` and `push-fixed-pr`), and one whose
comments cannot be read. (**Changed in v2**: a GraphQL refusal is told by how
the answer is classified, `refused`, not by matching its message; a 408 and a
429 are not refusals.)

- **`start`**: `skip-ci` on; `merge-queued` off, recording GitHub's unlabel
  event under the clone's git directory (**Changed in v2**: the event must be
  newer than every one listed before the label came off, so that an older
  unlabel shown early is not taken for it); auto-merge disarmed; draft. Without
  GraphQL: held by the labels alone, and said; armed and not disarmable fails.
  The queue is read before any of it, as v1 does, though with the checks
  (**Changed in v2**), which makes the read, and the window before the hold,
  longer.
- **`done`**: refuses uncommitted changes and untracked files not ignored;
  refuses a head on GitHub the local branch never had (its reflog), as
  `--force-if-includes` does, a dry run included, and fails, without a refusal,
  when that history cannot be read (no reflog); pushes the commit checked out
  with the worker's leased push, leased against the head the queue read
  (**Changed in v2**: v1 pushed `--force-with-lease --force-if-includes` against
  the remote-tracking branch, and could not tell a push whose answer was lost
  from one that failed); carries the stacked layers along (skipping one a claim
  holds on, or whose comments cannot be read); marks it ready; then
    - `--requeue`: puts `merge-queued` back last, only if `start` took it off
      and that unlabel is still the label's last event;
    - `--review`: leaves `merge-queued` off for the author to queue again.

## `report-unowned-prs`

```text
report-unowned-prs [--dry-run] [--repo <owner/name>]
```

Files one issue (`conventions.md`) per queued pull request whose owner is
`none`, unless an open issue of this account already carries its marker
(anywhere in its body, every page of issues read), one at a time. Reads no issue
when no owner is `none`. A queued pull request whose owner could not be read is
said apart (one the queue does not cover has no owner, read or not), and so is
one nobody owns whose comments could not be read: it is filed by a run that
reads them, so that the one report carries them. Exits 1, after filing all it
can, when an issue could not be filed, the issues could not be listed (then
nothing is filed), or an owner or those comments could not be read (**Changed in
v2**: v1 passed over an unread owner and exited 0 for each).

## `start-issue`

```text
start-issue <n> --by <claimant> [--plan | --release] [--force] [--repo <owner/name>]
```

(**New in v2**: `--repo`.)

- default: write a `started` claim, read back after a pause (the oldest claim
  wins), then add `in-progress` and take `planned` off;
- `--plan`: a `planned` claim and the `planned` label;
- `--release`: take both labels off, release the claim.

Refused — exit 1 with whose it is — when another claimant's claim holds, when it
is labelled `in-progress` with no claim naming the claimant, or when an open
pull request closes it by keyword. The claimant itself may run it again (a start
is renewed, a plan becomes a start). `--force` goes past a refusal.

## `startable-issues`

```text
startable-issues [--limit <n>] [--author <login>]... [--theme <name>] [--by <claimant>] [--repo <owner/name>]
```

Lists the issues to start next, writing nothing (**New in v2**: `--repo`, as
every other command takes it). Startable: start state `ready` or `free`, not
`in-progress` or `planned` (by label or **live claim**, v2), no open pull
request closes it, written by `--author` (default the token's account), none of
`duplicate`, `invalid`, `question`, `wontfix`, `pending`, `priority:hold`,
`priority:close`, and not left by a `run-issue-resolver` session (its record).

Themes: the scope a title starts with (`feat(synstate): …`), with the package
that scope lives in, and the packages its body names by path. Order without
`--theme`: every `priority:S`, then the highest-tier issue left with the rest of
its theme whatever their tier (`D` only after a `D`), then the next; an issue
below `S` whose theme another session started on is held back and named at the
end. With `--theme` (prefix: `synstate` takes `synstate-dom`): that theme alone,
its `S` first; issues another session started in it are named on the first line
and left to it. `--by` names who asks, so a theme only its own started issues
are on is not held back.

## The unattended loop

**New in v2** (#3089): `run-unblock-prs-skill` and `run-issue-resolver` share
one loop: the interval pause, logging only what changed, stop handling (the
first signal finishes, a second stops at once and passes SIGTERM on), fatal
errors, the per-session worktree under `~/.local/state/unblock-prs/`, and the
Claude Code session runner.

The runner, for both:

- **The API key only.** Refuses to start without `ANTHROPIC_API_KEY`; leaves
  `ANTHROPIC_AUTH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN` and the Bedrock, Vertex and
  Foundry switches out of the session's environment and blanks them in its own
  settings; stops the session at its first event when Claude Code reports
  another credential, or does not know the skill (or `/code-review`, for the
  resolver).
- `claude -p --permission-mode dontAsk`, `Bash` and file tools allowed, `gh` and
  `git push` denied by prefix (a slip guard, not a boundary).
- Each session's cost and id are logged.

### `run-unblock-prs-skill`

```text
run-unblock-prs-skill --max-budget-usd <usd> [--model <m>] [--skill <name>]
                      [--interval-min <n>=10] [--once] [--dry-run]
```

Reads the queue as the skill's first step does, with no model. Starts one
session per pull request that is the skill's and unclaimed, in the skill's
order, the next as soon as one ends; looks again every `--interval-min` once
none is left. Files `report-unowned-prs` itself, once per pull request nobody
owns while it runs; a run that could not file or read everything is asked again
next round (**Changed in v2**: v1 matched its text for the numbers it failed;
nothing is ever filed twice). A pull request a session ended on without fixing
is not handed on again until its head or set-aside reason changes; at most three
sessions per pull request per run. A session that failed before spending is
retried next look (the first such stops the command). A claim a session left
standing is released when it ends. The skill:
`unblock-prs` when `.claude/skills/unblock-prs/` exists, else
`pr-merge-queue:unblock-prs`.

### `run-issue-resolver`

```text
run-issue-resolver --max-total-usd <usd> [--max-sessions <n>=10]
                   [--concurrency <n>=3, at most 8] [--interval-min <n>=30]
                   [--author <login>]... [--model <m>] [--once] [--dry-run]
```

Starts one session per startable issue (as `startable-issues` decides, tier
order then oldest first), up to `--concurrency` at once, never two on one issue
or one theme (below `S`); `start-issue` under a run claimant first. The session
checks whether it is already done (closes it, naming what did it), whether one
pull request can finish it without a person (comments why not), else does it and
opens it with `open-pr` ending `Closes #N`. An issue with no open closing pull
request when the session ends is released and recorded in
`run-issue-resolver/<owner>/<name>.json`, not handed on until it changes.

Budget: until a session resolves an issue and reports its cost, one at a time,
each capped at a quarter of the total; after, each at three times the average
resolved cost or the dearest, whichever is more, but no more than what is left
(never below the average). Caps of running sessions are held out of the total;
an unreported cost counts as the whole cap. A session its cap stopped is not
recorded. `--max-sessions` counts started sessions that spent anything. A
session that did not get going stops further starts.

## `.github/unblock-prs.json`

Optional; its JSON schema is generated from the config's type
(`gen:config-schema`).

| key                            | meaning                                                                                     |
| :----------------------------- | :------------------------------------------------------------------------------------------ |
| `translation.heading`          | the heading of the translation half of a description                                        |
| `autoFix.ignore`               | regular expressions of failed contexts not read (the aggregates)                            |
| `autoFix.before`               | commands run first, always                                                                  |
| `autoFix.prepare[]`            | `{ context, run }`: run once when a context being fixed matches                             |
| `autoFix.fixers[]`             | `{ context, run, stage }`: every failure must match one; `$1`–`$9` its groups, shell-quoted |
| `autoFix.after`                | commands run last, always                                                                   |
| `autoFix.notFixableAnnotation` | the check-run annotation title, at any level, that says a job's command failed              |
| `regenerate.before`            | commands run before the generators                                                          |
| `regenerate.generators[]`      | `{ path, run }`: a conflicted file matching `path` is regenerated                           |
| `generatedBranches[]`          | `{ branch, rebuild }`: rebuilt, never rebased by hand                                       |
| `speculate.workflows`          | the workflow files dispatched on a queue layer                                              |
| `speculate.depth`              | how many leading candidates are layered                                                     |

`check:root:auto-fix-contexts` fails when a `prepare` or `fixers` context
matches no check the pull request workflows produce.

## The Claude Code plugin

`claude-plugin/` ships the `unblock-prs` skill (fixes what the worker set aside:
claim, reproduce, fix, `push-fixed-pr`; runs `report-unowned-prs` every round)
and the `resolve-issues` skill (takes the first N `startable-issues`, a serial
stack of pull requests opened with `open-pr`). Its version is the package's.
Their text moves to v2 unchanged except for command paths.
