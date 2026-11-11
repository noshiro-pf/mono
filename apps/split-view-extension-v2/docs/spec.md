<!-- cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf rcppcpp -->

# Split View v2: specification

What `split-view-extension` does today, written down as requirements, and the
decisions the rebuild in this directory makes about it. The rebuild replaces
`apps/split-view-extension/` once it does everything below; until then the two
live side by side and nothing outside this directory depends on this one.

Each requirement has an id (`L3`, `P12`, …) that the tests name. "Kept" means
the rebuild behaves as the current extension does; **Changed** marks where it
deliberately does not, with the reason.

## 1. The contracts that do not change

Two things outside the extension depend on it, so they are fixed:

- **C1. The `split.html` URL** — the query parameters `ws`, `layout`, `url`,
  `zoom`, `sandbox`, `name` and `title`, their meaning and their encoding, as
  `apps/split-view-link` names them. The PR Manager and the GitHub button build
  these URLs, and bookmarks hold them. The rebuild imports `split-view-link`
  rather than redefining it.
- **C2. What is in `chrome.storage.local`** — the keys `workspaceRegistry`,
  `workspace:<id>` and `serviceWorkerResetOrigins`, in the shapes
  `apps/split-view-extension/docs/storage-and-state.md` documents. The rebuild
  carries the same manifest `key`, so it is the same extension id and reads the
  user's saved split views as they are; it writes records the current version
  reads too, so going back is a reload and nothing is migrated either way.
- **C3. The extension id** `nifmgpafbfpgpcijgmfpcoonjbalbkhf`, pinned by `key`.
  Load either build, never both: they are one extension.

## 2. Layout and look

- **L1.** The layout is a binary tree. A leaf is a pane; a split node has an
  axis (`row`: side by side, first on the left; `column`: stacked, first on
  top), the first child's share `ratio`, and optionally a child held at a fixed
  size in CSS pixels (`fixed: { child, px }`), the other taking the rest.
- **L2.** `ratio` is clamped to `0.05..0.95`, on the way in from storage and the
  URL as well as when dragged. `px` is a whole number in `0..100000`; the
  geometry keeps a held child within the same `0.05..0.95` of its node.
- **L3.** Panes are laid out in pixels with a 6px gutter at every depth. Each
  pane's `iframe` is a sibling in pane-id order and positioned absolutely: an
  `iframe` moved in the DOM reloads, so no layout change moves one.
- **L4.** Presets: `1`, `2 cols`, `3 cols`, `2 rows`, `3 rows`, `2×2`, `2×3`,
  `L1+R2`, `T1+B2` (ids `single`, `columns-2`, `columns-3`, `rows-2`, `rows-3`,
  `grid-2x2`, `grid-2x3`, `left-1-right-2`, `top-1-bottom-2`). A grid is a row
  of columns. Applying a preset reuses the panes already there in tree order
  (their addresses, zoom and sandbox survive) and creates the shortfall.
  A new split view starts as `2×2`.
- **L5.** A pane's split buttons split it to the right or downwards: the pane
  keeps the first half and a new empty pane takes the second and becomes active.
- **L6.** Close removes a pane and its sibling takes its space. The last pane
  cannot be closed.
- **L7.** A pane is moved by dragging its grip. Dropped on the middle of another
  pane it swaps places with it; on an edge (the outer quarter) it takes that
  side, the space it leaves going to its former sibling. An outline shows the
  target while dragging; `Escape` cancels. Nothing reloads.
- **L8.** A divider is dragged to change its ratio, or the held size when the
  node holds one. While a divider or a pane is dragged the frames take no
  pointer events.
