<!-- cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf -->

# Storage and state

What this extension keeps, where it keeps it, and what reads it back. The
[README](../README.md) covers the parts that are about the browser rather than
about data — the header-stripping rules, the `sandbox` attribute, why a site's
own service worker defeats both. This document is the data.

Every shape here was dumped out of a running Chromium rather than read off the
types, so it is what is actually on disk, including the fields that are written
and never read.

## Where state lives

| where                    | what                                                     | how long it lasts                                                        |
| :----------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------- |
| `chrome.storage.local`   | every saved split view, the list of them, per-site flags | until the extension is removed — survives rebuilds, reloads and restarts |
| `chrome.storage.session` | the split view's tab id (and the diagnostics log)        | until the browser closes                                                 |
| the page's URL (`?ws=`)  | which split view **this tab** is showing                 | the tab: a reload, a session restore, `Ctrl+Shift+T`                     |
| React state              | the layout being edited, until the save debounce fires   | the page                                                                 |
| nowhere                  | scroll position in a pane, form contents inside a frame  | —                                                                        |

`local` and `session` both cap at `QUOTA_BYTES`, measured at 10,485,760 bytes
(10 MB). Nothing here approaches it: the single-pane record below is 215 bytes
of JSON, and a backup of two whole split views came to 3.6 kB.

## `chrome.storage.local`

Three kinds of key, and nothing else:

| key                         | holds                                                         |
| :-------------------------- | :------------------------------------------------------------ |
| `workspaceRegistry`         | the list: which split views exist, in what order, named what  |
| `workspace:<id>`            | one split view's layout and addresses. One key per split view |
| `serviceWorkerResetOrigins` | the origins whose service workers a pane removes on sight     |

A whole profile with two split views, dumped verbatim:

```json
{
    "workspaceRegistry": {
        "version": 1,
        "entries": [
            { "id": "one", "name": "split-view-1", "createdAt": 1789040493982 },
            {
                "id": "599df02e-8f28-4919-b2b2-d82bd4fd7ed2",
                "name": "PR review",
                "createdAt": 1789040497337
            }
        ],
        "activeId": "one"
    },
    "workspace:one": {
        "savedAt": 1789040519576,
        "state": {
            "version": 1,
            "root": { "kind": "pane", "paneId": 0 },
            "panes": [
                {
                    "id": 0,
                    "url": "http://localhost:5198/",
                    "sandboxed": false,
                    "historyLength": 2,
                    "reloadToken": 1
                }
            ],
            "nextPaneId": 4,
            "activePaneId": 0
        }
    },
    "workspace:599df02e-8f28-4919-b2b2-d82bd4fd7ed2": {
        "savedAt": 1789040498112,
        "state": { "…": "the same shape" }
    },
    "serviceWorkerResetOrigins": ["https://github.com"]
}
```

### `workspaceRegistry` — the list

```ts
type WorkspaceRegistry = Readonly<{
    version: 1;
    entries: readonly WorkspaceEntry[];
    activeId: string | undefined;
}>;

type WorkspaceEntry = Readonly<{
    id: string;
    name: string;
    createdAt: number;
}>;
```

| field       | means                                                                                                                                       |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `entries`   | **ordered**. The order is the order in the toolbar's `select`, and position _n_ is what `Alt+n` selects and what the favicon draws          |
| `id`        | the `<id>` half of the `workspace:<id>` key, and the `?ws=` in a tab's URL. `crypto.randomUUID()`, except the first one, which is `default` |
| `name`      | free text, defaulting to `split-view-<n>` for the smallest _n_ nothing is already named after. Renaming never changes the id                |
| `createdAt` | `Date.now()` when the entry was added. Written, never read — it is there for a human reading a dump                                         |
| `activeId`  | which split view a `split.html` **with no `?ws=`** opens: the toolbar button's "the one I had last". Not "which tab is showing what"        |

Invariants the parser enforces on the way in, rather than trusting: ids are
unique (a duplicate is dropped, first one wins), an entry with no `id` is
dropped, a blank `name` falls back to the id, and an `activeId` naming no entry
becomes the first entry's id.

