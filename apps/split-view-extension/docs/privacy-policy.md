# Split View — privacy policy

Last updated: 2026-09-11

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

That is all of it. It never leaves the device: nothing in this extension makes
a network request of its own. Removing the extension removes the lot.

## What the extension reads

- **The address and title of the page in each pane.** A script in the pane
  reports these to the extension's own page, so that the pane's address bar and
  its tooltip can show where it is, and so that a reload can come back to it.
  The address is saved as described above; the title is not saved. Neither is
  transmitted anywhere.
- **Nothing else about the page.** The script does not read page content, form
  fields, cookies or storage, and on a page that is not inside a split view it
  stops immediately.

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
