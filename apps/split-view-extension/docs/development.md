# Development

Building, loading, testing and packing the extension. What it does for a user
is in the [README](../README.md); why it is built the way it is — the
header-stripping rules, the sandbox, the service-worker escape, the pinned
extension id — is in [`how-it-works.md`](./how-it-works.md).

## Setup

From the repository root, once — see [Setup](../../../README.md#setup) for Node,
pnpm and `pnpm install`. Then, for this package:

```sh
pnpm exec playwright install chromium   # for `check:e2e`, `smoke` and `screenshots`
```

That is everything `build`, `check:test`, `check:lint` and `check:types` need. The rest is
wanted only by the commands whose output leaves the repository:

| command       | also needs                                                                     |
| :------------ | :----------------------------------------------------------------------------- |
| `smoke`       | a **headed** Chromium — `xvfb-run -a pnpm run smoke` where there is no display |
| `screenshots` | the same                                                                       |
| `pack`        | `zip`                                                                          |
| `pack:crx`    | `pass`, holding the signing key, and `openssl`                                 |

Everything below is run from `apps/split-view-extension`.

The packaging commands share
[`chrome-extension-packaging.mts`](../../../tools/configs/chrome-extension-packaging.mts)
with the GitHub defaults extension; `scripts/store-package.mts` holds the
package-specific settings. Its shared staging and manifest tests run through
`pnpm run check:root:test` at the repository root. `pack:crx` checks that
Playwright's Chromium is installed before asking `pass` for the signing key.

## Building and loading

```sh
pnpm run build       # writes dist/ — what to load normally
pnpm run build:dev   # the same, plus the diagnostics and localhost links
pnpm run gen:icons   # redraws public/icons/*.png, which the build copies
pnpm run pack        # writes pack/split-view-extension-<version>.zip, for the store
pnpm run pack:crx    # the same, signed, for an item with verified CRX upload
pnpm run screenshots # writes pack/screenshots/*.png and docs/screenshots/*.png
```

**`pnpm run build` needs the workspace libraries built first.** It imports
`ts-data-forge` and `react-utils` through their `dist/`, so on a checkout where
nothing has been built yet, build the extension together with what it depends
on — from the repository root:

```sh
pnpm --filter-prod 'split-view-extension...' run build
```

`--filter-prod` follows `dependencies` only. The plain `--filter` follows
`devDependencies` too, which pulls in the lint toolchain, and that has no valid
build order — see "Build" in the root `CLAUDE.md`.

Then load `dist/` as described in the README's [Install](../README.md#install).
There is no dev server: the page has to be served from `chrome-extension://`,
because that origin is what the header-stripping rule and the content script are
keyed to. After any change, re-run `pnpm run build` and press the reload button
on the extension's card in `chrome://extensions`.

`build:dev` adds a read-only `webRequest` log in the service worker, which shows
what Chrome attributes a pane's request to and which framing headers arrive —
the way to make "this pane will not load" answerable. It also lets the
pr-manager dev server (`pnpm run dev` / `preview` there) open `split.html`
from a link, which a production build allows from `noshiro-pf.github.io` only;
from `localhost` a production build refuses the link with
`ERR_BLOCKED_BY_CLIENT`.

The version is the one in `package.json`, and a changeset is what raises it:
`pnpm changeset` from the repository root for any change the extension ships,
`minor` for a feature and `patch` for a fix. The build writes it into
`dist/manifest.json`; `public/manifest.json` carries none, and the build fails
if it does.

Publishing it is [`store-listing.md`](./store-listing.md): the copy for every
field of the dashboard, a justification per permission, and what to expect from
the review of an extension that strips framing headers. The screenshots it
uploads are the ones the README shows; `pnpm run screenshots` takes them against
placeholder pages the script serves itself and writes both copies.

## Testing

```sh
pnpm run test               # the unit tests, in Node
pnpm run check:e2e          # the UI, in Chromium headless, with the build loaded
xvfb-run -a pnpm run smoke  # the build, in a real Chromium
```

`pnpm run check:e2e` builds the extension, loads `dist/` into Chromium and goes
through every part of the page with Playwright: the presets, splitting, closing,
dragging a divider and moving a pane, each pane's address bar, history, reload,
zoom and menu, the explanation shown for a page that cannot be framed, the saved
list of split views, the help, and a reload or an address that restores a view.
The pages shown in panes come from a local server
([`scripts/e2e-page-server.mts`](../scripts/e2e-page-server.mts)), so it needs
no network. It runs headless, as Chromium itself (`channel: 'chromium'`) loads
extensions headless where the headless shell does not; in CI the build job's
`dist/` is used rather than a new build.

`pnpm run smoke` loads the build into a real Chromium and checks the parts that
only a browser can check: that a page sending `X-Frame-Options: DENY` and
`frame-ancestors 'none'` is framed anyway, that the content script inside a pane
reports its title and follows a navigation made in the frame, that a reload comes
back to the same layout at the same addresses, and the whole of the saved list —
creating, switching with `Alt+N` from the page and from inside a pane, renaming,
exporting, deleting, opening them all, and the list surviving a reload — plus the
tab's title and its numbered favicon, which nothing outside a browser draws. It
needs a headed browser — `xvfb-run -a pnpm run smoke` where there is no display.
