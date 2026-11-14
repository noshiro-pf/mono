---
'ts-fortress': patch
---

`t.number`'s `multipleOf` and `step` accept the multiples of a decimal divisor such as `0.1` or `0.01`. They took the floating-point remainder, under which `0.3 % 0.1` is `0.09999999999999998`, so `step: 0.01` rejected 990 of the 1001 hundredths from `0` to `10` and `t.number(0.3, { multipleOf: 0.1 })` threw at construction. A value the remainder rejects is now also compared as the decimals the value and the divisor are written as: both are scaled to integers by the decimal places of their shortest notation and the integers are divided, where both are safe integers. Every value accepted before is still accepted. This also fixes the branded number constructors that take these constraints.
