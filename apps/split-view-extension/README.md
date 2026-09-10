<!-- cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf -->

# split-view-extension

A Chrome extension (Manifest V3) that splits one tab into a grid of web pages.
Chrome's own split view puts two pages side by side; this one divides a single
tab into as many panes as you like, in any arrangement, and remembers the
layout and the addresses across a reload.

Not published anywhere. It is loaded unpacked, in developer mode.

## Development setup

From the repository root, once — see [Setup](../../README.md#setup) for Node,
pnpm and `pnpm install`. Then, for this package:

```sh
pnpm exec playwright install chromium   # for `smoke` and `screenshots`
```

That is everything `build`, `test`, `lint` and `type-check` need. The rest is
wanted only by the commands whose output leaves the repository:

| command       | also needs                                                                     |
| :------------ | :----------------------------------------------------------------------------- |
| `smoke`       | a **headed** Chromium — `xvfb-run -a pnpm run smoke` where there is no display |
| `screenshots` | the same                                                                       |
| `pack`        | `zip`                                                                          |
| `pack:crx`    | `pass`, holding the signing key, and `openssl`                                 |

Everything below is run from this directory (`apps/split-view-extension`).

## Loading it

```sh
pnpm run build       # writes dist/ — what to load normally
pnpm run build:dev   # the same, plus the diagnostics
pnpm run gen:icons   # redraws public/icons/*.png, which the build copies
pnpm run pack        # writes pack/split-view-extension-<version>.zip, for the store
pnpm run pack:crx    # the same, signed, for an item with verified CRX upload
pnpm run screenshots # writes pack/screenshots/*.png, for the store listing
```

Publishing it is [`docs/store-listing.md`](./docs/store-listing.md): the copy
for every field of the dashboard, a justification per permission, and what to
expect from the review of an extension that strips framing headers.

Then, in Chrome: `chrome://extensions` → turn on **Developer mode** → **Load
unpacked** → choose `apps/split-view-extension/dist`. The toolbar button opens
the split view (and focuses the existing one if there is one).

`pnpm run build` has to be re-run after any change, followed by the reload
button on the extension's card. There is no dev server: the page has to be
served from `chrome-extension://`, because that origin is what the
header-stripping rule and the content script are keyed to.

`pnpm run smoke` loads the build into a real Chromium and checks the parts that
only a browser can check: that a page sending `X-Frame-Options: DENY` and
`frame-ancestors 'none'` is framed anyway, that the content script inside a pane
reports its title and follows a navigation made in the frame, that a reload comes
back to the same layout at the same addresses, and the whole of the saved list —
creating, switching with `Alt+N` from the page and from inside a pane, renaming,
exporting, deleting, and the list surviving a reload — plus the tab's title and
its numbered favicon, which nothing outside a browser draws. It needs a headed
browser — `xvfb-run -a pnpm run smoke` where there is no display.

## Using it

- The toolbar across the top applies a preset layout: 1, 2 or 3 columns, 2 or 3
  rows, a 2×2 or 2×3 grid, or one large pane beside two small ones. Applying a
  preset keeps the addresses of the panes it reuses.
- **A grid is a row of columns, not a column of rows.** The divider that spans
  the whole stage is the vertical one; each column's horizontal divider moves
  on its own, so making one pane taller leaves the columns beside it alone.
  Nested the other way round, one horizontal divider would set the height of
  every column at once, which is rarely what is wanted.
- **⬌ / ⬍ in a pane's toolbar splits that pane** to the right or downwards, and
  ✕ closes it. Those two are the whole of "phase 2": the layout is a binary
  tree, so a pane can be split again as deep as you like.
- **Drag a pane by the ⠿ at the left of its toolbar to move it.** Dropping it
  on the **middle** of another pane exchanges the two; dropping it on an
  **edge** takes that side of the pane, and the space the moved pane leaves
  behind is taken over by whatever it was sharing a divider with. An outline says which of the two it
  will be while you drag; `Escape` calls it off.
    - **Neither reloads anything.** What moves is the pane's place in the
      layout tree, so the page keeps its scroll position, its history, its
      login and its sandbox setting, and simply lands in a different rectangle.
- Drag any divider to change the ratio.
- **`−` / `+` in a pane's toolbar zoom that pane**, and `Ctrl`+wheel (or a
  trackpad pinch) over it does the same. The percentage appears beside them
  when it is not 100%, and clicking it goes back. The zoom is saved with the
  layout, and it travels with the pane when you move it.
    - It is the _page_ that scales the pane's `iframe` — the element is made
      `1 / zoom` of the space it has and drawn at `zoom` — so the site is laid
      out for the viewport it appears to have, exactly as the browser's own
      zoom does it, and a pane can be zoomed even on a page that will not run
      the extension's content script.
