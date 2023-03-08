import { DateUtils, IMap, Result, tp } from '@noshiro/ts-utils';
import {
  type DMChannel,
  type Message,
  type NewsChannel,
  type TextChannel,
} from 'discord.js';
import { emojis, triggerCommand } from '../constants';
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
} from '../functions';
import { addPoll } from '../in-memory-database';
import {
  answerOfDateDefaultValue,
  createCommandMessageId,
  createDateOptionId,
  createPollId,
  createTimestamp,
  createTitleMessageId,
  type AnswerOfDate,
  type DatabaseRef,
  type DateOption,
  type DateOptionId,
  type Group,
  type PsqlClient,
  type TitleMessageId,
  type UserId,
} from '../types';

const rpSendPollMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: DMChannel | NewsChannel | TextChannel,
  title: string,
  args: readonly string[]
): Promise<
  Result<
    Readonly<{
      dateOptions: readonly DateOption[];
      dateOptionMessageList: readonly Message[];
      summaryMessage: Message;
      titleMessageId: TitleMessageId;
    }>,
    unknown
  >
> => {
  const titleMessage = await messageChannel.send(createTitleString(title));
  const titleMessageId = createTitleMessageId(titleMessage.id);

  const mut_dateOptionAndMessageListTemp: (readonly [DateOption, Message])[] =
    [];

  for (const el of args) {
    // eslint-disable-next-line no-await-in-loop
    const result = await Result.fromPromise(messageChannel.send(el));

    if (Result.isErr(result)) return result;
    mut_dateOptionAndMessageListTemp.push([
      {
        label: el,
        id: createDateOptionId(result.value.id),
      },
      result.value,
    ]);
  }

  const dateOptionMessageList = mut_dateOptionAndMessageListTemp.map(
    ([, a]) => a
  );
  const dateOptions = mut_dateOptionAndMessageListTemp.map(([a]) => a);

  const summaryMessageEmbed = rpCreateSummaryMessage(
    {
      id: createPollId(''),
      updatedAt: createTimestamp(DateUtils.now()),
      title,
      dateOptions,
      answers: IMap.new<DateOptionId, AnswerOfDate>(
        dateOptions.map((d) => tp(d.id, answerOfDateDefaultValue))
      ),
      titleMessageId,
    },
    IMap.new<UserId, string>([])
  );

  const summaryMessageInitResult = await Result.fromPromise(
    messageChannel.send(summaryMessageEmbed)
  );

  if (Result.isErr(summaryMessageInitResult)) return summaryMessageInitResult;
  const summaryMessageInit = summaryMessageInitResult.value;

  // memo: "（編集済）" という文字列が表示されてずれるのが操作性を若干損ねるので、
  // あえて一度メッセージを送った後再編集している
  const summaryMessageEditResult = await Result.fromPromise(
    summaryMessageInit.edit(summaryMessageEmbed)
  );

  if (Result.isErr(summaryMessageEditResult)) return summaryMessageEditResult;

  const summaryMessage = summaryMessageEditResult.value;

  const summaryMessageReactResult = await Result.fromPromise(
    summaryMessage.react(emojis.refresh.unicode)
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
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  discordChannel: Message['channel'],
  messageId: string,
  title: string | undefined,
  pollOptions: readonly string[]
): Promise<Result<undefined, unknown>> => {
  if (title === undefined) return Result.ok(undefined);
  if (pollOptions.length === 0) return Result.ok(undefined);

  const replySubResult = await rpSendPollMessageSub(
    discordChannel,
    title,
    pollOptions
  );
  if (Result.isErr(replySubResult)) return replySubResult;
  const { summaryMessage, dateOptions, dateOptionMessageList, titleMessageId } =
    replySubResult.value;

  const addPollResult = await addPoll(
    databaseRef,
    psqlClient,
    {
      id: createPollId(summaryMessage.id),
      updatedAt: createTimestamp(summaryMessage.createdTimestamp),
      title,
      dateOptions,
      answers: IMap.new<DateOptionId, AnswerOfDate>(
        dateOptions.map((d) => tp(d.id, answerOfDateDefaultValue))
      ),
      titleMessageId,
    },
    createCommandMessageId(messageId)
  );

  await Promise.all(
    dateOptionMessageList.map(async (msg) => {
      await msg.react(emojis.good.unicode);
      await msg.react(emojis.fair.unicode);
      await msg.react(emojis.poor.unicode);
    })
  );

  return addPollResult;
};

const gpSendGroupingMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: DMChannel | NewsChannel | TextChannel,
  groups: readonly Group[]
): Promise<Result<undefined, unknown>> => {
  const summaryMessageResult = await Result.fromPromise(
    messageChannel.send(gpCreateSummaryMessage(groups))
  );

  return Result.map(() => undefined)(summaryMessageResult);
};

const gpSendRandMessageSub = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageChannel: DMChannel | NewsChannel | TextChannel,
  n: number
): Promise<Result<undefined, unknown>> => {
  const summaryMessageResult = await Result.fromPromise(
    messageChannel.send(Math.ceil(Math.random() * n))
  );

  return Result.map(() => undefined)(summaryMessageResult);
};

const gpSendGroupingMessage = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageFilled: Message
): Promise<Result<undefined, unknown>> => {
  const parseResult = gpParseGroupingCommandArgument(
    removeCommandPrefix(messageFilled.content, triggerCommand.gp)
  );
  if (Result.isErr(parseResult)) return Result.ok(undefined);
  const [numGroups, nameList] = parseResult.value;

  if (nameList.length === 0) return Result.ok(undefined);
  if (nameList.length < numGroups) return Result.ok(undefined);

  const replySubResult = await gpSendGroupingMessageSub(
    messageFilled.channel,
    generateGroups(numGroups, nameList)
  );

  return replySubResult;
};

const gpSendRandMessage = async (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  messageFilled: Message
): Promise<Result<undefined, unknown>> => {
  const parseResult = gpParseRandCommandArgument(
    removeCommandPrefix(messageFilled.content, triggerCommand.rand)
  );

  if (Result.isErr(parseResult)) return Result.ok(undefined);
  const n = parseResult.value;

  const replySubResult = await gpSendRandMessageSub(messageFilled.channel, n);

  return replySubResult;
};

export const sendMessageMain = async (
  databaseRef: DatabaseRef,
  psqlClient: PsqlClient,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  message: Message
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
      databaseRef,
      psqlClient,
      message.channel,
      message.id,
      title,
      args
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp30} `)) {
    const res = convertRp30ArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp30)
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      databaseRef,
      psqlClient,
      message.channel,
      message.id,
      res.value.title,
      res.value.args
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp60} `)) {
    const res = convertRp60ArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp60)
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      databaseRef,
      psqlClient,
      message.channel,
      message.id,
      res.value.title,
      res.value.args
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp30d} `)) {
    const res = convertRp30dArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp30d)
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      databaseRef,
      psqlClient,
      message.channel,
      message.id,
      res.value.title,
      res.value.args
    );
  }

  if (message.content.startsWith(`${triggerCommand.rp60d} `)) {
    const res = convertRp60dArgToRpArgs(
      removeCommandPrefix(message.content, triggerCommand.rp60d)
    );

    if (Result.isErr(res)) return res;

    return rpSendPollMessage(
      databaseRef,
      psqlClient,
      message.channel,
      message.id,
      res.value.title,
      res.value.args
    );
  }

  return Result.ok(undefined);
};
