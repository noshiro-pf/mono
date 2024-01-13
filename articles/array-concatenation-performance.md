---
title: 'JavaScript の配列生成や文字列連結のパフォーマンスについて'
emoji: '🐈'
type: 'tech'
topics: ['javascript', 'V8']
published: false
---

https://stackoverflow.com/questions/16696632/most-efficient-way-to-concatenate-strings-in-javascript, https://medium.com/@zhongdongy/the-performance-of-javascript-string-concat-e52466ca2b3a

文字列連結パフォーマンスに関する補足
JavaScript の文字列連結のパフォーマンスの話は結構複雑のようです。
https://docs.google.com/document/d/1o-MJPAddpfBfDZCkIHNKbMiM86iDFld7idGbNQLuKIQ/preview#heading=h.6kknmf22ixwc

基本的に

文字列連結結果は連続するメモリ領域に確保されるとは限らず、「ロープ」と呼ばれる手法によって文字列断片同士を繋いだもの（連結リストのようなデータ構造？）として表現される場合があるようです。ただ、これをネットワーク越しの外界やその他 API に渡すときに連続する文字列に変換しなければならない場合があるため、そのタイミングで変換コストが生じます。

おそらくケースバイケースであり、筆者もどう書くのが最も良いのかは正直自信がありません。少数の文字列連結であれば `+` で繋いでしまうのが速い可能性もあります。

［`Array#join()`と`String#concat()`の比較］

`Array#join()` を使う場合は、間に挟む文字列が空文字（`.join("")`）であったとしてもその連結にもコストがかかるため、定数倍でやや不利になる可能性があります（$n$個の文字列連結操作が $n + (n - 1)$ 個の文字列連結操作になってしまう）。
`Array#join()` は `\n` などを挟むことができる点で柔軟性がありますが、単に文字列連結をするために空文字で呼び出すのであれば
`String#concat()` を使って `"".concat(...ss)` とする方が高速な可能性があります。
