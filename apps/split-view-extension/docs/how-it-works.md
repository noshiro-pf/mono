<!-- cspell:ignore nifmgpafbfpgpcijgmfpcoonjbalbkhf -->

# How it works

The design behind what the [README](../README.md) describes: why each control
behaves as it does, how a site that refuses to be framed ends up in a pane
anyway, and what that costs. [`development.md`](./development.md) is how to
build and test it; [`storage-and-state.md`](./storage-and-state.md) is the data.

## The controls, and why they behave that way

The full list, with the reasoning the README leaves out.

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
- **A narrow pane keeps its toolbar in a menu.** Below about 440px there is no
  room for fourteen controls and an address bar, so the zoom, the sandbox
  toggle, the split buttons and "open in a new tab" move into `⋯` — and the two
  service-worker actions are in there at every width, because a menu row has
  room to say what they do and a 12px icon does not.
- **Drag a pane by the grip at the left of its toolbar to move it.** Dropping it
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
    - It is the _page_ that zooms the pane's `iframe`, with the CSS `zoom`
      property, so a pane can be zoomed even on a page that will not run the
      extension's content script.
    - **`zoom`, not `transform: scale`**, and the difference is measurable:
      with a scale transform the frame's own renderer draws at 1x and the
      compositor stretches the result, so text is soft — `devicePixelRatio`
      inside the frame stays `1`. `zoom` propagates into the frame as an
      effective zoom, and `devicePixelRatio` there becomes the zoom, so the
      page is drawn at that scale. The layout is the same either way:
      percentages resolve in the zoomed space, so the frame still fills the
      pane and the site is laid out for the viewport it appears to have.
- Type an address into a pane and press Enter. A bare host gets `https://`,
  `localhost:5173` gets `http://`, and anything that is not an address becomes
  a web search.
