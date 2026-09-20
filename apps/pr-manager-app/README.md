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

## Staying current

The page re-reads the report **every two minutes while it is on screen**, and
again the moment a hidden tab is brought back. Nothing has to be clicked;
**Refresh** is there for impatience.

**Two minutes is set by the rate limit, not by taste.** The obvious reasoning
is wrong here and it is worth writing down:

| caller                        |                  limit | is a `304` charged? |
| :---------------------------- | ---------------------: | :------------------ |
| anonymous — what this page is |   60/hour, per address | **yes**             |
| authenticated                 | 5000/hour, per account | no                  |

Both measured against this repository: `x-ratelimit-remaining` unchanged
across four conditional requests with a token, and falling 59, 58, 57 across
three without one. So the conditional request saves the transfer and the
parse, and saves nothing on the quota — one request every two minutes is 30
an hour, leaving half the budget for reloads and for whatever else shares the
address. The `If-None-Match` is sent anyway: it is free, it is correct, and it
is what would make a much shorter interval possible the day this page carries
a token.

A poll may add to the page and may say it failed, but **may not take the page
away**: a refresh that fails leaves the last report on screen with a note
beside it, because a dashboard that blanks on a spent rate limit is worse than
one showing data from four minutes ago.

So the page is as fresh as the last run of `pr-report.yml`, which is every
pull request event, every push to `main`, **every completion of a workflow
behind a required context**, and 07:00 JST. That last trigger is what makes a
CI verdict arrive about a minute after the run ends rather than at the next
pull request event; the page notices within another two minutes.

Little is lost to that wait: the report is rewritten by a workflow that takes
about a minute (median 58s over its last twenty runs), so the interval is not
what decides how old the page is.

The "generated 3 hours ago" line is measured against a clock of its own that
ticks every 30 seconds. Fixed at the moment of the load, a tab left open would
read as fresh forever.

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
