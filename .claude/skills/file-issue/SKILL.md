---
name: file-issue
description: File an issue in this repository the one way that places it in a priority tier and checks it is not a duplicate — look for an open issue it repeats, choose its tier by docs/issue-priority.md, write the description in English and Japanese, and create it with `pr-description create --priority`. Use whenever an issue is to be filed: a review finding deferred, a follow-up, a bug found in passing, or when asked to open an issue.
---

# File an issue

Every open issue carries exactly one `priority:<tier>` label, and no two open
issues are about one problem. Filing through this procedure keeps both true;
`pnpm run pr-report` names any issue that slips past it.

## 1. Is it a security finding?

A finding that reads as a way to break in — bypassing authentication or a
permission, exposing personal data, steps an attacker could follow — goes to the
private `noshiro-pf/mono-security`, never here (`CLAUDE.md`, "Security
findings"). Stop here for one of those. Hardening with no way in (a missing
CSP, a rule narrower than it needs to be) may be filed here.

## 2. Look for the issue it repeats

```bash
pnpm run pr-description -- similar --title '<the title you mean to give it>' --keyword <name> --keyword <name>
```

Pass as keywords the names the issue is about, as written in the code: the
function, the file, the rule, the command. Read each issue it lists that could
be the same problem (`pnpm run pr-description -- read <N>`).

- **It is the same problem**: add what is new to that issue instead —
  `pr-description pull`, edit both halves, `push` — and say which issue you
  added to. File nothing.
- **It is part of a larger issue that lists it**: the same; do not split it out
  unless the larger one is a progress issue and this part needs a `Start-After:`
  of its own (`docs/issue-start-after.md`).
- **It is another problem**: note the number for step 5.

## 3. Choose its tier

Read [`docs/issue-priority.md`](../../../docs/issue-priority.md) and apply
"決め方" in order; the first rule that applies decides, and a doubt goes to
the higher tier. A bug's tier depends on whether anyone but the author uses
the app: take it from "実ユーザーのいるアプリ", and **ask the user about an
app that list does not name**, then add their answer to the list in your pull
request.

A `Start-After:` must not name an issue in a lower tier than this one. If it
would, split out the part this one needs into an issue at least this tier, and
name that; or drop the declaration if it is only a better order.

## 4. Write the description

English first, then the Japanese under `## 日本語`, its headings the
English's one level down (`CLAUDE.md`, "Japanese text"); trailers —
`Start-After:` — after a `---` rule at the end. Say what happens, where (paths,
links pinned to a commit), and what done looks like. A closing keyword
(`resolves #N`) is prose in an issue, where GitHub acts on none. Check it:

```bash
pnpm run pr-description -- check --file <path> --issue
```

## 5. Create it

```bash
pnpm run pr-description -- create --title '<title>' --file <path> --priority <S|A|B|C|D|hold> [--not-duplicate <N>]...
```

`create` refuses while an open issue has a close title; name each one you read
in step 2 and found to be another problem with `--not-duplicate`. Never pass a
`priority:` label as `--label`, and never add or change one later by another
route without taking the old one off: an issue has exactly one tier.

Report the new issue's number and tier, and link it from wherever it was
deferred.
