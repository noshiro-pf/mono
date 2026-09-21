# `pr-report-payload`

The machine-readable copies of the two reports this repository keeps: the
schemas that validate them, the types derived from those, and where the files
live.

Two of them, with different writers:

| branch                 | file                   | written by                             |
| :--------------------- | :--------------------- | :------------------------------------- |
| `data/pr-report`       | `pr-report.json`       | `pr-report`, from `.github/workflows/` |
| `data/unblock-prs-log` | `unblock-prs-log.json` | `unblock-prs`, from a terminal         |

Both are read by `pr-manager-app`, and by nothing else. `pr-report.md` sits
beside the first of them, written by the same run: the same report as prose,
which GitHub renders on the branch. Nothing reads it — it is there so that
moving off the issue costs nobody the thing the issue was good for, a current
report at a URL readable without the app, and so that the job that publishes
it needs `contents: write` and nothing else.

The definitions live here rather than in either end so that there is one of
each, and a test in `tools/scripts/cmd/pr-report/payload.test.mts` builds a
report, serializes it and parses it back — which is the drift this package
exists to prevent.

**The schema is the declaration; the type is `t.TypeOf` of it**, as
`libs/github-settings-as-code` does. Writing both out and annotating the
schema `t.Type<X>` is checked and cannot silently disagree, but it is the same
shape said twice and lists every union's members twice over. The single
exception is `PayloadTreeNode`: its schema names itself, and a `t.recursion`
with nothing to annotate it is `TS7022 — implicitly has type 'any' because it
... is referenced directly or indirectly in its own initializer`. There the
annotation is what breaks the cycle, and the comment beside it says so.

## Why a branch

The page cannot ask GitHub about the pull requests itself. Reading one costs
three requests — the comparison against the base and the two kinds of check —
and an anonymous browser is allowed sixty an hour, shared with everything else
behind the same address. Twenty open pull requests would spend the hour before
the page had loaded once. So the reports do that work in advance and the page
reads what they wrote; the only question is where they write it.

This was an issue body until recently, with the JSON in a collapsed block at
the bottom. It worked, and it was the wrong place: an issue is a thing people
open, read and subscribe to, and a repository that keeps two of them as a
database has two fewer issues for what issues are for. What replaced it had to
clear four bars at once, and only one candidate cleared all four.

| where                   | anonymous read | CORS + `ETag` | the workflow's own token can write it |
| :---------------------- | :------------- | :------------ | :------------------------------------ |
| an issue body           | yes            | yes           | yes, `issues: write`                  |
| **a file on a branch**  | **yes**        | **yes**       | **yes, `contents: write`**            |
| a release               | yes            | yes           | yes                                   |
| a gist                  | yes            | yes           | no                                    |
| the wiki                | **no**         | **no**        | no                                    |
| a Project, a Discussion | **no**         | —             | no                                    |

A release clears every bar and loses on where it puts things: at the top of
the page this repository publishes npm packages from. A gist is outside the
repository altogether and would need an account-level credential stored in the
workflow, which is a larger thing to hold than `contents: write` on one
repository.

The last two are worth being explicit about, because they are the obvious
candidates. The wiki has no REST API at all, and `github.com/<owner>/<repo>/wiki`
sends no `Access-Control-Allow-Origin`, so a browser cannot read it either way.
Projects v2 is GraphQL-only, and GraphQL answers an anonymous caller `403` —
which would have turned this page's optional token into a required one, and
`read:project` is a far stronger token than the one with no permissions at all
that the page asks for today.

## How the branches behave

**One writer each, which is why there are two branches rather than one.** Each
writer force-pushes a fresh orphan commit, so its branch is one commit holding
one file however long this goes on, and the repository never accumulates a
commit per report. Two writers doing that to one branch would delete each
other's file.

**Nothing watches them.** Every `push:` trigger in `.github/workflows/` names
`main`, and the rulesets under `repo-settings/` cover `main` and `archive/**`.
A push here starts nothing and is refused by nothing. `main` itself stays out
of reach of the token that writes these: `main-no-bypass.json` forbids
creation, deletion and non-fast-forward there with no bypass actors, and a
`GITHUB_TOKEN` cannot write `.github/workflows/` at all.

**The reader reads the contents API**, `?ref=<branch>` with
`Accept: application/vnd.github.raw`, and every property it depends on is
measured from a `noshiro-pf.github.io` origin: the answer carries
`Access-Control-Allow-Origin`, exposes `ETag` and the `X-RateLimit-*` headers
to scripts, and does both on the `304` as well as on the `200`. The `ETag` is
the blob's SHA, which is a better one than the issue body's was — it changes
exactly when the content does, so a report rewritten to identical bytes costs
the page no re-render. `Cache-Control` is `max-age=60`, the same as the issues
it replaced sent.

## What is in it, and what is not

The payload is not everything `pr-report --format json` prints. Two fields are
deliberately left behind:

- **the pull request bodies**, by far the largest thing read about a pull
  request, and nothing displays them — what is read _out_ of them, the
  `Merge-After:` numbers and the issues each one closes, is in the payload
  already;
- **the per-context verdict map**, which `checks` summarises.

Both of those grow with the number of open pull requests, and neither is ever
displayed. What is carried instead is one thing the
reader could not
work out for itself: the `summary` counts, because `queued` is a label whose
spelling lives in the workflows and in `tools/scripts/cmd/unblock-prs/`, and
`failing` is a verdict reached over the contexts the ruleset requires.

`generatedAtEpochMs` sits beside the ISO `generatedAt` for the same kind of
reason: parsing a date _string_ is the one operation whose result the language
leaves to the implementation, and a page saying "generated 3 hours ago" should
not be computing that from an implementation-defined parse.

## The `unblock-prs` log

Events, not lines. What that script prints is prose meant to be watched live;
what is worth keeping is the shape underneath it — which pull request, what
was done, how it turned out — which is also what a page can lay out as rows.
The caps (`RUN_LOG_MAX_RUNS`, `RUN_LOG_MAX_EVENTS`) are here because this is
the one payload that grows without an upper bound of its own, and the file is
rewritten whole each time: the oldest runs are dropped rather than left to
grow a branch that is force-pushed on every run of the script.

## Versions

`PAYLOAD_VERSION` is checked before the schema is, so that a payload from
another age is reported as that rather than as a field of the wrong type. The
two sides are deployed together — the workflow runs from `main` and the app is
built from `main` — so a mismatch is transient, and `parsePayload` says which
way round it is, which is what tells a reader whether to reload or to wait.

Excess properties are accepted, which is what lets a newer report carry a
field this app has no use for yet without taking the page down.

## Checks

```sh
pnpm run check:test    # the files, round-tripped and fed the wrong things
pnpm run check:types
pnpm run check:lint
```

The drift this package exists to prevent is caught in
`tools/scripts/cmd/pr-report/payload.test.mts`, which builds a report, turns
it into a payload, serializes it, and parses it back with the reader's own
code.
