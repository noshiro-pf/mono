# GitHub View Defaults — privacy policy

Last updated: 2026-11-17

**GitHub View Defaults collects nothing, stores nothing, and sends nothing.**
There is no account, no analytics, no telemetry, no server and no third party
of any kind.

## What it stores

Nothing. It asks for no storage permission and writes neither `chrome.storage`
nor `localStorage` nor a cookie. The one thing it remembers — which pages it
has already acted on — lives in a variable for as long as that tab holds that
page, and is gone when the page is left.

## What it reads

Two scripts run on `https://github.com` pages. The first reads three kinds of
thing:

- **The address of the page**, to decide whether it is a pull request diff, a
  repository's branch overview, or a pull request or issue whose number goes
  in the tab title.
- **The `href` of the links on the page**, to decide which of them point at
  one.
- **The title of the page** — the text of the tab — on a pull request or an
  issue, to put its number in front of it.

It does not read the address the page was reached from: an earlier version read
`document.referrer` for one decision, and that decision is now made from the
address itself.

The second puts two buttons on a pull request, and reads:

- **The address of the page**, to decide whether it is a pull request, which of
  its tabs, and in which repository.
- **Whether Split View is installed**, which the extension's service worker
  finds out by loading a file from inside Split View, on the same computer.
  Nothing about it leaves the browser.
- **A pull request's title, the issue it closes and the Claude Code session it
  names**, when you ask for that pull request to be opened in Split View — with
  the **⧉ Split view** button or from the context menu. The script loads the
  pull request's conversation page from github.com, as your browser would if you
  opened it, and reads three things from it: the title, which names the new tab,
  the address of the first issue the pull request closes, and the
  address of the first Claude Code session (`https://claude.ai/code/session_…`)
  its description names on a `Claude-Session:` line. They are handed to Split
  View, which opens them and keeps them as it keeps any split view. Nothing is
  read until you ask, and nothing is sent anywhere else.
- **The labels of a pull request in `noshiro-pf/mono`**, when you press the
  **＋ merge-queued** button, which is shown on that repository's pull requests
  and nowhere else: the label names in GitHub's own label picker, which of them
  are selected, and the labels listed in the pull request's sidebar. In a pane
  of Split View, which no script of this extension can reach, Split View reads
  these for it after you press the button there, and hands them to this
  extension's service worker; this extension tells Split View, for each pane's
  address, whether the pane gets the button.

That is all of it. Neither script reads any other page content — diffs,
comments, form fields — nor cookies or storage, and they read nothing at all on
any other site: the extension is declared for `github.com` and is not injected
anywhere else.

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
- It puts the number of a pull request or an issue, as `#1234`, at the front of
  that page's tab title.
- It puts the two buttons above at the bottom left of a pull request.
- When you press **⧉ Split view**, it opens the pull request in Split View in a
  new tab and closes the pull request's own tab (not on a `Ctrl`+click or a
  middle click).
- When you press **＋ merge-queued**, it adds the `merge-queued` label to that
  pull request by using GitHub's label picker on the page, as you would by hand.
  GitHub makes the change, as the signed-in user and with that user's
  permissions; the extension sends nothing itself.

Nothing else on the page is touched, and nothing is added to any request.

## Network

The one network request the extension makes of its own is to github.com: the
pull request's conversation page, loaded when you ask for that pull request to
be opened in Split View, described above. Otherwise loading github.com is
between the user and GitHub, exactly as it would be without the extension — the
addresses this changes are ones the browser was going to ask for anyway.

## Removal

Removing the extension removes everything it does. There is nothing left
behind, because there was nothing kept.

## Contact

<https://github.com/noshiro-pf/mono/issues>
