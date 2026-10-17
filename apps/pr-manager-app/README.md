# `pr-manager-app`

**GitHub Pull Requests Manager** — the state of every open pull request in
`noshiro-pf/mono`, as a page.

<https://noshiro-pf.github.io/mono/pr-manager/>

## What it is

The state of every open pull request, read straight from GitHub, in a form
that can be left open in a tab: the merge order the `Merge-After:` trailers
and the stacks declare drawn as the tree it is — a pull request onto another's
branch is marked `stacked on #N` under it — the issues each pull request closes with
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
  that was refused, a watch that timed out. The script leaves a comment on
  the pull request it gave up on, and the page reads the record that comment
  starts with — only from comments the signed-in account wrote, the one the
  script runs as, since anyone can post a comment that looks like it. Not
  GitHub's own `mergeable`, which says whether a _merge_
  conflicts — the script rebases, and a chained pull request whose parent was
  squash-merged is where the two answers part. Once the base has moved the
  badge turns grey: the next run tries again.
- **It waits for a code owner.** `main`'s ruleset asks for no approvals, except
  a code owner's on the paths `.github/CODEOWNERS` lists — so a pull request
  touching one stays green and never merges. When the author is the only
  owner it can never be approved, and the badge says it needs a ruleset
  bypass instead.

**The queue** `pnpm run unblock-prs` works through is drawn under the merge
order, as one row of boxes: the pull request it is running at the head, by
the base it merges into, with a turning ring; then the ones it would pick
next, in the order it would pick them; then the ones whose turn has not come,
in a dashed box saying what they wait for (`after #N`, `review`,
`native stack`). Every box is the same width however many there are, so the
whole queue is always in view, and carries the priority on a pill as the DAG's
nodes do; hovering one shows its title. What is set aside, claimed, a draft or
otherwise not the worker's to move is drawn outside the row, with why in a word
and whose it is. It is decided by the code the worker decides with
(`queue-order.mts` in `pr-report-core`), from what the page reads; what one run
of the worker has seen green without merging, and so put last, lives in that
run's memory and is not shown.

Below that, the workflow runs still going, what merged in the last week, and
the open issues, most recently updated first. Every open issue is read: the
first thirty come with the rest of the page, and the others follow a hundred at
a time, each page added to the list as it comes in. A page that fails leaves a
button under the list to ask for it again.

**The open issues can be narrowed and sorted.** The `priority:high`,
`priority:mid` and `priority:low` labels are switches, with **none** for an
issue carrying no one of them (or more than one), as they are in the merge
order. Every other label an open issue carries is a pick: once any is picked,
only the issues carrying one picked are listed, still not those whose priority
is switched off. The order is **updated** or **priority**: high first, none
between mid and low, and the most recently updated first within each. Each
switch and pick counts what the list shows of it, as the merge order's do, and
the choice is kept in the browser. They apply to the list; the DAG draws every
issue.

**Running workflows** lists what the Actions tab shows filtered to
`is:in_progress is:queued is:waiting is:action_required is:neutral is:stale`,
newest first, and its title links to that filter on GitHub: each run's state
(drawn as GitHub draws it, a turning ring for one in progress and a dot for
one queued, and a badge for the rarer states), its title, the workflow and run number, what started it, its branch, when it
started and who started it. It is read beside the report rather than as a part
of it, so a read of it that fails says so in its own block and leaves the
merge order as it was.

**List / DAG**, above the issues, draws them instead as the graph of what each
waits for, read from the `Start-After:` lines in their bodies
(`docs/issue-start-after.md`). An issue is a hexagon and a pull request a
rounded box, the problem angular and what settles it round; an edge runs from
what is waited for to what waits. Green is an issue that can be started (a thick
border when it waited and need not any more), brown and dashed one that waits,
blue an open pull request and the issues it closes, grey what is done. Each node
shows its title and opens its page on GitHub. In the DAG, the **Done** chip beside the switch starts
pressed; unpressed, it leaves out the issues closed as completed and the merged
pull requests, with the waits on them that are over, so that only what is left
to do is laid out. Both choices are kept in the browser. At the other end of
the row, **−** and **+** zoom the graph out and in a step at a time about the
middle of its box, **Fit** draws all of it in the box (never larger than its
natural size, and following the box and the graph as they change until the
next zoom), and **100%** puts it back at its natural size. To use the room it
has, Fit also rearranges the issues with no dependency either way: in longer
or shorter rows, under the rest of the graph, beside it, or filling the room to
its right before going on under it, whichever draws the whole graph the
largest. A zoom from there keeps that arrangement; 100% puts
them back under the rest. The zoom starts at
100% on every visit.

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

