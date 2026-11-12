# Firestore のルールとインデックスの自動デプロイ

`.github/workflows/deploy-firestore.yml` が、`main` への push で次のアプリの
`firestore.rules` と `firestore.indexes.json` を Firebase にデプロイする。

| アプリ                     | Firebase project            |
| :------------------------- | :-------------------------- |
| `apps/algo-app`            | `algo-app-45270`            |
| `apps/life-plan-simulator` | `life-plan-simulator-9eab3` |
| `apps/task-manager`        | `task-manager-app-d0cae`    |

フロントエンドは GitHub Pages にあり、同じ push で `deploy-pages.yml` が公開する
（`docs/frontend-hosting.md`）。ルールもそれと一緒に出ていくよう、changeset の
`version` ではなく、push の前後でアプリの `firebase.json`・`.firebaserc`・
`firestore.rules`・`firestore.indexes.json` のどれかが変わったかで決める。
`version` は依存ライブラリのリリースのたびに上がるので、それで決めるとルールが
変わっていないデプロイばかりになる。

## 対象外

- **`event-schedule-app`・`event-schedule-app-functions`**：Hosting と
  Functions も一緒に、`deploy-event-schedule-app.yml` がデプロイする
  （`docs/event-schedule-app-deploy.md`。この workflow との違いもそこにある）。
- **`poll-discord-app`**：本番で実ユーザーがいるので、デプロイは今も手で行う。
- **Pages へ 301 を返すだけの `firebase.json`**（`annotation-tool` など）：一度
  デプロイしたら終わりで、継続的なデプロイは要らない。

workflow は対象のアプリと project を `TARGETS` に明示的に書いている。アプリを
足すときは、上の表と `TARGETS` と `workflow_dispatch` の選択肢と、下の
「project ごとのロール」を揃え、ルールが次に変わるまで何もデプロイされないので
一度手で dispatch する。
`TARGETS` の `rulesTests` には、アプリに `check:test:rules` があるかを書く。
`package.json` と食い違っていればテストの job が落ち、何もデプロイしない。

## ルールを変えるとき

`check:test:rules`（`life-plan-simulator`・`task-manager`）は Java と Firestore
エミュレータを使うルールのテストで、`code-check.yml` の `z:ci:code-check:coverage-types-and-emulators` の中で `ws:check:test:rules` が
pull request で走らせる。workflow もデプロイの前に、鍵を持たない job で
デプロイするアプリのテストを走らせ、落ちたアプリはデプロイしない。バイパスでの
マージや、チェックがまだ走っている `main` への push でも、テストに落ちるルールは
本番に出ない。そのアプリはルールが次に変わったときにデプロイされる。テストだけを
直した変更では workflow が何も選ばないので、マージ後にそのアプリを
`workflow_dispatch` で走らせる。手元で走らせるときは Java 21 以上が要る。

切り戻しや、手で直したルールの上書きには、Actions の「Deploy Firestore rules」
から `workflow_dispatch` でアプリを選んで走らせる。そのときのブランチの内容が
デプロイされる（environment が `main` に限っている）。この場合もルールのテストを
先に走らせるので、デプロイまで数分かかり、テストに落ちるルールには戻せない。
テストを通らない状態で急いで戻すときは、手元からアプリのディレクトリで
`pnpm exec firebase deploy --only firestore` を実行する。

インデックスは `--force` を付けずにデプロイするので、`firestore.indexes.json` に
無いインデックスが本番にあっても消さずに警告だけが出る。

## 認証

長寿命の鍵は置かない。workflow が動くと GitHub が「どのリポジトリの、どの
workflow が、どの ref と environment で動いているか」を書いた OIDC トークンを
発行し、Google Cloud がそれを確かめて、デプロイ用のサービスアカウントとして
1 時間ほど使える資格情報と交換する（Workload Identity Federation）。

- **pool**（Workload Identity Pool）：外部が発行したトークンを受け付ける、
  Google Cloud 側の窓口。ここでは GitHub Actions 用の `github` を 1 つ置く。
- **provider**：pool の中で、どの発行元（`token.actions.githubusercontent.com`）
  を信じ、どんなトークンだけを通すか（attribute condition）を決める設定。
  `noshiro-pf-mono` は、このリポジトリの workflow が `main` で動いたときの
  トークンのうち、environment と workflow の組が次の 2 つのどちらかのものだけを
  通す：`firebase-deploy` と `deploy-firestore.yml`、`event-schedule-app-deploy`
  と `deploy-event-schedule-app.yml`（`docs/event-schedule-app-deploy.md`）。
  トークンの `environment` は `attribute.environment` に写す。
- **サービスアカウント**：人ではなくプログラムが使う Google アカウント。
  `firestore-deploy@noshiro-pf-ci.iam.gserviceaccount.com` に、上の表の project の
  ルールとインデックスを更新するロールだけを付ける。なりすませるのは
  `attribute.environment` が `firebase-deploy` のトークンだけで、
  `event-schedule-app-deploy` のトークンは、同じ provider を通っても
  `docs/event-schedule-app-deploy.md` のサービスアカウントにしかなれない。

