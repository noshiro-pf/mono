import type * as Discord from 'discord.js';
import { ChannelType } from 'discord.js';
import { type IMap, Result } from 'ts-data-forge';
import { triggerCommand } from '../constants.mjs';
import { firestoreApi } from '../firebase/index.mjs';
import {
  createTitleString,
  createUserIdToDisplayNameMap,
  getUserIdsFromAnswers,
  rpCreateSummaryMessage,
  rpParseCommand,
} from '../functions/index.mjs';
import { toCommandMessageId, type UserId } from '../types/index.mjs';
import { fetchMessagesById } from './fetch-messages-by-id.mjs';
import { fixAnswerAndUpdateMessage } from './fix-answer.mjs';

export const updatePollTitle = async (
  message: Discord.Message,
): Promise<Result<undefined, unknown>> => {
  if (message.author.bot) {
    return Result.ok(undefined);
  }

  if (
    !message.content.startsWith(`${triggerCommand.rp} `) &&
    !message.content.startsWith(`${triggerCommand.rp30} `) &&
    !message.content.startsWith(`${triggerCommand.rp60} `)
  ) {
    return Result.ok(undefined);
  }

  const [title] = rpParseCommand(message.content);

  if (title === undefined) {
    return Result.ok(undefined);
  }

  const pollIdResult = await firestoreApi.getPollIdByCommandMessageId(
    toCommandMessageId(message.id),
  );

  if (Result.isErr(pollIdResult)) {
    return pollIdResult;
  }

  const pollId = pollIdResult.value;

  if (pollId === undefined) {
    return Result.ok(undefined);
  }

  const pollResult = await firestoreApi.getPollById(pollId);

  if (Result.isErr(pollResult)) {
    return pollResult;
  }

  const poll = pollResult.value;

  if (poll === undefined) {
    return Result.ok(undefined);
  }

  const channel = message.channel;

  if (channel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${channel.type}) is not supported. (GuildText only)`,
    );
  }

  const [userIdToDisplayNameResult, messages]: readonly [
    Result<IMap<UserId, string>, string>,
    Discord.Collection<string, Discord.Message>,
  ] = await Promise.all([
    createUserIdToDisplayNameMap(
      message.guild,
      getUserIdsFromAnswers(poll.answers).toArray(),
    ),
    fetchMessagesById(
      (options) => channel.messages.fetch(options),
      // Unlike a refresh, a title edit also needs the title message. It is
      // fetched rather than edited by id so that a deleted one is skipped
      // instead of failing the edit.
      [
        pollId,
        poll.titleMessageId,
        ...poll.dateOptions.map((dateOption) => dateOption.id),
      ],
    ),
  ]);

  if (Result.isErr(userIdToDisplayNameResult)) {
    return userIdToDisplayNameResult;
  }

  const userIdToDisplayName = userIdToDisplayNameResult.value;

  const newPoll = { ...poll, title } as const;

  // `find` by id costs nothing next to the requests for a poll's few messages.
  const [updateSummaryMessageResult, updateTitleMessageResult] =
    await Promise.all([
      Result.fromPromise(
        messages
          .find((m) => m.id === pollId)
          ?.edit({
            embeds: [rpCreateSummaryMessage(newPoll, userIdToDisplayName)],
          }) ?? Promise.resolve(undefined),
      ),
      Result.fromPromise(
        messages
          .find((m) => m.id === poll.titleMessageId)
          ?.edit(createTitleString(title)) ?? Promise.resolve(undefined),
      ),
    ]);

  return Result.isErr(updateSummaryMessageResult)
    ? updateSummaryMessageResult
    : Result.isErr(updateTitleMessageResult)
      ? updateTitleMessageResult
      : // This edits the summary a second time and removes and re-adds its
        // refresh reaction, which wastes requests on every title edit. Its
        // setPoll is the only place the new title is saved, so a failure before
        // it, such as a deleted summary, leaves Firestore with the old title.
        fixAnswerAndUpdateMessage(messages, newPoll);
};
