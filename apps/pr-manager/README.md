# GitHub Pull Requests Manager

A page that shows where every open pull request of a GitHub repository
stands — what it waits for, whether its checks pass, what holds it up — and
the open issues as the graph of what each waits for. Leave it open in a tab:
it keeps itself current.

<https://noshiro-pf.github.io/mono/pr-manager/>

Nothing needs installing, and the page never writes to the repository: it
reads GitHub from the browser with a token you give it. How it works, and how
to work on it, is [`docs/design.md`](./docs/design.md).

## Getting started

1. **Make a token.** For a public repository, a token that can read only what
   anyone can see is enough:
    - a [classic token](https://github.com/settings/tokens/new) with **no
      scopes ticked**, or
    - a [fine-grained token](https://github.com/settings/personal-access-tokens/new)
      with repository access set to **Public repositories**.

    For a private repository, a fine-grained token given read-only access to
    it.

2. **Open the page at your repository**:
   `https://noshiro-pf.github.io/mono/pr-manager/?repo=owner/name`. Or press
   **change** beside the repository's name in the header and type
   `owner/name`, or paste the repository's address from the address bar
   (`https://github.com/owner/name/pulls` works too). Bookmark it: the
   repository, the layout, the theme and the DAG's zoom are all in the URL.
3. **Paste the token** into the panel at the top and press **Use this
   token**. It is kept in the tab only, unless you tick **Remember on this
   device**.

Without `?repo=`, or with a value that names no repository, the page reads
nothing and asks which repository to open. The header always names the
repository shown.

## What you see

- **The merge order**: the open pull requests as a tree, each under what it
  has to wait for. A pull request opened onto another's branch is drawn
  under it as `stacked on #N`.
- **A card per pull request**: its checks over what the default branch
  requires (`1✗ 1… 6✓`, with the names on hover), how far it is ahead of and
  behind its base, whether it waits for a code owner's approval, whether it
  is a draft, whether auto-merge is armed, its labels and the issues it
  closes.
- **Counts that filter**: open, failing, awaiting code owner, pending. Click
  one to hide what it counts, or its **only** button to show nothing else.
- **Running workflows**, **what merged in the last week**, and **the open
  issues**, as a list you can filter and sort, or as a **DAG** of what each
  issue waits for.
- **Layout**: one, two or three columns, the blocks in any order, any block
  hidden, or the whole page fitted to the window.

The page reads GitHub every fifteen seconds while the tab is visible, less
often on a repository large enough that this would spend more than half the
token account's budget, and stops while the tab is hidden.

## What your repository can add

The page is useful on any repository as it is. These conventions, all
optional, make it say more; **How to use** in the header sums them up:

| Write this                                                                      | and the page                                      |
| :------------------------------------------------------------------------------ | :------------------------------------------------ |
| `Merge-After: #N` on a line of a pull request's description                     | draws it under #N in the merge order              |
| `Start-After: #N` on a line of an issue's description, or GitHub's "blocked by" | draws the issue after #N in the DAG               |
| a `priority:high`, `priority:mid` or `priority:low` label                       | filters and sorts by it                           |
| a `pending` label                                                               | counts it as held back, and can hide it           |
| required status checks in a ruleset or branch protection rule                   | judges the checks by those alone, not every check |
| a ruleset asking for code owner review, and a `CODEOWNERS` file                 | shows which pull requests wait for a code owner   |

What `Start-After:` means, and how an issue's wait carries over to the pull
request closing it, is
[`docs/issue-start-after.md`](../../docs/issue-start-after.md).

**With a merge queue.** The page also shows a queue run by labels: the pull
requests labelled `merge-queued` in the order they land, what was set aside
and why, who claimed what, and whose turn each one is. It shows these only on
a repository that has a `merge-queued` label. The queue itself is the npm
package [`pr-merge-queue`](../../libs/pr-merge-queue/README.md), with a
Claude Code plugin that fixes what it sets aside. In short:

1. `npm add --save-dev pr-merge-queue`, and a token in `GH_TOKEN` or
   `GITHUB_TOKEN` (or `gh auth token`).
2. Create the labels `merge-queued`, `skip-ci` and `auto-rebase`
   (`blocks-release` too with a changesets version pull request). Allow
   squash merging and auto-merge, require status checks on the default branch
   with branches up to date, and make the workflows skip while `skip-ci` is
   on.
3. Open pull requests with `npx open-pr`, label the ready ones
   `merge-queued`, and leave `npx unblock-prs` running in a terminal of its
   own (`--dry-run --once` first shows what it would do).
4. Install the plugin for what it sets aside:
   `/plugin marketplace add noshiro-pf/mono`, then
   `/plugin install pr-merge-queue@noshiro-pf`, and run
   `/loop /pr-merge-queue:unblock-prs` in a Claude Code session in the
   repository, with the worker's token in `GH_TOKEN`: the skill sees only
   what that account's comments hand it. `.github/unblock-prs.md` tells it how
   the repository's checks are reproduced.

The package's README, "Setting up a repository", has each step and why.

## Your token

- It goes to `api.github.com` and nowhere else: the page's
  `Content-Security-Policy` allows no other host.
- It is kept in `sessionStorage`, gone when the tab closes, unless you tick
  **Remember on this device**, which keeps it in `localStorage`.
- **Clear** forgets it.
- **Both stay in your browser.** Nothing is sent to a server of ours: there
  is none, and the page is static files on GitHub Pages. Neither the
  repository's owner nor anyone else can read what you saved; only pages
  opened in your own browser can.

**What "shared with other pages" means.** A browser keeps `localStorage` per
site, and every page under `https://noshiro-pf.github.io/` is one site. So,
in your browser, a token you chose to remember can be read by any page from
there that you open, not only this one. What is published there:

- from this repository, under `/mono/`: this page, the
  [Task Manager](https://noshiro-pf.github.io/mono/task-manager/), and the
  documentation of the libraries (`synstate`, `synstate-dom` and the TypeDoc
  pages);
- the older documentation sites of `noshiro-pf`'s archived repositories,
  which are no longer rebuilt.

None of them reads this page's token. The Task Manager keeps only its own
data there (its display settings, and Firebase's copy of its tasks and
sign-in), and the documentation keeps nothing. The token is
stored under a key no other page uses (`github-token--pr-manager-app--…`).
The "remember" choice is still off by default, because a page published
there later would be on the same site.

- The page spends the token account's GraphQL budget: about 9 points a read
  on a repository of this size, 2,000 or so of the 5,000 an hour. On a larger
  repository it reads less often, so that it keeps to about half the budget.
  The panel shows what is left and how often it reads.

## Limits

- github.com only: not GitHub Enterprise Server or `ghe.com`.
- Read-only: nothing here labels, rebases, merges or comments.
- Up to 500 open pull requests; with more, the page says so instead.

## Running it locally

```sh
pnpm run dev        # the dev server
pnpm run build      # into build/
pnpm run check:test
```

Each of these reads the live API with your token. More in
[`docs/design.md`](./docs/design.md).
