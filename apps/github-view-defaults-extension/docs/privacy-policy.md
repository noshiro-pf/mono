# GitHub View Defaults — privacy policy

Last updated: 2026-09-19

**GitHub View Defaults collects nothing, stores nothing, and sends nothing.**
There is no account, no analytics, no telemetry, no server and no third party
of any kind.

## What it stores

Nothing. It asks for no storage permission and writes neither `chrome.storage`
nor `localStorage` nor a cookie. The one thing it remembers — which pages it
has already acted on — lives in a variable for as long as that tab holds that
page, and is gone when the page is left.

## What it reads

One script runs on `https://github.com` pages, and reads two kinds of thing:

- **The address of the page**, to decide whether it is a pull request diff or a
  repository's branch overview.
- **The `href` of the links on the page**, to decide which of them point at
  one.

That is all of it. It does not read the address the page was reached from: an
earlier version read `document.referrer` for one decision, and that decision is
now made from the address itself. It does not read page content, diffs, comments, form fields,
cookies or storage, and it reads nothing at all on any other site: the
extension is declared for `github.com` and is not injected anywhere else.

## What it changes

- It adds `w=1` and `show-viewed-files=false` to a pull request diff address
  that does not already say otherwise — the same two settings GitHub's own
  "Hide whitespace changes" and "Viewed files" controls write.
- It sends a repository's branch overview to that repository's full branch
  list, `/branches/all` — the page's own "All" tab — unless the address carries
  `overview=1`, which is what the extension writes on the page's own "Overview"
  tab so that the overview stays reachable.
- It makes the same two changes to links on the page that point at such an
  address.

Nothing else on the page is touched, and nothing is added to any request.

## Network

The extension makes no network request of its own. Loading github.com is
between the user and GitHub, exactly as it would be without the extension —
the addresses this changes are ones the browser was going to ask for anyway.

## Removal

Removing the extension removes everything it does. There is nothing left
behind, because there was nothing kept.

## Contact

<https://github.com/noshiro-pf/mono/issues>