- Type an address into a pane and press Enter. A bare host gets `https://`,
  `localhost:5173` gets `http://`, and anything that is not an address becomes
  a web search.
- **The layout is saved and restored on reload**, including where you navigated
  to inside each pane. The tab's URL carries the workspace id
  (`split.html?ws=<id>`), which is what survives a reload, a browser restart
  with session restore, and a tab reopened with Ctrl+Shift+T.
- **The select at the left of the toolbar is the list of saved split views.**
  Choosing one swaps this tab's contents for it; `＋` adds one. **`Alt+1`..
  `Alt+9` selects by position**, and works with the focus inside a pane as well
  as on the page.
- **`Edit` opens a popover** — rename, reorder, open in a tab of its own,
  delete, and the JSON `Export` / `Import`. A popover rather than a second
  toolbar row: a row costs the panes its height for the whole session. It
  closes on `Escape`, or on a click anywhere but in it that this page can see —
  a click _inside a pane_ goes to the frame and never reaches the page, so the
  popover stays open over it.
- **The number is the position in the list**, and it is also the `Alt+N` and
  the number in the favicon — so reordering is how a split view is given a
  shorter shortcut. Deleting takes the layout with it, and needs a second
  click.
- **`Export` / `Import` are the way across an extension id that changed** —
  see "The list, and what it is keyed to" below.
- The toolbar button opens the split view you had last, or focuses the tab if
  one is open.

## How it works

**[`docs/storage-and-state.md`](./docs/storage-and-state.md) is the data:** what
is in `chrome.storage.local` and `session`, key by key and field by field, with
a verbatim dump of a real profile; when each record is written and how it is
repaired on the way back in; the backup file's format; the reducer's actions;
and the `postMessage` protocol. What follows here is the browser-facing half.

| piece                 | what it does                                                             |
| :-------------------- | :----------------------------------------------------------------------- |
| `src/layout/`         | the binary layout tree, and the rectangles it flattens into              |
| `src/state/`          | the reducer, the saved list, the address bar's parsing, and storage      |
| `src/components/`     | the page: the list of split views, a toolbar, the panes and the dividers |
| `src/frame-agent.mts` | the content script that runs inside every pane                           |
| `src/background.mts`  | the service worker: the toolbar button, and cleanup on tab close         |

Five things are worth knowing before changing any of it.

**The layouts and the list of them are two records, and only the second one is
new.** A workspace's layout has always been at `workspace:<id>` in
`chrome.storage.local`, and has always outlived the tab; what was missing was
anything that said _which_ workspaces exist, so a closed one could not be found
again — the toolbar button opened a fixed id and the button that made a new
one handed out random ids. `workspaceRegistry` is that list: ids, names and order, plus the workspace
the toolbar button should open. Consequences:

- **The list is recovered from storage when there is none.** Every workspace
  saved before the list existed is still under its own key, so
  `registryFromStoredWorkspaces` builds the first list out of what is there
  rather than starting empty and orphaning them.
- **A `?ws=` that is not on the list is added to it**, not refused. Such a URL
  is a bookmark, a restored session or the smoke test, and the layout it names
  is the one thing that cannot be recovered any other way.
- **`pruneUnlistedWorkspaces` deletes the records the list does not name.**
  There used to be a cap — twenty, by last save — which is not compatible with
  a list: a layout on it has to stay until the user deletes it, however long
  ago it was opened.
- **The workspace on screen and its layout are one piece of React state.** Two
  would make "which id does this layout belong to" a question of which
  `setState` React batched with which, and the wrong answer overwrites one
  split view with another's panes.
- **Switching in place replaces every `iframe`.** The pane elements are keyed
  by workspace as well as by pane id, so switching loads the new workspace's
  addresses instead of navigating the old elements. That is the cost of the
  design: the panes of the split view you switch to are loaded afresh. Keeping
  them alive would mean keeping every visited workspace's frames in the DOM,
  hidden — which works (`display: none` does not unload a frame) at the price
  of every workspace's pages staying resident.
