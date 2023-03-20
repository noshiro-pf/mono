import { ISet, isNotUndefined, Obj, Result, Str, tp } from '@noshiro/ts-utils';
import type * as Discord from 'discord.js';
import { emojis } from '../constants';
import { firestoreApi } from '../firebase';
import {
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
} from '../functions';
import {
  toDateOptionId,
  toUserId,
  type DateOptionId,
  type Poll,
  type UserId,
} from '../types';

/**
 * @description reactions を取得して poll.answers を修復（データベースが壊れたときの保険）
 */
export const fixAnswerAndUpdateMessage = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messages: Discord.Collection<string, Discord.Message>,
  poll: Poll
): Promise<Result<undefined, string>> => {
  const pollMessage = messages.find((m) => m.id === poll.id);

  if (pollMessage === undefined) {
    return Result.err(`message with id ${poll.id} not found`);
  }

  // remove reaction stamp button
  await pollMessage.reactions.removeAll();

  const dateOptionMessages: readonly (readonly [
    DateOptionId,
    Discord.Message
  ])[] = poll.dateOptions
    .map((dateOption) =>
      tp(
        toDateOptionId(dateOption.id),
        messages.find((m) => m.id === dateOption.id)
      )
    )
    .filter((a): a is readonly [DateOptionId, Discord.Message] =>
      isNotUndefined(a[1])
    );

  const dateOptionMessagesFilled = await Promise.all(
    dateOptionMessages.map(([dateId, msg]) => tp(dateId, msg))
  );

  // TODO: flatMapにする
  const reactionsForThisPoll: DeepReadonly<
    [
      DateOptionId,
      {
        good: UserId[] | undefined;
        fair: UserId[] | undefined;
        poor: UserId[] | undefined;
      }
    ][]
  > = await Promise.all(
    dateOptionMessagesFilled.map(([dateId, msg]) =>
      Promise.all([
        msg.reactions
          .resolve(emojis.good.unicode)
          ?.users.fetch()
          .then((good) =>
            good.filter((u) => !u.bot).map((u) => toUserId(u.id))
          ),
        msg.reactions
          .resolve(emojis.fair.unicode)
          ?.users.fetch()
          .then((fair) =>
            fair.filter((u) => !u.bot).map((u) => toUserId(u.id))
          ),
        msg.reactions
          .resolve(emojis.poor.unicode)
          ?.users.fetch()
          .then((poor) =>
            poor.filter((u) => !u.bot).map((u) => toUserId(u.id))
          ),
      ]).then(([good, fair, poor]) =>
        tp(dateId, {
          good,
          fair,
          poor,
        })
      )
    )
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
  const newPollFilled: Poll = Obj.update(poll, 'answers', (answers) =>
    answers.withMutations(
      reactionsForThisPoll.map(([dateId, reactions]) => ({
        type: 'set',
        key: dateId,
        value: {
          good: ISet.new(reactions.good ?? []),
          fair: ISet.new(reactions.fair ?? []),
          poor: ISet.new(reactions.poor ?? []),
        },
      }))
    )
  );

  const userIdToDisplayNameResult = await createUserIdToDisplayNameMap(
    pollMessage.guild,
    getUserIdsFromAnswers(newPollFilled.answers).toArray()
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
      .then(() => undefined)
  );

  if (Result.isErr(editSummaryMessageResult)) {
    return Result.err(
      `editSummaryMessage in fixAnswerAndUpdateMessage failed: ${Str.from(
        editSummaryMessageResult.value
      )}`
    );
  }

  // restore reaction stamp button
  const addEmojiResult = await Result.fromPromise(
    pollMessage.react(emojis.refresh.unicode)
  );

  if (Result.isErr(addEmojiResult)) {
    return Result.err(
      `addEmoji in fixAnswerAndUpdateMessage failed: ${Str.from(
        addEmojiResult.value
      )}`
    );
  }

  return Result.ok(undefined);
};
