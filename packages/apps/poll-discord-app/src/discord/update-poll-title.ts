import type { Message, PartialMessage } from 'discord.js';
import { triggerCommand } from '../constants';
import {
  createTitleString,
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
  rpParseCommand,
} from '../functions';
import type { DatabaseRef, PsqlClient } from '../types';
import { createCommandMessageId } from '../types';
import { fixAnswerAndUpdateMessage } from './fix-answer';

export const updatePollTitle = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  message: Message | PartialMessage
): Promise<Result<undefined, unknown>> => {
  const messageFilled = message.partial ? await message.fetch() : message;

  if (messageFilled.author.bot) return Result.ok(undefined);

  if (
    !messageFilled.content.startsWith(`${triggerCommand.rp} `) &&
    !messageFilled.content.startsWith(`${triggerCommand.rp30t} `) &&
    !messageFilled.content.startsWith(`${triggerCommand.rp60t} `)
  ) {
    return Result.ok(undefined);
  }

  const [title] = rpParseCommand(messageFilled.content);

  if (title === undefined) return Result.ok(undefined);

  const pollId = databaseRef.db.commandMessageIdToPollIdMap.get(
    createCommandMessageId(messageFilled.id)
  );
  if (pollId === undefined) return Result.ok(undefined);

  const poll = databaseRef.db.polls.get(pollId);
  if (poll === undefined) return Result.ok(undefined);

  const [userIdToDisplayNameResult, messages] = await Promise.all([
    createUserIdToDisplayNameMap(
      messageFilled.guild,
      getUserIdsFromAnswers(poll.answers).toArray()
    ),
    messageFilled.channel.messages.fetch({
      after: messageFilled.id,
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
