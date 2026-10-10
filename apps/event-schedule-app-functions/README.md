# event-schedule-app-functions

The Cloud Functions of [`event-schedule-app`](../event-schedule-app/README.md):

- `fetchEventListOfUser`, `verifyEmail`, `sendReport` — callable functions the
  app calls
- `answerCreationListener`, `answerUpdateListener`, `answerDeletionListener` —
  mail the organizer when an answer changes
- `notifyAnswerDeadlineEveryday`, `notifyAfterAnswerDeadlineEveryMinutes` —
  mail the organizer before and after the answer deadline
- `userDeletionListener` — removes a deleted user's id from events and answers

The Firebase project, `firebase.json` and the Firestore rules are in
`apps/event-schedule-app`; its `functions.source` points at this package's
`build/`.

## Build

```sh
pnpm run build        # bundle into build/
pnpm run watch:build  # rebuild on change, for the emulator
```

`build/` is what gets deployed, and it is bundled for that reason: Cloud
Functions runs `npm install` on the deployed `package.json`, which cannot
resolve the `workspace:*` dependencies. So `scripts/build.mts` bundles the
workspace packages into `build/index.mjs` and writes a `build/package.json`
naming only `firebase-admin`, `firebase-functions` and `nodemailer`, pinned to
the versions installed here.

## Configuration

The mail account is the `RUNTIME_CONFIG` secret (Secret Manager), a JSON object
of the shape `functions.config()` used to return:

```json
{
    "gmail": {
        "email": "…",
        "password": "…",
        "app-password": "…",
        "email-address-for-error-log": "…"
    }
}
```

firebase-functions v7 removed `functions.config()`. To create the secret from
the existing runtime config, run once in `apps/event-schedule-app`, after
`pnpm dlx firebase-tools@15 login`:

```sh
pnpm dlx firebase-tools@15 functions:config:export --secret RUNTIME_CONFIG
```

Pass `--secret`: without it the command offers `FUNCTIONS_CONFIG_EXPORT`, a
name the code does not read.

The emulator does not read Secret Manager: `build/.secret.local` holds a dummy
`RUNTIME_CONFIG`, so mail fails and everything else works. To send real mail
locally, put a `.secret.local` beside this README (`RUNTIME_CONFIG=<json>` on
one line); the build copies it instead. It is ignored by git and not deployed.

## Deploy

```sh
cd ../event-schedule-app
pnpm dlx firebase-tools@15 deploy --only functions
```

`predeploy` in `firebase.json` runs the build. The functions are 1st gen
(`firebase-functions/v1`) on Node.js 22, as they were deployed before;
moving to 2nd gen renames every function, so it is a change of its own.
Node.js 22 on 1st gen is supported until 2027-10-31.
