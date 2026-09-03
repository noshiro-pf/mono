# event-schedule-app

An app for arranging a date among several people: the organizer posts the
candidate dates, everyone marks each one, and the app ranks them by how many
people can make it. State lives in Firestore.

<https://event-schedule-app.web.app>

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md).

## Running it

```sh
pnpm run dev      # Vite dev server
pnpm run build    # production build into `build/`, which firebase.json serves
pnpm run preview  # serve that build
```

The Cloud Functions, the Firestore rules and the Playwright end-to-end suite
did not come across with the restore: they are deployment and integration
concerns, and this repository does not deploy the app. They are still in
`experimental/packages/apps/event-schedule-app/`.

### env

The functions read a Gmail account from the Firebase environment config:

```json
{
    "gmail": {
        "email": "noshiro.app@gmail.com",
        "password": "<password>"
    }
}
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