- **L9. Changed (#3412).** A divider is a focusable `role="separator"` with
  `aria-orientation`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` (the
  first child's share in percent) and a name. Arrow keys along its axis move it
  by a step, `Home` and `End` to the limits.
- **L10.** The layout as a string (`formatLayoutSpec` / `parseLayoutSpec`):
  prefix notation, `p` a pane, `r`/`c` a split followed by the first share in
  percent when it is not 50 (to a tenth), or by whole pixels and `f`/`s` for a
  held first/second child. `rcppcpp` is a 2×2 grid. Case and whitespace are
  ignored on reading; anything that is not exactly one tree is refused.
- **L11. Changed.** A split view has at most 64 panes (`maxPaneCount`): a split
  beyond that is refused with a notice; a URL's addresses past the 64th are left
  out; a layout string with more than 64 panes is refused before it is parsed,
  as is a stored tree deeper or wider than that. A stored tree that repeats a
  pane id gives each repeat a fresh id.
- **L12. Changed.** The page follows the OS colour scheme as Chromium reports it
  (`prefers-color-scheme`, which reads light when the OS states no preference):
  light or dark. The current extension is dark only, which a light desktop shows
  as one dark tab among light ones. The page's own controls take the same
  scheme. A pane's frame is light-schemed with a white background whatever the
  theme, as a tab is: a page that declares no scheme draws on white, one that
  declares a dark scheme gets its own dark canvas, and either is told the OS's
  scheme.

## 3. A pane

- **P1.** A pane is an address bar, back, forward, reload, zoom, open in a new
  tab, sandbox toggle, split right, split down, a `⋯` menu and close, above an
  `iframe`. An empty pane shows a prompt instead of a frame.
- **P2.** The address bar normalizes what is typed: a known scheme (`http`,
  `https`, `about`, `file`, `ftp`) is kept, any other scheme becomes a search;
  `localhost`, `127.0.0.1` and `[::1]` get `http://`; a host with a dot gets
  `https://`; anything else is a Google search. Submitting the address the pane
  is already at reloads it.
- **P3.** Back and forward are asked of the frame; back is disabled until the
  frame reports a history longer than one. Reload asks the frame when it has
  reported for the current document, and otherwise replaces the element at the
  address the pane is at.
- **P4.** Zoom steps along `0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2`
  with `−`/`+`, or `Ctrl`+wheel / pinch inside the pane. The percentage shows
  when not 100% and clicking it resets. Applied as CSS `zoom` on the `iframe`
  (not `transform`), so it needs nothing from the framed page. Saved per pane.
- **P5.** The sandbox is on by default, with every token but top-level
  navigation: `allow-same-origin`, `allow-scripts`, `allow-forms`,
  `allow-modals`, `allow-popups`, `allow-popups-to-escape-sandbox`,
  `allow-downloads`, `allow-storage-access-by-user-activation`,
  `allow-presentation`, `allow-orientation-lock` and `allow-pointer-lock`.
  Toggling it replaces the element, which reloads the pane at the address it is
  at. `allow` delegates `autoplay`, `clipboard-read`, `clipboard-write`,
  `encrypted-media`, `fullscreen` and `picture-in-picture`.
- **P6.** "Open in a new tab" opens the pane's address — or, when a link took
  the pane to a page that did not load, the link's destination — in an ordinary
  tab.
- **P7.** Below 440px of width the zoom, sandbox, split and open-in-tab controls
  move into `⋯`. The service-worker actions are in `⋯` at every width.
  The menu closes on `Escape`, on a press outside it, and when the pane grows
  out of being narrow.
- **P8.** The pane toolbar shows the site's favicon (`_favicon/`) and the
  frame's title as the `iframe`'s title.
- **P9.** A press anywhere in a pane's toolbar makes it the active pane
  (outlined). The active pane is what a context-menu split acts on when the
  frame cannot say which pane it is (§8).

### Failure detection and the fallback

- **P10.** An address Chrome refuses outright is recognized from the address:
  `chrome:`, `chrome-untrusted:`, `devtools:`, `view-source:`, `about:` other
  than `about:blank`, another extension's page, `file:`, any other non-web
  scheme, and the Web Store (`chromewebstore.google.com`,
  `chrome.google.com/webstore`). The fallback shows at once, naming the reason.
- **P11.** Otherwise a pane is blocked when its frame fired `load` and no report
  came within 800ms of it (reports are counted from that `load`), or when
  nothing at all happened for 10s.
- **P12.** The fallback covers the frame (which stays in the DOM): "Open in a
  new tab", "Try again" (only when the failed address is the one the pane was
  pointed at), "Clear the site's service workers" (site refusals only) and "Show
  the frame anyway". The next navigation gets a fallback of its own.
- **P13.** A frame reports, before leaving, where a cross-document GET
  navigation is going (`leaving`); until a document answers, retry and "open in
  a new tab" go to that destination.

### Service workers

- **P14.** "Clear the site's service workers" loads a hidden, sandboxed helper
  frame at the site's origin, asks the content script there to unregister every
  registration, shows `SW-<n>` with the count, and reloads the pane (at the
  `leaving` destination when there is one). A helper that has not answered in
  10s is abandoned.
- **P15.** "Always clear them for this site" toggles the origin in
  `serviceWorkerResetOrigins`. A blocked pane at such an origin clears
  automatically, at most twice per run of failures (reset by any report). A page
  of such an origin in a pane unregisters its workers once a second. The list is
  watched by every page and every pane's content script.

