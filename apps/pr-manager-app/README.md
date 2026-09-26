# `pr-manager-app`

**GitHub Pull Requests Manager** — the state of every open pull request in
`noshiro-pf/mono`, as a page.

<https://noshiro-pf.github.io/mono/pr-manager/>

## What it is

The state of every open pull request, read straight from GitHub, in a form
that can be left open in a tab: the merge order the `Merge-After:` trailers
declare drawn as the tree it is, the issues each pull request closes with
their titles, its labels in GitHub's own colours, the branch it is of,
whether it is open or a draft, whether auto-merge is armed, the verdict of
the contexts the ruleset requires, how far each branch is ahead of and
behind its base, and when it was last pushed to and last updated.

The verdict carries its parts — `1✗ 1… 1– 6✓`, failed, still coming,
skipped, passed, with the names on hover — and stays "running" while
anything at all is still going on the head commit. Both are there because a
pull request once showed a tick two minutes before its CI failed: the round
before had skipped its required aggregates, and the round replacing it had
not created them yet.

And the two things that stop a pull request that is otherwise ready, which
nothing on GitHub's own list shows:

- **`unblock-prs` set it aside**, and why: a rebase that conflicted, a push
  that was refused, a watch that timed out. The script leaves a commit status
  on the head it gave up on, and the page reads it from the check results it
  already fetches. Not GitHub's own `mergeable`, which says whether a _merge_
  conflicts — the script rebases, and a chained pull request whose parent was
  squash-merged is where the two answers part. Once the base has moved the
  badge turns grey: the next run tries again.
- **It waits for a code owner.** `main`'s ruleset asks for no approvals, except
  a code owner's on the paths `.github/CODEOWNERS` lists — so a pull request
  touching one stays green and never merges. When the author is the only
  owner it can never be approved, and the badge says it needs a ruleset
  bypass instead.

Below that, what merged in the last week, and the open issues, most recently
updated first (thirty at most, said so when there are more).

It **only reads**. Nothing here labels, rebases, merges or comments — that is
`pnpm run unblock-prs`, run by a person — and a page that cannot do any of it
is a page that is safe to leave open.

## The merge order

A pull request is drawn under what its `Merge-After:` names, so the tree read
top down is the order things can land, and a root is one that nothing open is
holding up. A number that names nothing still open is dropped: the pull
request it named has merged, which is the constraint being met.

**A pull request that names several appears under each of them, and is drawn
in full once** — its card and everything below it, under whichever of them
the page reaches first reading downwards, not the first the trailer lists.
Everywhere else it is one line, `#N — shown above`, which is always true
because the page is read in the order it is drawn. So a diamond does not draw
its lower half twice. The card does not list what it waits for; its other
predecessors are the ones carrying a `shown above` line for it.

A pull request on a `Merge-After` cycle is not in the tree: every member of a
cycle waits, in the end, for itself, so there is no place in an order to draw
it. The cycles are named in their own section below the tree instead, and a
pull request waiting on nothing but a cycle member is drawn as a root.

## Opening a pull request in a split view

Each card has a **⧉ split view** link beside the title, which opens the pull
request in [`split-view-extension`](../split-view-extension/README.md): the
diff on the left and the conversation on the right, at 7:3. The diff hides
whitespace changes and the files already marked viewed
(`?w=1&show-viewed-files=false`). When the pull request closes an issue, or
names the Claude Code session it was written in, that joins the conversation
on the right half, at 1:1; with both, the session is on the left of the right
half, beside the conversation stacked over the issue. The first issue and the
first session only, if it names several. The conversation and the issue are
shown at 75%. The tab is titled with the pull request's number and title,
`#2071 feat(…): …`.

A session is named by a `Claude-Session:` line in the pull request's
description, which `CLAUDE.md` asks a session to write, and the card lists
it under the issues by its title:

```md
Claude-Session: [Open a pull request in a split view](https://claude.ai/code/session_…)
```

Only a `https://claude.ai/code/session_…` URL is taken, and not from inside a
fenced code block.

Every link names one saved split view, `PR Manager`, so the extension's list
gains one entry rather than one per pull request; a tab already open on an
earlier pull request keeps showing it, because the extension shows what a
tab's URL describes.

The link reaches the extension only where three things hold, and none of
them can be checked from this page, whose `Content-Security-Policy` lets it
connect to `api.github.com` alone:

- **The extension is installed unpacked**, under the id `key` in its manifest
  pins. A build from the Chrome Web Store has an id of its own, and its
  package lists no page that may link to it.
- **The build lists this page's origin** in its `web_accessible_resources`:
  every build from source lists `noshiro-pf.github.io`, and only the
  extension's `pnpm run build:dev` lists the port `pnpm run dev` and
  `pnpm run preview` serve on here. Otherwise the link opens the browser's "blocked" page,
  `ERR_BLOCKED_BY_CLIENT`, although the same URL pasted into the address bar
  opens: Chrome checks the origin only for a navigation a page starts.

## Where the data comes from

GitHub's GraphQL API, from the browser, on every read. There is no report
file in between: pressing **Refresh** shows what GitHub shows at that moment.

What is decided about the pull requests — the verdict over the required
contexts, the merge order, the counts — is `pr-report-core`, the same code
`pnpm run pr-report` decides it with, so the page and the command cannot
disagree about a pull request. Which contexts are required, and which paths
need a code owner, are read from `repo-settings/rulesets/main.json` and
`.github/CODEOWNERS` on the default branch, in the same query.

