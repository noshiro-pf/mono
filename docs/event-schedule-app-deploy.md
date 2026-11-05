# event-schedule-app の自動デプロイ

`.github/workflows/deploy-event-schedule-app.yml` が、`main` への push で
`event-schedule-app` の Firebase project（`event-schedule-app`）に次の 3 つを
デプロイする。どれも、前回成功した run から自分の元になるファイルが変わった
ときだけ。

| target      | 元になるもの                                                                                                                            |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `firestore` | `apps/event-schedule-app` の `firebase.json`・`.firebaserc`・`firestore.rules`・`firestore.indexes.json`                                |
| `functions` | `apps/event-schedule-app-functions` と、それが `dependencies` でたどるワークスペースのパッケージ。加えて `firebase.json`・`.firebaserc` |
| `hosting`   | `apps/event-schedule-app` と、それが `dependencies` でたどるワークスペースのパッケージ                                                  |

パッケージから決める 2 つには、ルートの `pnpm-lock.yaml`・`pnpm-workspace.yaml`・
`tools/configs/` と、ビルドの道具が走らせるワークスペースのパッケージ（すべての
ライブラリのビルドが通る strip pass の `libs/ts-repo-utils`）も入り、パッケージの
中の Markdown・テスト・e2e・`eslint.config.mts` は入らない。`devDependencies` は
たどらない（lint と型の道具で、デプロイするファイルを変えない）。選び方は
`tools/scripts/cmd/firebase-deploy-plan.mts` にある。

## 何と比べて決めるか

**比べる相手は、この workflow で最後に成功した run の commit** で、1 つ前の
push ではない。run は 1 本ずつ流れ、待っている run は GitHub が新しい run に
置き換える（キャンセルする）が、新しい run は前回の成功からの変更をすべて
デプロイするので、置き換えで抜け落ちるものは無い。失敗した run の分も、次の
run が拾い直す。成功した run が 1 つも無いとき（最初の run）と
`workflow_dispatch` は、3 つすべてをデプロイする。

Functions は lockfile の変更だけでも選ばれるが、firebase-tools が関数ごとに
ソースのハッシュを比べ、変わっていない関数はデプロイしない。Hosting は
選ばれるたびに新しいリリースを作る（中身が同じならアップロードはしない）。

## デプロイの前に確かめること

`build` job が、デプロイするものによらず毎回 emulator の e2e
（`check:e2e:emulators`）を走らせ、落ちたら何もデプロイしない。pull request の
必須チェックでも走っているが、bypass でマージされたものや、2 つの pull request が
合わさってできた `main` を、確かめないままデプロイしないため。デプロイ後は
`e2e-production.yml` が毎日本番を確かめる。

## 切り戻し

`main` に revert をマージする。今のデプロイを入れ直すだけなら、Actions の
「Deploy event-schedule-app」を `workflow_dispatch` で走らせる（`main` の先端を
3 つともデプロイする）。

関数を消すデプロイは `--force` が要るので、この workflow では失敗する。関数を
消すときは手で `firebase deploy --only functions` を走らせる。

## `deploy-firestore.yml` との違い

`algo-app`・`life-plan-simulator`・`task-manager` の Firestore ルールは
`deploy-firestore.yml` が自動でデプロイしている（`docs/firestore-deploy.md`）。
こちらは実ユーザーのいるアプリで、デプロイするものも多いので、次の点が違う。