## Filtering and sorting the merge order

The merge order leads with the counts — open, queued, failing, set aside,
awaiting code owner, pending — and **each count but `open` is a switch** for
the pull requests it counts: clicking one hides them, whatever else they are,
so switching off `queued` leaves what is still waiting for a review, switching
off `pending` leaves out what carries the `pending` label an author puts on a
pull request they are holding back, and one under none of the counts is
always shown. Each also carries an **only** button
in its corner: once any is picked, only a pull request under a picked count is
shown, whatever else it is, so picking `failing` leaves what is failing,
queued or not. A count switched off still hides what it counts, and a count is
never both: picking one switches it back on, and switching one off unpicks it.
A draft is not among them: it is always shown, and its badge says it is one.
Nor is being behind the base, which the card's ahead / behind bar shows.

Below them, the `priority:high`, `priority:mid` and `priority:low` labels are
switches too, with **none** for a pull request carrying no one of them (or
more than one), and the order is either the merge order or **priority**.
Sorted by priority, the pull requests at each level of the tree are ordered
by the highest priority in them or anywhere below them, since landing a high
one means landing what holds it up first; none sits between mid and low.

**Every number is what the list below shows**, and when the switches leave
some out, how many there are in all follows it in small: `2 of 8` open,
`1 of 3` queued. A count or a priority switched off reads how many switching
it back on would show, struck through, rather than the nothing the list has
of it.

The counts and the switches below them **stay in view while the merge order
scrolls under them**, with its title — under the toolbar when the header is
folded — and leave with the merge order once it has scrolled past. On a
screen too small to spare the room, they scroll away with it, and only the
title stays. Every other section's title stays in view the same way.

What is hidden gives its place to what is shown below it, so a pull request
waiting on a hidden one is drawn where that one was. And a pull request
under more than one predecessor is expanded wherever it now comes first.

Everything is shown, in merge order, until the reader changes it; the choice
is kept in the browser's IndexedDB, in a database of the page's own name, so
it is there on the next visit. Not in the URL like the layout and the theme:
it is a working choice made again and again rather than a way of looking at
the page worth sharing in a link.

## Layout

The page is five blocks: the merge order (with its counts above it and any
cycles under it), the queue, the workflow runs still going, what merged, and
the open issues. The queue stays under the merge order when the columns are
split, and a URL written before it had a block puts it there; in the `fill`
mode its share starts at half the others', being one row. **Layout**, beside the theme
button, arranges them:

- **One column, two or three.** Two need a screen at least 60rem wide, and
  three 80rem; on a narrower one they stack whatever the layout says. A line
  between two columns is dragged to share the width, and double-clicked to
  even the two beside it; with three, the third keeps its width.
- **The order**, and which column each block is in, with the dialog's
  buttons alone: an order set once and seldom changed is not worth a drag
  surface on every block.
- **A height of its own.** The line under a block, drawn as the one between
  the columns is, is dragged to give it one, and it then scrolls by itself; a
  double click there gives the natural height back.
- **Or fill the window.** The page is then as tall as the window and never
  scrolls: what the header leaves is shared out among each column's blocks,
  and only a block scrolls, inside itself. The line between a block and the
  one below is dragged to move height from one to the other and
  double-clicked to even them, and the last block of a column reaches its end;
  the dialog shows each block's part of its column and changes it with
  buttons. The heights given in the other mode are kept for the way back.
- **Hide a block** with its button in the dialog. It keeps its place, its
  height and its share, and showing it again puts it back there; the blocks
  around it share out the column as if it were not there. A column whose
  blocks are all hidden keeps its width.

