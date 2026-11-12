# PR Manager v2 — architecture

How v2 is built. What it does is [`spec.md`](./spec.md). This file says where
each thing lives and why it differs from v1.

## Goals that shaped it

1. **One reader of GitHub for the page and the worker.** v1 kept its own
   GraphQL reader (`report-query.mts`, `load-report.mts`, 3,400 lines) beside
   `pr-merge-queue`'s. v2 takes the queries, decoders and decisions from
   `pr-report-core-v2` (built by the unblock-prs v2 work) and keeps only what is
   particular to a page: when to read, what to keep when a part fails, and how
   to draw it.
2. **Layers that only point down:** `ui` to `store` to `domain`, and `store` to
   `github`. `domain/` is pure (no DOM, no timers, no fetch) and holds every
   decision the page makes, so that a test reads like the spec.
3. **One place per concern.** Every URL parameter is declared once, as a codec,
   and one store writes the URL. Every age is bound to one clock.
4. **CSS next to what it styles.** v1 had one 3,355-line `index.css`; v2 keeps
   design tokens in `ui/tokens.css` and a stylesheet per component group,
   imported by the component, in cascade layers.

## Directory layout

```
src/
  main.tsx            entry: start page or app, chosen by ?repo=
  index.mts           barrel for the tests and the demo page
  domain/             pure decisions, each with *.test.mts beside it
    url/              the codec type and the parameters' shared spellings
    repo.mts          ?repo= parsing, GitHub URL forms
    theme.mts         light/dark, ?theme=
    layout/           blocks, columns, tabs, heights, shares, ?cols= …
    report/           what a failed part keeps from the last read
    merge-order/      the cards, the tree's view settings, counts, the search
    queue/            the queue row from pr-report-core-v2's decision
    issues/           rows, view settings, counts, the search; the DAG's
                      graph, layered layout, zoom and two-line titles
    activity/         the reader's days and the Activity dialog's query
    github-search.mts every "on GitHub" link
    split-view.mts    the split view link, through split-view-link
    poll.mts          the budget-paced poll interval
    format.mts        ages, times
    label-color.mts   chip ink by WCAG contrast
  github/             fetch as a Transport, the token, the workflow runs,
                      the Activity dialog's read
  store/              synstate stores; each takes the browser as arguments
  ui/                 synstate-dom components, by feature; tokens.css
test/
  demo/               the demo page over made-up data (dev server only)
```

## The URL

`domain/url/codec.mts` defines

```ts
type ParamCodec<T> = Readonly<{
    read: (params: URLSearchParams) => T;
    write: (value: T, params: URLSearchParams) => void; // only non-defaults
}>;
```

Each feature exports its codec (`themeCodec`, `layoutCodec`,
`mergeOrderViewCodec`, `issuesViewCodec`, `dagZoomCodec`), and
`store/url-store.mts` is the only writer of `history.replaceState`. It reads
every codec once at start, and a moment after any change (300 ms, so a drag
writes once) writes all of them into the current query string, keeping the
parameters no codec owns (`repo`, and whatever a newer page wrote). v2 reads
every parameter v1 wrote, so bookmarks survive the swap.

## Reading

- **One read is one snapshot.** `store/report-store.mts` calls
  `pr-report-core-v2`'s `readSnapshotGraphql` with the page's `fetch`
  (`github/transport.mts`) beside the running workflows, and hands the snapshot
  to `decideQueue`, which is the worker's own decision. The page has no query of
  its own but the Activity dialog's searches and the workflow runs' REST list.
- **A part that fails keeps its last answer** (`domain/report/kept.mts`) and
  says why in the blocks drawn from it; only a read that brought nothing is a
  failed read, which keeps the whole report.
- **One read out at a time.** Refresh during a read reads again when it ends; a
  token changed drops whatever a read asked before then brings. This settles
  what the first attempt left open: there is no per-block refresh to overlap the
  poll, and nothing lands late over something newer.
- The poll is paced by `domain/poll.mts`'s pure function of the budget drop, and
  a hidden tab reads nothing. Timers and visibility are passed in, so a test
  drives both.
- **The Activity dialog reads apart**, when opened, and again at local midnight
  while open (`store/activity-store.mts`).

## Drawing

synstate-dom: each component runs once and binds observables. Components read
view models the stores derive; they do not compute. Lists are `For` keyed by
number. Dialogs are native `<dialog>` opened from store state. A `.tsx` file
defines one component, as the root `CLAUDE.md` asks: a part only one component
draws is a component of its own, in a file beside it
(`src/ui/one-component-per-file.test.mts` holds it).

## Differences from v1 worth knowing

- The queries and decoders are shared with the worker (above).
- The URL has one writer and one declaration per parameter.
- CSS is split per component and layered (`@layer tokens, base, components`).
- Stores are grouped by feature with one composition root (`store/index.mts`)
  instead of one module importing every other.
- Names say what a thing is in the spec's words (`MergeOrderView`, not
  `PageSummary`).
- One read per poll instead of v1's parts sent apart and drawn as each lands:
  every block is drawn from one consistent snapshot, at the cost of the first
  paint waiting for the slowest part. See `spec.md`'s **(changed)** items.
