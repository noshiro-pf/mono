# my-portfolio-app-preact

A one-page portfolio site: a profile card, a list of what I have built, and
the links that go with each.

<https://my-portfolio-app-4f8be.web.app/>

Restored from `experimental/` — see
[docs/experimental-inventory.md](../../docs/experimental-inventory.md).

## Running it

```sh
pnpm run dev      # Vite dev server
pnpm run build    # production build into `build/`
pnpm run preview  # serve that build
```

## Deploying

The original README recorded the GitHub Actions setup: generate a token with
`firebase login:ci` and paste it into the repository's secrets as
`FIREBASE_TOKEN`. Nothing in this repository deploys the app, so that is a
note about the original workflow rather than one that runs here.
