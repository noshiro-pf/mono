import type * as Discord from 'discord.js';
import { ChannelType } from 'discord.js';
import { emojis, triggerCommand } from '../constants.mjs';
import { firestoreApi } from '../firebase/index.mjs';
import {
  convertRp30ArgToRpArgs,
  convertRp30dArgToRpArgs,
  convertRp60ArgToRpArgs,
  convertRp60dArgToRpArgs,
  createTitleString,
  generateGroups,
  gpCreateSummaryMessage,
  gpParseGroupingCommandArgument,
  gpParseRandCommandArgument,
  removeCommandPrefix,
  rpCreateSummaryMessage,
  rpParseCommand,
} from '../functions/index.mjs';
import {
  answerOfDateDefaultValue,
  toCommandMessageId,
  toDateOptionId,
  toPollId,
  toTimestamp,
  toTitleMessageId,
  type AnswerOfDate,
  type CommandMessageId,
  type DateOption,
  type DateOptionId,
  type Group,
  type Poll,
  type TitleMessageId,
  type UserId,
} from '../types/index.mjs';

const rpSendPollMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: Discord.GuildTextBasedChannel | Discord.TextBasedChannel,
  title: string,
  args: readonly string[],
): Promise<
  Result<
    Readonly<{
      dateOptions: readonly DateOption[];
      dateOptionMessageList: readonly Discord.Message[];
      summaryMessage: Discord.Message;
      titleMessageId: TitleMessageId;
    }>,
    unknown
  >
> => {
  if (messageChannel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${messageChannel.type}) is not supported. (GuildText only)`,
    );
  }

  const titleMessage = await messageChannel.send(createTitleString(title));
  const titleMessageId = toTitleMessageId(titleMessage.id);

  const mut_dateOptionAndMessageListTemp: (readonly [
    DateOption,
    Discord.Message,
  ])[] = [];

  for (const el of args) {
    // eslint-disable-next-line no-await-in-loop
    const result = await Result.fromPromise(messageChannel.send(el));

    if (Result.isErr(result)) return result;
    mut_dateOptionAndMessageListTemp.push([
      {
        label: el,
        id: toDateOptionId(result.value.id),
      },
      result.value,
    ]);
  }

  const dateOptionMessageList = mut_dateOptionAndMessageListTemp.map(
    ([, a]) => a,
  );
  const dateOptions = mut_dateOptionAndMessageListTemp.map(([a]) => a);

  const summaryMessageEmbed = rpCreateSummaryMessage(
    {
      id: toPollId(''),
      updatedAt: toTimestamp(DateUtils.now()),
      title,
      dateOptions,
      answers: IMap.new<DateOptionId, AnswerOfDate>(
        dateOptions.map((d) => tp(d.id, answerOfDateDefaultValue)),
      ),
      titleMessageId,
    },
    IMap.new<UserId, string>([]),
  );

  const summaryMessageInitResult = await Result.fromPromise(
    messageChannel.send({ embeds: [summaryMessageEmbed] }),
  );

  if (Result.isErr(summaryMessageInitResult)) return summaryMessageInitResult;
  const summaryMessageInit = summaryMessageInitResult.value;

  // memo: "（編集済）" という文字列が表示されてずれるのが操作性を若干損ねるので、
  // あえて一度メッセージを送った後再編集している
  const summaryMessageEditResult = await Result.fromPromise(
    summaryMessageInit.edit({ embeds: [summaryMessageEmbed] }),
  );

  if (Result.isErr(summaryMessageEditResult)) return summaryMessageEditResult;

  const summaryMessage = summaryMessageEditResult.value;

  const summaryMessageReactResult = await Result.fromPromise(
    summaryMessage.react(emojis.refresh.unicode),
  );

  if (Result.isErr(summaryMessageReactResult)) return summaryMessageReactResult;

  return Result.ok({
    titleMessageId,
    dateOptions,
    dateOptionMessageList,
    summaryMessage,
  });
};

const rpSendPollMessage = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  discordChannel: Discord.Message['channel'],
  messageId: CommandMessageId,
  title: string | undefined,
  pollOptions: readonly string[],
): Promise<Result<undefined, unknown>> => {
  if (title === undefined) return Result.ok(undefined);
  if (pollOptions.length === 0) return Result.ok(undefined);

  const replySubResult = await rpSendPollMessageSub(
    discordChannel,
    title,
    pollOptions,
  );
  if (Result.isErr(replySubResult)) return replySubResult;
  const { summaryMessage, dateOptions, dateOptionMessageList, titleMessageId } =
    replySubResult.value;

  const poll: Poll = {
    id: toPollId(summaryMessage.id),
    updatedAt: toTimestamp(summaryMessage.createdTimestamp),
    title,
    dateOptions,
    answers: IMap.new<DateOptionId, AnswerOfDate>(
      dateOptions.map((d) => tp(d.id, answerOfDateDefaultValue)),
    ),
    titleMessageId,
  };

  const [
    setPollResult,
    setPollIdForCommandMessageIdResult,
    setPollIdForDateOptionIdsResult,
  ] = await Promise.all([
    firestoreApi.setPoll(poll),
    firestoreApi.setPollIdForCommandMessageId(messageId, poll.id),
    firestoreApi.setPollIdForDateOptionIds(
      poll.dateOptions.map((p) => p.id),
      poll.id,
    ),
  ]);

  if (Result.isErr(setPollResult)) {
    return setPollResult;
  }
  if (Result.isErr(setPollIdForCommandMessageIdResult)) {
    return setPollIdForCommandMessageIdResult;
  }
  if (Result.isErr(setPollIdForDateOptionIdsResult)) {
    return setPollIdForDateOptionIdsResult;
  }

  await Promise.all(
    dateOptionMessageList.map((msg) => msg.react(emojis.good.unicode)),
  );
  await Promise.all(
    dateOptionMessageList.map((msg) => msg.react(emojis.fair.unicode)),
  );
  await Promise.all(
    dateOptionMessageList.map((msg) => msg.react(emojis.poor.unicode)),
  );

  return Result.ok(undefined);
};

const gpSendGroupingMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: Discord.GuildTextBasedChannel | Discord.TextBasedChannel,
  groups: readonly Group[],
): Promise<Result<undefined, unknown>> => {
  if (messageChannel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${messageChannel.type}) is not supported. (GuildText only)`,
    );
  }

  const summaryMessageResult = await Result.fromPromise(
    messageChannel.send({ embeds: [gpCreateSummaryMessage(groups)] }),
  );

  return Result.map(summaryMessageResult, () => undefined);
};

const gpSendRandMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: Discord.GuildTextBasedChannel | Discord.TextBasedChannel,
  n: number,
): Promise<Result<undefined, unknown>> => {
  if (messageChannel.type !== ChannelType.GuildText) {
    return Result.err(
      `This channel type (${messageChannel.type}) is not supported. (GuildText only)`,
    );
  }

  const summaryMessageResult = await Result.fromPromise(
    messageChannel.send(Math.ceil(Math.random() * n).toString()),
  );

  return Result.map(summaryMessageResult, () => undefined);
};

const gpSendGroupingMessage = async (
  messageFilled: Discord.Message,
): Promise<Result<undefined, unknown>> => {
  const parseResult = gpParseGroupingCommandArgument(
    removeCommandPrefix(messageFilled.content, triggerCommand.gp),
  );
  if (Result.isErr(parseResult)) return Result.ok(undefined);
  const [numGroups, nameList] = parseResult.value;

  if (nameList.length === 0) return Result.ok(undefined);
  if (nameList.length < numGroups) return Result.ok(undefined);

  const replySubResult = await gpSendGroupingMessageSub(
    messageFilled.channel,
    generateGroups(numGroups, nameList),
  );

  return replySubResult;
};

const gpSendRandMessage = async (
  messageFilled: Discord.Message,
): Promise<Result<undefined, unknown>> => {
  const parseResult = gpParseRandCommandArgument(
    removeCommandPrefix(messageFilled.content, triggerCommand.rand),
  );

  if (Result.isErr(parseResult)) return Result.ok(undefined);
  const n = parseResult.value;

  const replySubResult = await gpSendRandMessageSub(messageFilled.channel, n);

  return replySubResult;
};

export const sendMessageMain = async (
  message: Discord.Message,
): Promise<Result<undefined, unknown>> => {
  if (message.author.bot) return Result.ok(undefined);

  if (message.content.startsWith(`${triggerCommand.gp} `)) {
    return gpSendGroupingMessage(message);
  }

  if (message.content.startsWith(`${triggerCommand.rand} `)) {
    return gpSendRandMessage(message);
  }

  if (message.content.startsWith(`${triggerCommand.rp} `)) {
    const [title, ...args] = rpParseCommand(message.content);
    return rpSendPollMessage(
      message.channel,
      toCommandMessageId(message.id),
      title,
      args,
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp30} `)) {
    const res = convertRp30ArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp30),
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      message.channel,
      toCommandMessageId(message.id),
      res.value.title,
      res.value.args,
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp60} `)) {
    const res = convertRp60ArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp60),
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      message.channel,
      toCommandMessageId(message.id),
      res.value.title,
      res.value.args,
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp30d} `)) {
    const res = convertRp30dArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp30d),
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      message.channel,
      toCommandMessageId(message.id),
      res.value.title,
      res.value.args,
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp60d} `)) {
    const res = convertRp60dArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp60d),
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      message.channel,
      toCommandMessageId(message.id),
      res.value.title,
      res.value.args,
    );
  }

  return Result.ok(undefined);
};
