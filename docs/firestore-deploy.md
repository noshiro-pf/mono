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

- **`event-schedule-app`・`event-schedule-app-functions`・`poll-discord-app`**：
  本番で実ユーザーがいるので、デプロイは今も手で行う。
- **Pages へ 301 を返すだけの `firebase.json`**（`annotation-tool` など）：一度
  デプロイしたら終わりで、継続的なデプロイは要らない。

workflow は対象のアプリと project を `TARGETS` に明示的に書いている。アプリを
足すときは、`TARGETS` と `workflow_dispatch` の選択肢と下のロールの付与を揃え、
ルールが次に変わるまで何もデプロイされないので一度手で dispatch する。

## ルールを変えるとき

`test:rules`（`life-plan-simulator`・`task-manager`）は Java と Firestore
エミュレータが要り、CI では走らない。**ルールを変える pull request は、マージ前に
手元で `pnpm run test:rules` を通す。** マージすればそのままデプロイされる。

切り戻しや、手で直したルールの上書きには、Actions の「Deploy Firestore rules」
から `workflow_dispatch` でアプリを選んで走らせる。そのときのブランチの内容が
デプロイされる（environment が `main` に限っている）。

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
  `noshiro-pf-mono` は、このリポジトリの `deploy-firestore.yml` が `main` で
  `firebase-deploy` environment を名指して動いたときのトークンだけを通す。
- **サービスアカウント**：人ではなくプログラムが使う Google アカウント。
  `firestore-deploy@noshiro-pf-ci.iam.gserviceaccount.com` に 3 つの project の
  ルールとインデックスを更新するロールだけを付け、provider を通った workflow
  だけがこのアカウントになりすませる。

### 一度だけ行う設定

pool とサービスアカウントは、デプロイ専用の GCP project `noshiro-pf-ci` に置く
（2026-10-29 に下の手順で作成済み）。アプリの project のどれかに置くと、その
project を消したときにほかのアプリのデプロイまで止まるため。作り直すときや
アプリを足すときは、同じ手順を使う。

```sh
HOST_PROJECT=noshiro-pf-ci
HOST_NUMBER="$(gcloud projects describe "$HOST_PROJECT" --format='value(projectNumber)')"
SA="firestore-deploy@${HOST_PROJECT}.iam.gserviceaccount.com"

gcloud services enable iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project "$HOST_PROJECT"

gcloud iam workload-identity-pools create github \
  --project "$HOST_PROJECT" --location global --display-name "GitHub Actions"

# repository_id と repository_owner_id は noshiro-pf/mono と noshiro-pf の数値 ID。
# 名前だけで縛ると、リポジトリを消して同じ名前で作り直した誰かも通る。
gcloud iam workload-identity-pools providers create-oidc noshiro-pf-mono \
  --project "$HOST_PROJECT" --location global --workload-identity-pool github \
  --issuer-uri https://token.actions.githubusercontent.com \
  --attribute-mapping 'google.subject=assertion.sub,attribute.repository=assertion.repository' \
  --attribute-condition "assertion.repository_id == '285301950' && assertion.repository_owner_id == '46040697' && assertion.ref == 'refs/heads/main' && assertion.environment == 'firebase-deploy' && assertion.workflow_ref.startsWith('noshiro-pf/mono/.github/workflows/deploy-firestore.yml@')"

gcloud iam service-accounts create firestore-deploy \
  --project "$HOST_PROJECT" --display-name "Firestore deploy from GitHub Actions"

gcloud iam service-accounts add-iam-policy-binding "$SA" \
  --project "$HOST_PROJECT" --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/${HOST_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/noshiro-pf/mono"

for project in algo-app-45270 life-plan-simulator-9eab3 task-manager-app-d0cae; do
  gcloud iam roles create firebaseProjectGetter --project "$project" \
    --title "Firebase project getter" --permissions firebase.projects.get --stage GA
  for role in roles/firebaserules.admin roles/datastore.indexAdmin roles/serviceusage.serviceUsageConsumer \
    "projects/${project}/roles/firebaseProjectGetter"; do
    gcloud projects add-iam-policy-binding "$project" \
      --member "serviceAccount:${SA}" --role "$role" --condition None
  done
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
