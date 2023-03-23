import { initDiscordClient, startDiscordListener } from './discord';

export const main = async (): Promise<Result<unknown, unknown>> => {
  console.log('Starting...');

  console.log('Initializing DiscordClient...');
  const discordClientResult = await initDiscordClient();

  if (Result.isErr(discordClientResult)) {
    console.error('initDiscordClient failed.', discordClientResult.value);
    return discordClientResult;
  }

  const discordClient = discordClientResult.value;
  console.log('Discord client is ready!');

  startDiscordListener(discordClient);

  return Result.ok(undefined);
};
