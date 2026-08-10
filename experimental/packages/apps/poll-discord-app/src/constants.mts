import { isDev } from './env.mjs';

export const triggerCommand = {
  rp: isDev ? '/rp-dev' : '/rp',
  rp30: isDev ? '/rp30-dev' : '/rp30',
  rp60: isDev ? '/rp60-dev' : '/rp60',
  rp30d: isDev ? '/rp30d-dev' : '/rp30d',
  rp60d: isDev ? '/rp60d-dev' : '/rp60d',
  gp: isDev ? '/gp-dev' : '/gp',
  rand: isDev ? '/rand-dev' : '/rand',
} as const;

export const emojis = {
  good: { unicode: '⭕', name: ':o:' },
  fair: { unicode: '🔺', name: ':small_red_triangle:' },
  poor: { unicode: '❌', name: ':x:' },
  refresh: { unicode: '🔄', name: ':arrows_counterclockwise:' },
} as const;

export const embedMessageColor = '#3e68b0';

export const footerText = 'Last Update';
