# GitHub View Defaults

A Chrome extension that opens a few GitHub pages the way you would have set
them up by hand: a pull request diff with whitespace-only changes hidden and
the files you have already marked as viewed collapsed, and a repository's
branches page as the full list of branches rather than the overview.

| page                                  | opened as                                              |
| :------------------------------------ | :----------------------------------------------------- |
| `/{owner}/{repo}/pull/{n}/files`      | the same URL with `?w=1&show-viewed-files=false` added |
| `/{owner}/{repo}/branches`            | `/{owner}/{repo}/branches/all`                         |
| `/{owner}/{repo}/branches?overview=1` | left as it is — see below                              |

`w=1` hides changes that are whitespace only, and
`show-viewed-files=false` collapses the files already marked as viewed — so
`github.com/owner/repo/pull/123/files` becomes
`github.com/owner/repo/pull/123/files?w=1&show-viewed-files=false`, whether you
got there from a link, a bookmark, or the tab at the top of a pull request. The
branches page's own "All" tab is reached the same way, whether you got there
from the repository's navigation or by typing the address.

The diff half is the same idea as
[Hide Whitespace for GitHub](https://github.com/jackchuka/chrome-extension-github-whitespace),
which is where the approach comes from, with the viewed-files parameter added
and one difference in behavior — see below.

## What it does, exactly

- **On the pull request diff pages** —
  `/{owner}/{repo}/pull/{number}/files`, the `/changes` spelling of the same
  tab, and anything below either of them, such as the diff between two of the
  pull request's commits. Not the conversation tab, not a commit page, not a
  comparison.
- **On a repository's branch overview** — `/{owner}/{repo}/branches`, and
  nothing else under it. The tabs that name what they list — `/branches/all`,
  `/branches/yours`, `/branches/active`, `/branches/stale` — already say what
  they want, so they are left exactly as they are.
- **It rewrites the links before you click them.** Every anchor on the page
  that points at one of those gets the treatment, so clicking "Files changed"
  or "Branches" goes straight to the right address. Landing on a bare URL from
  outside — a bookmark, a notification e-mail — is redirected instead, which
  costs a second page load and is the only time you would notice the extension
  at all.
- **What the address already says is never overruled.** This is the difference
  from the extension above, which always forces `w=1`. GitHub's own "Show
  whitespace changes" and "Toggle viewed files" controls navigate to the same
  page with `w=0` or `show-viewed-files=true` on it; forcing the defaults back
  would leave no way to look at what the extension hides. A link somebody
  shared with `w=0` on it keeps it, too.
- **The branches "Overview" tab still works.** It points at the very URL the
  branch rule redirects, so redirecting it whatever the address said would make
  the overview unreachable. The way out is in the address: the extension gives
  that one link `?overview=1`, and an overview whose address carries it is left
  exactly as it is. So the tab reaches the overview, and the address goes on
  saying so — a reload stays there, and the URL can be bookmarked or shared and
  still means the overview.
    - **Everything else about the overview is decided by the address alone**,
      which is why a link followed, an address typed, a bookmark opened and a
      page reloaded all get the same answer. It was `document.referrer` at
      first, and that is a fact about how a page was reached rather than about
      the page: measured, a reload of the overview carried the referrer of the
      click before it and so stayed, while the same address bookmarked went to
      the list. `overview=1` cannot disagree with itself that way.
    - `overview=1` is not one of GitHub's parameters; GitHub ignores it. The
      extension reads only whether it is there, the way it reads `w` on a diff.
- **Nothing else.** No options, no storage, no network, no permissions beyond
  running on `github.com`. Both rules are a table in `src/page-url.mts`;
  changing them is an edit and a rebuild.

Only `https://github.com` is matched. A GitHub Enterprise installation on
another host is not covered — add its origin to `content_scripts.matches` in
`public/manifest.json` and rebuild.

## Install

It is installed from source, as an unpacked extension. You need
[Git](https://git-scm.com/), [Node.js](https://nodejs.org/) and
[pnpm](https://pnpm.io/installation).

1. Build it:

    ```bash
    git clone https://github.com/noshiro-pf/mono.git
    cd mono
    pnpm install
    pnpm --filter github-view-defaults-extension run build
    ```

2. Open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked**, and select
   `apps/github-view-defaults-extension/dist`.

To update it later, pull, build again, and press the reload button on the
extension's card.

## How it works

Three mechanisms, in the order they matter:

- **The links are rewritten.** A `MutationObserver` watches the document and
  gives every new anchor pointing at one of those pages the address the rules
  want. A pull request page grows its links as you use it, so this runs for the
  life of the page rather than once; a `WeakSet` of the anchors already looked
  at keeps the rescans cheap. An anchor is judged from the page it sits on,
  which is the one thing a page-level rule cannot know and does not need: it is
  what separates the branches page's own "Overview" tab from the identical href
  in the repository's navigation.
- **Clicks on those links are left to the browser.** GitHub navigates between
  its own pages without loading a document, and would use the route it holds
  for the link rather than the address in the attribute — which would undo the
  rewrite at the moment it matters. The extension stops the click from reaching
  GitHub's handler, so the anchor does what an anchor does.
- **The page it lands on is redirected**, if the rules want something else of
  it. The content script runs at `document_start`, before the document is
  parsed, so the load it abandons has barely begun. This also covers the
  client-side navigations the first two do not reach: the observer notices the
  address changing under it and asks again. The question it asks reads the
  address and nothing else, so a typed URL, a bookmark, a notification link and
  a reload are all answered the same.

**Each page is acted on once, and once only.** GitHub takes the
parameters in and then rewrites its own address bar without them — measured on
a logged-out session, `?w=1&show-viewed-files=false` becomes `?w=1` a moment
after the page loads. An extension that read that as "the defaults are gone"
would put them back, and the page would load again, forever. So the paths
already dealt with are remembered for the life of the document: parameters
coming off afterwards is GitHub having used them, not GitHub having lost them.

`src/page-url.mts` holds all of the rules and touches no DOM — which URLs count
and what the extension wants of them — and `src/content.mts` is the glue that
applies it. `test/page-url.test.mts` covers the first of those.

## Commands

| command                | what it does                                          |
| :--------------------- | :---------------------------------------------------- |
| `pnpm run build`       | builds `dist/`, which is what Chrome loads            |
| `pnpm run test`        | runs the unit tests                                   |
| `pnpm run smoke`       | runs the built extension in a real Chromium           |
| `pnpm run check:types` | type-checks the package                               |
| `pnpm run check:lint`  | lints it                                              |
| `pnpm run gen:icons`   | redraws `public/icons/` — see `scripts/gen-icons.mts` |
| `pnpm run pack`        | builds and writes the Chrome Web Store zip            |
| `pnpm run pack:crx`    | the same package, signed, for verified CRX upload     |

The icons are committed, so `gen:icons` is only run when the shape changes.

`smoke` needs a headed browser — Chromium loads no extensions in the headless
shell — so on a machine with no display run it as `xvfb-run -a pnpm run smoke`.
It touches no network: every github.com request is answered from a fixture in
`scripts/smoke.mts`, which is also what lets it check the two things the unit
tests cannot — that the extension does not redirect a second time when the site
takes the parameters off its own address bar, and that a reload of a page the
extension decided about is decided the same way again.

## Release

1. `pnpm run test && pnpm run build && xvfb-run -a pnpm run smoke`.
2. Raise `version` in [`public/manifest.json`](./public/manifest.json). It is
   the manifest's version that the store reads and that names the package; the
   `package.json` version is unused, this being a private package.
3. `pnpm run pack`, which builds and writes
   `pack/github-view-defaults-extension-<version>.zip` — `dist/` without its
   source maps. `pack/` is not tracked.
4. Upload that zip to the
   [Chrome Web Store dashboard](https://chrome.google.com/webstore/devconsole),
   with the copy in [`docs/store-listing.md`](./docs/store-listing.md) and the
   policy in [`docs/privacy-policy.md`](./docs/privacy-policy.md).

Once **verified CRX upload** is turned on for the item the store stops taking a
zip, and `pnpm run pack:crx` is what to upload instead: the same staged package
signed by Chrome with the key registered on the account. That key is not in the
repository and must not be — it comes out of `pass`, and there is not one yet;
`scripts/pack-crx.mts` says how to make it and where it has to live. Losing it
means losing the ability to publish an update.

This extension is not affiliated with GitHub.
