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

|                    | `deploy-firestore.yml`                                                                        | `deploy-event-schedule-app.yml`                                                          |
| :----------------- | :-------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| デプロイするもの   | Firestore のルールとインデックスだけ                                                          | Hosting、Cloud Functions、Firestore のルールとインデックス                               |
| フロントエンド     | GitHub Pages（`deploy-pages.yml` が push ごとに公開）                                         | Firebase Hosting（この workflow）                                                        |
| 何と比べるか       | push の前後（`github.event.before`）                                                          | 最後に成功した run の commit                                                             |
| 何が変わったら     | 4 つの設定ファイル                                                                            | 設定ファイル、パッケージと依存先のソース、lockfile など                                  |
| job の分け方       | `plan` → `test-rules`（鍵なし、ルールのテスト）→ `deploy`（鍵あり、テストに通ったアプリだけ） | `plan` → `build`（鍵なし、テストとビルド）→ `deploy`（鍵あり、成果物を検査してデプロイ） |
| デプロイ前のテスト | ルールのテスト（`check:test:rules`）を、デプロイするアプリごとに                              | emulator の e2e を毎回                                                                   |
| `predeploy`        | あれば拒む                                                                                    | 取り除く（ビルドは `build` job で済んでいる）                                            |
| 並び               | project ごとに 1 つ。古い run は自分で見送る                                                  | workflow 全体で 1 本ずつ。re-run された古い run は、`main` が変えた target を見送る      |
| environment        | `firebase-deploy`                                                                             | `event-schedule-app-deploy`                                                              |
| サービスアカウント | `firestore-deploy@noshiro-pf-ci`（ルールとインデックスだけ）                                  | `event-schedule-app-deploy@noshiro-pf-ci`（`event-schedule-app` の project だけ）        |
| API の利用の数え先 | `noshiro-pf-ci`（そこで API を有効にする。#2658）                                             | `event-schedule-app`（`GOOGLE_CLOUD_QUOTA_PROJECT`）                                     |
| 承認               | 無し                                                                                          | 無し                                                                                     |

2 つのサービスアカウントは、同じ Workload Identity provider を通るが、それぞれ
自分の environment を名指すトークンでしかなりすませない（下の「認証」）。
Hosting と Functions のロールは `deploy-firestore.yml` からは使えない。

## 認証

仕組みは `docs/firestore-deploy.md` の「認証」と同じで、pool `github` と
provider `noshiro-pf-mono`（GCP project `noshiro-pf-ci`）もそこのものを使う。
provider が通すトークンと属性の写し方はそこに書いてある。この workflow の
サービスアカウント `event-schedule-app-deploy` には、`attribute.environment` が
`event-schedule-app-deploy` のトークンだけがなれる。

**API の利用は、デプロイ先の `event-schedule-app` に数える。** サービスアカウントで
呼んだ API は、何もしなければそのアカウントの project（`noshiro-pf-ci`）の利用に
なり、そこで API が有効でないと 403 になる（#2658）。`noshiro-pf-ci` は課金
アカウントを持たないので、Functions のデプロイが使う Cloud Build・Artifact
Registry・Cloud Scheduler・Secret Manager はそこで有効にできない。そこで workflow
の Deploy の step は `GOOGLE_CLOUD_QUOTA_PROJECT` を `event-schedule-app` にし、
firebase-tools はすべての呼び出しに `x-goog-user-project` を付ける。手でデプロイ
してきた project なので、要る API はどれも有効になっている。数え先にするには
その project での `serviceusage.services.use`（Service Usage Consumer）が要る。
`noshiro-pf-ci` に数えられるのは、資格情報の交換（STS・IAM Credentials）だけ。

### 一度だけ行う設定

pool と provider は `docs/firestore-deploy.md` の「一度だけ行う設定」が作る
（作成済み）。ここにあるのは、この workflow のサービスアカウントとそのロール
だけ。上から順に行う。

```sh
# リポジトリのルートで走らせる（4 が apps/event-schedule-app を名指す）。
HOST_PROJECT=noshiro-pf-ci
HOST_NUMBER="$(gcloud projects describe "$HOST_PROJECT" --format='value(projectNumber)')"
POOL="projects/${HOST_NUMBER}/locations/global/workloadIdentityPools/github"
SA="event-schedule-app-deploy@${HOST_PROJECT}.iam.gserviceaccount.com"
PROJECT=event-schedule-app

# 1. サービスアカウント。
gcloud iam service-accounts create event-schedule-app-deploy \
  --project "$HOST_PROJECT" --display-name "event-schedule-app deploy from GitHub Actions"
gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/${POOL}/attribute.environment/event-schedule-app-deploy"

# 2. noshiro-pf-ci で API を足すことはしない。デプロイの呼び出しは
#    GOOGLE_CLOUD_QUOTA_PROJECT で event-schedule-app に数える（上の「認証」）。
#    noshiro-pf-ci は課金アカウントを持たず、Cloud Build・Artifact Registry・
#    Cloud Scheduler・Secret Manager を有効にできない。

# 3. event-schedule-app の project でのロール。
gcloud iam roles create firebaseProjectGetter --project "$PROJECT" \
  --title "Firebase project getter" \
  --permissions firebase.projects.get,resourcemanager.projects.get --stage GA
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

# 4. Artifact Registry の cleanup policy。無いと、非対話のデプロイは関数を
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
確認と利用をこの project に数えること（Service Usage Consumer）、カスタムロールの
`firebase.projects.get` と `resourcemanager.projects.get`（project のメタデータを
読むだけ。前者は firebase-tools がどの deploy でも最初に、後者は Functions の
準備で使う）。カスタムロールを作ったあとで権限を足すときは
`gcloud iam roles update firebaseProjectGetter --project "$PROJECT" --add-permissions <権限>`。
足りなければ、`docs/firestore-deploy.md` と同じく、失敗した run のエラーが権限の
名前を出すので、それを含む最小のロールを足し、ここにも書き足す。

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
