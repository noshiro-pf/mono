# 元金均等返済

## 元金均等返済における各月の支払金額

-   $n$: 支払い回数
-   $r$: 月利
-   $A$: 残高の初期値

$x$を各月の支払額とする．$i$回目の支払い後の残高を $A_i$ とすると，

$$
  A_{i + 1} = A_i(1 + r) - x
$$

となる．

ここで $k = x/r$ と置くと $k = k(1 + r) - x$ であり， $A_{i + 1} = A_i(1 + r) - x$ と合わせて $A_{i + 1} - k = (A_i - k)(1 + r)$ となるから

$$
  A_i - k = (A_0 - k)(1 + r)^i
$$

となる．
特に $A_n = 0$ であるから

$$
  0 - k = (A_0 - k)(1 + r)^n
$$

これを整理すると

$$
  x \left( \frac{1}{r} - \frac{(1 + r)^n}{r} \right) + A_0(1 + r)^n = 0
$$

$$
  x = \frac{A_0(1 + r)^n}{\frac{(1 + r)^n - 1}{r}}
    = A_0 r \frac{(1 + r)^n - 1 + 1}{(1 + r)^n - 1}
    = A r \left(1 + \frac{1}{(1 + r)^n - 1} \right).
$$

## 元金均等返済における$i$回目の支払い後の残高

$$
  A_i = k + (A - k)(1 + r)^i = \frac{x}{r} + \left(A - \frac{x}{r}\right)(1 + r)^i
$$

$n$を支払回数として，

$$
  x = A r \left(1 + \frac{1}{(1 + r)^n - 1} \right) = \frac{Ar (1 + r)^n }{(1 + r)^n - 1}
$$

であったから，

$$
\begin{aligned}
  A_i &= \frac{x}{r} \left(1 - (1 + r)^i \right) + A (1 + r)^i \\
      &= \frac{A (1 + r)^n}{(1 + r)^n - 1} \left(1 - (1 + r)^i \right) + A (1 + r)^i
\end{aligned}
$$

$q = 1 + r$ とおいて

$$
\begin{aligned}
  A_i &= \frac{A q^n}{q^n - 1} (1 - q^i) + A q^i \\
      &= A \left( \frac{q^n}{q^n - 1} (1 - q^i) + q^i \right) \\
      &= A \frac{q^n(1 - q^i) + q^i(q^n - 1)}{q^n - 1} \\
      &= A \frac{q^n - q^i}{q^n - 1} \\
      &= A \frac{1 - q^{i - n}}{1 - q^{-n}}. \\
\end{aligned}
$$
