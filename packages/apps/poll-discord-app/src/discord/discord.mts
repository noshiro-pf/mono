import {
  ActivityType as DiscordActivityType,
  Client as DiscordClient,
  Partials as DiscordPartials,
  GatewayIntentBits,
  type Message as DiscordMessage,
  type MessageReaction as DiscordMessageReaction,
} from 'discord.js';
import { triggerCommand } from '../constants.mjs';
import { DISCORD_TOKEN } from '../env.mjs';
import { onMessageReactionAdd, onMessageReactionRemove } from './reaction.mjs';
import { sendMessageMain } from './send-poll-message.mjs';
import { updatePollTitle } from './update-poll-title.mjs';

export const initDiscordClient = async (): Promise<
  Result<DiscordClient, unknown>
> => {
  try {
    const discordClient = new DiscordClient({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
      ],
      partials: [
        DiscordPartials.Message,
        DiscordPartials.Channel,
        DiscordPartials.Reaction,
      ],
    });

    const login = await Result.fromPromise(discordClient.login(DISCORD_TOKEN));

    if (Result.isErr(login)) {
      return Result.err(login);
    }

    if (discordClient.user === null) {
      return Result.err("discordClient.user doesn't exist");
    }

    discordClient.user.setPresence({
      activities: [
        {
          name: [
            triggerCommand.rp30,
            triggerCommand.rp60,
            triggerCommand.rp30d,
            triggerCommand.rp60d,
            triggerCommand.rp,
            triggerCommand.gp,
            triggerCommand.rand,
          ].join(','),
          type: DiscordActivityType.Playing,
        },
      ],
    });

    return Result.ok(discordClient);
  } catch (error) {
    return Result.err(error);
  }
};

export const startDiscordListener = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  discordClient: DiscordClient,
): void => {
  discordClient.on('messageReactionAdd', async (reaction, user) => {
    const reactionFilled: DiscordMessageReaction = reaction.partial
      ? await reaction.fetch()
      : reaction;

    const result = await onMessageReactionAdd(reactionFilled, user);

    if (Result.isErr(result)) {
      console.error('on messageReactionAdd error:', result);
    }
  });

  discordClient.on('messageReactionRemove', async (reaction, user) => {
    const reactionFilled: DiscordMessageReaction = reaction.partial
      ? await reaction.fetch()
      : reaction;

    const result = await onMessageReactionRemove(reactionFilled, user);

    if (Result.isErr(result)) {
      console.error('on messageReactionRemove error:', result);
    }
  });

  discordClient.on('messageUpdate', async (_oldMessage, newMessage) => {
    const newMessageFilled: DiscordMessage<boolean> = newMessage.partial
      ? await newMessage.fetch()
      : newMessage;

    const result = await updatePollTitle(newMessageFilled);

    if (Result.isErr(result)) {
      console.error('on message error:', result);
    }
  });

  discordClient.on('messageCreate', async (message) => {
    const result = await sendMessageMain(message);

    if (Result.isErr(result)) {
      console.error('on message error:', result);
    }
  });
};
