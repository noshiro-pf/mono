import type * as Discord from 'discord.js';
import { ISet, Result, tp, unknownToString } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { emojis } from '../constants.mjs';
import { firestoreApi } from '../firebase/index.mjs';
import {
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
} from '../functions/index.mjs';
import {
  toDateOptionId,
  toUserId,
  type DateOptionId,
  type Poll,
  type UserId,
} from '../types/index.mjs';
import { fetchAllReactionUsers } from './fetch-reaction-users.mjs';

/**
 * Reactions を取得して poll.answers を修復（データベースが壊れたときの保険）し、
 * `poll` を保存してサマリーを一度だけ描き直す。
 *
 * `resetRefreshReaction` のとき（🔄 による修復）は、修復が保存と描画まで済んだ後
 * にだけサマリーのリアクションを外して 🔄 を付け直す。途中で失敗したときは押された
 * 🔄 が残るので、もう一度修復を試せる。
 */
export const fixAnswerAndUpdateMessage = async (
  mut_messages: Discord.Collection<string, Discord.Message>,
  poll: Poll,
  { resetRefreshReaction }: Readonly<{ resetRefreshReaction: boolean }>,
): Promise<Result<undefined, string>> => {
  const pollMessage = mut_messages.find((m) => m.id === poll.id);

  if (pollMessage === undefined) {
    return Result.err(`message with id ${poll.id} not found`);
  }

  const dateOptionMessages: readonly (readonly [
    DateOptionId,
    Discord.Message,
  ])[] = poll.dateOptions
    .map((dateOption) =>
      tp(
        toDateOptionId(dateOption.id),
        mut_messages.find((m) => m.id === dateOption.id),
      ),
    )
    .filter(
      (a): a is readonly [DateOptionId, Discord.Message] => a[1] !== undefined,
    );

  const dateOptionMessagesFilled = dateOptionMessages.map(([dateId, msg]) =>
    tp(dateId, msg),
  );

  // TODO: flatMapにする
  const reactionsForThisPoll: DeepReadonly<
    [
      DateOptionId,
      {
        good: UserId[] | undefined;
        fair: UserId[] | undefined;
        poor: UserId[] | undefined;
      },
    ][]
  > = await Promise.all(
    dateOptionMessagesFilled.map(([dateId, msg]) =>
      Promise.all([
        reactingUserIds(msg, emojis.good.unicode),
        reactingUserIds(msg, emojis.fair.unicode),
        reactingUserIds(msg, emojis.poor.unicode),
      ]).then(([good, fair, poor]) =>
        tp(dateId, {
          good,
          fair,
          poor,
        }),
      ),
    ),
  );

  /*
    [
      [
        "868749175842553877",
        {
          "good": ["623145801702440983"],
          "fair": ["623145801702440983"],
          "poor": ["623145801702440983"]
        }
      ],
      [
        "868749176924696606",
        {
          "good": [],
          "fair": ["623145801702440983"],
          "poor": ["623145801702440983"]
        }
      ],
      [
        "868749177868398622",
        {
          "good": ["623145801702440983"],
          "fair": ["623145801702440983"],
          "poor": ["623145801702440983"]
        }
      ]
    ]
  */
  const newPollFilled: Poll = {
    ...poll,
    answers: poll.answers.withMutations(
      reactionsForThisPoll.map(([dateId, reactions]) => ({
        type: 'set',
        key: dateId,
        value: {
          good: ISet.create(reactions.good ?? []),
          fair: ISet.create(reactions.fair ?? []),
          poor: ISet.create(reactions.poor ?? []),
        },
      })),
    ),
  } as const;

  const userIdToDisplayNameResult = await createUserIdToDisplayNameMap(
    pollMessage.guild,
    getUserIdsFromAnswers(newPollFilled.answers).toArray(),
  );

  if (Result.isErr(userIdToDisplayNameResult)) {
    return userIdToDisplayNameResult;
  }

  const userIdToDisplayName = userIdToDisplayNameResult.value;

  const setPollResult = await firestoreApi.setPoll(newPollFilled);

  if (Result.isErr(setPollResult)) {
    return setPollResult;
  }

  const editSummaryMessageResult = await Result.fromPromise(
    pollMessage
      .edit({
        embeds: [rpCreateSummaryMessage(newPollFilled, userIdToDisplayName)],
      })
      .then(() => undefined),
  );

  if (Result.isErr(editSummaryMessageResult)) {
    return Result.err(
      `editSummaryMessage in fixAnswerAndUpdateMessage failed: ${unknownToString(
        editSummaryMessageResult.value,
      )}`,
    );
  }

  if (!resetRefreshReaction) {
    return Result.ok(undefined);
  }

  // Clear the 🔄 that was pressed, and put the bot's back.
  const removeAllResult = await Result.fromPromise(
    pollMessage.reactions.removeAll(),
  );

  if (Result.isErr(removeAllResult)) {
    return Result.err(
      `removeAll in fixAnswerAndUpdateMessage failed: ${unknownToString(
        removeAllResult.value,
      )}`,
    );
  }

  const addEmojiResult = await Result.fromPromise(
    pollMessage.react(emojis.refresh.unicode),
  );

  if (Result.isErr(addEmojiResult)) {
    return Result.err(
      `addEmoji in fixAnswerAndUpdateMessage failed: ${unknownToString(
        addEmojiResult.value,
      )}`,
    );
  }

  return Result.ok(undefined);
};

/**
 * The ids of the users other than bots who reacted to `message` with `emoji`,
 * every page of them, or `undefined` for a reaction nobody added.
 */
const reactingUserIds = async (
  message: Discord.Message,
  emoji: string,
): Promise<readonly UserId[] | undefined> => {
  const reaction = message.reactions.resolve(emoji);

  if (reaction === null) {
    return undefined;
  }

  const users = await fetchAllReactionUsers((options) =>
    reaction.users.fetch(options),
  );

  return users.filter((u) => !u.bot).map((u) => toUserId(u.id));
};
