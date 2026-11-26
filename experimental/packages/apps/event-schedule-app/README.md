# `event-schedule-app` (what stays of the old package)

The app now lives in `apps/event-schedule-app`, restored from this package. What
is left here is kept on purpose (#3994):

| Path | What it is | Why it stays |
| :-- | :-- | :-- |
| `scripts/migration/history/` | The one-off Firestore migrations v2→v3 … v6→v7, with example documents. | History: they explain why `apps/event-schedule-app-shared` still has `v1` to `v9`. |
| `scripts/export-firestore.ts` | Prints every event and its answers as JSON, through `firebase-admin` and a `service-account-key.json`. | The only backup tool the app ever had. Do not restore it as it is: it needs a long-lived key on disk. |
| `configs/tsconfig.scripts.json` | The tsconfig of `scripts/`. | It belongs to the scripts above. |
| `.gitignore` | Ignores the key and the scripts' output. | It hides them in a checkout that still has them (`experimental/README.md`). |

The old build's implicit globals (`configs/inject-def.ts`,
`scripts/gen-global-dts.mjs`, `src/globals.d.ts`) and the tsconfig of the old
`src/` (`configs/tsconfig.test.json`) were deleted: `apps/event-schedule-app`
imports everything explicitly and has its own configuration.

Nothing here is installed, built or checked.
