# Development

Building, loading, testing and packing the extension. What it does for a user
is in the [README](../README.md); why it is built the way it is — the
header-stripping rules, the sandbox, the service-worker escape, the pinned
extension id — is in [`how-it-works.md`](./how-it-works.md).

## Setup

From the repository root, once — see [Setup](../../../README.md#setup) for Node,
pnpm and `pnpm install`. Then, for this package:

```sh
pnpm exec playwright install chromium   # for `smoke` and `screenshots`
```

That is everything `build`, `test`, `lint` and `type-check` need. The rest is
wanted only by the commands whose output leaves the repository:

| command       | also needs                                                                     |
| :------------ | :----------------------------------------------------------------------------- |
| `smoke`       | a **headed** Chromium — `xvfb-run -a pnpm run smoke` where there is no display |
| `screenshots` | the same                                                                       |
| `pack`        | `zip`                                                                          |
| `pack:crx`    | `pass`, holding the signing key, and `openssl`                                 |

Everything below is run from `apps/split-view-extension`.

## Building and loading

```sh
pnpm run build       # writes dist/ — what to load normally
pnpm run build:dev   # the same, plus the diagnostics
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
build order — see "Building from a clean checkout" in the root `CLAUDE.md`.

Then load `dist/` as described in the README's [Install](../README.md#install).
There is no dev server: the page has to be served from `chrome-extension://`,
because that origin is what the header-stripping rule and the content script are
keyed to. After any change, re-run `pnpm run build` and press the reload button
on the extension's card in `chrome://extensions`.

`build:dev` adds a read-only `webRequest` log in the service worker, which shows
what Chrome attributes a pane's request to and which framing headers arrive —
the way to make "this pane will not load" answerable.

Publishing it is [`store-listing.md`](./store-listing.md): the copy for every
field of the dashboard, a justification per permission, and what to expect from
the review of an extension that strips framing headers. The screenshots it
uploads are the ones the README shows; `pnpm run screenshots` takes them against
placeholder pages the script serves itself and writes both copies.

## Testing

```sh
pnpm run test               # the unit tests, in Node
xvfb-run -a pnpm run smoke  # the build, in a real Chromium
```

`pnpm run smoke` loads the build into a real Chromium and checks the parts that
only a browser can check: that a page sending `X-Frame-Options: DENY` and
`frame-ancestors 'none'` is framed anyway, that the content script inside a pane
reports its title and follows a navigation made in the frame, that a reload comes
back to the same layout at the same addresses, and the whole of the saved list —
creating, switching with `Alt+N` from the page and from inside a pane, renaming,
exporting, deleting, opening them all, and the list surviving a reload — plus the
tab's title and its numbered favicon, which nothing outside a browser draws. It
needs a headed browser — `xvfb-run -a pnpm run smoke` where there is no display.
