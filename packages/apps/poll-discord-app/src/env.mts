import * as dotenv from 'dotenv';

const NODE_ENV: 'development' | 'production' | (string & {}) | undefined =
  process.env['NODE_ENV'];

console.log(`NODE_ENV = "${NODE_ENV ?? ''}"`);

export const isDev = NODE_ENV === 'development';

dotenv.config({
  path:
    mapOptional(NODE_ENV, (n) =>
      match(n, {
        development: '.env.dev',
        production: '.env.prd',
      }),
    ) ?? '.env',
});

export const DISCORD_TOKEN = process.env['DISCORD_TOKEN'] ?? '';

export const useEmulators: boolean = false;
