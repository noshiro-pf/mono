---
'github-settings-as-code': major
---

BREAKING CHANGE: 設定ファイルの読み込み元を `github/` から `repo-settings/` に変更した。

`github/` は `.github/` の別名に見えるため、workflow もそこにあるという誤解を招いていた。
移行は `git mv github repo-settings` のみ。ファイルの中身は変わらない。
