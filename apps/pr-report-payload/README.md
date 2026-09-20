# `pr-report-payload`

The machine-readable copy of the open pull request report: the shape, the
schema that validates it, and the block it travels in.

Two packages depend on this one and nothing else does.
`tools/scripts/cmd/pr-report` builds a payload and appends the block to the
Markdown it writes into the report issue; `apps/pr-manager-app` reads that
issue back and validates what it finds. The definition lives here rather than
in either of them so that there is one of it.

## Why the issue is the transport

The app cannot ask GitHub about the pull requests itself. Reading one costs
three requests — the comparison against the base and the two kinds of check —
and an anonymous browser is allowed sixty an hour, shared with everything else
behind the same address. Twenty open pull requests would spend the hour before
the page had loaded once.

The report already does that work, in a job that holds a token, once a day and
on every event that can change the answer. So the app reads the report rather
than the repository, and the report's own issue is where it already is: one
body, overwritten in place, readable by anyone, and still a thing a person can
read without an app.

## The block

`embedPayload` writes it and `extractPayload` reads it. Between two HTML
comment markers sits a collapsed `<details>` holding one line of JSON in a
fenced block:

````text
<!-- pr-report:payload:begin -->
<details>
<summary>Machine-readable copy of this report</summary>

```json
{"version":1,…}
```

</details>
<!-- pr-report:payload:end -->
````

Three properties are wanted at once and the shape is what gets all three.

- **A reader of the issue should not have to look at it**, so it is collapsed
  and at the bottom, below everything the report says in prose.
- **Nothing a contributor writes should be able to break it.** A pull request
  title is arbitrary text and it ends up inside this JSON. Escaping the fence
  needs a newline and `JSON.stringify` writes none, so the payload is always
  exactly one line; and the markers are matched at the start of a line, which
  that one line never is. A title spelling out either marker is inert.
- **The reader has to find it without parsing Markdown**, so the markers are
  HTML comments, which render as nothing and are found by scanning lines.

## What is in it, and what is not

The payload is not everything `pr-report --format json` prints. Two fields are
deliberately left behind:

- **the pull request bodies**, by far the largest thing read about a pull
  request, and nothing displays them — what is read _out_ of them, the
  `Merge-After:` numbers and the issues each one closes, is in the payload
  already;
- **the per-context verdict map**, which `checks` summarises.

An issue body holds 65536 characters and both of those grow with the number of
open pull requests. What is carried instead is one thing the reader could not
work out for itself: the `summary` counts, because `queued` is a label whose
spelling lives in the workflows and in `tools/scripts/cmd/unblock-prs/`, and
`failing` is a verdict reached over the contexts the ruleset requires.

`generatedAtEpochMs` sits beside the ISO `generatedAt` for the same kind of
reason: parsing a date _string_ is the one operation whose result the language
leaves to the implementation, and a page saying "generated 3 hours ago" should
not be computing that from an implementation-defined parse.

## Versions

`PAYLOAD_VERSION` is checked before the schema is, so that a payload from
another age is reported as that rather than as a field of the wrong type. The
two sides are deployed together — the workflow runs from `main` and the app is
built from `main` — so a mismatch is transient, and `extractPayload` says so.

Excess properties are accepted, which is what lets a newer report carry a
field this app has no use for yet without taking the page down.

## Checks

```sh
pnpm run check:test    # the block, round-tripped and attacked
pnpm run check:types
pnpm run check:lint
```

The drift this package exists to prevent is caught in
`tools/scripts/cmd/pr-report/payload.test.mts`, which builds a report, turns
it into a payload, and validates it against the schema here.
