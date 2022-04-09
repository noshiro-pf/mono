import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterReactHooksDef = IRecord.fromEntries(
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
  ].map((key) => tp(key, ['@noshiro/tiny-router-react-hooks', key]))
);
