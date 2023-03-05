import { Result } from '@noshiro/ts-utils';
import {
  ActivityType as DiscordActivityType,
  Client as DiscordClient,
  GatewayIntentBits,
  Partials as DiscordPartials,
  type Message as DiscordMessage,
  type MessageReaction as DiscordMessageReaction,
} from 'discord.js';
import { triggerCommand } from '../constants';
import { DISCORD_TOKEN } from '../env';
import { type DatabaseRef, type PsqlClient } from '../types';
import { onMessageReactionAdd, onMessageReactionRemove } from './reaction';
import { sendMessageMain } from './send-poll-message';
import { updatePollTitle } from './update-poll-title';

export const initDiscordClient = (): Promise<Result<DiscordClient, unknown>> =>
  // eslint-disable-next-line promise/param-names
  new Promise((resolveAll) => {
    console.log('Initializing DiscordClient...');

    const discordClient = new DiscordClient({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        DiscordPartials.Message,
        DiscordPartials.Channel,
        DiscordPartials.Reaction,
      ],
    });

    Promise.all([
      new Promise<Result<undefined, unknown>>((resolve) => {
        try {
          const presence = discordClient.user?.setActivity({
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
          });

          if (presence === undefined) {
            resolve(Result.err(undefined));
          } else {
            resolve(Result.ok(undefined));
          }
        } catch (error) {
          resolve(Result.err(error));
        }
      }).then((result) => {
        console.log('DiscordClient initialization: ready.');
        return result;
      }),
      Result.fromPromise(discordClient.login(DISCORD_TOKEN)).then((result) => {
        console.log('DiscordClient initialization: logged in successfully.');
        return result;
      }),
    ])
      .then(([ready, login]) => {
        console.log('DiscordClient initialization completed.');
        if (Result.isErr(ready)) {
          resolveAll(Result.err(ready));
        } else {
          if (Result.isErr(login)) {
            resolveAll(Result.err(login));
          } else {
            resolveAll(Result.ok(discordClient));
          }
        }
      })
      .catch(() => {
        resolveAll(Result.err(undefined));
      });
  });

export const startDiscordListener = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  discordClient: DiscordClient,
  psqlClient: PsqlClient,
  databaseRef: DatabaseRef
): void => {
  discordClient.on('messageReactionAdd', async (reaction, user) => {
    const reactionFilled: DiscordMessageReaction = reaction.partial
      ? await reaction.fetch()
      : reaction;

    onMessageReactionAdd(databaseRef, psqlClient, reactionFilled, user)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on messageReactionAdd error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on('messageReactionRemove', async (reaction, user) => {
    const reactionFilled: DiscordMessageReaction = reaction.partial
      ? await reaction.fetch()
      : reaction;

    onMessageReactionRemove(databaseRef, psqlClient, reactionFilled, user)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on messageReactionRemove error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on('messageUpdate', async (_oldMessage, newMessage) => {
    const newMessageFilled: DiscordMessage<boolean> = newMessage.partial
      ? await newMessage.fetch()
      : newMessage;

    updatePollTitle(databaseRef, psqlClient, newMessageFilled)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on message error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on('messageCreate', (message) => {
    sendMessageMain(databaseRef, psqlClient, message)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on message error:', result);
        }
      })
      .catch(console.error);
  });
};
