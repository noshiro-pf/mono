import { Obj, Result, type IMap } from '@noshiro/ts-utils';
import type * as Discord from 'discord.js';
import { ChannelType } from 'discord.js';
import { triggerCommand } from '../constants';
import {
  createTitleString,
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
  rpParseCommand,
} from '../functions';
import {
  toCommandMessageId,
  type DatabaseRef,
  type PsqlClient,
  type UserId,
} from '../types';
import { fixAnswerAndUpdateMessage } from './fix-answer';

export const updatePollTitle = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  message: Discord.Message
): Promise<Result<undefined, unknown>> => {
  if (message.author.bot) return Result.ok(undefined);

  if (
    !message.content.startsWith(`${triggerCommand.rp} `) &&
    !message.content.startsWith(`${triggerCommand.rp30} `) &&
    !message.content.startsWith(`${triggerCommand.rp60} `)
  ) {
    return Result.ok(undefined);
  }

  const [title] = rpParseCommand(message.content);

  if (title === undefined) return Result.ok(undefined);

  const pollId = databaseRef.db.commandMessageIdToPollIdMap.get(
    toCommandMessageId(message.id)
  );
  if (pollId === undefined) return Result.ok(undefined);

  const poll = databaseRef.db.polls.get(pollId);
  if (poll === undefined) return Result.ok(undefined);

  const channel = message.channel;

  if (channel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${channel.type}) is not supported. (GuildText only)`
    );
  }

  const [userIdToDisplayNameResult, messages]: [
    Result<IMap<UserId, string>, string>,
    Discord.Collection<string, Discord.Message>
  ] = await Promise.all([
    createUserIdToDisplayNameMap(
      message.guild,
      getUserIdsFromAnswers(poll.answers).toArray()
    ),
    channel.messages.fetch({
      after: message.id,
    }),
  ]);

  if (Result.isErr(userIdToDisplayNameResult)) {
    return userIdToDisplayNameResult;
  }

  const userIdToDisplayName = userIdToDisplayNameResult.value;

  const newPoll = Obj.set(poll, 'title', title);

  const [updateSummaryMessageResult, updateTitleMessageResult] =
    await Promise.all([
      Result.fromPromise(
        messages
          .find((m) => m.id === pollId)
          ?.edit({
            embeds: [rpCreateSummaryMessage(newPoll, userIdToDisplayName)],
          }) ?? Promise.resolve(undefined)
      ),
      Result.fromPromise(
        messages
          .find((m) => m.id === poll.titleMessageId)
          ?.edit(createTitleString(title)) ?? Promise.resolve(undefined)
      ),
    ]);

  if (Result.isErr(updateSummaryMessageResult)) {
    return updateSummaryMessageResult;
  }
  if (Result.isErr(updateTitleMessageResult)) {
    return updateTitleMessageResult;
  }

  return fixAnswerAndUpdateMessage(databaseRef, psqlClient, messages, newPoll);
};
