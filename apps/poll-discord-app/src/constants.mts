import { isDev } from './env.mjs';

export const triggerCommand = {
  rp: isDev ? ('/rp-dev' as const) : ('/rp' as const),
  rp30: isDev ? ('/rp30-dev' as const) : ('/rp30' as const),
  rp60: isDev ? ('/rp60-dev' as const) : ('/rp60' as const),
  rp30d: isDev ? ('/rp30d-dev' as const) : ('/rp30d' as const),
  rp60d: isDev ? ('/rp60d-dev' as const) : ('/rp60d' as const),
  gp: isDev ? ('/gp-dev' as const) : ('/gp' as const),
  rand: isDev ? ('/rand-dev' as const) : ('/rand' as const),
} as const;

export const emojis = {
  good: { unicode: '⭕', name: ':o:' },
  fair: { unicode: '🔺', name: ':small_red_triangle:' },
  poor: { unicode: '❌', name: ':x:' },
  refresh: { unicode: '🔄', name: ':arrows_counterclockwise:' },
} as const;

export const embedMessageColor = '#3e68b0';

export const footerText = 'Last Update';
