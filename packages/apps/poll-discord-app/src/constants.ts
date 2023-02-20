import { isDev } from './env';

export const triggerCommand = {
  rp: isDev ? '/rpdev' : '/rp',
  rp30t: isDev ? '/rp30tdev' : '/rp30t',
  rp60t: isDev ? '/rp60tdev' : '/rp60t',
  rp30: isDev ? '/rp30dev' : '/rp30',
  rp60: isDev ? '/rp60dev' : '/rp60',
  gp: isDev ? '/gpdev' : '/gp',
  rand: isDev ? '/randdev' : '/rand',
} as const;

export const emojis = {
  good: { unicode: '⭕', name: ':o:' },
  fair: { unicode: '🔺', name: ':small_red_triangle:' },
  poor: { unicode: '❌', name: ':x:' },
  refresh: { unicode: '🔄', name: ':arrows_counterclockwise:' },
} as const;

export const embedMessageColor = '#3e68b0';

// const thumbnailUrl =
//   'https://github.com/noshiro-pf/poll_discord_app/blob/main/src/assets/calendar_icon.png?raw=true';

export const footerText = 'Last Update';

// export const paths = {
//   dbJson: './db.json',
// } as const;

// psql
export const psqlTableName = 'main';
export const psqlRowType = {
  id: 'id',
  data: 'data',
  updated_at: 'updated_at',
} as const;

export const psqlRowId = '2021-03-20_16:35';
