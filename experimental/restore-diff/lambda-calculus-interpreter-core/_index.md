# `lambda-calculus-interpreter-core` — src の差分一覧

|          |                                                                                  |
| :------- | :------------------------------------------------------------------------------- |
| 復元前   | `experimental/packages/apps/lambda-calculus-interpreter-core/src`（42 ファイル） |
| 復元後   | `apps/lambda-calculus-interpreter-core/src`（44 ファイル）                       |
| 変更あり | 31                                                                               |
| 同一     | 11                                                                               |
| 追加     | 2                                                                                |
| 削除     | 0                                                                                |

| 状態      | 復元前                                           | 復元後                                           | diff                                                                                          |
| :-------- | :----------------------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| identical | `constants/alphabets.mts`                        | `constants/alphabets.mts`                        | —                                                                                             |
| identical | `constants/index.mts`                            | `constants/index.mts`                            | —                                                                                             |
| identical | `constants/max-steps.mts`                        | `constants/max-steps.mts`                        | —                                                                                             |
| changed   | `functions/evaluator/alpha-conversion.mts`       | `functions/evaluator/alpha-conversion.mts`       | [`alpha-conversion.mts.diff`](./functions/evaluator/alpha-conversion.mts.diff)                |
| changed   | `functions/evaluator/beta-reduction-1-step.mts`  | `functions/evaluator/beta-reduction-1-step.mts`  | [`beta-reduction-1-step.mts.diff`](./functions/evaluator/beta-reduction-1-step.mts.diff)      |
| identical | `functions/evaluator/eval-1-step.mts`            | `functions/evaluator/eval-1-step.mts`            | —                                                                                             |
| changed   | `functions/evaluator/eval-sequence.mts`          | `functions/evaluator/eval-sequence.mts`          | [`eval-sequence.mts.diff`](./functions/evaluator/eval-sequence.mts.diff)                      |
| identical | `functions/evaluator/index.mts`                  | `functions/evaluator/index.mts`                  | —                                                                                             |
| changed   | `functions/evaluator/substitute.mts`             | `functions/evaluator/substitute.mts`             | [`substitute.mts.diff`](./functions/evaluator/substitute.mts.diff)                            |
| changed   | `functions/get-free-variables.mts`               | `functions/get-free-variables.mts`               | [`get-free-variables.mts.diff`](./functions/get-free-variables.mts.diff)                      |
| identical | `functions/index.mts`                            | `functions/index.mts`                            | —                                                                                             |
| changed   | `functions/is-abstraction.test.mts`              | `functions/is-abstraction.test.mts`              | [`is-abstraction.test.mts.diff`](./functions/is-abstraction.test.mts.diff)                    |
| changed   | `functions/is-alpha-equal.mts`                   | `functions/is-alpha-equal.mts`                   | [`is-alpha-equal.mts.diff`](./functions/is-alpha-equal.mts.diff)                              |
| changed   | `functions/is-application.test.mts`              | `functions/is-application.test.mts`              | [`is-application.test.mts.diff`](./functions/is-application.test.mts.diff)                    |
| changed   | `functions/is-lambda-term.mts`                   | `functions/is-lambda-term.mts`                   | [`is-lambda-term.mts.diff`](./functions/is-lambda-term.mts.diff)                              |
| changed   | `functions/is-variable.mts`                      | `functions/is-variable.mts`                      | [`is-variable.mts.diff`](./functions/is-variable.mts.diff)                                    |
| changed   | `functions/is-variable.test.mts`                 | `functions/is-variable.test.mts`                 | [`is-variable.test.mts.diff`](./functions/is-variable.test.mts.diff)                          |
| changed   | `functions/parser/expand-shortcut.mts`           | `functions/parser/expand-shortcut.mts`           | [`expand-shortcut.mts.diff`](./functions/parser/expand-shortcut.mts.diff)                     |
| changed   | `functions/parser/get-parse-tree.mts`            | `functions/parser/get-parse-tree.mts`            | [`get-parse-tree.mts.diff`](./functions/parser/get-parse-tree.mts.diff)                       |
| identical | `functions/parser/index.mts`                     | `functions/parser/index.mts`                     | —                                                                                             |
| identical | `functions/parser/macro/index.mts`               | `functions/parser/macro/index.mts`               | —                                                                                             |
| changed   | `functions/parser/macro/is-number.mts`           | `functions/parser/macro/is-number.mts`           | [`is-number.mts.diff`](./functions/parser/macro/is-number.mts.diff)                           |
| changed   | `functions/parser/macro/number.mts`              | `functions/parser/macro/number.mts`              | [`number.mts.diff`](./functions/parser/macro/number.mts.diff)                                 |
| changed   | `functions/parser/macro/plus.mts`                | `functions/parser/macro/plus.mts`                | [`plus.mts.diff`](./functions/parser/macro/plus.mts.diff)                                     |
| changed   | `functions/parser/macro/succ.mts`                | `functions/parser/macro/succ.mts`                | [`succ.mts.diff`](./functions/parser/macro/succ.mts.diff)                                     |
| changed   | `functions/parser/macro/to-number.mts`           | `functions/parser/macro/to-number.mts`           | [`to-number.mts.diff`](./functions/parser/macro/to-number.mts.diff)                           |
| changed   | `functions/parser/parse-lambda-term.mts`         | `functions/parser/parse-lambda-term.mts`         | [`parse-lambda-term.mts.diff`](./functions/parser/parse-lambda-term.mts.diff)                 |
| changed   | `functions/parser/split-to-tokens.mts`           | `functions/parser/split-to-tokens.mts`           | [`split-to-tokens.mts.diff`](./functions/parser/split-to-tokens.mts.diff)                     |
| changed   | `functions/parser/token-list-is-lambda-term.mts` | `functions/parser/token-list-is-lambda-term.mts` | [`token-list-is-lambda-term.mts.diff`](./functions/parser/token-list-is-lambda-term.mts.diff) |
| changed   | `functions/pickup-available-variable.mts`        | `functions/pickup-available-variable.mts`        | [`pickup-available-variable.mts.diff`](./functions/pickup-available-variable.mts.diff)        |
| changed   | `functions/print/has-macro.mts`                  | `functions/print/has-macro.mts`                  | [`has-macro.mts.diff`](./functions/print/has-macro.mts.diff)                                  |
| identical | `functions/print/index.mts`                      | `functions/print/index.mts`                      | —                                                                                             |
| changed   | `functions/print/term-to-string.mts`             | `functions/print/term-to-string.mts`             | [`term-to-string.mts.diff`](./functions/print/term-to-string.mts.diff)                        |
| changed   | `functions/print/to-macro-string.mts`            | `functions/print/to-macro-string.mts`            | [`to-macro-string.mts.diff`](./functions/print/to-macro-string.mts.diff)                      |
| changed   | `functions/term-eq.mts`                          | `functions/term-eq.mts`                          | [`term-eq.mts.diff`](./functions/term-eq.mts.diff)                                            |
| changed   | `index.mts`                                      | `index.mts`                                      | [`index.mts.diff`](./index.mts.diff)                                                          |
| identical | `types/index.mts`                                | `types/index.mts`                                | —                                                                                             |
| identical | `types/lambda-term.mts`                          | `types/lambda-term.mts`                          | —                                                                                             |
| changed   | `types/lambda-term.test.mts`                     | `types/lambda-term.test.mts`                     | [`lambda-term.test.mts.diff`](./types/lambda-term.test.mts.diff)                              |
| changed   | `types/number-term.mts`                          | `types/number-term.mts`                          | [`number-term.mts.diff`](./types/number-term.mts.diff)                                        |
| changed   | `types/number-term.test.mts`                     | `types/number-term.test.mts`                     | [`number-term.test.mts.diff`](./types/number-term.test.mts.diff)                              |
| changed   | `types/variable.mts`                             | `types/variable.mts`                             | [`variable.mts.diff`](./types/variable.mts.diff)                                              |
| added     | —                                                | `utils/index.mts`                                | [`index.mts.diff`](./utils/index.mts.diff)                                                    |
| added     | —                                                | `utils/tuple-guards.mts`                         | [`tuple-guards.mts.diff`](./utils/tuple-guards.mts.diff)                                      |
