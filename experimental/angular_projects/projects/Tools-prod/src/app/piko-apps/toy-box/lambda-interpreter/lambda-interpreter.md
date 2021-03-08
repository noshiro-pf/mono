## 仕様

- 入力として許される λ 式は以下の BNF で定義されるもののみ．

$$
  \langle \textrm{expr} \rangle
  \Coloneqq
  x
    \mid (\lambda x. \langle \textrm{expr} \rangle )
    \mid (\langle \textrm{expr} \rangle \langle \textrm{expr} \rangle)
$$

- 使えるアルファベットは `[a-z]`．
- スペース，改行は無視される．
- `(`, `)`, `.` の隣に空白は不要．
- 括弧の補完は未実装．
- $1$, $2$, $+$, $\times$ などの略記も使用できない．

## ToDo

- 簡約のステップ数上限の入力欄
- 1 ステップ$\beta$-簡約の実装（今の実装は 1 ステップで止まらない）
- 括弧の補完
- 略記の対応

### 入出力例

- `((lambda x.(x x))(lambda x.(x y)))`
  $\to$
  `(y y)`
- `((lambda x. (lambda y. (x y))) y)`
  $\to$
  `(lambda a. (y a))`
- `((lambda n. (lambda f. (lambda x. (f((n f) x))))) (lambda s. (lambda z. (s(s(s z))))))`
  $\to$
  `(lambda f. (lambda x. (f (f (f (f x))))))`
