# PR Manager v2 — functional specification

What the page does, written from the behavior of `apps/pr-manager` (v1,
2026-11-09, `ee61504e`) and the requirements gathered in #3673. It says **what**
the reader sees and can do; how v2 is built is
[`architecture.md`](./architecture.md). v2 replaces v1 once every item here is
met. Items marked **(new)** are not in v1; items marked **(changed)** differ
from v1 on purpose, with the reason.

## 1. Purpose and limits

- A static page that shows where every open pull request of one GitHub
  repository stands and what it waits for, the merge queue run by
  `pr-merge-queue`, the running workflows, what merged in the last week, and the
  open issues as a list or as a DAG of what each waits for.
- **Read-only.** It never labels, rebases, merges or comments.
- **Talks to `api.github.com` only.** The built `index.html` carries a
  `Content-Security-Policy` with `default-src 'none'`, `connect-src
https://api.github.com`, `script-src 'self'`, `style-src 'self'
'unsafe-inline'`, `img-src 'self' data:`, `base-uri 'none'`, `form-action
'none'`. Build only (the dev server's HMR needs a websocket).
- github.com only; up to 500 open pull requests (past that, the pull request
  part fails and says so rather than drawing a partial merge order).
- Served from GitHub Pages at `/mono/pr-manager/` (v2 during development:
  `/mono/pr-manager-v2/`).

## 2. Repository selection

- `?repo=owner/name` is read once at load. Also accepted: a GitHub URL of the
  repository (`https://github.com/owner/name/pulls`, with or without scheme or
  `www.`). A name of only dots is rejected.
- Without a valid `?repo=`: a **start page** that asks for one (a form taking
  `owner/name` or a GitHub URL), says what the page is, and loads neither the
  store nor any GitHub data. An invalid value is echoed with an error.
- The header names the repository (a link to it) and has **change**, a small
  disclosure with the same form; submitting writes `?repo=` and reloads, so a
  read in flight for one repository never lands on another's page. Every other
  query parameter is carried over.
- A repository GitHub resolves to nothing for the token (`repository: null`) is
  said in place of the report.

## 3. The token

- GraphQL needs a token; the page reads nothing without one, and shows the token
  panel open plus a notice saying so.
- The panel: a password field, **Use this token**, **Remember on this device**
  (checkbox), **Clear**, and an expandable explanation: which token to make
  (classic with no scopes, or fine-grained with "Public repositories"; for a
  private repository, fine-grained read-only on it), links to both GitHub pages,
  where it is stored, and that it goes to `api.github.com` only.
- Stored in `sessionStorage` by default, in `localStorage` when remembered,
  under `github-token--pr-manager-app--218bd917-a944-41cf-80a1-3436918878f8` (v2
  keeps the key so the swap keeps the reader's token). **Clear** forgets both,
  and empties the page even while a read is in flight (answers for a cleared or
  replaced token are dropped).
- A token GitHub refuses (401) is said in the panel.
- The panel shows the GraphQL budget left (`x-ratelimit-remaining` / limit,
  reset time) and the poll interval in use.
- A token is never a build-time value.

## 4. Reading and staying current

### 4.1 Parts

A read is several independent parts, each its own request(s), sent at once, each
drawn as soon as it answers, each failing on its own:

| Part          | API     | Contents                                                                                                                                                                                                                             |
| :------------ | :------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pull requests | GraphQL | open PRs 50/page (every page every read), default branch, CODEOWNERS (`.github/`, root, `docs/` in that order), whether `merge-queued` exists, `queue/pr-*` branches                                                                 |
| rules         | REST    | `rules/branches/{default}` (paged past 100, #3217) and `branches/{default}` protection contexts; `no-cache`                                                                                                                          |
| checks        | GraphQL | per head, 20 PRs/query: check runs (with `completedAt`), status contexts, workflow of each run                                                                                                                                       |
| details       | GraphQL | 20 PRs/query: body, closing issues (`closingIssuesReferences` plus keywords marked in `bodyHTML`), review state, the worker's own comments, closing issues' bodies                                                                   |
| comparisons   | GraphQL | ahead/behind each head vs its base, 20 PRs/query; sent once the PR part names the heads                                                                                                                                              |
| references    | GraphQL | titles/state of issues only a body names; sent only when there are any                                                                                                                                                               |
| merged        | GraphQL | search `is:pr is:merged merged:>=<a week ago>`                                                                                                                                                                                       |
| open issues   | GraphQL | first 30 with the report; the rest 100/page, each page added as it lands; every loaded page re-read by every later poll                                                                                                              |
| workflow runs | REST    | `actions/runs?status=` × 6 states, first page (100) of each, `no-cache` (304s are free), newest first, includes `run_started_at`; a run shows the state it was listed under; a state with more than a page is said, not cut silently |
| activity      | GraphQL | only when the Activity dialog opens: `issueCount` per day for 7 ended days + today, merged PRs and closed issues                                                                                                                     |

- **(changed)** The parts are read together as one snapshot (the reader
  `pr-report-core-v2` shares with the worker) and drawn together when it lands,
  rather than each as it answers: every block then agrees with every other, and
  the queue is decided from the same facts the worker would see. The first paint
  waits for the slowest part.
- A part that fails **keeps what the last read had** and says it failed in the
  panels drawn from it (merge order and queue for the first five, its own block
  for the others). A part that failed with nothing to keep is drawn as "unread",
  never as empty.
- Only a read in which every part failed (bad token, offline) is a failed read:
  the last report stays, with "last refresh failed" in the header and the reason
  on hover.
- An older read never replaces a newer one; a poll never puts "reading" back
  where there was data.
- **(changed)** No pane refresh: with one snapshot per read, a block's own
  refresh would cost what **Refresh** costs. A read failed before any report
  says why in place of the blocks.

### 4.2 When to read

- On load (once a token is present), on **Refresh**, and on a timer.
- The interval is **paced by the budget**: at most every 15 s, at least every 5
  min, in steps of 5 s, chosen so that reads spend about a quarter of the 5,000
  points an hour, measured from how much the budget dropped since the last read
  (other use of the account counts too).
- A hidden tab reads nothing and has no timer. Shown again, it reads at once
  only if an interval has passed since the last read; otherwise when the rest of
  the interval has passed.
- "Read from GitHub 2 minutes ago · <exact time>" under the header, plus an
  "Updating…" ring while a read is out (hidden, not removed, so the page does
  not jump). Every age on the page ticks off one shared 1 s clock while the tab
  is visible.

## 5. Header

- Title "GitHub Pull Requests Manager", repository link and **change**.
- Buttons, in order: **How to use**, **Activity**, **Layout**, theme toggle
  (Light | Dark), **Refresh** ("Reading…" while busy), fold chevron.
- **Fold**: the header becomes a one-line sticky toolbar (title, repository,
  read age with the exact time on hover, buttons). The token panel and the read
  line go — except the token panel stays while there is no token. Folded state
  is kept in IndexedDB (database named after the page), not in the URL.
- **How to use** dialog: the README link first, then the conventions the page
  reads (`Merge-After:`, `Start-After:`/"blocked by", the `priority:*` labels
  for PRs and issues, `pending`, required checks, CODEOWNERS and `#
enforced-by:`), and an outline of the merge queue setup linking to
  `pr-merge-queue`'s README. Works without a token.
- **Activity** dialog: a table of the last 7 ended days in the reader's time
  zone (`10/11(日)` style), PRs merged and issues closed per day with bars and
  links to the matching GitHub searches, a total row, and today's counts apart
  (as of the read). Read when opened; reread at local midnight if open.
- **Theme**: follows the system until toggled; the choice goes in the URL
  (`?theme=light|dark`) and is dropped when it equals the system's.

## 6. Layout

- Five blocks: **merge order** (with the cycles section under it), **queue**,
  **running workflows**, **merged**, **open issues**. (Block ids:
  `open`, `queue`, `runs`, `merged`, `issues`.)
- **Columns**: one, two (needs ≥ 60rem) or three (≥ 80rem); narrower screens
  stack. Column dividers drag to resize (pointer events, touch works) and
  double-click to even the two beside it; with three, the third keeps its width.
- **Order and column** of each block are set in the Layout dialog only (↑ ↓ ← →
  buttons).
- **Tabs**: a block can be made a tab of the block above it; consecutive tabs
  form a group drawn as one block (WAI-ARIA tabs, selection follows focus,
  arrows/Home/End). A group takes the height/share of its first tab and
  remembers which tab is shown.
- **Height modes**: `natural` (page scrolls; a block may be given a fixed height
  by dragging the line under it, double-click restores natural) and `fill` (page
  is window-tall and never scrolls; each column shared among its blocks by
  weights, default 100, queue 50; the line between two blocks drags weight from
  one to the other, double-click evens them; the dialog shows and changes each
  block's share with buttons). Each mode keeps its numbers while the other is
  on.
- **Hide** a block; it keeps its place, height and share. A column whose blocks
  are all hidden keeps its width. A queue on a repository without the queue
  label is listed as "none here".
- **Reset the layout** in the dialog.
- Everything a drag does can be done in the dialog by keyboard.
- Kept in the URL (debounced): `cols`, `left`/`middle`/`right` (block ids joined
  with `.`, tab groups with `_`), `tab`, `split`, `lines=25-70`, `h.<id>`,
  `mode=fill`, `s.<id>`, `hide`. Only differences from the default are written;
  unknown blocks dropped, missing ones appended to the left column, numbers
  clamped.
- Section titles are sticky (under the folded toolbar when folded); the merge
  order's counts and filters stay in view with its title while it scrolls (only
  the title on small screens).

## 7. Merge order

### 7.1 Tree

- Each open PR is drawn under what it waits for: `Merge-After: #N` lines in its
  description (outside code fences), the PR whose head branch is its base
  (`stacked on #N`, not across forks), and what the issues it closes
  `Start-After:` (inherited: `after #N (Start-After)`; an open issue named that
  no open PR closes is noted `#N (issue) not done`).
- A number naming nothing open is dropped (it merged).
- A PR under several predecessors is drawn in full once, under whichever is
  reached first reading downwards; elsewhere as one line `#N — shown above`.
- PRs on a `Merge-After` cycle are left out of the tree and listed in a
  **Merge-After cycles** section under it ("Each of these waits, in the end, for
  itself…"); a PR waiting only on cycle members is a root.

### 7.2 Card

Per PR:

- Badges: **open/draft** (categorical blue, not a status colour), **checks
  verdict** with parts `1✗ 1… 1– 6✓` (failed, pending, skipped, passed; names on
  hover; "running" while anything on the head still runs; `checks unread` when
  rules could not be read; over every reported context when the branch requires
  none, and the hover says so), **auto-merge** on/off, **code owner review**
  (shown only when waiting or unknown; "needs a ruleset bypass" when the author
  is the only owner; team owners can't be resolved without `read:org`, said so),
  **set aside** by the worker with its reason (only from the signed-in account's
  comments; grey once the base moved), **claimed** (who, when), `paused` while
  `skip-ci` is on (only on a queue repository).
- `#N` and the title linking to the PR; **⧉ split view** link (§12).
- Claude Code sessions from `Claude-Session:` lines, by title (URL when no
  title, truncated with an ellipsis).
- The issues it closes, with titles and state.
- Branch line: `head → base`, `stacked on #N`, behind/ahead counts with a
  diverging bar pair (blue ahead, red behind) on one scale shared by the whole
  page.
- Merge-after notes as above.
- `pushed <age>` (head commit date) and `updated <age>`.
- Labels as chips in GitHub's colours, text colour chosen by higher WCAG
  contrast (every default GitHub label ≥ 4.5:1).

### 7.3 Counts and filters

- Count tiles: **open** (`2 of 8`), **queued**, **failing**, **set aside**,
  **awaiting code owner**, **pending** (`pending` label). Queue-related tiles
  only on a queue repository; code-owner tile only when a ruleset asks for code
  owner review.
- Each tile but open is a switch (hide what it counts) with an **only** pick in
  its corner; a status is never both hidden and picked.
- **priority**: `high`, `mid`, `low`, `none` switches (labels
  `priority:high|mid|low`; none = zero or several).
- **state**: **draft** switch.
- **sort**: merge order | priority (siblings ordered by the best priority in
  their subtree; none between mid and low).
- Every number is what the list shows; hidden items read as how many showing
  would add, struck through.
- Hidden PRs give their place to what is below them.
- **on GitHub** link: the closest GitHub search for what is shown, with a
  tooltip saying what it cannot express.
- URL: `prs.hide=queued.setAside`, `prs.only=failing`,
  `prs.hidePriority=low.none`, `prs.hideDrafts=1`, `prs.sort=priority`.

## 8. Queue (only when the repository has a `merge-queued` label)

- Title links: **on GitHub** (all `merge-queued`), **picked on GitHub**; a
  summary `7 queued · 1 running · 0 set aside`.
- One row of equal-width boxes: the running one first (turning ring, `running`
  under it) next to the base it merges into (`main ←`), then the ones it would
  pick next in order (`next`, `2`, `3`, …), first those checked ahead
  (`queue/pr-*` layers, `checked ahead`; the layers' own runs, which v1 gains
  in #3809, come with #3810), then dashed boxes for those whose turn has not
  come with why (`after #N`, `review`, `native stack`).
- Each box carries its priority pill, title on hover (tooltip anchored to the
  nearer end).
- When the row overflows: it scrolls with the running box held at the start, and
  a **map** above (one mark per box) shows a frame around the part in view; drag
  the frame like a scrollbar thumb, click elsewhere to jump.
- Outside the row: set aside, claimed, drafts and the like, each with why in a
  word and whose it is.
- **(new, #2757)** A candidate that only a ruleset bypass can merge is marked
  `bypass` with the review hold's reason (text from `pr-report-core`), so its
  later place does not look like a bug.
- Order decided by `pr-report-core`'s queue code from what the page read (merge
  state made from `mergeable` + comparison). Until every part it needs is read,
  it lists the `merge-queued` PRs by number, order unknown.
- A legend: running, waits for another PR, set aside, high/mid/low.

## 9. Running workflows

- Title "Running workflows (N)", **on GitHub** to the Actions tab filtered to
  `is:in_progress is:queued is:waiting is:action_required is:neutral
is:stale`.
- Per run, newest first: state icon (turning ring in progress, dot queued, badge
  for waiting/action required/neutral/stale), title, workflow name and run
  number, event, branch, started age, actor.
- Read beside the report (own budget, own failure).

## 10. Merged in the last 7 days

- Title with **on GitHub**; per PR: number, title, author, `head → base`, merged
  age, labels, closing issues.

## 11. Open issues

### 11.1 Common

- Title "Open issues (N)", **on GitHub** (closest search), **New issue**.
- View switch **List | DAG** (`issues=dag`).
- Count tiles in both views: **open** (shown of total), tiers `S A B C D none`
  as one joined group, `hold` and `close` beside open, **in progress**; each a
  switch with **only**. Two tiers picked show either; in progress with a tier
  shows both.
- Tiers come from `priority:S|A|B|C|D|hold|close` labels (none = zero or
  several). Tooltips say what each tier means.
- **(changed)** Read with the snapshot, up to 1,000 open issues, rather than 30
  first and then page by page: the DAG and the counts are then never drawn from
  part of the list. Past 1,000 the block says the list is cut short.
- **(new, #3233)** Claimed issues (`in-progress` / `planned` label) show the
  claimant from `start-issue`'s claim comment and its age, in the list and the
  DAG; a Claude Code session URL opens the session; a `started` claim older than
  24 hours stands out (a session that has not touched an issue in a day has most
  likely stopped).

### 11.2 List

- Search box: title substring (case-insensitive) or number (`123`/`#123`); not
  kept in the URL.
- Label picks: every other label on an open issue; once any is picked, only
  issues carrying one picked.
- Start-state switches (DAG's words and colours): `Can start, wait over`,
  `Can start`, `Planned`, `In progress`, `Needs a look`, `Waiting`, `Cycle`.
- Sort: **updated** | **priority** (S, A, B, C, none, D, hold, close; updated
  within) | **start** (ready, free, planned, in progress, needs a look, waiting,
  cycle; updated within).
- Per issue: `#N title` link, start badge, `after #N…` (each coloured by its
  state, title on hover), a warning when the body has `Merge-After:` (which
  issues don't read), updated age, author, comment count, labels.
- URL: `issues.hidePriority`, `issues.onlyPriority`, `issues.hideStart`,
  `issues.hideInProgress=1`/`issues.onlyInProgress=1`, `issues.sort`,
  `issues.label=<name>` (repeated). Legacy `issues.hidePending=1`,
  `issues.onlyPending=1`, `dag.hidePending=1` read as `hold`.

### 11.3 DAG

- Nodes: listed issues (hexagons), what they name, open PRs closing a listed
  issue (rounded boxes). Edges from what is waited for to what waits; dashed
  "closed by" edge from an issue to its PR.
- States and colours: can start (green; thick border when the wait is over),
  waiting (brown, dashed), planned (purple), in progress / open PR (blue),
  closed unfinished (grey); **(new)** open but past what the list read (grey,
  dotted), whose own state is unknown; priority pill (`high` filled, `mid`
  outlined, `low` faint); `pending` PRs faint. Done issues and merged PRs are
  not drawn, nor the waits on them.
- Only tiers and in progress filter the DAG; an issue left out that a drawn one
  waits on stays (not counted).
- Each node: `#N` pill, title fitted to two lines (CJK counted double) with `…`,
  links to GitHub.
- Layered layout, left to right: components stacked largest first; nodes with no
  edge in a grid under "No dependencies drawn either way"; crossings reduced by
  barycenter sweeps; nodes levelled with neighbors; curved edges.
- Legend of shapes and colours.
- Zoom: **−**/**+** step through fixed scales about the box's centre; **Fit**
  draws it all in the box (never above 100%; follows resizes until the next
  zoom; also rearranges the free nodes to draw the graph largest); **100%**.
  URL `dag.zoom=125` or `dag.zoom=fit`.

## 12. Split view link

- `⧉ split view` on each card opens `split-view-extension` with: diff (`?w=1&
show-viewed-files=false`) at 737px / 67% zoom on the left, conversation on
  the right at 75%; with a closing issue and/or a Claude session, the
  conversation is held at 577px and the issue (75%) over the session (100%) take
  the rest. First issue, first session only. Tab titled `#N <title>`. Saved view
  name `PR Manager`. URL built by `split-view-link`.

## 13. URL parameters (all)

`repo`, `theme`, layout (§6), `prs.*` (§7), `issues`, `issues.*`, `dag.zoom`.
Only differences from defaults are written; unknown names and values are
dropped; everything carries over when switching repository.

## 14. Accessibility and style

- Status colours never carry meaning alone (glyph + word).
- Diverging blue/red for ahead/behind; categorical blue for open/draft.
- Light and dark from one set of tokens via `light-dark()`.
- Dialogs are native modal `<dialog>`s; drags are pointer-only with keyboard
  equivalents in the Layout dialog; tabs follow WAI-ARIA.
- Works at phone width (390px) with no horizontal page scroll.

## 15. Requirements from #3673 (all new in v2)

1. Issue claimant and age in list and DAG, session link, stale `started`
   highlighted (§11.1).
2. `bypass` mark with the review hold's reason on the queue (§8).
3. Required checks judged from every branch rule, paged past 100 (§4.1).
4. During a re-run, hold back an earlier attempt's red as the worker does, from
   REST `run_started_at` and check run `completedAt` (§4.1, §7.2).