- **The list is shared between tabs; a layout is not.** Every tab holds its own
  copy of the list and `saveWorkspaceRegistry` writes the whole record, so each
  page watches `chrome.storage.onChanged` and adopts what another tab wrote —
  without writing it back, which is what keeps two tabs from answering each
  other for ever. Two tabs on the _same_ workspace still fight over its layout:
  both save, and the last write wins. `Alt`-click a chip for a workspace you
  are not already looking at.

**Two rules strip the headers, because neither covers the other's case.**

- A **dynamic** rule scoped by `initiatorDomains: [<extension id>]` — the host
  part of a `chrome-extension://` URL is the extension id, so this matches every
  frame _this extension opens_, in any tab. Dynamic rules outlive the browser
  session, so it is in place before any page of ours is, and no tab id enters
  into it. An `iframe` in an ordinary page stays blocked, as it should.
- A **session** rule scoped to the split view's tab — for a link clicked
  _inside_ a pane, which the site initiates rather than us, and which the
  initiator-scoped rule therefore does not see.

Measured with `getMatchedRules`: a typed address matches the dynamic rule; a
link click inside a pane matches the tab-scoped one; with the tab-scoped rule
removed, the link click is blocked and the already-loaded pane keeps its
content — which is exactly what the failure looks like from the outside.

**The tab-scoped rule is re-asserted, not installed once.** A
`declarativeNetRequest` session rule is bound to a tab id, and a tab id is less
permanent than it looks: Chrome's memory saver discards an idle tab and gives it
a **new** id when it comes back, at which point the old rule matches nothing.
The panes already loaded keep their content, so the failure surfaces only on the
next navigation — as a site that had been framing fine suddenly reporting
`frame-ancestors 'none'` in the console. The page therefore re-asserts the rule
for whichever tab it is in _now_: on load, whenever the tab becomes visible, and
before every navigation typed into a pane. If it cannot (no tab id), the toolbar
says so rather than leaving panes mysteriously blank.

**Response headers are stripped for this tab only.** Most sites refuse to be
framed, through `X-Frame-Options` or a CSP `frame-ancestors` directive. The page
installs a `declarativeNetRequest` **session** rule whose condition names its
own `tabId` and `sub_frame` only, so ordinary browsing is untouched. The whole
CSP header has to go rather than just the one directive — `declarativeNetRequest`
cannot read a header's value, only remove, set or append it — so a pane also
loses the site's own XSS protections.

**Panes are `sandbox`ed, without `allow-top-navigation`.** That is what stops a
framed page from replacing the whole split view with itself. It cannot be done
from the page's side: `window.top` is unforgeable, and assigning to a
cross-origin `top.location` is allowed by design. `allow-same-origin` is kept,
so the frame keeps its origin, its cookies and its storage. 🔒 in a pane's
toolbar turns the sandbox off for that pane, for a site that genuinely needs
top-level navigation.

**The page and the panes talk over `postMessage`.** The page cannot read a
cross-origin frame's URL or call `history.back()` on it, so a content script
inside the frame does both and reports back. It is declared for `<all_urls>` and
every frame, and the first thing it does on an ordinary page is notice that
`location.ancestorOrigins` is empty and return. A pane where it cannot run — a
`chrome://` URL, the Web Store, an error page — shows ⚠ in its toolbar; the
address bar and the frame still work, but the title, the back button and
"restore where I navigated to" do not.

**`iframe` elements are never moved in the DOM.** Moving one reloads it, so the
panes are rendered as siblings in pane-id order and positioned absolutely from
the computed geometry. The tree decides where a pane _is_, never where its
element sits. Splitting a pane appends an element; nothing else moves.

That is also what makes dragging a pane somewhere else free: exchanging two
panes' places, or pulling one out and re-attaching it to the side of another,
is an edit to the tree, and the elements stay exactly where they are in the
DOM. Only the rectangles they are positioned into change. Dragging is followed
on `window` against those same rectangles rather than on the panes themselves —
a pointer over a pane is a pointer over an `iframe`, which belongs to the
framed site, so the stage turns pointer events off for the frames while a drag
is in progress, exactly as it does for a divider.

## A site's own service worker beats the rules

If the framed site has a service worker that answers the navigation, the
response never passes through the network layer, and `declarativeNetRequest`
cannot touch it. This was measured, not guessed: with a service worker
answering from Cache Storage — or with `fetch(event.request)` — a pane is
blocked even by a rule with **no conditions at all**, while the same page
without the worker loads. It is why GitHub's issues pages fail in a pane for a
signed-in user (GitHub registers a worker when signed in, none when signed out)
while the repository's own pages load.

