# GitHub Diff Defaults

A Chrome extension that opens every GitHub pull request diff the way you would
have set it up by hand: whitespace-only changes hidden, and the files you have
already marked as viewed collapsed.

It does that by putting two query parameters on the "Files changed" URL —

| parameter                 | what it does                                 |
| :------------------------ | :------------------------------------------- |
| `w=1`                     | hides changes that are whitespace only       |
| `show-viewed-files=false` | collapses the files already marked as viewed |

— so `github.com/owner/repo/pull/123/files` becomes
`github.com/owner/repo/pull/123/files?w=1&show-viewed-files=false`, whether you
got there from a link, a bookmark, or the tab at the top of a pull request.

It is the same idea as
[Hide Whitespace for GitHub](https://github.com/jackchuka/chrome-extension-github-whitespace),
which is where the approach comes from, with the viewed-files parameter added
and one difference in behavior — see below.

## What it does, exactly

- **On the pull request diff pages only** —
  `/{owner}/{repo}/pull/{number}/files`, the `/changes` spelling of the same
  tab, and anything below either of them, such as the diff between two of the
  pull request's commits. Not the conversation tab, not a commit page, not a
  comparison.
- **It rewrites the links before you click them.** Every anchor on the page
  that points at a diff gets the parameters, so clicking "Files changed" goes
  straight to the right address. Landing on a bare diff URL from outside — a
  bookmark, a notification e-mail — is redirected instead, which costs a second
  page load and is the only time you would notice the extension at all.
- **A parameter that is already on the URL is never rewritten.** This is the
  difference from the extension above, which always forces `w=1`. GitHub's own
  "Show whitespace changes" and "Toggle viewed files" controls navigate to the
  same page with `w=0` or `show-viewed-files=true` on it; forcing the defaults
  back would leave no way to look at what the extension hides. A link somebody
  shared with `w=0` on it keeps it, too.
- **Nothing else.** No options, no storage, no network, no permissions beyond
  running on `github.com`. The two parameters are a constant in
  `src/diff-url.mts`; changing them is an edit and a rebuild.

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
    pnpm --filter github-diff-defaults-extension run build
    ```

2. Open `chrome://extensions` and turn on **Developer mode**.
3. Choose **Load unpacked**, and select
   `apps/github-diff-defaults-extension/dist`.

To update it later, pull, build again, and press the reload button on the
extension's card.

## How it works

Three mechanisms, in the order they matter:

- **The links are rewritten.** A `MutationObserver` watches the document and
  gives every new anchor pointing at a diff the parameters it is missing. A
  pull request page grows its links as you use it, so this runs for the life of
  the page rather than once; a `WeakSet` of the anchors already looked at keeps
  the rescans cheap.
- **Clicks on those links are left to the browser.** GitHub navigates between
  its own pages without loading a document, and would use the route it holds
  for the link rather than the address in the attribute — which would undo the
  rewrite at the moment it matters. The extension stops the click from reaching
  GitHub's handler, so the anchor does what an anchor does.
- **The page it lands on is redirected**, if it is a diff URL without the
  parameters. The content script runs at `document_start`, before the document
  is parsed, so the load it abandons has barely begun. This also covers the
  client-side navigations the first two do not reach: the observer notices the
  address changing under it and asks again.

**Each diff page is given the defaults once, and once only.** GitHub takes the
parameters in and then rewrites its own address bar without them — measured on
a logged-out session, `?w=1&show-viewed-files=false` becomes `?w=1` a moment
after the page loads. An extension that read that as "the defaults are gone"
would put them back, and the page would load again, forever. So the paths
already dealt with are remembered for the life of the document: parameters
coming off afterwards is GitHub having used them, not GitHub having lost them.

`src/diff-url.mts` holds all of the rules and touches no DOM — which URLs count
and what goes on them — and `src/content.mts` is the glue that applies it.
`test/diff-url.test.mts` covers the first of those.

## Commands

| command               | what it does                                          |
| :-------------------- | :---------------------------------------------------- |
| `pnpm run build`      | builds `dist/`, which is what Chrome loads            |
| `pnpm run test`       | runs the unit tests                                   |
| `pnpm run type-check` | type-checks the package                               |
| `pnpm run lint`       | lints it                                              |
| `pnpm run gen:icons`  | redraws `public/icons/` — see `scripts/gen-icons.mts` |

The icons are committed, so `gen:icons` is only run when the shape changes.

This extension is not affiliated with GitHub.
