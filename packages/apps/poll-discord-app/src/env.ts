import { config } from 'dotenv';

config();

export const DISCORD_TOKEN = process.env['DISCORD_TOKEN'] ?? '';
export const CLIENT_ID = process.env['CLIENT_ID'] ?? '';
export const GUILD_ID = process.env['GUILD_ID'] ?? '';

// eslint-disable-next-line @typescript-eslint/dot-notation
export const isDev = process.env['NODE_ENV'] === 'development';

export const DATABASE_URL = isDev
  ? process.env['LOCAL_DATABASE_URL']
  : process.env['DATABASE_URL'];
