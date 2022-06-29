// Require the necessary discord.js classes
import {
  ActionRowBuilder,
  Client,
  GatewayIntentBits,
  InteractionType,
  SelectMenuBuilder,
} from 'discord.js';
import { deployCommands } from './deploy-commands';
import { DISCORD_TOKEN } from './env';

export const main = (): void => {
  // Create a new client instance
  const mut_client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // When the client is ready, run this code (only once)
  mut_client.once('ready', () => {
    console.log('Discord Client is Ready!');
  });

  mut_client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isAutocomplete())
      return;

    switch (interaction.commandName) {
      case 'ping': {
        if (!interaction.isChatInputCommand()) return;
        await interaction.reply('Pong!');

        break;
      }

      case 'server': {
        if (!interaction.isChatInputCommand()) return;
        await interaction.reply(
          `Server name: ${interaction.guild?.name ?? ''}\nTotal members: ${
            interaction.guild?.memberCount ?? ''
          }`
        );

        break;
      }

      case 'user': {
        if (!interaction.isChatInputCommand()) return;
        await interaction.reply(
          `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
        );

        break;
      }

      case 'select': {
        if (!interaction.isChatInputCommand()) return;

        const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents(
          new SelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions(
              {
                label: 'Select me',
                description: 'This is a description',
                value: 'first_option',
              },
              {
                label: 'You can select me too',
                description: 'This is also a description',
                value: 'second_option',
              }
            )
        );

        await interaction.reply({ content: 'Pong!', components: [row] });

        break;
      }

      case 'tag': {
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete)
          return;

        const focusedValue = interaction.options.getFocused();
        const choices = ['faq', 'install', 'collection', 'promise', 'debug'];
        const filtered = choices.filter((choice) =>
          choice.startsWith(focusedValue)
        );
        await interaction.respond(
          castWritable(
            filtered.map((choice) => ({ name: choice, value: choice }))
          )
        );

        break;
      }
    }
  });

  // Login to Discord with your client's token
  mut_client.login(DISCORD_TOKEN).catch(noop);

  deployCommands();
};
