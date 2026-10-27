# Firebase deploys

The apps that depend on Firebase (Firestore, Auth, Cloud Functions) are
deployed by `.github/workflows/deploy-firebase.yml`. Nothing is deployed from a
developer's machine any more; the commands in the apps' READMEs remain for
setting things up and for emergencies.

## What deploys what

A push to `main` that changes a package's `package.json` `version` deploys
that package's target, with that target's `--only` and nothing else. The
comparison is of the `version` value itself, between `github.event.before` and
the pushed commit: a dependency update changes `package.json` too.

| Package (name it in the changeset) | Firebase project            | `--only`            |
| :--------------------------------- | :-------------------------- | :------------------ |
| `event-schedule-app`               | `event-schedule-app`        | `hosting,firestore` |
| `event-schedule-app-functions`     | `event-schedule-app`        | `functions`         |
| `algo-app`                         | `algo-app-45270`            | `firestore`         |
| `task-manager`                     | `task-manager-app-d0cae`    | `firestore`         |
| `life-plan-simulator`              | `life-plan-simulator-9eab3` | `firestore`         |

So a change to the event-schedule-app's pages or rules names
`event-schedule-app`, a change to its functions names
`event-schedule-app-functions`, and a change to both names both. The version
pull request is what changes the `version`, so the deploy happens when it
merges. `algo-app`, `task-manager` and `life-plan-simulator` are served from
GitHub Pages (`deploy-pages.yml`); only their Firestore rules (and, for
`algo-app`, its indexes) go to Firebase.

A target whose package has a `test:rules` script (`task-manager` and `life-plan-simulator`) runs it
in the `build` job, and its rules are deployed only if it passes; it is what
their READMEs asked of a deploy by hand. A target whose build or rules test
fails is not deployed and the run goes red; the other targets of the same run
are deployed all the same. Nothing deploys the failed one later by itself,
since its `version` has already moved: fix it and bump it again, or dispatch
it (below).

**A library release redeploys the apps that use it.** With
`updateInternalDependencies: "patch"` and `workspace:*`, `changeset version`
gives every dependent app a patch bump ("Updated dependencies" in its
`CHANGELOG.md`), so the next version pull request deploys them rebuilt
against the new library. That is intended: what is deployed is what `main`
builds.

`poll-discord-app` is not a target. It has Firestore rules but no hosting, the
bot runs elsewhere, and its `firebase.json` names no project.

### A redeploy or a rollback

Run the workflow by hand ("Run workflow" on the Actions page, from `main`),
pick the package, and optionally give a commit. Without one it deploys the
tip of `main`; with one, that commit, which has to be on `main`. A dispatch
deploys that commit's tree whatever its `version` says, changed or not, so it
also deploys anything merged since the last deploy without a changeset (a
rules edit, say). Read `git log <last deployed commit>..main -- <the target's
directories>` first.

### Two runs for one target

Deploys of one target run one at a time. GitHub keeps one waiting deploy per
target and replaces it with whichever arrives last, and since builds take
different times that can be an older commit's. So a deploy first compares its
commit's `version` with `main`'s tip; when they differ it dispatches a deploy
of the tip and stands down. The tip may then be deployed twice, but never not
at all, and the dispatched deploy is the latest entry in the `firebase-deploy`
environment's history, so that history shows what is live.

## How the key is kept apart

