# Split View — privacy policy

Last updated: 2026-09-29

**Split View collects nothing, sends nothing, and has no server.** There is no
account, no analytics, no telemetry and no third party of any kind.

## What it stores, and where

Everything it stores is in the browser's own extension storage
(`chrome.storage.local`), on the computer it is installed on:

- **The layouts** — how each split view is divided, and the address, zoom and
  sandbox setting of each pane.
- **The list of saved split views** — their names and their order.
- **Per-site settings** — the origins whose service workers a pane removes on
  sight, which the user turns on per site.

That is all of it. It never leaves the device, and it is sent nowhere. The one
network request the extension makes of its own is to GitHub, described below.
Removing the extension removes the lot.

## What the extension reads

- **The address and title of the page in each pane.** A script in the pane
  reports these to the extension's own page, so that the pane's address bar and
  its tooltip can show where it is, and so that a reload can come back to it.
  The address is saved as described above; the title is not saved. Neither is
  transmitted anywhere.
- **A GitHub pull request's title and the issue it closes**, when you ask for
  that pull request to be opened in a split view — with the **⧉ Split view**
  button on its page, or from the context menu. A script on github.com loads the
  pull request's conversation page from github.com, as your browser would if you
  opened it, and reads two things from it: the title, which names the new tab,
  and the address of the first issue the pull request closes, which is opened in
  a pane. Both become part of that split view and are saved as described above.
  Nothing is read until you ask, and nothing is sent anywhere else.
- **Nothing else about the page.** The scripts do not read page content, form
  fields, cookies or storage beyond the above, and on a page that is not inside
  a split view or a GitHub pull request they stop immediately.

## What the panes themselves do

A pane shows a web page in an iframe. That page loads over the network as it
would in an ordinary tab, and whatever it does — its own cookies, its own
requests, its own analytics — is between the user and that site, exactly as it
would be if the page were open in a tab of its own. This extension adds
nothing to those requests.

To make framing possible at all, the extension removes the response headers
that sites use to refuse being framed (`X-Frame-Options`, and
`Content-Security-Policy`). This happens only for frames the extension itself
opened and for sub-frames of the tab a split view is open in. Removing the
whole `Content-Security-Policy` header also removes the site's own protections
against script injection _while that page is in a pane_, which is the price of
showing it there at all; panes are sandboxed to limit what a page in one can
do.

## Contact

The extension is open source. Questions, and anything this document does not
answer, belong in an issue:
<https://github.com/noshiro-pf/mono/issues>
