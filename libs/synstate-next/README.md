# synstate-next

A from-scratch rebuild of [synstate](../synstate/README.md), kept as a separate
private package until it matches or beats synstate, then released as the next
major version of `synstate`. It is not published. What it does differently, and
why, is in [DESIGN.md](./DESIGN.md).

## Who changes this package

**Only the rebuild's own pull requests change this package and
[synstate-dom-next](../synstate-dom-next/README.md).** A bug fix, security fix
or refactor made to synstate or synstate-dom stays there, and is not ported
here, even when the same code seems to have the same bug: the rebuild is held to
its own design, and a fix written for the old one would pull it back. Note the
issue number in the rebuild's thread instead, so the case can be checked against
the new design. Until the switch, synstate and synstate-dom take bug fixes only.

### 日本語

**このパッケージと [synstate-dom-next](../synstate-dom-next/README.md)
を変更するのは、作り直しの作業そのものの pull request だけです。**
synstate や synstate-dom に入れたバグ修正・セキュリティ修正・リファクタリングは、
同じコードに同じ問題があるように見えてもこちらへは移植しません。作り直しは
独自の設計に沿って進めており、旧設計向けの修正はそれを旧設計へ引き戻すからです。
代わりに作り直しのスレッドへ issue 番号を伝え、新しい設計で同じケースを確かめます。
置き換えまでの間、synstate と synstate-dom はバグ修正だけを受け付けます。

## What is here

- `state`, `source`, `batch`, owners (`createOwner`, `onCleanup`, `untracked`).
- `pipe` with the operators `map`, `filter`, `scan`, `withInitialValue`,
  `debounce` and `switchMap`, and `derive`, `combine` and `merge`.
- `synstate-next/internal`: the node and effect classes, for synstate-dom-next
  only.