Everything the pointer does on the page can be done in the Layout dialog with
a keyboard, which is why the drag surfaces themselves are pointer-only. The
drags are pointer events rather than the HTML drag and drop API, which draws
its own ghost image and does not work with touch.

**The layout is kept in the URL**, as the theme is, so a bookmark opens the
same way: `cols=2` or `cols=3`, `left=open.merged`, `middle=runs` (with
three), `right=issues`, `split=40` (the left column's share of two, in
percent), `lines=25-70` (where the two lines between three columns are, in
percent from the left), `h.open=480` (a height, in pixels), `mode=fill` and
`s.open=150` (a block's share of its column, a weight against 100 for each
block without one, 50 for the queue) and `hide=runs.merged` (the blocks hidden). Only what differs from one column in the usual order is
written, a moment after the last
change so that a drag does not rewrite the address bar on every pointer move.
A URL edited by hand still opens: unknown blocks are dropped, missing ones put
back, and numbers clamped.

## Folding the header

The chevron at the end of the header's buttons **folds the header into a
toolbar**, for more of the report on screen: the title, the repository and
how long ago the report was read share one line with the buttons, which stay
in their order, and the token panel and the line with the exact time of
reading go (the time is in the tooltip). Folded, the toolbar stays at the top
of the window while the report scrolls under it; the same chevron unfolds it.
Without a token the token panel stays, folded or not, since the page reads
nothing until it has one.

It starts unfolded, and whether it is folded is kept in IndexedDB beside the
merge order's filters, for the same reason.

## Opening a pull request in a split view

Each card has a **⧉ split view** link beside the title, which opens the pull
request in [`split-view-extension`](../split-view-extension/README.md): the
diff on the left and the conversation on the right, at 7:3. The diff hides
whitespace changes and the files already marked viewed
(`?w=1&show-viewed-files=false`). GitHub takes those off the pane's address
once the diff has opened — on a pull request with files already marked viewed
it leaves `/changes#diff-…` — and the split view saves the address the pane
is at, so without
[`github-view-defaults-extension`](../github-view-defaults-extension/README.md),
which puts them back, the next time that split view opens the diff shows
everything. When the pull request closes an issue, or
names the Claude Code session it was written in, that shares the right half
at 1:1 — the issue right of the conversation, the session left of it, next to
the diff; with both, the issue is on the left of the right half, beside the
conversation stacked over the session. The first issue and the
first session only, if it names several. The conversation and the issue are
shown at 75% when they share the right half, and the conversation alone at
100%. The tab is titled with the pull request's number and title,
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
`.github/CODEOWNERS` on the default branch, in the query that lists the pull
requests.

**GraphQL, because of how GitHub charges.** REST charges a request, and one
pull request takes three — the comparison against its base and the two kinds
of check — so polling twenty of them would spend an hour's 5,000 in minutes.
GraphQL charges a query by the size of what it asks for, and a handful of
queries covers every open pull request: **about 9 points a read** by GitHub's
formula.

**One query per part of the page, all sent at once**, because GitHub answers
a query only once all of it is ready. Measured against this repository, the
one query that used to ask for everything took about four and a half seconds,
and the comparison after it three quarters of a second more, with nothing on
the page until both were back. Apart, the pull requests the merge order is
drawn from answer in about a second, and the first read draws the merge order
then; the verdicts (about three seconds — each check run is followed to the
workflow it belongs to), the distance from the base, the badges read from the
details, and the merged and issue sections each fill in as their own query
answers, saying "reading" until then. Only the comparison waits, because it
can name the heads only once the pull requests are in. A read that comes
after the page shows a report replaces it whole, so a poll never puts a
"reading" back where there was data.

**The workflow runs are REST's**, because GraphQL cannot list a repository's
runs by state. REST lists them by one state at a time, so a read of them is
six requests, against REST's budget rather than GraphQL's — the two are
separate. Each goes out as `no-cache`, so the browser asks GitHub whether the
answer it kept has changed, and GitHub does not count a `304` against the
budget: a state with nothing in it costs nothing after the first read. The
header's budget is GraphQL's alone.