Writers: every list edit — create, rename, reorder, delete, import — and a
switch, which sets `activeId`. `saveWorkspaceRegistry` writes the whole record
each time; see [Keeping two tabs in step](#keeping-two-tabs-in-step).

### `workspace:<id>` — one split view

```ts
Readonly<{
    savedAt: number; // Date.now() at the write; what the migration orders by
    state: WorkspaceState;
}>;
```

```ts
type WorkspaceState = Readonly<{
    version: 1;
    root: LayoutNode;
    panes: readonly PaneState[];
    nextPaneId: number;
    activePaneId: number | undefined;
}>;
```

#### `root` — the layout, as a binary tree

```ts
type LayoutNode =
    | Readonly<{ kind: 'pane'; paneId: number }>
    | Readonly<{
          kind: 'split';
          axis: 'column' | 'row';
          ratio: number; // first's share of the space left after the gutter, 0.05..0.95
          first: LayoutNode;
          second: LayoutNode;
      }>;
```

`row` puts `first` on the **left**, `column` puts it on **top** — the names
follow CSS `flex-direction`, which says how the children are arranged rather
than how the divider is drawn. A 2×2 grid is therefore a `row` of two `column`s,
never the other way round; see the README for why that distinction is the whole
point of the nesting.

`ratio` is clamped to `0.05..0.95` on the way in as well as on the way out, so
a hand-edited `0` cannot produce a pane too small to have a toolbar and
therefore too small to drag back.

The tree is the only thing that says where a pane is. The `iframe` elements are
rendered as siblings in pane-id order and positioned absolutely from the
computed rectangles, because moving an `iframe` in the DOM reloads it. It is
also why dragging a pane somewhere else costs nothing: a swap rewrites two
leaves, a move to an edge is `removePaneAt` followed by `insertPaneBeside`, and
in both cases the elements stay put and are positioned into different
rectangles on the next render.

#### `panes` — one entry per leaf of the tree

| field           | stored | read back | notes                                                                                                                         |
| :-------------- | :----- | :-------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `id`            | yes    | yes       | matches a `paneId` in the tree                                                                                                |
| `url`           | yes    | yes       | **where the pane actually is**, not where it was pointed — see below. `""` means an empty pane                                |
| `sandboxed`     | yes    | yes       | the per-pane `sandbox` attribute; `false` is the 🔓 the user chose for a site that needs top-level navigation                 |
| `zoom`          | yes    | yes       | `1` unless someone changed it. Applied by the page as a `transform` on the `iframe`, so it needs nothing from the framed site |
| `historyLength` | yes    | **no**    | reset to `1` on load. It describes a frame that no longer exists                                                              |
| `reloadToken`   | yes    | **no**    | reset to `0` on load. It is a React `key`, meaningless across a page load                                                     |
| `currentUrl`    | no     | —         | folded into `url` at save time, then dropped                                                                                  |
| `title`         | no     | —         | belongs to the document the pane will load; the frame reports one within a second of loading                                  |

Two of those are worth spelling out.

**`currentUrl` is folded into `url` when saving.** In memory a pane has both:
`url` is what the page told the frame to load and is the only thing that ever
reaches `src`, and `currentUrl` is where the frame says it has got to after the
user clicked around inside it. Saving `currentUrl ?? url` is what makes a reload
come back to where you had navigated to rather than to where you started.

**`historyLength` and `reloadToken` are written but never read.** They are
`PaneState` fields, and `PaneState` is what gets serialized; filtering them out
at the write would buy nothing that the loader ignoring them does not already
buy. Anything undefined at save time — `currentUrl`, `title` — does disappear,
because `chrome.storage` serializes with JSON semantics.

### `serviceWorkerResetOrigins`

`readonly string[]`, sorted, of origins like `https://github.com`. A pane at an
origin on this list unregisters the site's service worker without being asked —
when it fails to load, and again whenever it loads, since the site re-registers
on every visit. It lives outside the workspaces on purpose: it is a fact about a
site, not about one layout, and it should hold for every split view.

## `chrome.storage.session`

| key                 | holds                                                                                                                    |
| :------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `splitViewTabId`    | the tab id of the split view, written by the page and read by the service worker so that the toolbar button can focus it |
| `splitViewEventLog` | the diagnostics ring buffer — **only in `pnpm run build:dev`**, and capped at 60 entries                                 |

Session storage, because a tab id is worth exactly as much as the browser
session it belongs to. The alternative, `chrome.tabs.query({ url })`, would need
the `tabs` permission; this needs nothing beyond the `storage` the workspaces
already use.

## The URL

`split.html?ws=<id>` — the one piece of state a reload preserves by itself,
which is what carries a split view through a reload, a browser restart with
session restore, and a tab reopened with `Ctrl+Shift+T`.

- Resolved on load and written back with `replaceState`, which adds no history
  entry: the workspace the page settled on is not somewhere the user navigated
  to.
- Switching writes it with `pushState`, so the browser's Back button walks back
  through the split views visited in this tab. `popstate` switches to whatever
  the URL then names.
- A `split.html` with **no** `?ws=` is what the toolbar button opens, and means
  "the one I had last" — the registry's `activeId`.

## Which split view a tab shows

`resolveWorkspace(fromUrl, now)` in `src/state/registry.mts`, on load:

1. Read `workspaceRegistry`. If there is none, or it has no entries, build one
   from the `workspace:*` keys that are in storage (see
   [Migration](#migration-and-repair)).
2. If the URL named an id that is **not** on the list, add it, named
   `split-view-<n>`. Such a URL is a bookmark, a restored session or the smoke
   test, and the layout it names is the one thing that cannot be recovered any
   other way.
3. If the list is still empty, create one entry with the id `default`.
4. The workspace to show is the URL's id, or `activeId`, or the first entry.
5. Mark it active, and write the list back **only if any of the above changed
   it**.

Then the layout: `loadWorkspaceState(id)`, or a fresh 2×2 grid if storage has
nothing under that id.

## When each record is written

The layout on screen is the only state that is not already in storage, so every
path that could lose it writes it first.

| moment                          | what is written                                                                |
| :------------------------------ | :----------------------------------------------------------------------------- |
| 250 ms after any change         | the layout. Debounced because a splitter drag changes it on every pointer move |
| `pagehide`                      | the layout — a tab closed inside the window                                    |
| before switching split views    | the layout, immediately: the debounce may not have fired                       |
| before opening one in a new tab | the layout, so the new tab starts from what is on screen                       |
| before exporting                | the layout, because the export reads storage rather than the page              |
| any list edit, and any switch   | the list                                                                       |

The one case that deliberately does **not** save first is switching away from a
workspace that has just been deleted — saving it would write the record back.

## Reading back: repair, never refuse

Everything that comes out of storage was written by an older version of this
code, so every field is validated on the way in and a value that does not parse
degrades rather than throwing.

- `parseWorkspaceState` returns `undefined` for a record with no usable tree,
  and the page starts that workspace fresh. Within a record it takes what it
  can: a pane entry it cannot read is dropped, a missing `url` becomes `""`, a
  missing `sandboxed` becomes `true` (the safe default), a `ratio` outside the
  range is clamped.
- `parseWorkspaceRegistry` returns `undefined` only for a value that is not a
  record, or has no `entries` field at all; otherwise it repairs, as above.
- `reconcileWorkspace` then makes the pair consistent: every pane the tree
  refers to gets a `PaneState`, every `PaneState` not in the tree is dropped,
  `nextPaneId` is moved past every id in use, and an `activePaneId` naming no
  pane falls back to the first. This runs on every restore, not only on
  suspicious ones — the addresses are the part the user would miss, and
  refusing to restore would lose them all.

## Migration and repair

**From before there was a list.** Layouts have always been at
`workspace:<id>`; the list is what was added. When there is no
`workspaceRegistry`, `registryFromStoredWorkspaces` builds one out of the keys
that are there: `default` first, then the rest by `savedAt`, most recent first,
named `split-view-1..n` by position. Nothing is orphaned, and it runs once.

**Records nothing refers to** are deleted at load, by
`pruneUnlistedWorkspaces`. This used to be a cap — the twenty most recently
saved were kept — which is incompatible with a list the user curates: a layout
on it has to stay until it is deleted, however long ago it was opened.

**`version: 1`** appears on both records and is written but not yet branched
on. It is there so that a future shape can be told from this one.

## Keeping two tabs in step

Every tab holds its own copy of the list, and `saveWorkspaceRegistry` writes the
whole record — so a tab with a stale copy would drop whatever another tab had
added. Each page therefore subscribes to `chrome.storage.onChanged`, and adopts
a `workspaceRegistry` written by anyone. It does not write back what it adopts,
which is what keeps two tabs from answering each other for ever; a page's own
writes arrive here too and are discarded by a deep-equality check.

Layouts are **not** shared this way. Two tabs on the same workspace both save
it, and the last write wins. The list does not know which tabs are open, so
nothing prevents it — open a second tab on a split view you are not already
looking at.

## The backup file

`Export` writes this, and `Import` reads it back:

```json
{
    "kind": "split-view-backup",
    "version": 1,
    "exportedAt": "2026-09-10 20:42:38",
    "workspaces": [
        {
            "id": "one",
            "name": "split-view-1",
            "state": { "…": "a WorkspaceState" }
        }
    ]
}
```

- **Merged by id**: an id already on the list has its layout and name replaced,
  an id that is not is appended, and nothing is ever deleted. Importing the same
  file twice therefore does nothing the second time, and a backup restored onto
  a fresh profile brings its `?ws=` URLs back with it.
- An imported name that collides with one already on the list is given the next
  `split-view-<n>` instead; the id decides identity, not the name.
- The importer **also accepts a raw `chrome.storage.local.get(null)` dump** —
  the object at the top of this document. That is the way out of an extension id
  that has already changed: the old id's page can no longer export, but its
  DevTools console can still print its storage.

## What the storage is keyed to

`chrome.storage.local` belongs to the extension **id**, and an unpacked
extension's id is derived from the directory it was loaded from — so the same
code loaded from another path is a different extension looking at empty storage.
`key` in `public/manifest.json` pins the id to
`nifmgpafbfpgpcijgmfpcoonjbalbkhf` wherever it is loaded from. See "The list,
and what it is keyed to" in the README for what that means for packing a `.crx`
and for anything saved before the key was added.

## The page's own state

One React state holds the pair, not two:

```ts
type Session = Readonly<{
    workspaceId: string | undefined;
    state: WorkspaceState;
}>;
```

Two pieces of state would make "which id does this layout belong to" a question
of which `setState` React batched with which, and the wrong answer overwrites
one split view with another's panes. `workspaceId` is `undefined` until the list
has been read; nothing renders and nothing saves before then.

Every change to a layout goes through one pure reducer,
`workspaceReducer(state, action)`:

| action          | carries                                   | does                                                                                                                                           |
| :-------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `restore`       | a whole `WorkspaceState`                  | replaces the layout, reconciled (above)                                                                                                        |
| `apply-preset`  | a `PresetId`                              | rebuilds the tree, **reusing the panes already open** so addresses survive                                                                     |
| `split`         | `paneId`, `axis`                          | replaces that leaf with a split of itself and a new pane                                                                                       |
| `move-pane`     | `paneId`, `targetPaneId`, a zone          | `center` exchanges the two panes' places; an edge detaches the pane and re-attaches it to that side of the target. Tree only — nothing reloads |
| `close`         | `paneId`                                  | removes a pane; the sibling takes the space. Refuses the last pane                                                                             |
| `set-ratio`     | a `NodePath`, `ratio`                     | moves one divider                                                                                                                              |
| `navigate`      | `paneId`, what was typed                  | normalizes it to a URL; re-submitting the same address reloads instead                                                                         |
| `report`        | `paneId`, `url`, `title`, `historyLength` | what the frame said about itself, once a second at most                                                                                        |
| `reload`        | `paneId`                                  | bumps `reloadToken`, having first made `url` the address the pane is at                                                                        |
| `set-sandboxed` | `paneId`, `sandboxed`                     | toggles the sandbox, which only takes effect on a fresh element                                                                                |
| `zoom`          | `paneId`, `in`/`out`/`reset`              | steps that pane along the zoom ladder. Nothing reloads: the frame is scaled from outside                                                       |
| `activate`      | `paneId`                                  | which pane is highlighted                                                                                                                      |

An action that changes nothing returns the **same** state object, so the
frames' once-a-second reports cost nothing: React bails out of the update, and
the debounced save never fires.

## The page ↔ frame protocol

Panes are cross-origin, so the page cannot read a frame's URL, its title, or
call `history.back()` on it. A content script in the frame does all three and
talks over `postMessage`. Every message carries
`tag: 'split-view/v1'` and is validated field by field on arrival; the page
additionally checks that `event.source` is the very frame it thinks it is
talking to.

| direction    | kind                         | carries                                   | for                                                         |
| :----------- | :--------------------------- | :---------------------------------------- | :---------------------------------------------------------- |
| page → frame | `assign`                     | `paneId`                                  | tells a frame which pane it is, and where to answer         |
| page → frame | `command`                    | `paneId`, `back`/`forward`/`reload`       | the pane toolbar's navigation buttons                       |
| page → frame | `unregister-service-workers` | `paneId`                                  | `Clear SW`, and the per-origin list                         |
| frame → page | `state`                      | `paneId`, `url`, `title`, `historyLength` | where the frame is now; dropped when it would repeat itself |
| frame → page | `service-workers`            | `paneId`, `count`                         | how many registrations went                                 |
| frame → page | `shortcut`                   | `paneId`, `code`                          | `Alt+1..9` pressed with the focus **inside** a pane         |
| frame → page | `zoom`                       | `paneId`, `in`/`out`                      | `Ctrl`+wheel, or a trackpad pinch, inside a pane            |

`zoom` is handled by the pane's own component, and it applies the step to the
pane the message came from rather than to the `paneId` in it — so a framed site
can zoom the pane it is in and no other. The frame's listener is a non-passive
one that calls `preventDefault`, without which the browser would zoom the whole
tab as well.

`shortcut` is the one the page handles itself rather than the pane's component:
a key event does not cross a frame boundary, so without the frame forwarding it
the shortcut would work only while the toolbar had the focus. It carries
`KeyboardEvent.code`, never `key` — on macOS `Alt+1` _types_ `¡`.

## Where each piece lives

| file                         | what it owns                                                                |
| :--------------------------- | :-------------------------------------------------------------------------- |
| `src/layout/types.mts`       | `LayoutNode`, `PaneState`, `WorkspaceState` — the shapes stored             |
| `src/layout/tree.mts`        | the pure tree operations: split, remove, set ratio                          |
| `src/layout/geometry.mts`    | the tree flattened into rectangles, and the hit-test behind a drop          |
| `src/layout/presets.mts`     | the preset layouts, and the rule that a grid is a row of columns            |
| `src/layout/zoom.mts`        | the zoom ladder, its clamp and its formatting                               |
| `src/state/reducer.mts`      | `workspaceReducer`, and reconciliation                                      |
| `src/state/storage.mts`      | `workspace:<id>`: read, write, list, delete, prune                          |
| `src/state/registry.mts`     | `workspaceRegistry`: the list, its edits, its migration, its cross-tab sync |
| `src/state/backup.mts`       | the JSON export and import                                                  |
| `src/state/workspace-id.mts` | the `?ws=` in the URL                                                       |
| `src/state/tab-identity.mts` | the tab's title, and the numbered favicon drawn on a canvas                 |
| `src/state/sw-origins.mts`   | `serviceWorkerResetOrigins`                                                 |
| `src/shared/protocol.mts`    | the `postMessage` messages, and their validators                            |
| `src/shared/shortcuts.mts`   | what counts as `Alt+1..9`                                                   |
