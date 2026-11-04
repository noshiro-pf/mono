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
pnpm run emulators  # Auth, Functions, Firestore and Pub/Sub emulators
pnpm run build      # production build into `build/`, which firebase.json serves
pnpm run preview    # serve that build
```

In development the app talks to the Auth, Firestore and Functions emulators, so
`dev` needs `emulators` running beside it. Sign-in goes to the Auth emulator, so
it needs no real account and the emulators' data is never tied to a production
user id. `emulators` builds the functions in
[`../event-schedule-app-functions`](../event-schedule-app-functions/README.md)
first and keeps the emulators' data in `emulator-data/` between runs; run that
package's `watch:build` to have the emulator pick up changes to the functions.

Both scripts run the emulators under the project id `demo-event-schedule-app`
rather than `.firebaserc`'s production `event-schedule-app`, and the app names
the same id to them; `emulatorProjectId` in `src/api/emulator-mode.mts` says
why. Start the emulators through these scripts: a bare
`firebase emulators:start` runs them under `.firebaserc`'s id, which the app
does not call. Data saved in `emulator-data/` under the old id is imported under
the new one.

The switch is `VITE_FIREBASE_EMULATORS`, which `.env.development` sets to
`true`. To try the production Firebase from the dev server, set it to anything
else, in an untracked `.env.development.local` (`VITE_FIREBASE_EMULATORS=false`)
or on the command line (`VITE_FIREBASE_EMULATORS=false pnpm run dev`). A
production build never connects to the emulators, whatever the variable says.

The app reaches the emulators on the host name the page was opened from, so a
phone opening the dev server by its LAN address (`pnpm run dev --host`) reaches
them too — provided the emulators listen there as well: change each `"host"`
under `emulators` in `firebase.json` to `"0.0.0.0"` while you do, and do not
commit that change. `check:root:firebase-emulator-hosts` fails, locally too,
while it is in place.

The emulators load `firestore.rules`, so what they let the app do is what
production lets it do. CI's `@emulators` e2e tests run against them, but along
one path only: an anonymous user creating an event, answering it, editing it
and filtering the answers. Nothing tests what the rules deny or what they let a signed-in user do, so
check a change there by hand before
`pnpm exec firebase deploy --only firestore:rules`, the only thing that puts
it in production.

The Firestore and Pub/Sub emulators need Java (JDK 21 or later), and the
emulators run through the `firebase-tools` this package declares, so nothing
else is installed.

### End-to-end tests

```sh
pnpm run check:e2e            # smoke tests; leaves out @emulators and @production
pnpm run check:e2e:emulators  # the tests that write to Firestore
pnpm run check:e2e:production # the @smoke and @production tests, against the site
```

`check:e2e:emulators` starts its own emulators with empty data
(`firebase emulators:exec`), so stop `pnpm run emulators` first: they listen on
the same ports. Its dev server always uses the emulators, whatever
`VITE_FIREBASE_EMULATORS` says, and it never reuses a dev server already running
(`configs/playwright.emulators.config.mts`), so stop `pnpm run dev` too.
`code-check.yml` runs it in the `z:ci:code-check:coverage-1-and-emulators`
matrix entry, with Java 21 and Chromium installed. It builds the functions
before starting the emulators and needs no Firebase credentials. The smoke tests
run separately, in the `ws:check:e2e:shard-2` entry.

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
