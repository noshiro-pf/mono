# `poll-discord-app` — src の差分一覧

|          |                                                                  |
| :------- | :--------------------------------------------------------------- |
| 復元前   | `experimental/packages/apps/poll-discord-app/src`（39 ファイル） |
| 復元後   | `apps/poll-discord-app/src`（45 ファイル）                       |
| 変更あり | 30                                                               |
| 同一     | 8                                                                |
| 追加     | 7                                                                |
| 削除     | 1                                                                |

| 状態      | 復元前                                       | 復元後                                       | diff                                                                                         |
| :-------- | :------------------------------------------- | :------------------------------------------- | :------------------------------------------------------------------------------------------- |
| identical | `assets/calendar_icon.png`                   | `assets/calendar_icon.png`                   | —                                                                                            |
| identical | `assets/grouping_icon.jpg`                   | `assets/grouping_icon.jpg`                   | —                                                                                            |
| changed   | `constants.mts`                              | `constants.mts`                              | [`constants.mts.diff`](./constants.mts.diff)                                                 |
| changed   | `discord/discord.mts`                        | `discord/discord.mts`                        | [`discord.mts.diff`](./discord/discord.mts.diff)                                             |
| changed   | `discord/fix-answer.mts`                     | `discord/fix-answer.mts`                     | [`fix-answer.mts.diff`](./discord/fix-answer.mts.diff)                                       |
| identical | `discord/index.mts`                          | `discord/index.mts`                          | —                                                                                            |
| changed   | `discord/reaction.mts`                       | `discord/reaction.mts`                       | [`reaction.mts.diff`](./discord/reaction.mts.diff)                                           |
| changed   | `discord/send-poll-message.mts`              | `discord/send-poll-message.mts`              | [`send-poll-message.mts.diff`](./discord/send-poll-message.mts.diff)                         |
| changed   | `discord/update-poll-title.mts`              | `discord/update-poll-title.mts`              | [`update-poll-title.mts.diff`](./discord/update-poll-title.mts.diff)                         |
| changed   | `env.mts`                                    | `env.mts`                                    | [`env.mts.diff`](./env.mts.diff)                                                             |
| changed   | `firebase/config.mts`                        | `firebase/config.mts`                        | [`config.mts.diff`](./firebase/config.mts.diff)                                              |
| changed   | `firebase/firebase-api.mts`                  | `firebase/firebase-api.mts`                  | [`firebase-api.mts.diff`](./firebase/firebase-api.mts.diff)                                  |
| identical | `firebase/index.mts`                         | `firebase/index.mts`                         | —                                                                                            |
| identical | `firebase/initialize-firebase.mts`           | `firebase/initialize-firebase.mts`           | —                                                                                            |
| changed   | `functions/convert-rp30-args-to-rp-args.mts` | `functions/convert-rp30-args-to-rp-args.mts` | [`convert-rp30-args-to-rp-args.mts.diff`](./functions/convert-rp30-args-to-rp-args.mts.diff) |
| changed   | `functions/create-summary-message.mts`       | `functions/create-summary-message.mts`       | [`create-summary-message.mts.diff`](./functions/create-summary-message.mts.diff)             |
| changed   | `functions/create-summary-value.mts`         | `functions/create-summary-value.mts`         | [`create-summary-value.mts.diff`](./functions/create-summary-value.mts.diff)                 |
| changed   | `functions/create-title-string.mts`          | `functions/create-title-string.mts`          | [`create-title-string.mts.diff`](./functions/create-title-string.mts.diff)                   |
| identical | `functions/emoji-id-from-unicode.mts`        | `functions/emoji-id-from-unicode.mts`        | —                                                                                            |
| changed   | `functions/generate-groups.mts`              | `functions/generate-groups.mts`              | [`generate-groups.mts.diff`](./functions/generate-groups.mts.diff)                           |
| changed   | `functions/get-user-ids-from-answers.mts`    | `functions/get-user-ids-from-answers.mts`    | [`get-user-ids-from-answers.mts.diff`](./functions/get-user-ids-from-answers.mts.diff)       |
| identical | `functions/index.mts`                        | `functions/index.mts`                        | —                                                                                            |
| changed   | `functions/parse-command.mts`                | `functions/parse-command.mts`                | [`parse-command.mts.diff`](./functions/parse-command.mts.diff)                               |
| changed   | `functions/quote-if-space-included.mts`      | `functions/quote-if-space-included.mts`      | [`quote-if-space-included.mts.diff`](./functions/quote-if-space-included.mts.diff)           |
| changed   | `functions/remove-command-prefix.mts`        | `functions/remove-command-prefix.mts`        | [`remove-command-prefix.mts.diff`](./functions/remove-command-prefix.mts.diff)               |
| changed   | `functions/user-id-to-display-name.mts`      | `functions/user-id-to-display-name.mts`      | [`user-id-to-display-name.mts.diff`](./functions/user-id-to-display-name.mts.diff)           |
| changed   | `functions/user-id-to-mention.mts`           | `functions/user-id-to-mention.mts`           | [`user-id-to-mention.mts.diff`](./functions/user-id-to-mention.mts.diff)                     |
| removed   | `globals.d.ts`                               | —                                            | [`globals.d.ts.diff`](./globals.d.ts.diff)                                                   |
| changed   | `index.mts`                                  | `index.mts`                                  | [`index.mts.diff`](./index.mts.diff)                                                         |
| changed   | `log.mts`                                    | `log.mts`                                    | [`log.mts.diff`](./log.mts.diff)                                                             |
| changed   | `main.mts`                                   | `main.mts`                                   | [`main.mts.diff`](./main.mts.diff)                                                           |
| changed   | `types/answer-of-date.mts`                   | `types/answer-of-date.mts`                   | [`answer-of-date.mts.diff`](./types/answer-of-date.mts.diff)                                 |
| changed   | `types/branded-types.mts`                    | `types/branded-types.mts`                    | [`branded-types.mts.diff`](./types/branded-types.mts.diff)                                   |
| changed   | `types/database.mts`                         | `types/database.mts`                         | [`database.mts.diff`](./types/database.mts.diff)                                             |
| changed   | `types/date-option.mts`                      | `types/date-option.mts`                      | [`date-option.mts.diff`](./types/date-option.mts.diff)                                       |
| changed   | `types/group.mts`                            | `types/group.mts`                            | [`group.mts.diff`](./types/group.mts.diff)                                                   |
| identical | `types/index.mts`                            | `types/index.mts`                            | —                                                                                            |
| changed   | `types/poll.mts`                             | `types/poll.mts`                             | [`poll.mts.diff`](./types/poll.mts.diff)                                                     |
| changed   | `types/types.mts`                            | `types/types.mts`                            | [`types.mts.diff`](./types/types.mts.diff)                                                   |
| added     | —                                            | `utils/date-utils.mts`                       | [`date-utils.mts.diff`](./utils/date-utils.mts.diff)                                         |
| added     | —                                            | `utils/days-of-week.mts`                     | [`days-of-week.mts.diff`](./utils/days-of-week.mts.diff)                                     |
| added     | —                                            | `utils/index.mts`                            | [`index.mts.diff`](./utils/index.mts.diff)                                                   |
| added     | —                                            | `utils/map-optional.mts`                     | [`map-optional.mts.diff`](./utils/map-optional.mts.diff)                                     |
| added     | —                                            | `utils/match.mts`                            | [`match.mts.diff`](./utils/match.mts.diff)                                                   |
| added     | —                                            | `utils/noop.mts`                             | [`noop.mts.diff`](./utils/noop.mts.diff)                                                     |
| added     | —                                            | `utils/upper-alphabets.mts`                  | [`upper-alphabets.mts.diff`](./utils/upper-alphabets.mts.diff)                               |