## 4. Saved split views

- **W1.** The top bar's `select` lists the saved split views as
  `<position>: <name>`; choosing one shows it in this tab (saving the one on
  screen first) and pushes a history entry, so Back walks back through them.
- **W2.** `Alt+1`..`Alt+9` (by `KeyboardEvent.code`, `Alt` alone) selects by
  position, from the page or from inside any pane; from a pane, only its own
  frame's report is acted on, not one from a frame nested in it.
- **W3.** `＋` adds `split-view-<n>` (smallest unused `n`) with a fresh UUID,
  saves the list, and opens it in a new tab.
- **W4.** `Edit` opens a popover for the split view on screen: rename (blank
  refused), move earlier / later, open in a new tab, delete (second click
  confirms; the layout goes too; deleting the last leaves a fresh one), open
  all, export, import, and a line reporting the last import / open-all for 6s.
  It closes on `Escape`, a press outside it that the page sees, and a switch.
- **W5.** "Open all" opens every saved split view not already open in a tab, in
  list order, behind the current tab, pinned when last seen pinned, and says how
  many were opened and how many were already open.
- **W6.** Export writes `split-views.json`, the layout on screen saved first:
  `{ kind: 'split-view-backup', version: 1, exportedAt, workspaces }`, each of
  the `workspaces` being `{ id, name, state }`. Import accepts that, or a raw
  `chrome.storage.local.get(null)` dump; merges by id (replace name and layout,
  or append; never delete); a colliding name gets the next `split-view-<n>`.
- **W7.** The tab is titled `<position>: <label>`, the label being the view's
  `title`, else the title the first pane in tree order reported, else the split
  view's name. The favicon is the extension's icon in the position's colour
  (cycle of eight) with the number over it, drawn on a canvas.
- **W8.** Whether a split view's tab is pinned is noticed on load, focus loss,
  hiding and every 30s, and stored on its list entry.
- **W9.** The list is shared between tabs: each page adopts every list written.
  A layout is not shared; two tabs on one split view both save it, the last
  write winning.
- **W10. Changed.** The service worker is the list's one writer, and the
  always-clear origins' (P15) as well. A page sends it an operation (show,
  create, remove, rename, move, activate, pin, import), applies the same
  operation to its own copy at once, and adopts the list the worker answers
  with. The worker applies operations one at a time to the stored list, so two
  tabs' edits never undo each other; it deletes a removed split view's record
  after writing the list. A page that gets no answer goes on with its own copy.

## 5. The URL and what a tab shows

- **U1.** `split.html?ws=<id>&title=…&layout=<spec>&url=…&zoom=…&sandbox=…` is
  written with `replaceState` when the layout is saved (not more often), and
  with `pushState` on a switch. `url` is one per pane in tree order (the address
  the pane is at), trailing empty ones left off; `zoom` only when some pane is
  not at 100%; `sandbox` only when some pane's is off. `:` and `/` are left
  unescaped; everything a query would read is escaped.
- **U2.** On load: a `layout` or `url` makes the URL a request, and what it
  describes is shown and saved under `ws` — or under a new UUID, added to the
  list, when there is no `ws`. A `ws` alone opens what is saved. Neither opens
  the list's `activeId` (the toolbar's "the one I had last"). A `layout` that
  does not parse is ignored and the addresses go side by side; a preset id is
  accepted as a layout. Addresses are normalized as typed ones are; zoom is
  clamped; `sandbox=0` turns a pane's off.
- **U3.** A `ws` not on the list is added (named by `name`, else
  `split-view-<n>`). An empty list gets one entry, `default`. A tab that loads
  hidden does not become `activeId`; it does when shown.
- **U4.** `popstate` switches to the `ws` the URL now names.
- **U5.** A framed `split.html` draws nothing.

## 6. Storage

- **S1.** Saved 250ms after any change, on `pagehide`, before a switch, before
  opening a tab on the view on screen, before "open all" and before export. A
  deleted split view is never saved back.
- **S2.** Read back with repair, never refusal: an unreadable record starts the
  split view fresh; a pane entry that does not parse is dropped; missing `url`,
  or one whose scheme P2 does not keep, is `''`, missing `sandboxed` is `true`,
  `zoom` and `ratio` are clamped; then every leaf gets a pane, every pane not in
  the tree is dropped, `nextPaneId` passes every id, a dangling `activePaneId`
  becomes the first pane.