The way out is to remove the worker, which is what `Clear SW` in a pane's toolbar
does: it opens a hidden frame at the site's origin, has the content script there
call `registration.unregister()`, and reloads the pane. The site registers its
worker again on its next ordinary visit, so this is an escape from a pane that
cannot load rather than a permanent change. The button appears only on a pane
that has failed to report.

`Always clear` next to it puts the **origin** on a list kept in `local` storage: a
pane at an origin on that list removes the worker without being asked — when it
fails to load, and again whenever it loads successfully, since the site
re-registers on every visit. Per origin because that is the only unit there is:
a worker is registered for a scope (`/` for the sites this matters to) and
`unregister()` takes the whole registration, so "only under `/issues`" is not
something the browser can be asked for. It is also exactly what the button was
already doing.

## The list, and what it is keyed to

`chrome.storage.local` belongs to the extension **id**, and an unpacked
extension's id is derived from the directory it was loaded from — so the same
code loaded from another path, or packed into a `.crx`, is a different extension
looking at empty storage. Rebuilding and reloading in place is safe and always
was; moving is not.

`key` in `public/manifest.json` is the fix: it is the public half of an RSA
keypair, and Chrome derives the id from it instead of from the path. The id is
now fixed at **`nifmgpafbfpgpcijgmfpcoonjbalbkhf`** wherever this is loaded
from. Two things follow:

- **Adding that key changed the id once**, so anything saved by a build from
  before it is under the old id and invisible here. To bring it across, open the
  old build's `split.html`, run `await chrome.storage.local.get(null)` in its
  DevTools console, save the result as a `.json`, and hand that to `Import` —
  the importer takes a raw storage dump as well as its own export format.
- **Packing a `.crx` needs the matching private key.** It is not in this
  repository and must not be: without it Chrome will refuse to install a `.crx`
  whose signature does not match the `key` in the manifest. Loading unpacked
  needs nothing but the `key`.
- **An item with verified CRX upload turned on takes only a signed `.crx`** —
  a zip comes back as "アイテムを crx パッケージで更新する必要があります".
  `pnpm run pack:crx` stages the same package and has Chrome sign it with the
  private key whose public half is registered on the account. **That key is not
  in this repository and must never be**; losing it means losing the ability to
  publish an update at all, since every upload is checked against the public
  half the store has on file. It comes out of `pass`, from the entry
  `split-view-extension` unless `SPLIT_VIEW_SIGNING_KEY_PASS` names another —
  and from nowhere else, because a key that can also be sitting in a file is a
  key that will end up in one. It is written to a file only because
  `--pack-extension-key` takes a path: into a `mkdtemp` directory, which is
  `0700`, and deleted as soon as the packing is over however it went. The
  script prints the id the signing key implies, and whether it is the id the
  unpacked build has.
- **The Chrome Web Store refuses a manifest that has a `key` at all**, since it
  assigns an id from the key it holds itself. `pnpm run pack` is what to upload
  to an item without verified CRX upload:
  it stages a copy of `dist/`, takes the `key` and the source maps out of the
  copy, and zips that — leaving `dist/` as the build made it, still loadable
  unpacked under the pinned id. The published extension therefore has a
  _different_ id from the local one and starts with empty storage; `Export` and
  `Import` are how the saved split views come across.

`Export` writes every saved split view — names, layouts, addresses — as one
JSON file, and `Import` reads it back by id: an id already on the list has its
layout and name replaced, an id that is not is appended, and nothing is deleted.
Importing the same file twice therefore does nothing the second time.

## The one thing that may not work

An `iframe` on an extension page is a cross-site context, so a site's
`SameSite=Lax` session cookie — the browser default — may not be sent, and the
pane shows you logged out. Whether it is sent depends on how Chrome treats a
request an extension with host permissions initiates, which is worth measuring
against the sites you actually want to use rather than reasoning about.

↗ in a pane's toolbar opens that pane's address in a normal tab, which is the
escape hatch for a site that will not work embedded.

## Permissions, and why

| permission                            | why                                                     |
| :------------------------------------ | :------------------------------------------------------ |
| `declarativeNetRequestWithHostAccess` | the header-stripping rule above                         |
| `host_permissions: <all_urls>`        | that rule acts only on requests the extension may touch |
| `storage`                             | the saved workspaces, and the split view's own tab id   |
| `favicon`                             | `_favicon/`, for the icon in a pane's toolbar           |

Narrow `<all_urls>` in `public/manifest.json` — in both `host_permissions` and
the content script's `matches` — to the sites you actually frame, if you would
rather not grant all of them.
