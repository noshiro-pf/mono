# repository variables

`settings.json` が宣言。反映は `pnpm run repo-settings:apply variables`、
GitHub の現在値で撮り直すのは `pnpm run repo-settings:backup variables`。

JSON にコメントが書けないので、何のための値かはここに置いてある。

| 変数                            | 何か                                                                                                                                                                                                                                                                           |
| :------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REPO_AUTOMATION_BOT_CLIENT_ID` | GitHub App `noshiro-repo-automation-bot`（App ID: 4478721）の client id。Contents / Pull requests / Issues 権限を持ち、`release.yml`、`pnpm-update.yml`、`node-support-update.yml` が App token を発行するのに使う。実際に使う権限は各ワークフローの `permission-*` 入力で絞る |

**秘密をここに書かないこと。** repository variable は API でも Actions の
ログでも平文で読める。秘密は secret 側にあり、そちらはこのツールの管理外。
client id が置いてあるのは、それが公開値で、対になる秘密鍵の方が secret だから。

`apply` は宣言に無い変数を消さない。消すときは宣言から外したうえで GitHub 側でも
消す。外し忘れると、次の `backup` が宣言に書き戻すので気づく。