- **S3.** The list is repaired too: duplicate and id-less entries dropped, blank
  names become the id, a dangling `activeId` becomes the first entry. No list at
  all is rebuilt from the `workspace:*` keys (`default` first, then by
  `savedAt`, newest first). Records the list does not name are deleted, in turn
  with the list's writes, when the browser starts and when the extension is
  installed or updated **(Changed: not on every load)**.
- **S4. Changed.** Only the persisted fields are written: a pane is
  `{ id, url, sandboxed, zoom }`. The current version wrote `historyLength` and
  `reloadToken` too and never read them back; its reader defaults both, so the
  records stay readable by it (C2).

## 7. The toolbar button and open tabs

- **T1. Changed (#2891).** A split view counts as open only while a tab shows
  it: a tab that has navigated elsewhere no longer counts. Each page records
  `{ workspaceId, viewedAt }` for its tab in session storage, and the service
  worker counts a record only when `chrome.runtime.getContexts` says that tab
  still holds an extension page.
- **T2. Changed (#2876).** The toolbar button focuses the open split view viewed
  last (its tab and window). With none open it opens every saved split view as
  W5 does, the list's `activeId` in front; with an empty list it opens
  `split.html`.
- **T3.** Installing the extension opens a split view.

## 8. Context menus

- **M1.** "Open pull request in Split View" on links to
  `https://github.com/*/*/pull/*`, and "Open this pull request in Split View"
  on such a page. On a github.com tab the GitHub content script reads the pull
  request (§9) and opens it; anywhere else it opens with what the address says.
- **M2.** "Open in a split to the right" / "below" (Japanese when Chrome's UI
  is: `右に分割して開く` / `下に分割して開く`) on any web page and any web link.
  In a split view, the pane the menu was opened in — asked of its frame, or the
  active pane when the frame is nested and cannot say — is split as L5 does,
  with the link (or nothing) in the new pane. Elsewhere, a new split view of the
  page and the link (or an empty pane) half and half, named after the tab, opens
  next to the tab, which is closed unless pinned. Nothing happens in incognito.
  The menus are recreated on install, update and startup, serially.

## 9. GitHub

- **G1.** Every pull request page on github.com has a fixed "⧉ Split view"
  button at the bottom left (in a shadow root on `<html>`, hidden off pull
  requests, following in-site navigation). A click opens the pull request in a
  split view next to this tab and closes this tab; `Ctrl`/`Cmd`+click or a
  middle click opens it behind and keeps the tab.
- **G2.** The conversation page is fetched (5s timeout) and parsed for the
  title, the first closing issue
  (`development-menu a[data-hovercard-type="issue"]`) and the first
  `Claude-Session:` trailer of the description (code left out, links written
  back as Markdown). On failure it opens with what is known.
- **G3.** The split view is `pullRequestSplitViewSearch` of `split-view-link`
  under the saved split view `github-pull-request` ("GitHub pull request").
  The worker re-validates every address: a pull request, an issue on github.com,
  a Claude Code session.
- **G4.** On the pull requests of `noshiro-pf/mono` only (owner and repository
  compared ignoring case), a "＋ merge-queued" button sits beside G1's. It adds
  the `merge-queued` label by working GitHub's own label picker: on another tab
  it follows the page's link to the conversation tab first; it clicks
  `button[aria-label="Manage labels"]` unless the picker is already open, sets
  `input[aria-label="Filter labels"]` and dispatches `input`, clicks the
  `role="option"` named exactly `merge-queued` by `aria-labelledby` unless it is
  already `aria-selected`, closes the picker with Escape, and reads the label
  back from the sidebar's Labels section (the nearest ancestor of the picker's
  button holding links, short of one holding a second heading). Every wait gives
  up as soon as the page is no longer that pull request's conversation.
  The outcome stays on the button for 3s: labelled, already labelled, no picker,
  no such label, not saved, or left the pull request.

## 10. Framing

- **F1.** A dynamic rule (`initiatorDomains: [<extension id>]`, `sub_frame`) and
  a session rule per split view tab (`tabIds: [tab]`, `sub_frame`) remove
  `X-Frame-Options`, `Content-Security-Policy` and
  `Content-Security-Policy-Report-Only`, and set `Sec-Fetch-Dest: document`,
  `Sec-Fetch-Mode: navigate`, `Sec-Fetch-Site: none`.
- **F2.** The page re-asserts both on load, when shown, and before every
  navigation it starts; the worker moves the tab rule on `tabs.onReplaced` and
  removes it on `tabs.onRemoved` and **(Changed)** when the tab navigates away
  from `split.html` (asking the tab again afterwards, so that a quick Back keeps
  its rule), so the next page in the tab keeps its frames' headers. The dynamic
  rule is rewritten on install and update, since a rule an earlier version wrote
  outlives the update. The page takes its tab rule back on `pagehide` too, which
  comes before the next page commits; the worker's removal is the fallback for a
  page that could not (a crash). The top bar warns when the rule is not in
  place, and when host access is withheld (with a button that requests it).

## 11. The content script in every frame

- **A1.** Runs at `document_start` in every frame (`match_origin_as_fallback`),
  and returns at once unless it is below this extension's page or its frame is
  named `split-view-pane:<id>`.
- **A2.** A pane's document asks to be assigned (`hello`) on `DOMContentLoaded`,
  not waiting for the frame's `load`. On the page's `assign` it reports
  `{ url, title, historyLength }` on `DOMContentLoaded`, `load`, `hashchange`,
  `popstate` and every second, only when it changed. It runs `back` / `forward`
  / `reload` commands. **(Changed)**
  The page takes a reported or `leaving` address only when its scheme is one P2
  keeps: the report comes from the framed page's world, which can forge it.
- **A3.** `Ctrl+R` / `Cmd+R` / `F5` (not taken by the site) reload the pane, not
  the tab; `Alt+1..9` is forwarded to the page. A frame nested in a pane's page
  hands those keys up, frame by frame, accepted only from the child frame
  holding the focus.
- **A4. Changed.** `Ctrl`+wheel zooms the pane (non-passive, prevented): a mouse
  notch is one step, and a trackpad pinch, a burst of events, steps at most
  every 60ms in one direction instead of once per event. `Ctrl` with only a
  horizontal delta is left to the site.
- **A5.** It answers the worker's "which pane are you" (§8).
- **A6.** Messages are tagged and validated field by field; the page accepts a
  report only from the frame it belongs to.

## 12. Development and packaging

- **D1.** `build` writes `dist/` (page and worker as modules; the two content
  scripts as IIFEs). `build:dev` adds a build name in the top bar, a diagnostics
  dump (rules, matched rules, host access, the panes' framing headers) and the
  PR Manager dev server's origin to `web_accessible_resources`. The production
  manifest lists
  `https://noshiro-pf.github.io/*` there.
- **D2.** `pack` / `pack:crx` stage the store package through the shared
  `tools/configs/chrome-extension-packaging.mts`; `gen:icons` draws
  `public/icons/`; `screenshots` takes the store screenshots, and
  `screenshots:light` the same in the light theme (L12), for pull requests only.
- **D3. Changed (#3407).** The scripts that serve pages listen on port 0 and
  read the port back.
- **D4. Changed.** One browser test suite, Playwright under `e2e/`, covers what
  the current `smoke` script and `e2e` split between them, header stripping and
  frame reports included; there is no separate headed smoke test.
- **D5. Changed.** The dev build's `webRequest` / `webNavigation` event log is
  dropped; the diagnostics dump keeps `getMatchedRules`, which answers the same
  question.

## 13. How the rebuild is organized

| directory         | what is in it                                                                                                                                        |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/`       | pure logic: the layout tree and geometry, the workspace model and reducer, the URL and storage codecs, the list and its operations, the load monitor |
| `src/platform/`   | the `chrome.*` calls, each behind a function the rest calls, and the worker's queue of list writes                                                   |
| `src/page/`       | `split.html`: a controller that owns the state and the effects, and the components that draw it                                                      |
| `src/background/` | the service worker                                                                                                                                   |
| `src/content/`    | the frame agent and the GitHub button                                                                                                                |

What differs from the current structure, and why:

- **The persisted shape and the live one are separate types.** A pane on disk is
  `StoredPane`; in memory it has a `live` part (where the frame says it is, its
  title, its history length, the reload counter) that is never written.
- **A pane's load is a pure state machine** (`core/pane-load.mts`): events in
  (`navigated`, `frame-load`, `report`, `grace-elapsed`, …), the fallback and
  the automatic clear out. The component only runs timers and forwards events.
- **The page's controller is not the component.** Switching, saving, the list's
  cross-tab sync and the keyboard live in `page/controller.mts`; the components
  receive observables and callbacks.
- **Open-tab bookkeeping is one mechanism** (T1) instead of a tab id record plus
  a per-tab record.
- **The list has one writer** (W10). Each tab writing the whole list made every
  concurrent edit a race, patched case by case (a deleted entry put back, a
  rename lost); one writer applying operations in turn removes the class.
