import * as dotenv from 'dotenv';
import { match } from 'ts-data-forge';

const NODE_ENV: 'development' | 'production' | undefined | (string & {}) =
  process.env['NODE_ENV'];

console.log(`NODE_ENV = "${NODE_ENV ?? ''}"`);

export const isDev = NODE_ENV === 'development';

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

export const useEmulators: boolean = false;
