import * as dotenv from 'dotenv';
import { match } from 'ts-data-forge';

const NODE_ENV: 'development' | 'production' | undefined | (string & {}) =
  process.env['NODE_ENV'];

console.log(`NODE_ENV = "${NODE_ENV ?? ''}"`);

dotenv.config({
  path: match(
    NODE_ENV ?? '',
    {
      development: '.env.dev',
      production: '.env.prd',
    },
    '.env',
  ),
});

export const DISCORD_TOKEN = process.env['DISCORD_TOKEN'] ?? '';

/** The application ID, which registering the slash commands needs. */
export const CLIENT_ID = process.env['CLIENT_ID'] ?? '';

/** The guild the slash commands are registered to while they are developed. */
export const GUILD_ID = process.env['GUILD_ID'] ?? '';
