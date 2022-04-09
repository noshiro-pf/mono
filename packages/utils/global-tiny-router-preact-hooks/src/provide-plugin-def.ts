import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterPreactHooksDef = IRecord.fromEntries(
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
    'withSlash',
  ].map((key) => tp(key, ['@noshiro/tiny-router-preact-hooks', key]))
);
