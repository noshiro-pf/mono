# `pr-manager-app`

**GitHub Pull Requests Manager** — the state of every open pull request in
`noshiro-pf/mono`, as a page.

<https://noshiro-pf.github.io/mono/pr-manager/>

## What it is

The same report `pnpm run pr-report` prints and `.github/workflows/pr-report.yml`
writes into an issue, in a form that can be left open in a tab: the merge order
the `Merge-After:` trailers declare drawn as the tree it is, the issues each
pull request closes with their titles, its labels in GitHub's own colours, the
branch it is of, whether it is open or a draft, whether auto-merge is armed,
the verdict of the contexts the ruleset requires, and how far each branch is
ahead of and behind its base.

Below that, two sections that are not about the queue: **what merged** in the
last week, and **what `unblock-prs` did** — the runs of the script that lands
the queue, which until now said everything it did on a terminal and nowhere
else.

It **only reads**. Nothing here labels, rebases, merges or comments — that is
`pnpm run unblock-prs`, run by a person — and a page that cannot do any of it
is a page that is safe to leave open.

## Where the data comes from

Two requests, both to the GitHub REST API and both for one issue: the open one
labelled `pr-report`, and the open one labelled `unblock-prs-log`. Each
carries its report as a block inside its body; `pr-report-payload` holds both
sides of that convention and says why an issue is the transport at all.

The log is asked for alongside the report rather than after it, and a log that
is missing or unreadable is a sentence in its own section rather than a reason
for the page to show nothing. There is no `unblock-prs-log` issue until
someone runs the script, and the page says so.

The short version: asking GitHub about the pull requests directly costs three
requests each, and an anonymous browser gets sixty an hour for the whole
address it sits behind. The report pays that cost in a job that holds a token;
the page reads what it wrote.

## Staying current

The page re-reads the report **every two minutes while it is on screen**, and
again the moment a hidden tab is brought back. Nothing has to be clicked;
**Refresh** is there for impatience, and is also what re-reads the
`unblock-prs` log — only a person running that script writes one, so a timer
has nothing to find.

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

Little is lost to the wait. The report is rewritten by a workflow that takes
about a minute (median 58s over its last twenty runs), so the interval is not
what decides how old the page is.

A poll may add to the page and may say it failed, but **may not take the page
away**: a refresh that fails leaves the last report on screen with a note
beside it, because a dashboard that blanks on a spent rate limit is worse than
one showing data from four minutes ago.

So the page is as fresh as the last run of `pr-report.yml`, which is every
pull request event, every push to `main`, **every completion of a workflow
behind a required context**, and 07:00 JST. That last trigger is what makes a
CI verdict arrive about a minute after the run ends rather than at the next
pull request event.

The "generated 3 hours ago" line is measured against a clock of its own that
ticks every 30 seconds. It used to be fixed at the moment of the load, which
meant a tab left open read as fresh forever.

## Running it

```sh
pnpm run dev        # the dev server, on the port app-dev-ports.mts gives it
pnpm run build      # into build/, with the base path the Pages site serves
pnpm run preview
pnpm run check:test
```

The issues are read from the live API in every one of these, including `dev`.
Without a token that is sixty requests an hour for the whole address — two per
load, so thirty loads, which is only a limit if the page is being reloaded in
a loop.

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
nothing has run, and a held pull request is not a broken one. Nor is open
versus draft: that badge takes the categorical blue, so that it cannot be read
as a verdict beside the one that is.

The ahead / behind bars are a **diverging** encoding — one quantity measured
in two directions, not two categories — so they take the palette's diverging
pair, blue and red, with the hairline track as the neutral middle. Every bar
on the page is drawn against one scale, the largest count anywhere in the
report, because a per-card scale would draw `-2` and `-39` the same length.
Both numbers are written out beside the bars regardless: nobody should have to
measure a bar to read a count three characters long.

**The label chips are GitHub's colours with the ink computed, not copied.**
GitHub picks black or white by perceived brightness (the YIQ weighting);
`src/label-color.mts` picks whichever measures the higher WCAG contrast, and
the two disagree on the mid-dark colours — on `#0e8a16` black measures 5.2:1
where white measures 4.0:1. There is a test over GitHub's whole default
palette asserting every chip clears 4.5:1.