- **The layout is saved and restored on reload**, including where you navigated
  to inside each pane. The tab's URL carries the workspace id
  (`split.html?ws=<id>`), which is what survives a reload, a browser restart
  with session restore, and a tab reopened with Ctrl+Shift+T — and, from the
  first save on, the view itself: the layout, the addresses, the zoom. The
  address bar is therefore a link to what is on screen, and a URL written by
  hand opens the view it describes. See "The URL" in
  [`storage-and-state.md`](./storage-and-state.md#the-url) for what wins when
  the URL and storage disagree.
- **The select at the left of the toolbar is the list of saved split views.**
  Choosing one swaps this tab's contents for it. **`Alt+1`..`Alt+9` selects by
  position**, and works with the focus inside a pane as well as on the page.
- **`＋` adds a split view and opens it in a new tab**, leaving this tab on the
  one it was showing: adding one is usually for a second set of pages beside
  the first, not instead of it. The list is saved before the tab opens, so the
  new page finds its entry — name included — rather than adding one of its own.
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
- **`↗ Open all` opens every saved split view, each in a tab of its own** —
  what to press after a browser restart that did not restore the tabs. The ones
  already open in a tab are left where they are, because two tabs on one split
  view both save its layout and the one closed last writes over the other's
  work; the popover says how many it opened and how many were already there.
    - **One last seen in a pinned tab comes back pinned.** No event a page can
      hear says that its own tab has been pinned, and the one the browser does
      offer — `chrome.tabs.onUpdated` — wakes the service worker for every
      navigation, title and icon change in every tab there is. So the page asks
      about itself instead, at the moments a pin has probably just happened:
      when it loads, when the focus leaves it (pinning is done in the tab
      strip), when it is switched away from, and every 30 seconds otherwise. A
      tab pinned and closed in the same breath comes back unpinned.
- **`Export` / `Import` are the way across an extension id that changed** —
  see "The list, and what it is keyed to" below.
- The toolbar button opens the split view you had last, or focuses the tab if
  one is open.

## The pieces

**[`storage-and-state.md`](./storage-and-state.md) is the data:** what
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
  both save, and the last write wins — which is why `↗ Open all` skips the
  split views already open in a tab.

**Two rules edit the headers, because neither covers the other's case.** Each
removes the response headers that refuse framing _and_ sets the three
`Sec-Fetch-*` request headers to what a top-level navigation would have sent —
see ["What will not open in a pane"](#what-will-not-open-in-a-pane-and-why) for
why the second half is needed at all.

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

**Panes are `sandbox`ed, without `allow-top-navigation`** — and the padlock in
a pane's toolbar turns that off for one pane. Both halves of that follow from
the header stripping above, in a chain worth writing down, because the sandbox
looks like belt-and-braces until you see what it is for:

1. **Stripping the headers makes frame busters live.** A site that sends
   `X-Frame-Options` usually also carries the older defense: a script that
   notices `window.top !== window.self` and assigns `top.location = self`. It
   does nothing while the browser is refusing to frame the page. Remove the
   headers and it starts working, and what it does is replace the whole split
   view with that one site.
2. **The framed page cannot be stopped from the outside.** `window.top` is
   `[LegacyUnforgeable]` in the HTML specification, so a page cannot be lied to
   about being framed, and assigning to a cross-origin `top.location` is
   allowed by design. There is no lever on this side of the frame boundary.
3. **The `sandbox` attribute is the only lever there is**, and
   `allow-top-navigation` is the token to leave out of it. `sandbox` denies by
   default, so everything a page legitimately needs has to be put back
   explicitly — which is what the rest of `paneSandboxTokens` is.
4. **`allow-same-origin` is the one that must stay.** Without it the frame gets
   an opaque origin: no cookies, no `localStorage`, no `IndexedDB`. Every site
   in every pane would be signed out, which is worse than what the sandbox is
   preventing.
5. **The cost is the pages that legitimately navigate the top frame** — a
   sign-in flow that redirects, a payment page, a link with `target="_top"`.
   They break with the sandbox on, and nothing on our side can tell them from a
   frame buster. Hence a per-pane escape hatch, off by default, rather than a
   global setting or a guess.

`sandbox` is read when a document is loaded into the frame, so changing it
means recreating the element: `set-sandboxed` in the reducer bumps
`reloadToken`, and turning the sandbox off reloads that pane. There is no way
round that.

**The page and the panes talk over `postMessage`.** The page cannot read a
cross-origin frame's URL or call `history.back()` on it, so a content script
inside the frame does both and reports back. It is declared for `<all_urls>` and
every frame, and the first thing it does on an ordinary page is notice that
`location.ancestorOrigins` is empty and return. A pane where it cannot run — a
`chrome://` URL, the Web Store, an error page — shows ⚠ in its toolbar and a
message over the frame (see
["What a pane shows instead"](#what-will-not-open-in-a-pane-and-why)); the
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
call `registration.unregister()`, and loads the pane again — at the page a link
was taking it to, when the frame said where it was going before it left, since
that is the page that failed. The site registers its worker again on its next
ordinary visit, so this is an escape from a pane that cannot load rather than a
permanent change. The button appears only on a pane that has failed to report.
**A helper frame that has not answered in ten seconds is given up on** and the
pane says it did not load: the site's worker may answer the root as well, and a
pane waiting on an answer that will never come used to stay blank until the
whole tab was reloaded.

`Always clear` next to it puts the **origin** on a list kept in `local` storage: a
pane at an origin on that list removes the worker without being asked — through
the helper frame when it fails to load, and from inside the page, once a second,
for as long as a page of that origin is open in the pane.

- **Once a second, not once at `load`.** A site registers its worker whenever it
  likes — GitHub does it a moment after the page has loaded — so a clear made at
  `load` finds nothing, and the worker registered after it answers the pane's
  next navigation. That is what made the setting look as if it had not stuck.
- **The worker can come back from outside the pane.** Where the pane's storage
  is not partitioned from the site's — Chrome exempts frames of sites an
  extension has host access to, though the smoke test runs with partitioning
  off and does not show it — the worker a pane removes is the site's own, and
  the site open in another tab registers it again. A navigation in the pane
  can still meet it; that one fails, is cleared, and lands where the link was
  going.
- **Per origin** because that is the only unit there is: a worker is registered
  for a scope (`/` for the sites this matters to) and `unregister()` takes the
  whole registration, so "only under `/issues`" is not something the browser
  can be asked for. It is also exactly what the button was already doing.
- **The list is watched, not read once**, by every split view page and by the
  content script in every pane, so turning it on reaches a pane already showing
  the site and a split view open in another tab.

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

## What will not open in a pane, and why

Four different mechanisms, and only two of them have an answer. Each is worth
telling apart, because the symptom is the same — a pane that stays blank — and
the thing to try next is not.

**1. A response header that refuses framing.** `X-Frame-Options`, or a CSP
`frame-ancestors` directive. Most of the interesting web does this.
**Handled**: the two rules above strip those headers, for this extension's own
frames and for the split view's tab only.

**2. The site refuses in the server, by reading the request.** Some sites do
not send a framing header at all; they look at the Fetch Metadata headers the
browser attaches — `Sec-Fetch-Dest: iframe`, `Sec-Fetch-Site: cross-site` — and
answer a framed request differently. Google Translate is the case that turned
this up. Measured, with everything else held equal:

| the request                                            | what `translate.google.com` answers |
| :----------------------------------------------------- | :---------------------------------- |
| `Sec-Fetch-Dest: document`, `Sec-Fetch-Site: none`     | `200` and the page                  |
| `Sec-Fetch-Dest: iframe`, `Sec-Fetch-Site: cross-site` | **`403` and no body**               |

and it says as much in `Vary: Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site`.
There is no response header to remove: the refusal _is_ the response.
**Handled**, though it took a second mechanism: both rules also _set_ those
three request headers to what a top-level navigation would have sent. Measured
again — 403 becomes 200, and the page renders in the pane. The scope is the
same as the header stripping: `sub_frame` requests only, so nothing changes for
a script or an XHR, which is where Fetch Metadata guards against CSRF and XSSI
rather than against framing.

**3. A page the browser will not put in a frame at all.** `chrome://`
anything, the Chrome Web Store, another extension's pages, `view-source:`,
`file:` in most configurations. Chrome refuses these to _every_ frame, and no
extension can change it. **Not handled, and cannot be** — nor can the address
bar even try: a `chrome://` address typed into a pane is treated as a search
term today, which is at least honest about the outcome but is confusing while
it lasts.

**4. A page served by the site's own service worker.** See the section above:
the response never passes through the network layer, so no rule can touch it.
**Handled by asking the site to give it up** — the pane offers to unregister
the worker, and can do it per origin from then on. That is what a signed-in
GitHub needs for its issues pages.

Two more things that are not "will not open" but look like it:

- **A pane is a third-party context for cookies.** A site's `SameSite=Lax`
  session cookie — the browser default — may not be sent, and the pane shows
  you signed out. Which sites this affects is worth measuring against the ones
  you actually use rather than reasoning about.
- **A page that wants to navigate the whole tab** — a sign-in redirect, a
  payment flow — is stopped by the pane's sandbox. Turning the sandbox off for
  that pane (the padlock, or the pane's menu when it is narrow) is the escape
  hatch.

### What a pane shows instead

Every one of those leaves the frame showing nothing, or the browser's own
"refused to connect" page — neither of which says what to do next. So the pane
covers it with a message and the two or three things worth trying: open it in a
tab of its own, try again, clear the site's service workers. How it decides
there is something to say:

- **From the address**, for the ones the browser refuses outright — `chrome://`,
  `file:`, the Web Store, another extension's pages. Those never start a
  navigation at all, so there is nothing to wait for: the message is immediate,
  and it names the reason, the reason being known.
- **From the frame's `load` event**, for everything else. Measured: a frame
  fires `load` exactly once whether the response was a page, an
  `X-Frame-Options` refusal, a 403 with no body or a connection error — so
  "the frame finished loading and the content script in it did not report
  within 800ms" is an answer, where a fixed timer would call every slow page a
  failure. A `load` that never comes — a server that never responds — is
  covered by a backstop at ten seconds. The count of reports starts at the
  `load` event itself: started any later, the previous document's answer was
  counted for the new one, and a link into a page that will not frame was never
  noticed at all.

**And it can be sent away.** "Show the frame anyway" reveals what is behind it,
because the signal is "nothing in the frame answered", and a page this
extension merely cannot script answers exactly like a page that never loaded —
a PDF in Chrome's own viewer being the case to know about. The next navigation
in that pane gets its own message.

"Open in a new tab" in a pane's toolbar is the way out of all of them.

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
