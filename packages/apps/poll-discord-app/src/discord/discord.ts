import { Client as DiscordClient, Intents } from 'discord.js';
import { triggerCommand } from '../constants';
import { DISCORD_TOKEN } from '../env';
import type { DatabaseRef, PsqlClient } from '../types';
import { onMessageReactionAdd, onMessageReactionRemove } from './reaction';
import { sendMessageMain } from './send-poll-message';
import { updatePollTitle } from './update-poll-title';

export const initDiscordClient = (): Promise<Result<DiscordClient, unknown>> =>
  // eslint-disable-next-line promise/param-names
  new Promise((resolveAll) => {
    const discordClient = new DiscordClient({
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
      intents: [Intents.FLAGS.GUILDS],
    });

    Promise.all([
      new Promise<Result<undefined, unknown>>((resolve) => {
        discordClient.once('ready', () => {
          try {
            discordClient.user?.setActivity({
              name: [
                triggerCommand.rp30t,
                triggerCommand.rp60t,
                triggerCommand.rp30,
                triggerCommand.rp60,
                triggerCommand.rp,
                triggerCommand.gp,
                triggerCommand.rand,
              ].join(','),
              type: 'PLAYING',
            });

            resolve(Result.ok(undefined));
          } catch (error) {
            resolve(Result.err(error));
          }
        });
      }),
      Result.fromPromise(discordClient.login(DISCORD_TOKEN)),
    ])
      .then(([ready, login]) => {
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
  discordClient.on('messageReactionAdd', async (mayBePartialReaction, user) => {
    const reaction = mayBePartialReaction.partial
      ? await mayBePartialReaction.fetch()
      : mayBePartialReaction;

    onMessageReactionAdd(databaseRef, psqlClient, reaction, user)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on messageReactionAdd error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on(
    'messageReactionRemove',
    async (mayBePartialReaction, user) => {
      const reaction = mayBePartialReaction.partial
        ? await mayBePartialReaction.fetch()
        : mayBePartialReaction;

      onMessageReactionRemove(databaseRef, psqlClient, reaction, user)
        .then((result) => {
          if (Result.isErr(result)) {
            console.error('on messageReactionRemove error:', result);
          }
        })
        .catch(console.error);
    }
  );

  discordClient.on('messageUpdate', (_oldMessage, newMessage) => {
    updatePollTitle(databaseRef, psqlClient, newMessage)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on message error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on('message', (message) => {
    sendMessageMain(databaseRef, psqlClient, message)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on message error:', result);
        }
      })
      .catch(console.error);
  });
};