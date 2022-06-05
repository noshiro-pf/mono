import { config } from 'dotenv';

config();

export const DISCORD_TOKEN = process.env['DISCORD_TOKEN'] ?? '';

// eslint-disable-next-line @typescript-eslint/dot-notation
export const isDev = process.env['NODE_ENV'] === 'development';

export const DATABASE_URL = isDev
  ? process.env['LOCAL_DATABASE_URL']
  : process.env['DATABASE_URL'];
