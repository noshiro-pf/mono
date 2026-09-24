# Reading GitHub without `gh`

Shared by the skills beside it. This directory holds no `SKILL.md` and is not
a skill; it is the one copy of the recipes more than one of them needs.

`CLAUDE.md`, "Session rules" forbids a session the `gh` CLI — it authenticates
as a person, and a session acting as one is the thing that rule is about. A
scheduled run in a container has a second reason: there is no `gh` login there
to act as, only a token. So everything here is the REST API, called the way
`tools/scripts/cmd/open-pr/api.mts` calls it.

`pnpm run unblock-prs` and `pnpm run open-pr` are not affected by any of this.
The first shells out to `gh` and stays the author's to run; the second calls
this same API and is the one a session runs.

## The credential

`GH_TOKEN` (or `GITHUB_TOKEN`) is in the environment. Check it is there with
`[ -n "${GH_TOKEN:-}" ]` and **never echo it** — printing it puts a credential
in the transcript, where it stays.

It is a fine-grained token whose permissions are per environment. A write that
answers `403 Resource not accessible by personal access token` is a token
narrower than the call, and the fix is to say which permission the call needs
and stop, not to find another route. The `x-accepted-github-permissions`
header is what the endpoint accepts, not what the token holds.

## One call

```bash
gh_api() {
    curl -sS \
        -H "Authorization: Bearer $GH_TOKEN" \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "User-Agent: noshiro-pf-mono" \
        "https://api.github.com/$1"
}
```

The `User-Agent` is not optional; GitHub rejects a request without one. `curl`
exits 0 on a 404 or a 403, so a refusal arrives as a body reading
`{"message": ...}` rather than as a failure — pass `-w '\n%{http_code}\n'` on
anything that writes.

`jq` is not installed. Read JSON with `python3 -c`, or let a script do it.

**GraphQL is refused by the proxy.** Nothing here may depend on it, which
rules out `mergeStateStatus`, `closingIssuesReferences`, marking a pull
request ready for review, and arming auto-merge. Each has a REST substitute
below or is something a session must not do anyway.

## What replaces each `gh` command

| `gh`                                    | here                                                         |
| :-------------------------------------- | :----------------------------------------------------------- |
| `gh pr list`, `gh pr view`              | `pnpm run pr-report -- --format json`, or `GET /pulls`       |
| `gh pr checks`                          | `pnpm run pr-report`; by hand, the two endpoints below       |
| `gh pr checks --watch`                  | a poll loop — there is no server-side wait                   |
| `gh run view --job <id> --log-failed`   | `GET /actions/jobs/{id}/logs`, whole log, grep it            |
| `gh pr edit --title`                    | `PATCH /pulls/{n}`                                           |
| `gh pr comment`                         | `POST /issues/{n}/comments`                                  |
| `gh pr update-branch --rebase`          | `PUT /pulls/{n}/update-branch`                               |
| `gh api repos/{o}/{r}/rules/...`        | same path through `gh_api`                                   |
| `gh pr merge`, `--auto`, `gh pr review` | nothing. A session does not merge, arm auto-merge or approve |

## Whether a pull request is green

**Use `pnpm run pr-report`.** It reads both places GitHub keeps a verdict and
judges the result against the contexts the ruleset requires, which is more
than one trap deep — `tools/scripts/cmd/pr-report/README.md` says which
traps it handles, and its tests are what hold that. Reading the endpoints by
hand and comparing what comes back to "how many are green" gets each of them
wrong.

The three below are the ones to know either way, because they are about
GitHub rather than about the script.

`--format json` gives one object per pull request, with `checks.verdict`
(`passed` / `failing` / `pending` / `paused`), `checks.failed`,
`checks.missing`, `labels` (each `{ name, color, description }`),
`autoMerge`, `headSha` and `comparison.behindBy`.

**`json`, not `payload`.** The `payload` format is what the pull request page
reads, and it leaves out what a page does not display — `headSha` among it,
which is the field that says whether the branch moved under you.

Read by hand, this is what to watch for:

- **A required context that has not reported is absent, not pending.** Three
  minutes into a twenty-five minute matrix, four of nine contexts are green
  and none is listed as waiting. Count against the required list, never
  against what came back.
- **`no-skip-ci-label` is a commit status, not a check run.** It is in
  `GET /commits/{sha}/status` and not in `GET /commits/{sha}/check-runs`. A
  reader of only the second calls the context that holds every labelled pull
  request missing. Where one name is both, GitHub asks both to pass — so the
  stricter of the two is the verdict, and a green status does not cover a red
  check run of the same name.
- **A name reports more than once, and the newest run is not the answer.**
  The run the `opened` event starts is cancelled by the `labeled` event's,
  and both stay on the commit — the cancelled one leaving its `*-result`
  aggregate concluded `failure`. GitHub resolves the context to the run in
  the check suite with the **greatest id**, not the one that started or
  finished last. Every suite of one push is created in the same second, so
  which suite got the higher id is luck: usually the superseding green one,
  and when it is not, the stale red holds the merge until something pushes
  or re-runs. `CLAUDE.md`, "Commits and pull requests" says to ignore that
  red; this is the case where GitHub does not, and a reader who sorts by
  `started_at` calls a blocked pull request green.

`pr-report` reads the required contexts from `repo-settings/rulesets/main.json`
rather than from GitHub, because the API that serves a ruleset wants an admin
token. The file is the desired state, and a context in it that
`repo-settings:apply` has not applied yet is required by nothing. When the
difference matters, ask GitHub:

```bash
gh_api 'repos/noshiro-pf/mono/rules/branches/main' | python3 -c '
import json, sys
for rule in json.load(sys.stdin):
    if rule.get("type") == "required_status_checks":
        for check in rule["parameters"]["required_status_checks"]:
            print(check["context"])'
```

## The open pull request for a branch

```bash
gh_api 'repos/noshiro-pf/mono/pulls?state=open&head=noshiro-pf:chore/pnpm-update'
```

`head` is qualified with the owner. A bare branch name also matches the same
name on a fork, and mistaking someone else's pull request for the one being
acted on is how a session pushes to the wrong place.

## Whether a branch is behind its base

```bash
gh_api 'repos/noshiro-pf/mono/compare/main...chore/pnpm-update' | python3 -c '
import json, sys
d = json.load(sys.stdin)
print(d["status"], "behind_by", d["behind_by"], "ahead_by", d["ahead_by"])'
```

This is the REST answer to what `mergeStateStatus: BEHIND` said. The
`mergeable_state` field on `GET /pulls/{n}` says something similar, but GitHub
computes it asynchronously and serves it from a cache, so it is regularly
stale after a force-push or a base that has just moved. `behind_by` is
counted on the spot.

## Which job failed, and why

A `*-result` aggregate does not name what failed — it is an `if: always()`
job asserting on its `needs`. Go from it to the run, and from the run to the
job that actually failed.

The aggregate's `details_url` is `.../actions/runs/<run_id>/job/<job_id>`.
With the run id:

```bash
gh_api 'repos/noshiro-pf/mono/actions/runs/<run_id>/jobs?per_page=100&filter=latest' \
    | python3 -c '
import json, sys
for job in json.load(sys.stdin)["jobs"]:
    if job["conclusion"] not in ("success", "skipped", None):
        print(job["id"], job["name"], job["conclusion"])'
```

Then the log. There is no `--log-failed`: the whole job log comes back as
plain text, tens of kilobytes of it, so grep rather than read.

```bash
curl -sSL -H "Authorization: Bearer $GH_TOKEN" -H "User-Agent: noshiro-pf-mono" \
    "https://api.github.com/repos/noshiro-pf/mono/actions/jobs/<job_id>/logs" -o job.log
grep -nE '##\[error\]|ELIFECYCLE|ERR_PNPM' job.log
```

**`ELIFECYCLE` names the command that failed.** The first error-looking line
is usually further from the cause than that is. Which step failed is also in
`steps[].conclusion` on `GET /actions/jobs/{job_id}`.

For a job GitHub Actions ran, the check run id **is** the job id, so an
aggregate's own check run id can go straight to `/actions/jobs/{id}`. For a
check run from any other app — every `codecov/*` — that id means nothing and
the endpoint answers 404.

## A stale red that is holding the merge

When a required context fails because the run in the greatest check suite id
is a cancelled one — the case above — nothing is wrong with the branch, and
reproducing the failure locally finds nothing. What holds the merge is that
GitHub has no newer answer for that context.

Find which run is holding it: list the runs of that name and take the one in
the greatest `check_suite.id`, then read its `details_url` for the run id.

```bash
gh_api 'repos/noshiro-pf/mono/commits/<sha>/check-runs?check_name=test-node-versions-result' \
    | python3 -c '
import json, sys
runs = json.load(sys.stdin)["check_runs"]
for r in sorted(runs, key=lambda r: r["check_suite"]["id"], reverse=True):
    print(r["check_suite"]["id"], r["conclusion"], r["details_url"])'
```

Re-running that workflow run keeps its suite and replaces its runs, so the
context resolves to the new answer:

```bash
curl -sS -X POST -w '\n%{http_code}\n' \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "User-Agent: noshiro-pf-mono" \
    'https://api.github.com/repos/noshiro-pf/mono/actions/runs/<run_id>/rerun'
```

It needs `actions: write`, and it costs that workflow's matrix once. Re-run
the run that is holding the context, not the one that already answered green —
re-running the green one changes nothing, because its suite is not the one
GitHub is reading.

## Waiting for checks

There is no server-side wait. Poll, at 60 seconds or more, and give it an end:
a full matrix is roughly 25 minutes, and a loop with no bound is how a
scheduled run spends a rate limit on a pull request nobody is going to look at.

```bash
for _ in $(seq 1 30); do
    pnpm run pr-report -- --format json > report.json
    # stop when the entry for this branch is no longer pending
    sleep 60
done
```

In a Claude Code session, run the loop through `Monitor` or a backgrounded
`Bash` call rather than in the foreground.

## Writing

A comment — put the body in a file, because a `-d` argument with prose in it
breaks on the first quote:

```bash
printf '%s' '{"body": "..."}' > comment.json
curl -sS -X POST \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "User-Agent: noshiro-pf-mono" \
    -H "Content-Type: application/json" \
    -w '\n%{http_code}\n' \
    -d @comment.json \
    'https://api.github.com/repos/noshiro-pf/mono/issues/<number>/comments'
```

A title (`PATCH /pulls/{n}` with `{"title": "..."}`), a label
(`POST /issues/{n}/labels`, which `pull_requests: write` covers on its own).

**What a session does not call**, however easy the route is:
`PUT /pulls/{n}/merge`, anything arming or disarming auto-merge, and
`POST /pulls/{n}/reviews`. See `CLAUDE.md`, "Session rules" and "Commits and
pull requests".