|                    | `deploy-firestore.yml`                                       | `deploy-event-schedule-app.yml`                                                          |
| :----------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| デプロイするもの   | Firestore のルールとインデックスだけ                         | Hosting、Cloud Functions、Firestore のルールとインデックス                               |
| フロントエンド     | GitHub Pages（`deploy-pages.yml` が push ごとに公開）        | Firebase Hosting（この workflow）                                                        |
| 何と比べるか       | push の前後（`github.event.before`）                         | 最後に成功した run の commit                                                             |
| 何が変わったら     | 4 つの設定ファイル                                           | 設定ファイル、パッケージと依存先のソース、lockfile など                                  |
| job の分け方       | 1 job（ビルドするものが無い）                                | `plan` → `build`（鍵なし、テストとビルド）→ `deploy`（鍵あり、成果物を検査してデプロイ） |
| デプロイ前のテスト | 無し（ルールのテストは pull request で走る）                 | emulator の e2e を毎回                                                                   |
| `predeploy`        | あれば拒む                                                   | 取り除く（ビルドは `build` job で済んでいる）                                            |
| 並び               | project ごとに 1 つ。古い run は自分で見送る                 | workflow 全体で 1 本ずつ。re-run された古い run は、`main` が変えた target を見送る      |
| environment        | `firebase-deploy`                                            | `event-schedule-app-deploy`                                                              |
| サービスアカウント | `firestore-deploy@noshiro-pf-ci`（ルールとインデックスだけ） | `event-schedule-app-deploy@noshiro-pf-ci`（`event-schedule-app` の project だけ）        |
| 承認               | 無し                                                         | 無し                                                                                     |

2 つのサービスアカウントは、同じ Workload Identity provider を通るが、それぞれ
自分の environment を名指すトークンでしかなりすませない（下の「認証」）。
Hosting と Functions のロールは `deploy-firestore.yml` からは使えない。

## 認証

仕組みは `docs/firestore-deploy.md` の「認証」と同じ（pool `github`、provider
`noshiro-pf-mono`、GCP project `noshiro-pf-ci`）。違うのは、provider が
トークンの `environment` を `attribute.environment` に写し、サービスアカウントを
その値に結び付けること。`firebase-deploy` を名指すトークンは
`firestore-deploy` にだけ、`event-schedule-app-deploy` を名指すトークンは
`event-schedule-app-deploy` にだけなれる。provider の条件は、environment と
workflow の組を 2 つだけ通す。

### 一度だけ行う設定

この workflow をマージする前に、上から順に行う。provider を先に変えるのは、
新しい結び付けが `attribute.environment` を要るから。古い結び付け
（`attribute.repository`）を外すのは、新しいものを足したあとにする。そうすれば
`deploy-firestore.yml` が止まる時間は無い。

