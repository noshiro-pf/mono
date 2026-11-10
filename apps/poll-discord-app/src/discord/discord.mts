import {
  ActivityType as DiscordActivityType,
  Client as DiscordClient,
  Partials as DiscordPartials,
  GatewayIntentBits,
  type Message as DiscordMessage,
  type MessageReaction as DiscordMessageReaction,
} from 'discord.js';
import { Result } from 'ts-data-forge';
import { triggerCommand } from '../constants.mjs';
import { DISCORD_TOKEN } from '../env.mjs';
import { isPartial } from './is-partial.mjs';
import { onMessageReactionAdd, onMessageReactionRemove } from './reaction.mjs';
import { runListener } from './run-listener.mjs';
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
        GatewayIntentBits.GuildExpressions,
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
    runListener('messageReactionAdd', async () => {
      const reactionFilled: DiscordMessageReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

      return onMessageReactionAdd(reactionFilled, user);
    });
  });

  discordClient.on('messageReactionRemove', (reaction, user) => {
    runListener('messageReactionRemove', async () => {
      const reactionFilled: DiscordMessageReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

      return onMessageReactionRemove(reactionFilled, user);
    });
  });

  discordClient.on('messageUpdate', (_oldMessage, newMessage) => {
    runListener('messageUpdate', async () => {
      const newMessageFilled: DiscordMessage<boolean> = isPartial(newMessage)
        ? await newMessage.fetch()
        : newMessage;

      return updatePollTitle(newMessageFilled);
    });
  });

  discordClient.on('messageCreate', (message) => {
    runListener('messageCreate', async () => sendMessageMain(message));
  });
};