**The issues a pull request closes are GitHub's reading of its body.**
`closingIssuesReferences` links a closing keyword only on a pull request into
the default branch, so a stacked one would list nothing until the layers
below it merged. The page also reads the keywords GitHub marks in the rendered
body (`bodyHTML`), whatever the base, and asks one more query for the titles of
the issues only the body names — a query made only when there are any.

## Staying current

The page reads GitHub **every fifteen seconds while it is on screen**, again
the moment a hidden tab is brought back, and at once when **Refresh** is
pressed. A hidden tab reads nothing and has no poll timer running: hiding it
stops the timer, and bringing it back starts a new one from the read it comes
back to, so the next read is fifteen seconds after that one.

**The interval is set by the budget.** GraphQL has no conditional request, so
a read that finds nothing new costs the same as one that finds everything.
Every fifteen seconds is 240 reads an hour, about 2,000 of the 5,000 points an
account gets, which leaves the rest for whatever else that account does with
GraphQL — `gh` included, since the budget is the account's.

**Every page of open issues is read again by every read after it**, one query
a page, about a point each by GitHub's formula, so the list stays as current
as the rest of the page. Reloading the page, or a new token, starts again from
the first thirty, and reads the rest after them. Each page after the first is
read on its own, rather than by a read of the whole report again, and a poll
already out when it was asked for does not take that page away.

A read may add to the page and may say it failed, but **may not take the page
away**: a read that fails leaves the last report on screen with a note beside
it. And an older read never replaces a newer one — a poll and a Refresh can
both be out at once, and whichever answers last is not necessarily the one
that asked last.

The "read 3 minutes ago" line, and every other age on the page, is measured
against a clock of its own that ticks every second while the tab is shown, so
a tab that stopped reading does not go on looking fresh. The ages are
signals bound to their text nodes (below), so a tick rewrites those and
renders no component.

An answer for a token that has since been cleared or replaced is dropped, so
**Clear** empties the page even while a read is still out.

**The state is in synstate stores** under `src/store/`, not in the components:
`reader.mts` holds what was read and decides when to read, `token-store.mts`
the token and its form, `theme-store.mts` light or dark, `layout-store.mts`
the layout and the drags and dialog that change it, `merge-order-store.mts`
what the merge order shows and the tree that leaves, `header-store.mts`
whether the header is folded. Each takes what it
touches in the browser as an argument — the timers as synstate `counter`s and
the DOM events as observables — which is what lets a test drive them with a
`source`, and `store.mts` hands them the real ones. What is kept outside the
page follows a store by subscription: storage follows the token, the URL
and `<html>` follow the theme, the URL follows the layout (through
`debounce`), IndexedDB follows the merge order's filters and the folded
header once what it held has been read, and the Layout dialog opens and closes as the store says.

**The components read the stores only through Preact signals**, which
`store.mts` makes from them with `synstate-preact-signals`' `toSignal`, and
change them only by calling their actions. Reading a signal's `.value` in a
render renders that component again when it changes; handing the signal
itself to JSX as a child or a DOM attribute rewrites that one node and
renders nothing, which is how the ages keep up with the clock.

Nothing is made of a signal on the way to the view: what a component needs,
the store derives, and **the store writes only what changed**. GitHub answers
every read with the whole report, so what changed is found once, where the
answer is written: `reader.mts` keeps the status and each part of the report
the page draws as a state of its own, made with synstate's `createState` and
an `equals`, which passes an update on only when it differs from what the
state holds. The pull requests are compared one by one, matched by number
(`share.mts`). A poll that found nothing new writes the time of reading and
nothing else, so nothing downstream has anything to compare.

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
The policy is added by a build-only Vite plugin, because the dev server's HMR
talks to it over a websocket, which `connect-src` would then have to name, and
a policy loosened for that would not be worth shipping.

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
is written twice, once on each side of `light-dark()`.

**Light or dark follows the system until the button beside Refresh is
pressed.** A press flips what is on screen and keeps the choice in the URL,
`?theme=light` or `?theme=dark`, so a bookmark or a pasted link opens the same
way, and no key is added to a `localStorage` every app on the origin shares.
It is a toggle between two looks rather than a cycle through "system, light,
dark", which would have a press that changes nothing visible; a choice that
comes back to what the system shows drops the parameter, and the page follows
the system again.

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