```sh
# リポジトリのルートで走らせる（6 が apps/event-schedule-app を名指す）。
HOST_PROJECT=noshiro-pf-ci
HOST_NUMBER="$(gcloud projects describe "$HOST_PROJECT" --format='value(projectNumber)')"
POOL="projects/${HOST_NUMBER}/locations/global/workloadIdentityPools/github"
FIRESTORE_SA="firestore-deploy@${HOST_PROJECT}.iam.gserviceaccount.com"
SA="event-schedule-app-deploy@${HOST_PROJECT}.iam.gserviceaccount.com"
PROJECT=event-schedule-app

# 1. provider：environment を属性に写し、2 つの組を通す。
gcloud iam workload-identity-pools providers update-oidc noshiro-pf-mono \
  --project "$HOST_PROJECT" --location global --workload-identity-pool github \
  --attribute-mapping 'google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.environment=assertion.environment' \
  --attribute-condition "assertion.repository_id == '285301950' && assertion.repository_owner_id == '46040697' && assertion.ref == 'refs/heads/main' && ((assertion.environment == 'firebase-deploy' && assertion.workflow_ref.startsWith('noshiro-pf/mono/.github/workflows/deploy-firestore.yml@')) || (assertion.environment == 'event-schedule-app-deploy' && assertion.workflow_ref.startsWith('noshiro-pf/mono/.github/workflows/deploy-event-schedule-app.yml@')))"

# 2. firestore-deploy を environment に結び付け直す（足してから外す）。
gcloud iam service-accounts add-iam-policy-binding "$FIRESTORE_SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL}/attribute.environment/firebase-deploy"
gcloud iam service-accounts remove-iam-policy-binding "$FIRESTORE_SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL}/attribute.repository/noshiro-pf/mono"

# 3. 新しいサービスアカウント。
gcloud iam service-accounts create event-schedule-app-deploy \
  --project "$HOST_PROJECT" --display-name "event-schedule-app deploy from GitHub Actions"
gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL}/attribute.environment/event-schedule-app-deploy"

# 4. firebase-tools が呼ぶ API を noshiro-pf-ci でも有効にする
#    （サービスアカウントで呼んだ分はこの project の利用として数えられる。#2658）。
gcloud services enable firebasehosting.googleapis.com cloudfunctions.googleapis.com \
  cloudscheduler.googleapis.com secretmanager.googleapis.com \
  artifactregistry.googleapis.com cloudbuild.googleapis.com \
  --project "$HOST_PROJECT"

# 5. event-schedule-app の project でのロール。
gcloud iam roles create firebaseProjectGetter --project "$PROJECT" \
  --title "Firebase project getter" --permissions firebase.projects.get --stage GA
for role in roles/firebasehosting.admin roles/cloudfunctions.developer \
  roles/cloudscheduler.admin roles/artifactregistry.reader \
  roles/firebaserules.admin roles/datastore.indexAdmin \
  roles/serviceusage.serviceUsageConsumer "projects/${PROJECT}/roles/firebaseProjectGetter"; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role "$role" --condition None
done

# 関数の実行用サービスアカウント（1st gen の既定）として関数を作るため。
gcloud iam service-accounts add-iam-policy-binding "${PROJECT}@appspot.gserviceaccount.com" \
  --project "$PROJECT" --role roles/iam.serviceAccountUser --member "serviceAccount:${SA}"

# RUNTIME_CONFIG を関数に結び付けるとき、firebase-tools が secret と
# その IAM ポリシーを読む。値は読めない。
gcloud secrets add-iam-policy-binding RUNTIME_CONFIG --project "$PROJECT" \
  --role roles/secretmanager.viewer --member "serviceAccount:${SA}"

# 6. Artifact Registry の cleanup policy。無いと、非対話のデプロイは関数を
#    デプロイしたあとで失敗する（手で一度だけ）。firebase-tools は
#    apps/event-schedule-app の devDependency なので、そのディレクトリで走らせる
#    （ルートの `pnpm exec firebase` は "Command "firebase" not found" になる）。
#    gcloud とは別のログインを使うので、未ログインなら先に login する。
pnpm --dir apps/event-schedule-app exec firebase login
pnpm --dir apps/event-schedule-app exec firebase functions:artifacts:setpolicy --project "$PROJECT" --location asia-northeast2
```

ロールは、Hosting のリリース（Firebase Hosting Admin）、関数の作成と更新
（Cloud Functions Developer）、毎日・毎分の通知の Cloud Scheduler のジョブ
（Cloud Scheduler Admin）、cleanup policy の確認（Artifact Registry Reader）、
ルールとインデックス（`docs/firestore-deploy.md` と同じ 2 つ）、API の有効化の
確認（Service Usage Consumer）、`firebase.projects.get`。足りなければ、
`docs/firestore-deploy.md` と同じく、失敗した run のエラーが権限の名前を出すので、
それを含む最小のロールを足し、ここにも書き足す。

### リポジトリ側

1. `repo-settings/environments/event-schedule-app-deploy.json` を
   `pnpm run repo-settings:apply` で適用する。**workflow をマージする前に**
   （`repo-settings/README.md`）。
2. `EVENT_SCHEDULE_APP_DEPLOY_SERVICE_ACCOUNT` は
   `repo-settings/variables/settings.json` に宣言してある。
   `pnpm run repo-settings:apply variables` で反映する。

最初の run は、成功した run がまだ無いので 3 つすべてをデプロイする。GCP 側が
揃う前にマージすると最初の run は認証で落ちるが、何もデプロイされないだけで、
揃ったあとに `workflow_dispatch` すれば済む。
