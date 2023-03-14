import { Result } from '@noshiro/ts-utils';
import { Client as DiscordClient } from 'discord.js';
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
      partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    });

    Promise.all([
      new Promise<Result<undefined, unknown>>((resolve) => {
        discordClient.once('ready', () => {
          discordClient.user
            ?.setActivity({
              name: [
                triggerCommand.rp30,
                triggerCommand.rp60,
                triggerCommand.rp30d,
                triggerCommand.rp60d,
                triggerCommand.rp,
                triggerCommand.gp,
                triggerCommand.rand,
              ].join(','),
              type: 'PLAYING',
            })
            .then(() => {
              resolve(Result.ok(undefined));
            })
            .catch((error) => {
              resolve(Result.err(error));
            });
        });
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
  discordClient.on('messageReactionAdd', (reaction, user) => {
    onMessageReactionAdd(databaseRef, psqlClient, reaction, user)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on messageReactionAdd error:', result);
        }
      })
      .catch(console.error);
  });

  discordClient.on('messageReactionRemove', (reaction, user) => {
    onMessageReactionRemove(databaseRef, psqlClient, reaction, user)
      .then((result) => {
        if (Result.isErr(result)) {
          console.error('on messageReactionRemove error:', result);
        }
      })
      .catch(console.error);
  });

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
