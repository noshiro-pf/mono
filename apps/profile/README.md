# profile

A profile page: career, a self-introduction, skills, what I have built and what
I have written, one tab each.

<https://noshiro-pf.github.io/mono/profile/>

Restored from `experimental/` as `my-portfolio-app-preact` — see
[docs/experimental-inventory.md](../../docs/experimental-inventory.md).

## Running it

```sh
pnpm run dev      # Vite dev server
pnpm run build    # production build into `build/`
pnpm run preview  # serve that build
```

## Deploying

`.github/workflows/deploy-pages.yml` publishes `build/` to the repository's
GitHub Pages site on every push to `main`, at the directory
`tools/configs/pages-apps.mts` names. Each tab is a path below it
(`/mono/profile/career/`), and Pages has no rewrites, so the build writes a copy
of `index.html` at each tab's path for a direct visit or a reload to find —
see `configs/vite.config.mts`.

The app used to be on Firebase Hosting at `my-portfolio-app-4f8be.web.app`.
Until that project is deleted, `firebase.json` holds only a redirect from there
to the same path on Pages, deployed by hand with
`pnpm dlx firebase-tools deploy --only hosting`; delete it and `.firebaserc`
with the project. `pnpm run check:root:firebase-redirects` checks the pair.
