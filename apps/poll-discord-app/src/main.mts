import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  StringSelectMenuBuilder,
  type Interaction,
} from 'discord.js';
import { Result } from 'ts-data-forge';
import { deployCommands } from './deploy-commands.mjs';
import { DISCORD_TOKEN } from './env.mjs';

/**
 * The rewrite on slash commands, a work in progress: it answers the sample
 * commands `deploy-commands.mts` registers and nothing else yet. The text
 * commands (`/rp`, `/gp`, `/rand` and the rest) are still the implementation in
 * `src-old/`.
 */
export const main = async (): Promise<Result<unknown, unknown>> => {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log('Discord Client is Ready!');
  });

  client.on(Events.InteractionCreate, (interaction) => {
    onInteractionCreate(interaction).catch((error: unknown) => {
      console.error('on interactionCreate threw:', error);
    });
  });

  const login = await Result.fromPromise(client.login(DISCORD_TOKEN));

  if (Result.isErr(login)) {
    console.error('login failed.', login.value);

    return login;
  }

  return deployCommands();
};

const onInteractionCreate = async (interaction: Interaction): Promise<void> => {
  if (interaction.isAutocomplete()) {
    if (interaction.commandName !== 'tag') {
      return;
    }

    const focusedValue = interaction.options.getFocused();

    const choices = [
      'faq',
      'install',
      'collection',
      'promise',
      'debug',
    ] as const;

    await interaction.respond(
      choices
        .filter((choice) => choice.startsWith(focusedValue))
        .map((choice) => ({ name: choice, value: choice })),
    );

    return;
  }

  if (!interaction.isChatInputCommand()) {
    return;
  }

  switch (interaction.commandName) {
    case 'ping':
      await interaction.reply('Pong!');

      break;

    case 'server':
      await interaction.reply(
        `Server name: ${interaction.guild?.name ?? ''}\nTotal members: ${
          interaction.guild?.memberCount ?? ''
        }`,
      );

      break;

    case 'user':
      await interaction.reply(
        `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`,
      );

      break;

    case 'select': {
      const menu = new StringSelectMenuBuilder();

      menu.setCustomId('select').setPlaceholder('Nothing selected').addOptions(
        {
          label: 'Select me',
          description: 'This is a description',
          value: 'first_option',
        },
        {
          label: 'You can select me too',
          description: 'This is also a description',
          value: 'second_option',
        },
      );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>();

      row.addComponents(menu);

      await interaction.reply({ content: 'Pong!', components: [row] });

      break;
    }

    default:
      break;
  }
};
