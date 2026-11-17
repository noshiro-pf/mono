# Split View — privacy policy

Last updated: 2026-11-17

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

That is all of it. It never leaves the device, and it is sent nowhere. The
extension makes no network request of its own.
Removing the extension removes the lot.

## What the extension reads

- **The address and title of the page in each pane.** A script in the pane
  reports these to the extension's own page, so that the pane's address bar and
  its tooltip can show where it is, and so that a reload can come back to it.
  The address is saved as described above; the title is not saved. Neither is
  transmitted anywhere.
- **A pane's address, for GitHub View Defaults.** When a pane shows a page, its
  address is passed to the developer's other extension, GitHub View Defaults, if
  it is installed, to ask which of its buttons the pane gets (the merge-queued
  button on a `noshiro-pf/mono` pull request). The address goes from one
  extension to the other inside the browser, and nowhere else.
- **What GitHub View Defaults asks for, after you press its button in a pane.**
  From the press until it answers, and in that pane only, Split View finds,
  reads, clicks and types into elements of the pane's page as that extension
  asks — which is how it works GitHub's label picker there — and hands it what
  it reads. Nothing is read before you press, and no other extension is
  answered.
- **Nothing else about the page.** The scripts do not read page content, form
  fields, cookies or storage beyond the above, and on a page that is not inside
  a split view they stop immediately.

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
