# event-schedule-app

An app for arranging a date among several people: the organizer posts the
candidate dates, everyone marks each one, and the app ranks them by how many
people can make it. State lives in Firestore.

<https://event-schedule-app.web.app>

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md).

## Running it

```sh
pnpm run dev        # Vite dev server
pnpm run emulators  # Functions, Firestore and Pub/Sub emulators
pnpm run build      # production build into `build/`, which firebase.json serves
pnpm run preview    # serve that build
```

In development the app talks to the Firestore and Functions emulators
(`useEmulators` in `src/env.mts`), so `dev` needs `emulators` running beside
it. Sign-in still goes to the production Firebase Auth. `emulators` builds
the functions in
[`../event-schedule-app-functions`](../event-schedule-app-functions/README.md)
first and keeps the emulators' data in `emulator-data/` between runs; run that
package's `watch:build` to have the emulator pick up changes to the functions.

The emulators load `firestore.rules`, so what they let the app do is what
production lets it do. Nothing in CI reads the rules; a change there takes
effect only with `pnpm exec firebase deploy --only firestore:rules`.

The Firestore and Pub/Sub emulators need Java (JDK 21 or later), and the
emulators run through the `firebase-tools` this package declares, so nothing
else is installed.

### End-to-end tests

```sh
pnpm run check:e2e            # what CI runs; leaves out @emulators and @production
pnpm run check:e2e:emulators  # the tests that write to Firestore
pnpm run check:e2e:production # the @smoke and @production tests, against the site
```

`check:e2e:emulators` starts its own emulators with empty data
(`firebase emulators:exec`), so stop `pnpm run emulators` first: they listen
on the same ports. No workflow runs it yet, since no runner has Java.

`check:e2e:production` is run daily by
[`e2e-production.yml`](../../.github/workflows/e2e-production.yml) against
<https://event-schedule-app.web.app> and the production Firestore. So that the
database does not grow with every run, it creates no event — nothing can
delete one — and works on one fixture event instead: it reads it, adds an
answer and deletes it, and edits the notes and sets them back.
`e2e/production.spec.mts` has the details. The fixture is made once, by hand:

1. Signed out, create an event at <https://event-schedule-app.web.app> with
   the default answer deadline (none) and notifications (off). The title and
   dates are free; the first run overwrites the notes.
2. Store the id from its URL (`/event/<id>/`) as the repository secret
   `EVENT_SCHEDULE_APP_E2E_EVENT_ID`, and do not post the URL anywhere: it is
   all it takes to edit the event.

To try a change to the tests before it meets production, point them at
`pnpm run dev` and the emulators, with an event created there:

```sh
E2E_BASE_URL=http://localhost:5188 EVENT_SCHEDULE_APP_E2E_EVENT_ID=<id> pnpm run check:e2e:production
```

### Firestore structure

`[]` marks a collection.

```text
/[events_v7]/
    |
    +--(event-id): EventSchedule
        |
        +--[answers]/
        |   |
        |   +--(answer-id): Answer
        |
        +--[internal]/
            |
            +--values
                |
                +--email: string
```

### Who may do what

`firestore.rules` says it in full; the shape, with the functions using the
Admin SDK and bypassing it:

- An event is fetched by its id and never listed: the id in the URL is what
  admits a reader. Nothing deletes an event.
- An event is edited by its author. One created while signed in carries
  `author.id` and is edited by that account only; one created anonymously
  (`author.id` is `null`) stays editable by anyone with the URL. The email
  check on the edit page is a convenience for the second kind, not a gate.
- `archivedBy` is each signed-in user's own entry to add or remove; an
  author's edit leaves it as it is.
- Answers are public and anyone may post one; an answer with `user.id` is
  edited and deleted by that account only. Nothing is written to answers after
  the deadline, read in the event's own `timezoneOffsetMinutes`.
- `internal/values` is written by whoever may edit the event and read only by
  the functions.
