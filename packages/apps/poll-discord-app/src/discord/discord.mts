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

export const startDiscordListener = (discordClient: DiscordClient): void => {
  discordClient.on('messageReactionAdd', (reaction, user) => {
    (async () => {
      const reactionFilled: DiscordMessageReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

      const result = await onMessageReactionAdd(reactionFilled, user);

      if (Result.isErr(result)) {
        console.error('on messageReactionAdd error:', result);
      }
    })().catch(() => {});
  });

  discordClient.on('messageReactionRemove', (reaction, user) => {
    (async () => {
      const reactionFilled: DiscordMessageReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

      const result = await onMessageReactionRemove(reactionFilled, user);

      if (Result.isErr(result)) {
        console.error('on messageReactionRemove error:', result);
      }
    })().catch(() => {});
  });

  discordClient.on('messageUpdate', (_oldMessage, newMessage) => {
    (async () => {
      const newMessageFilled: DiscordMessage<boolean> = newMessage.partial
        ? await newMessage.fetch()
        : newMessage;

      const result = await updatePollTitle(newMessageFilled);

      if (Result.isErr(result)) {
        console.error('on message error:', result);
      }
    })().catch(() => {});
  });

  discordClient.on('messageCreate', (message) => {
    (async () => {
      const result = await sendMessageMain(message);

      if (Result.isErr(result)) {
        console.error('on message error:', result);
      }
    })().catch(() => {});
  });
};