**GraphQL, because of how GitHub charges.** REST charges a request, and one
pull request takes three — the comparison against its base and the two kinds
of check — so polling twenty of them would spend an hour's 5,000 in minutes.
GraphQL charges a query by the size of what it asks for, and one query asks
for everything: measured against this repository, **about 5 points and 5
seconds a read**, the report query and one follow-up for ahead / behind
together. The follow-up is separate because it can only name the heads once
the first answer has.

## Staying current

The page reads GitHub **every fifteen seconds while it is on screen**, again
the moment a hidden tab is brought back, and at once when **Refresh** is
pressed. A hidden tab reads nothing.

**The interval is set by the budget.** GraphQL has no conditional request, so
a read that finds nothing new costs the same as one that finds everything.
Every fifteen seconds is 240 reads an hour, about 1,200 of the 5,000 points an
account gets, which leaves the rest for whatever else that account does with
GraphQL — `gh` included, since the budget is the account's.

A read may add to the page and may say it failed, but **may not take the page
away**: a read that fails leaves the last report on screen with a note beside
it. And an older read never replaces a newer one — a poll and a Refresh can
both be out at once, and whichever answers last is not necessarily the one
that asked last.

The "read 3 minutes ago" line is measured against a clock of its own that
ticks every 30 seconds, so a tab that stopped reading does not go on looking
fresh.

## The token

**GraphQL answers nobody without a token**, so the page reads nothing until
it has one; the panel at the top is open until then.

**It needs no permission at all.** The repository is public, and a token is
only what GraphQL asks a caller to be:

- **A classic token with no scopes ticked.** In GitHub's words, "a token with
  no assigned scopes can only access public information". It cannot read a
  private repository, write anything, or act as its owner.
- Or **a fine-grained token** with repository access set to _Public
  repositories_, which is read-only access to what anyone can already see.

The panel says both of those on screen, with links to the two pages, so that
nobody has to come here to find out what to tick.

Where it is kept is the reader's choice and the default is the cautious one:
`sessionStorage`, gone when the tab closes. "Remember on this device" moves it
to `localStorage` — which on GitHub Pages is **shared by every app published
under `noshiro-pf.github.io`**, since that is one origin for all of them.

The build writes a `Content-Security-Policy` into `index.html` naming
`api.github.com` as the only host this page may connect to, so "it is sent
nowhere else" is a property of the page rather than a promise about its code.
`style-src` allows inline styles because the label chips and the ahead/behind
bars carry `style` attributes computed from the report; `script-src` does not.
The policy is added by a build-only Vite plugin, because the dev server needs
an inline preamble for Fast Refresh and a websocket for HMR, and a policy
loose enough for those would not be worth shipping.

**A token is never a build-time value.** `vite build` bakes in what it is
given, and this bundle is served from a public site.

## Running it

```sh
pnpm run dev        # the dev server, on the port app-dev-ports.mts gives it
pnpm run build      # into build/, with the base path the Pages site serves
pnpm run preview
pnpm run check:test
```

Every one of these reads the live API, including `dev`, and spends the
token's GraphQL budget like the published page does. `dev` gets no
`Content-Security-Policy`; only the build does.

## Deployment

`.github/workflows/deploy-pages.yml` builds everything on a push to `main`, and
`tools/scripts/cmd/build-pages-site.mts` copies `build/` into the site.

The directory it lands in and the `base` this app's bundle is built with both
come from `tools/configs/pages-apps.mts`, and they have to agree: a mismatch is
a page that loads and then asks for its script at a path nothing serves — a
blank screen, a 404 in the console, and no failing check anywhere, because both
halves did exactly what they were told.

## Colour

The tokens in `src/index.css` are the validated default palette of the
repository's data-visualization guidance — chart surface, page plane, three
inks, the hairlines, and the four reserved status steps. Dark mode is a
selected set of steps rather than an automatic flip, which is why every value
is written twice.

A status colour never carries meaning alone: every badge that uses one also
carries a glyph and a word. Two of the four steps sit below 3:1 on the light
surface by design, and that pairing is the mitigation the palette asks for in
exchange. `paused` is deliberately not a status at all — while `skip-ci` is on
nothing has run, and a held pull request is not a broken one. Nor is open
versus draft: that badge takes the categorical blue, so that it cannot be read
as a verdict beside the one that is.

The ahead / behind bars are a **diverging** encoding — one quantity measured
in two directions, not two categories — so they take the palette's diverging
pair, blue and red, with the hairline track as the neutral middle. Every bar
on the page is drawn against one scale, the largest count anywhere in the
report, because a per-card scale would draw `-2` and `-39` the same length.
Both numbers are written out beside the bars regardless: nobody should have to
measure a bar to read a count three characters long.

**The label chips are GitHub's colours with the ink computed, not copied.**
GitHub picks black or white by perceived brightness (the YIQ weighting);
`src/label-color.mts` picks whichever measures the higher WCAG contrast, and
the two disagree on the mid-dark colours — on `#0e8a16` black measures 5.2:1
where white measures 4.0:1. There is a test over GitHub's whole default
palette asserting every chip clears 4.5:1.
