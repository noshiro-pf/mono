import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  [
    'back',
    'pathname$',
    'push',
    'queryParams$',
    'redirect',
    'removeListener',
    'usePathname',
    'useQueryParams',
    'useRouterLinkClick',
  ].map((key) => tp(key, tp('@noshiro/tiny-router-preact-hooks', key)))
);
