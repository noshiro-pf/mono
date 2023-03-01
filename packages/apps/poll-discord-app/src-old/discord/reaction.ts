import type { MessageReaction, PartialUser, User } from 'discord.js';
import { emojis, numMessagesToFetch } from '../constants';
import {
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
} from '../functions';
import { updateVote } from '../in-memory-database';
import {
  createDateOptionId,
  createUserId,
  type AnswerType,
  type DatabaseRef,
  type Poll,
  type PsqlClient,
} from '../types';
import { fixAnswerAndUpdateMessage } from './fix-answer';

const onRefreshClick = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reactionFilled: MessageReaction
): Promise<Result<undefined, string>> => {
  const messages = await reactionFilled.message.channel.messages.fetch({
    after: reactionFilled.message.id,
    limit: numMessagesToFetch,
  });

  const poll: Poll | undefined = databaseRef.db.polls.get(
    reactionFilled.message.id
  );

  if (poll === undefined) return Result.err('poll not found');

  const fixAnswerAndUpdateMessageResult = await fixAnswerAndUpdateMessage(
    databaseRef,
    psqlClient,
    messages,
    poll
  );

  if (Result.isErr(fixAnswerAndUpdateMessageResult)) {
    return fixAnswerAndUpdateMessageResult;
  }

  const users = await reactionFilled.users.fetch();

  const result = await Promise.all(
    users
      .filter((u) => !u.bot)
      .map((u) => Result.fromPromise(reactionFilled.users.remove(u.id)))
  );

  if (result.some(Result.isErr)) {
    return Result.err(
      Result.unwrapThrow(
        Json.stringify(result.map((a) => a.value) as JSONValue, undefined, 2)
      )
    );
  }

  return Result.ok(undefined);
};

const onMessageReactCommon = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  action: Readonly<{
    type: 'add' | 'remove';
    value: AnswerType | 'refresh' | undefined;
  }>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: PartialUser | User
): Promise<Result<undefined, string>> => {
  if (user.bot) return Result.ok(undefined);
  if (action.value === undefined) return Result.ok(undefined);

  if (action.value === 'refresh') {
    if (action.type === 'add') {
      return onRefreshClick(databaseRef, psqlClient, reaction);
    }
    return Result.ok(undefined);
  }

  const dateOptionId = createDateOptionId(reaction.message.id);

  const [resultPollResult, messages] = await Promise.all([
    updateVote(databaseRef, psqlClient, dateOptionId, createUserId(user.id), {
      type: action.type,
      value: action.value,
    }),
    reaction.message.channel.messages.fetch({
      after: dateOptionId,
      limit: numMessagesToFetch,
    }),
  ]);

  if (Result.isErr(resultPollResult)) return resultPollResult;
  const resultPoll = resultPollResult.value;
  if (messages.size === 0) return Result.err('messages not found.');

  const userIdToDisplayNameResult = await createUserIdToDisplayNameMap(
    reaction.message.guild,
    getUserIdsFromAnswers(resultPoll.answers).toArray()
  );

  if (Result.isErr(userIdToDisplayNameResult)) {
    return userIdToDisplayNameResult;
  }

  const userIdToDisplayName = userIdToDisplayNameResult.value;

  const message = messages.find((m) => m.id === resultPoll.id);

  if (message === undefined) {
    return Result.err(`message with id ${resultPoll.id} not found`);
  }

  const result = await Result.fromPromise<undefined, string>(
    message
      .edit({
        embeds: [rpCreateSummaryMessage(resultPoll, userIdToDisplayName)],
      })
      .then(() => undefined)
  );

  return result;
};

const mapReactionEmojiNameToAnswerType = (
  reactionEmojiName: string
): AnswerType | 'refresh' | undefined =>
  match(reactionEmojiName, {
    [emojis.good.unicode]: 'good',
    [emojis.fair.unicode]: 'fair',
    [emojis.poor.unicode]: 'poor',
    [emojis.refresh.unicode]: 'refresh',
  });

export const onMessageReactionAdd = (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: PartialUser | User
): Promise<Result<undefined, unknown>> =>
  onMessageReactCommon(
    databaseRef,
    psqlClient,
    {
      type: 'add',
      value: mapOptional(reaction.emoji.name, mapReactionEmojiNameToAnswerType),
    },
    reaction,
    user
  );

export const onMessageReactionRemove = (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: PartialUser | User
): Promise<Result<undefined, unknown>> =>
  onMessageReactCommon(
    databaseRef,
    psqlClient,
    {
      type: 'remove',
      value: mapOptional(reaction.emoji.name, mapReactionEmojiNameToAnswerType),
    },
    reaction,
    user
  );
