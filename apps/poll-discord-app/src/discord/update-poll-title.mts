import type * as Discord from 'discord.js';
import { ChannelType } from 'discord.js';
import { Result } from 'ts-data-forge';
import { triggerCommand } from '../constants.mjs';
import { firestoreApi } from '../firebase/index.mjs';
import { createTitleString, rpParseCommand } from '../functions/index.mjs';
import { toCommandMessageId } from '../types/index.mjs';
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

  // Saved first and on its own, so that the title is kept whatever happens to
  // the messages below.
  const updateTitleResult = await firestoreApi.updatePollTitle(pollId, title);

  if (Result.isErr(updateTitleResult)) {
    return updateTitleResult;
  }

  const messages = await fetchMessagesById(
    (options) => channel.messages.fetch(options),
    // Unlike a refresh, a title edit also needs the title message. It is
    // fetched rather than edited by id so that a deleted one is skipped instead
    // of failing the edit.
    [
      pollId,
      poll.titleMessageId,
      ...poll.dateOptions.map((dateOption) => dateOption.id),
    ],
  );

  // `find` by id costs nothing next to the requests for a poll's few messages.
  // The summary is drawn once, by the repair, with the new title; nobody
  // pressed 🔄, so its reactions are left as they are.
  const [updateTitleMessageResult, fixAnswerResult] = await Promise.all([
    Result.fromPromise(
      messages
        .find((m) => m.id === poll.titleMessageId)
        ?.edit(createTitleString(title)) ?? Promise.resolve(undefined),
    ),
    fixAnswerAndUpdateMessage(
      messages,
      { ...poll, title },
      { resetRefreshReaction: false },
    ),
  ]);

  return Result.isErr(updateTitleMessageResult)
    ? updateTitleMessageResult
    : fixAnswerResult;
};