### 一度だけ行う設定

pool とサービスアカウントは、デプロイ専用の GCP project `noshiro-pf-ci` に置く
（作成済み）。アプリの project のどれかに置くと、その project を消したときに
ほかのアプリのデプロイまで止まるため。下は空の `noshiro-pf-ci` から作るときの
手順で、アプリを足すときには要らない（「project ごとのロール」だけでよい）。
空から作るときは、このあと「project ごとのロール」と、
`docs/event-schedule-app-deploy.md` の「一度だけ行う設定」も行う
（`event-schedule-app-deploy` のサービスアカウントも `noshiro-pf-ci` にある）。

既にある provider の写し方や条件を変えるときは、下の provider のコマンドだけを、
`create-oidc` を `update-oidc` に変えて走らせる。

```sh
HOST_PROJECT=noshiro-pf-ci
HOST_NUMBER="$(gcloud projects describe "$HOST_PROJECT" --format='value(projectNumber)')"
SA="firestore-deploy@${HOST_PROJECT}.iam.gserviceaccount.com"

# 前の 3 つは pool・サービスアカウントの作成と、トークンの交換・なりすまし用。
# 後の 3 つは firebase-tools が呼ぶ API。サービスアカウントで呼んだ分はデプロイ先
# ではなくこの project の利用として数えられるので、ここでも有効にしておく。
# 2026-10-30 の最初のデプロイが Rules API の 403 で落ちて分かった。firestore
# （インデックス）と firebase（project の取得）は、同じ理由で要る見込みで先に
# 有効にしたもので、まだそれで落ちたことはない。
gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  firebaserules.googleapis.com firestore.googleapis.com firebase.googleapis.com \
  --project "$HOST_PROJECT"

gcloud iam workload-identity-pools create github \
  --project "$HOST_PROJECT" --location global --display-name "GitHub Actions"

# repository_id と repository_owner_id は noshiro-pf/mono と noshiro-pf の数値 ID。
# 名前だけで縛ると、リポジトリを消して同じ名前で作り直した誰かも通る。
gcloud iam workload-identity-pools providers create-oidc noshiro-pf-mono \
  --project "$HOST_PROJECT" --location global --workload-identity-pool github \
  --issuer-uri https://token.actions.githubusercontent.com \
  --attribute-mapping 'google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.environment=assertion.environment' \
  --attribute-condition "assertion.repository_id == '285301950' && assertion.repository_owner_id == '46040697' && assertion.ref == 'refs/heads/main' && ((assertion.environment == 'firebase-deploy' && assertion.workflow_ref.startsWith('noshiro-pf/mono/.github/workflows/deploy-firestore.yml@')) || (assertion.environment == 'event-schedule-app-deploy' && assertion.workflow_ref.startsWith('noshiro-pf/mono/.github/workflows/deploy-event-schedule-app.yml@')))"

gcloud iam service-accounts create firestore-deploy \
  --project "$HOST_PROJECT" --display-name "Firestore deploy from GitHub Actions"

gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/${HOST_NUMBER}/locations/global/workloadIdentityPools/github/attribute.environment/firebase-deploy"
```

### project ごとのロール

`firestore-deploy` がデプロイする project（上の表）ごとに 1 回ずつ、`PROJECT` を
変えて走らせる。アプリを足すときに GCP 側で要るのは、足す project でのこの
1 回だけ。

```sh
SA=firestore-deploy@noshiro-pf-ci.iam.gserviceaccount.com
PROJECT=algo-app-45270

gcloud iam roles create firebaseProjectGetter --project "$PROJECT" \
  --title "Firebase project getter" --permissions firebase.projects.get --stage GA
for role in roles/firebaserules.admin roles/datastore.indexAdmin roles/serviceusage.serviceUsageConsumer \
  "projects/${PROJECT}/roles/firebaseProjectGetter"; do
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member "serviceAccount:${SA}" --role "$role" --condition None
done
```

ロールは、ルールの作成と公開（Firebase Rules Admin）、インデックスの更新
（Cloud Datastore Index Admin）、firebase-tools が API の有効化を確かめる読み取り
（Service Usage Consumer）、そして firebase-tools がどの deploy でも最初に確かめる
`firebase.projects.get`。最後のものを含む既成のロール（Firebase Viewer など）は
Authentication のユーザーまで読めるので、この 1 つだけのカスタムロールにした。
足りなければ、失敗した run のエラー（`Authorization failed`）が権限の名前を
出すので、それを含む最小のロールを足す。

### リポジトリ側

1. `FIREBASE_DEPLOY_WORKLOAD_IDENTITY_PROVIDER` と
   `FIREBASE_DEPLOY_SERVICE_ACCOUNT` は `repo-settings/variables/settings.json`
   に宣言してある（説明は `repo-settings/variables/README.md`）。
   `pnpm run repo-settings:apply variables` で反映する。
2. `repo-settings/environments/firebase-deploy.json` を
   `pnpm run repo-settings:apply` で適用する。**workflow をマージする前に。**
   名指された environment が無いと GitHub がその場で branch policy の無いものを
   作る（`repo-settings/README.md`）。
