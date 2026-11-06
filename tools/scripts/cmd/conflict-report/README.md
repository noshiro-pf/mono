# `conflict-report`

Counts the rebase conflicts and the `unblock-prs` set-asides of the pull
requests merged in a window (a week by default), and prints them as Markdown to
paste into an issue as it is (#3593).

```bash
pnpm run conflict-report -- --days 7
```

It reads the network (the pull requests, their timelines and runs, their
comments), so it is a root script of its own, not a `check:root:*` guard.

## What it counts

- **The conflicts**, by replaying every rebase each merged pull request went
  through: its heads (each force-push and commit on its timeline, and each head
  a `pull_request` run was for) in commit-time order, each cherry-picked onto
  the base of the head that replaced it with `git merge-tree --write-tree`. A
  conflict found this way was resolved by someone, whether or not `unblock-prs`
  set the pull request aside: a session that rebased its own branch leaves no
  set-aside behind.
- **Where**: a conflicted file that `.github/unblock-prs.json`'s `regenerate`
  declares is counted by itself, marked generated; any other by its package.
- **The other side**: the merged pull requests (by the `(#N)` of their squash
  subjects) that changed a conflicted file between the two bases, and whether
  one of them carries the same `Claude-Session:` trailer. A session's own stack
  prevents the conflicts with itself; only something across sessions prevents
  the rest.
- **The set-asides**, by reason, and the failed checks of `checks-failed` ones,
  from `unblock-prs`'s comments by the token's account, standing or resolved (a
  resolved one keeps what it said under a fold). `unblock-prs` keeps one comment
  per pull request and rewrites it, so this is the latest set-aside of each pull
  request, not every one it had.

The version pull requests are left out: `release.yml` rebuilds them rather than
rebasing them. The heads it replays are fetched from `origin` by SHA when the
clone does not have them.
