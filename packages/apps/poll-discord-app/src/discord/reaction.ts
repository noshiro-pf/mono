import { match, Result } from '@noshiro/ts-utils';
import type * as Discord from 'discord.js';
import { ChannelType } from 'discord.js';
import { emojis } from '../constants';
import { firestoreApi } from '../firebase';
import {
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
} from '../functions';
import { toDateOptionId, toPollId, toUserId, type AnswerType } from '../types';
import { fixAnswerAndUpdateMessage } from './fix-answer';

const onRefreshClick = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reactionFilled: Discord.MessageReaction
): Promise<Result<undefined, string>> => {
  const channel = reactionFilled.message.channel;

  if (channel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${channel.type}) is not supported. (GuildText only)`
    );
  }

  const messages = await channel.messages.fetch({
    around: reactionFilled.message.id,
  });

  const pollResult = await firestoreApi.getPollById(
    toPollId(reactionFilled.message.id)
  );

  if (Result.isErr(pollResult)) return pollResult;

  const poll = pollResult.value;

  if (poll === undefined) return Result.err('poll not found');

  const fixAnswerAndUpdateMessageResult = await fixAnswerAndUpdateMessage(
    messages,
    poll
  );

  if (Result.isErr(fixAnswerAndUpdateMessageResult)) {
    return fixAnswerAndUpdateMessageResult;
  }

  return Result.ok(undefined);
};

const onMessageReactCommon = async (
  action: Readonly<{
    type: 'add' | 'remove';
    value: AnswerType | 'refresh' | undefined;
  }>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: Discord.MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: Discord.PartialUser | Discord.User
): Promise<Result<undefined, unknown>> => {
  if (user.bot) return Result.ok(undefined);
  if (action.value === undefined) return Result.ok(undefined);

  if (action.value === 'refresh') {
    if (action.type === 'add') {
      return onRefreshClick(reaction);
    }
    return Result.ok(undefined);
  }

  const dateOptionId = toDateOptionId(reaction.message.id);

  const channel = reaction.message.channel;
  if (channel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type "${channel.type}" is not supported. ("GuildText" only)`
    );
  }

  const pollIdResult = await firestoreApi.getPollIdByDateOptionId(dateOptionId);

  if (Result.isErr(pollIdResult)) return pollIdResult;

  const pollId = pollIdResult.value;

  if (pollId === undefined) {
    return Result.err(
      `pollId for dateOptionId "${dateOptionId}" doesn't exist in firestore`
    );
  }

  const [updateMessageReactionResult, updatePollUpdatedAtResult, messages]: [
    Result<void, string>,
    Result<void, string>,
    Discord.Collection<string, Discord.Message>
  ] = await Promise.all([
    firestoreApi.updateMessageReaction(
      pollId,
      dateOptionId,
      action.value,
      toUserId(user.id),
      action.type
    ),
    firestoreApi.updatePollUpdatedAt(pollId),
    channel.messages.fetch({
      after: dateOptionId,
    }),
  ]);

  if (messages.size === 0) return Result.err('messages not found.');

  if (Result.isErr(updateMessageReactionResult)) {
    return updateMessageReactionResult;
  }

  if (Result.isErr(updatePollUpdatedAtResult)) {
    return updatePollUpdatedAtResult;
  }

  const resultPollResult = await firestoreApi.getPollById(pollId);

  if (Result.isErr(resultPollResult)) {
    return resultPollResult;
  }
  const resultPoll = resultPollResult.value;

  if (resultPoll === undefined) {
    return Result.err(`poll of id "${pollId}" doesn't exist in firestore`);
  }

  const userIdToDisplayNameResult = await createUserIdToDisplayNameMap(
    reaction.message.guild,
    getUserIdsFromAnswers(resultPoll.answers).toArray()
  );

  if (Result.isErr(userIdToDisplayNameResult)) {
    return userIdToDisplayNameResult;
  }

  const userIdToDisplayName = userIdToDisplayNameResult.value;

  const message: Discord.Message | undefined = messages.find(
    (m) => m.id === resultPoll.id
  );

  if (message === undefined) {
    return Result.err(`message with id ${resultPoll.id} not found`);
  }

  const result = await Result.fromPromise(
    message
      .edit({
        embeds: [rpCreateSummaryMessage(resultPoll, userIdToDisplayName)],
      })
      .then(() => undefined)
  );

  return result;
};

const mapReactionEmojiNameToAnswerType = (
  reactionEmojiName: string | null
): AnswerType | 'refresh' | undefined =>
  match(reactionEmojiName ?? '', {
    [emojis.good.unicode]: 'good',
    [emojis.fair.unicode]: 'fair',
    [emojis.poor.unicode]: 'poor',
    [emojis.refresh.unicode]: 'refresh',
  });

export const onMessageReactionAdd = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: Discord.MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: Discord.PartialUser | Discord.User
): Promise<Result<undefined, unknown>> =>
  onMessageReactCommon(
    {
      type: 'add',
      value: mapReactionEmojiNameToAnswerType(reaction.emoji.name),
    },
    reaction,
    user
  );

export const onMessageReactionRemove = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  reaction: Discord.MessageReaction,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  user: Discord.PartialUser | Discord.User
): Promise<Result<undefined, unknown>> =>
  onMessageReactCommon(
    {
      type: 'remove',
      value: mapReactionEmojiNameToAnswerType(reaction.emoji.name),
    },
    reaction,
    user
  );
