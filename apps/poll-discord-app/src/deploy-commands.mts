import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { Result } from 'ts-data-forge';
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from './env.mjs';

/**
 * Registers the slash commands to the guild `GUILD_ID` names.
 *
 * A guild command is available as soon as it is registered, unlike a global
 * one, which is why the prototype registers them per guild.
 */
export const deployCommands = async (): Promise<Result<unknown, unknown>> => {
  const rest = new REST({ version: '10' });

  rest.setToken(DISCORD_TOKEN);

  const result = await Result.fromPromise(
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    }),
  );

  if (Result.isOk(result)) {
    console.log('Successfully registered application commands.');
  }

  return result;
};

const slashCommand = (
  name: string,
  description: string,
): SlashCommandBuilder => {
  const builder = new SlashCommandBuilder();

  return builder.setName(name).setDescription(description);
};

const commands = [
  slashCommand('ping', 'Replies with pong!'),
  slashCommand('server', 'Replies with server info!'),
  slashCommand('user', 'Replies with user info!'),
  slashCommand('select', 'Replies with select!'),
  slashCommand('tag', 'Replies with Pong!').addStringOption((option) =>
    option
      .setName('autocomplete')
      .setDescription('Enter your choice')
      .setAutocomplete(true),
  ),
].map((command) => command.toJSON());
