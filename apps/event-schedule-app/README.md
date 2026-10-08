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

The Firestore and Pub/Sub emulators need Java (JDK 21 or later), and the
emulators run through `pnpm dlx firebase-tools`, so nothing else is installed.

The Playwright suite that writes to Firestore (`create-event.spec.ts`) is still
in `experimental/packages/apps/event-schedule-app/`.

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