As in `release.yml`, the job that runs the dependency tree holds nothing, and
the job that holds the OIDC token runs nothing out of the tree (see "Jobs
that hold a key" in `.github/workflows/README.md`). The workflow's header says
what that takes for Cloud Functions in particular: the functions are
discovered in the `build` job (`functions-build/functions.yaml`), and the
`predeploy` hooks are stripped from `firebase.json` before deploying. The
deploy job treats the artifact as hostile: it unpacks only the target's build
output, and refuses one that holds a `node_modules`, a link or a path outside
it, or, for the functions, has no `functions.yaml`; `firebase.json` and the
rules come from the checkout.

The discovery in `build` is given the environment firebase-tools would give
it as far as it is known without credentials: `GCLOUD_PROJECT`, and
`FIREBASE_CONFIG` with the project id only. A function that reads the default
Storage bucket or Realtime Database instance from `FIREBASE_CONFIG` fails
discovery there, and a `.env` file in the functions source fails the build;
either needs the workflow taught first, not worked around.

firebase-tools is the standalone binary, pinned by version and SHA-256 in the
workflow's `env`. To move it, download the new `firebase-tools-linux` release
asset (at least seven days old, as `minimumReleaseAge` asks of everything
else), and write its `sha256sum` beside the version.

## Setting it up

Done once, by hand. The workflow fails at "Authenticate to Google Cloud" until
it is.

### 1. The GitHub environment

`repo-settings/environments/firebase-deploy.json` limits the environment to
`main`. Apply it **before** the workflow merges, or GitHub creates the
environment on first use with no branch policy:

```sh
pnpm run repo-settings:apply environments
```

### 2. The Workload Identity pool and provider

One pool, in the `event-schedule-app` project. The attribute condition is what
refuses a token from any other repository, workflow, ref or environment:

```sh
POOL_PROJECT=event-schedule-app

gcloud services enable iamcredentials.googleapis.com sts.googleapis.com \
    --project "$POOL_PROJECT"

gcloud iam workload-identity-pools create github \
    --project "$POOL_PROJECT" --location global \
    --display-name "GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc noshiro-pf-mono \
    --project "$POOL_PROJECT" --location global \
    --workload-identity-pool github \
    --issuer-uri https://token.actions.githubusercontent.com \
    --attribute-mapping 'google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.environment=assertion.environment' \
    --attribute-condition "assertion.repository_owner_id == '46040697' && assertion.repository == 'noshiro-pf/mono' && assertion.workflow_ref == 'noshiro-pf/mono/.github/workflows/deploy-firebase.yml@refs/heads/main' && assertion.environment == 'firebase-deploy'"

gcloud iam workload-identity-pools providers describe noshiro-pf-mono \
    --project "$POOL_PROJECT" --location global \
    --workload-identity-pool github --format 'value(name)'
```

The last command prints
`projects/<number>/locations/global/workloadIdentityPools/github/providers/noshiro-pf-mono`.
Put it in the repository variable `FIREBASE_DEPLOY_WIF_PROVIDER`
(`repo-settings/variables/`), and apply that.

### 3. A deploy service account in each Firebase project

The workflow impersonates `firebase-deploy@<project>.iam.gserviceaccount.com`
in the target's project. In each of the four projects:

```sh
PROJECT=event-schedule-app # then algo-app-45270, task-manager-app-d0cae, life-plan-simulator-9eab3
POOL_NUMBER=<the number from step 2>

gcloud services enable iamcredentials.googleapis.com --project "$PROJECT"

gcloud iam service-accounts create firebase-deploy \
    --project "$PROJECT" --display-name "Deploy from GitHub Actions"

SA="firebase-deploy@${PROJECT}.iam.gserviceaccount.com"

gcloud iam service-accounts add-iam-policy-binding "$SA" \
    --project "$PROJECT" --role roles/iam.workloadIdentityUser \
    --member "principal://iam.googleapis.com/projects/${POOL_NUMBER}/locations/global/workloadIdentityPools/github/subject/repo:noshiro-pf/mono:environment:firebase-deploy"
```

Then the roles, only those the project's targets need:

| Role                                      | For                                                             |
| :---------------------------------------- | :-------------------------------------------------------------- |
| `roles/serviceusage.serviceUsageConsumer` | every target: firebase-tools checks that the APIs are on        |
| `roles/firebasehosting.admin`             | `hosting`                                                       |
| `roles/firebaserules.admin`               | `firestore` (rules)                                             |
| `roles/datastore.indexAdmin`              | `firestore` (indexes)                                           |
| `roles/cloudfunctions.developer`          | `functions`                                                     |
| `roles/cloudscheduler.admin`              | `functions`: the scheduled functions' jobs are read and updated |
| `roles/secretmanager.viewer`              | `functions`: the `RUNTIME_CONFIG` binding is checked, not read  |
| `roles/iam.serviceAccountUser`            | `functions`, on the runtime account only (below)                |

```sh
# Leave out the roles of targets the project does not have.
for role in roles/serviceusage.serviceUsageConsumer roles/firebasehosting.admin \
    roles/firebaserules.admin roles/datastore.indexAdmin; do
    gcloud projects add-iam-policy-binding "$PROJECT" \
        --member "serviceAccount:${SA}" --role "$role" --condition None
done

# event-schedule-app only:
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role roles/cloudfunctions.developer --condition None
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role roles/cloudscheduler.admin --condition None
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role roles/secretmanager.viewer --condition None
gcloud iam service-accounts add-iam-policy-binding \
    "${PROJECT}@appspot.gserviceaccount.com" --project "$PROJECT" \
    --member "serviceAccount:${SA}" --role roles/iam.serviceAccountUser
```

No project but `event-schedule-app` has hosting: `algo-app-45270` needs the
first, third and fourth, and `task-manager-app-d0cae` and
`life-plan-simulator-9eab3`, which have no indexes either, only the first and
third. `iam.serviceAccountUser` is granted on the 1st gen runtime
account rather than on the project, so the deploy account can act as that one
account and no other. If a deploy fails for a permission, the log names it;
add the narrowest role that holds it and add it to the table above.

The `RUNTIME_CONFIG` secret stays in Secret Manager and is bound to the
functions at deploy time; the workflow never reads it
(`apps/event-schedule-app-functions/README.md`).

### 4. Check

Run the workflow by hand for each package once. A dispatch deploys `main`'s
tip, which is what is live only if nothing has been merged into the target's
directories since it was last deployed by hand. Check that first, or give the
commit that was last deployed as `commit`; otherwise the check also deploys
those changes.
