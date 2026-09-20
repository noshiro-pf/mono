# `pr-manager-app`

**GitHub Pull Requests Manager** — the state of every open pull request in
`noshiro-pf/mono`, as a page.

<https://noshiro-pf.github.io/mono/pr-manager/>

## What it is

The same report `pnpm run pr-report` prints and `.github/workflows/pr-report.yml`
writes into an issue, in a form that can be left open in a tab: the merge order
the `Merge-After:` trailers declare drawn as the tree it is, the issues each
pull request closes, its labels, the verdict of the contexts the ruleset
requires, and how far each branch is ahead of and behind its base.

It **only reads**. Nothing here labels, rebases, merges or comments — that is
`pnpm run unblock-prs`, run by a person — and a page that cannot do any of it
is a page that is safe to leave open.

## Where the data comes from

One request, to the GitHub REST API, for the open issue labelled `pr-report`.
The payload is a block inside that issue's body; `pr-report-payload` holds both
sides of that convention and says why the issue is the transport at all.

The short version: asking GitHub about the pull requests directly costs three
requests each, and an anonymous browser gets sixty an hour for the whole
address it sits behind. The report pays that cost in a job that holds a token;
the page reads what it wrote.

So the page is as fresh as the last run of the workflow, which is every pull
request event, every push to `main`, and 07:00 JST. The header says how long
ago that was, and **Refresh** goes and looks again.

## Running it

```sh
pnpm run dev        # the dev server, on the port app-dev-ports.mts gives it
pnpm run build      # into build/, with the base path the Pages site serves
pnpm run preview
pnpm run check:test
```

The report issue is read from the live API in every one of these, including
`dev`. Without a token that is sixty requests an hour — one per load, so this
is only a limit if the page is being reloaded in a loop.

## Deployment

`.github/workflows/deploy-pages.yml` builds everything on a push to `main`, and
`tools/scripts/cmd/build-pages-site.mts` copies `build/` into the site.

The directory it lands in and the `base` this app's bundle is built with both
come from `tools/configs/pages-apps.mts`, and they have to agree: a mismatch is
a page that loads and then asks for its script at a path nothing serves — a
blank screen, a 404 in the console, and no failing check anywhere, because both
halves did exactly what they were told.

## Colour

The tokens in `src/index.css` are the validated default palette of the
repository's data-visualization guidance — chart surface, page plane, three
inks, the hairlines, and the four reserved status steps. Dark mode is a
selected set of steps rather than an automatic flip, which is why every value
is written twice.

A status colour never carries meaning alone: every badge that uses one also
carries a glyph and a word. Two of the four steps sit below 3:1 on the light
surface by design, and that pairing is the mitigation the palette asks for in
exchange. `paused` is deliberately not a status at all — while `skip-ci` is on
nothing has run, and a held pull request is not a broken one.
