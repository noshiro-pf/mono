import { REST } from '@discordjs/rest';
import { Routes, SlashCommandBuilder } from 'discord.js';
// eslint-disable-next-line import/no-internal-modules
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from './env';

export const deployCommands = (): void => {
  const commands = [
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with pong!'),
    new SlashCommandBuilder()
      .setName('server')
      .setDescription('Replies with server info!'),
    new SlashCommandBuilder()
      .setName('user')
      .setDescription('Replies with user info!'),

    new SlashCommandBuilder()
      .setName('select')
      .setDescription('Replies with select!'),

    new SlashCommandBuilder()
      .setName('tag')
      .setDescription('Replies with Pong!')
      .addStringOption((option) =>
        option
          .setName('autocomplete')
          .setDescription('Enter your choice')
          .setAutocomplete(true)
      ),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  rest
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    })
    .then(() => {
      console.log('Successfully registered application commands.');
    })
    .catch(console.error);
};
