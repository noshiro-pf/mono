# Chrome Web Store listing

Copy for the dashboard, kept here so that what was submitted is written down
and the next version can be edited rather than rewritten. Field limits are the
store's.

Upload `pack/split-view-extension-<version>.zip` from `pnpm run pack` — not
`dist/`, which carries the manifest `key` the store refuses. Once **verified
CRX upload** is turned on for the item, a zip is refused too ("アイテムを crx
パッケージで更新する必要があります") and `pnpm run pack:crx` is what to upload
instead: the same package, signed by Chrome with the key registered on the
account, which the script takes out of `pass`. See "What the storage is keyed to" in the [README](../README.md).

## Store listing

**Name** (45 characters)

```text
Split View
```

**Summary** (132 characters)

```text
Splits one tab into a grid of web pages. Each pane is a real page: navigate it, zoom it, move it, and it is there next time.
```

**Description**

```text
Split View turns one browser tab into a grid of web pages. Each pane has its
own address bar, its own history and its own zoom, and the whole arrangement is
saved — reopen the tab and everything is where you left it, at the page you had
navigated to.

• Lay the panes out from presets — 1, 2 or 3 columns, 2 or 3 rows, a 2×2 or 2×3
  grid, one large pane beside two small ones — or split any pane again with the
  ⬌ / ⬍ buttons in its toolbar. Drag the dividers to change the ratios.
• Move a pane by dragging the grip at the left of its toolbar: drop it on the
  middle of another pane to swap the two, or on an edge to take that side.
  Nothing reloads, so the page keeps its scroll position and its history.
• Zoom one pane at a time with − / +, or Ctrl + wheel over it. A wide site fits
  in a narrow pane, which is the thing a browser window cannot do to a quarter
  of itself.
• Keep as many split views as you like. The select at the left of the toolbar
  lists them, Alt+1 to Alt+9 switch between them, and each is saved under its
  own name. Export the lot to JSON and import it back on another machine.

Worth knowing before you install:

• Most sites refuse to be shown inside another page, in one of two ways. Some
  send a header saying so (X-Frame-Options, or a Content-Security-Policy
  frame-ancestors directive); Split View removes those headers for its own
  panes, which also removes the site's own protection against being framed
  while it is in a pane. Others refuse in the server, by reading the
  Sec-Fetch-* headers that mark a request as coming from a frame — Google
  Translate is one — so for its own panes Split View sets those headers to what
  a page you had typed into a tab would have sent. Both apply only to frames
  the extension itself opened and to the tab a split view is open in; ordinary
  browsing in other tabs is untouched, and each pane runs sandboxed so that a
  page in it cannot navigate the tab away.
• Some pages cannot be opened in a pane at all, and no extension can change
  that: chrome:// pages, the Chrome Web Store, other extensions' pages,
  view-source:. The browser refuses these to every frame.
• A site whose own service worker answers its pages cannot be framed either —
  the response never reaches the network, so nothing can be rewritten. The pane
  offers to remove that worker, per site if you like, and the site registers it
  again on its next ordinary visit. A signed-in GitHub needs this for its
  issues pages.
• A pane is a third-party context for cookies, so a site you are signed in to
  may appear signed out. And a page that wants to navigate the whole tab — a
  sign-in redirect, a payment flow — is stopped by the pane's sandbox, which
  you can turn off for that one pane. Every pane can open its address in an
  ordinary tab, which is the way out of any of this.
• Nothing leaves your computer. There is no account, no analytics and no
  server: the layouts and addresses live in the browser's own extension
  storage.
```

**Category**: Workflow & Planning (Functionality & UI is the other reasonable
one; Developer Tools understates it — the panes are ordinary web pages).

**Language**: English.

## Single purpose

```text
Showing several web pages side by side inside one browser tab, and remembering
the arrangement.
```

## Permission justifications

One per field in the dashboard. Each says what breaks without it, because that
is what a reviewer is deciding.

**`storage`**

```text
Stores the split views: the layout tree, each pane's address and zoom, and the
list of saved layouts with their names. This is what makes a split view survive
a reload or the tab being closed. Local only; nothing is sent anywhere.
```

**`favicon`**

```text
Draws the site's icon beside each pane's address bar, so that panes can be told
apart at a glance. It reads Chrome's own favicon cache through the _favicon/
URL and makes no network request of its own.
```

**`declarativeNetRequestWithHostAccess`**

```text
Most sites stop themselves being shown inside another page, which is the whole
function of this extension, and they do it in two ways that need two different
edits.

Some send a response header: X-Frame-Options, or a Content-Security-Policy
frame-ancestors directive. The rules remove those headers.

Others refuse in the server, by reading the Fetch Metadata request headers that
mark a request as coming from a frame. Google Translate answers a request
carrying Sec-Fetch-Dest: iframe with 403 and no body, while the same request
with Sec-Fetch-Dest: document is served normally, and advertises this with
Vary: Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site. There is no response
header to remove, so the rules set those three request headers to the values a
top-level navigation would have carried.

Both edits are made by the same two rules, and both are scoped so that ordinary
browsing is not affected: sub_frame requests only — never a top-level document,
and never a script, an image or an XHR, which is where Fetch Metadata protects
against CSRF and XSSI rather than against framing — and then either requests
initiated by this extension's own pages, or requests in the single tab a split
view is open in. This variant of the permission was chosen over plain
declarativeNetRequest precisely so that the rules can act only where the user
has granted host access.
```

**Host permission (`<all_urls>`)**

```text
A pane shows whatever address the user types into it, so the extension cannot
know in advance which sites it needs. The permission is used for two things
only: the header rules above, which act only on this extension's own frames and
its own tab, and a content script that reports a pane's title and current URL
back to the extension's page. Neither reads or transmits page content, and
neither runs in tabs that are not part of a split view.
```

**Content script on all sites**

```text
The extension's page cannot read a cross-origin frame's URL or title, and
cannot call history.back() on it. A small script runs in each frame to do those
three things and report them to the extension's own page over postMessage. On
an ordinary page it checks whether it is inside a split view — one property read
— and returns immediately. It sends nothing until the extension's page has told
it which pane it belongs to.
```

**Remote code**: No. Every script in the package is in the package. The panes
show remote _web pages_ in sandboxed iframes, which is the extension's purpose
and not remote code in the policy's sense: nothing is fetched and evaluated in
the extension's own context.

## Data usage

Nothing is collected, so every category is left unchecked, and the three
certifications can be accepted as written:

- **Not being sold to third parties** — there is no third party.
- **Not being used or transferred for purposes unrelated to the item's single
  purpose** — the stored data _is_ the item's purpose.
- **Not being used or transferred to determine creditworthiness or for lending
  purposes** — no.

**Privacy policy URL**: the store asks for one whenever the item handles any
user data, and addresses in local storage count. Point it at
[`docs/privacy-policy.md`](./privacy-policy.md) on GitHub:

```text
https://github.com/noshiro-pf/mono/blob/main/apps/split-view-extension/docs/privacy-policy.md
```

## Screenshots

`pnpm run screenshots` writes four 1280×800 PNGs into `pack/screenshots/`:

| file          | shows                                                             |
| :------------ | :---------------------------------------------------------------- |
| `1-grid.png`  | four panes, each with its own toolbar and address                 |
| `2-zoom.png`  | one pane zoomed out, fitting more of a page into a quarter screen |
| `3-move.png`  | a pane mid-drag, with the drop indicator saying what it will do   |
| `4-saved.png` | the list of saved split views, with the edit popover open         |

**Retake them with the sites you actually use before uploading.** The script
serves its own plain pages, which is honest and reproducible but shows the
extension doing nothing interesting; a listing is more convincing with real
work in the panes. `demoUrls` at the top of `scripts/screenshots.mts` is the
list to change.

## What to expect from review

The header-stripping rule and `<all_urls>` are the parts a reviewer will stop
on, and an extension that removes framing protections can be read as
facilitating clickjacking. The answers above are the honest ones: the rules are
scoped to this extension's own frames and its own tab, the panes are sandboxed
without `allow-top-navigation` so a framed page cannot take over the tab, and
the user chooses every address themselves. Expect a longer review than a
listing with no host permissions, and answer the permission fields in the
dashboard rather than leaving them to be inferred from the description.
